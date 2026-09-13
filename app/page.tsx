import Link from "next/link";
import { Feed } from "@/components/Feed";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tight">QSocial</div>
          <div className="text-xs text-zinc-500">Gone in 7 days.</div>
        </div>
        <Link href="/create" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Post</Link>
      </header>
      <Feed />
    </div>
  );
}