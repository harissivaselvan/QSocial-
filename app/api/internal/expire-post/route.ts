import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/*
  IMPORTANT:
  In production, verify the QStash signature before accepting this request.
  Keep this endpoint private until QStash signing verification is implemented.
*/
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "QStash signature verification must be configured" }, { status: 503 });
  }
  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  const db = supabaseAdmin();
  const { error } = await db.rpc("expire_post", { target_post_id: postId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}