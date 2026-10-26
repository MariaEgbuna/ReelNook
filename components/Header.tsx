"use client";

import Link from "next/link";
import { useWatchlist } from "@/lib/watchlist";

export default function Header() {
  const list = useWatchlist();
  const count = list?.length ?? 0;

  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-bold text-foreground">
          🎬 Movie App
        </Link>
        <Link href="/watchlist" className="text-soft hover:text-foreground">
          Watchlist{count > 0 ? ` (${count})` : ""}
        </Link>
      </nav>
    </header>
  );
}