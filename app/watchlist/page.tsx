"use client";

import Link from "next/link";
import MovieGrid from "@/components/MovieGrid";
import { useWatchlist } from "@/lib/watchlist";

export default function WatchlistPage() {
  const list = useWatchlist();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">My Watchlist</h1>

      {list === null ? null : list.length === 0 ? (
        <p className="text-muted">
          Your watchlist is empty.{" "}
          <Link href="/" className="underline hover:text-foreground">
            Browse trending movies
          </Link>
        </p>
      ) : (
        <MovieGrid movies={list} />
      )}
    </main>
  );
}