"use client";
import { useEffect, useState } from "react";

type Post = {
  id: string; content: string; created_at: string; expires_at: string;
  anonymous_name: string; like_count: number; comment_count: number;
};

function remaining(expires: string) {
  const ms = new Date(expires).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 36e5);
  const d = Math.floor(h / 24);
  if (d) return `${d}d ${h % 24}h left`;
  return `${h}h left`;
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts").then(r => r.json()).then(x => setPosts(x.posts ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card h-40 animate-pulse" />)}</div>;
  if (!posts.length) return <div className="card p-8 text-center"><div className="text-lg font-semibold">Nothing here yet.</div><p className="mt-2 text-sm text-zinc-500">Be the first to post.</p></div>;

  return <div className="space-y-4">{posts.map(p => (
    <article key={p.id} className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">{p.anonymous_name}</span>
        <span className="text-xs text-zinc-500">{remaining(p.expires_at)}</span>
      </div>
      <p className="whitespace-pre-wrap leading-7 text-zinc-100">{p.content}</p>
      <div className="mt-5 flex gap-5 text-sm text-zinc-500">
        <span>♡ {p.like_count}</span><span>💬 {p.comment_count}</span>
      </div>
    </article>
  ))}</div>;
}