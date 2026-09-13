import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function requireProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");

  const db = supabaseAdmin();
  const { data: existing } = await db
    .from("profiles")
    .select("id, anonymous_name, avatar_seed")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (existing) return existing;

  const adjectives = ["Quiet", "Hidden", "Cosmic", "Curious", "Midnight", "Wandering"];
  const nouns = ["Fox", "Orbit", "Signal", "Moon", "Comet", "Echo"];
  const name = `${adjectives[Math.floor(Math.random()*adjectives.length)]} ${nouns[Math.floor(Math.random()*nouns.length)]}`;

  const { data, error } = await db.from("profiles").insert({
    auth_user_id: userId,
    anonymous_name: `Anonymous ${name}`,
    avatar_seed: crypto.randomUUID()
  }).select("id, anonymous_name, avatar_seed").single();

  if (error) throw error;
  return data;
}