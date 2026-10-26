"use client";

import { toggleWatchlist, useWatchlist } from "@/lib/watchlist";
import type { Movie } from "@/lib/tmdb";

export default function WatchlistButton({ movie }: { movie: Movie }) {
  const list = useWatchlist();
  const saved = list?.some((m) => m.id === movie.id) ?? false;

  return (
    <button
      onClick={() => toggleWatchlist(movie)}
      disabled={list === null}
      className={`rounded-lg px-4 py-2 font-semibold transition disabled:opacity-60 ${
        saved
          ? "bg-surface-2 text-foreground ring-1 ring-line hover:opacity-80"
          : "bg-accent text-accent-fg hover:opacity-90"
      }`}
    >
      {saved ? "✓ In watchlist" : "+ Add to watchlist"}
    </button>
  );
}