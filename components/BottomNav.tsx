import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around py-3 text-xs text-zinc-400">
        <Link href="/">Home</Link>
        <Link href="/explore">Explore</Link>
        <Link href="/create" className="rounded-full bg-white px-4 py-2 font-semibold text-black">Create</Link>
        <Link href="/notifications">Alerts</Link>
        <Link href="/profile">Profile</Link>
      </div>
    </nav>
  );
}