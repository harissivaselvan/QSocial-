import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth";
import { postSchema } from "@/lib/validation";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db.rpc("get_active_posts");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: Request) {
  try {
    const profile = await requireProfile();
    const body = postSchema.parse(await req.json());
    const db = supabaseAdmin();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await db.from("posts").insert({
      author_profile_id: profile.id,
      content: body.content,
      expires_at: expires
    }).select("id, expires_at").single();

    if (error) throw error;

    if (body.mediaKey) {
      const { error: me } = await db.from("media").insert({
        post_id: data.id, storage_key: body.mediaKey, mime_type: "image/*", size_bytes: 0, expires_at: expires
      });
      if (me) throw me;
    }

    // QStash scheduling should be added here after configuring the token.
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : 400 });
  }
}