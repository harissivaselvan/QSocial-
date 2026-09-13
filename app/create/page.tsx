"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError(""); setBusy(true);
    try {
      let mediaKey: string | null = null;
      if (file) {
        const compressed = await imageCompression(file, { maxSizeMB: 0.35, maxWidthOrHeight: 1600, useWebWorker: true });
        const fd = new FormData();
        fd.append("file", compressed);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const result = await up.json();
        if (!up.ok) throw new Error(result.error || "Upload failed");
        mediaKey = result.key;
      }
      const res = await fetch("/api/posts", {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ content, mediaKey })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Post failed");
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-2xl px-4 py-8">
    <SignedOut><div className="card p-8 text-center"><h1 className="text-xl font-bold">Sign in to post</h1><SignInButton mode="modal"><button className="mt-5 rounded-full bg-white px-5 py-3 font-semibold text-black">Sign in</button></SignInButton></div></SignedOut>
    <SignedIn>
      <h1 className="mb-2 text-2xl font-bold">Create a post</h1>
      <p className="mb-6 text-sm text-zinc-500">Anonymous to everyone else. Automatically disappears after 7 days.</p>
      <div className="card p-5">
        <textarea value={content} onChange={e => setContent(e.target.value)} maxLength={2000} placeholder="What's on your mind?" className="min-h-44 w-full resize-none bg-transparent outline-none placeholder:text-zinc-600" />
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} className="max-w-[220px] text-xs text-zinc-400" />
          <button disabled={busy || !content.trim()} onClick={submit} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-40">{busy ? "Posting..." : "Publish"}</button>
        </div>
        {file && <p className="mt-3 text-xs text-zinc-500">Selected: {file.name}</p>}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </SignedIn>
  </div>;
}