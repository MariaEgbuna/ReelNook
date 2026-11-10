"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setWatchStatus } from "@/app/actions/watchlist";
import type { Movie } from "@/lib/tmdb";
import type { WatchStatus } from "@/lib/watch-status";

const base = "rounded-lg px-4 py-2 font-semibold transition disabled:opacity-60";
const active = "bg-surface-2 text-foreground ring-1 ring-line hover:opacity-80";

export default function WatchlistButton({
  movie,
  signedIn,
  initialStatus,
}: {
  movie: Movie;
  signedIn: boolean;
  initialStatus: WatchStatus | null;
}) {
  const [status, setStatus] = useState<WatchStatus | null>(initialStatus);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Link
        href="/sign-in"
        className="inline-block rounded-lg border border-line px-4 py-2 font-semibold text-soft hover:text-foreground"
      >
        Sign in to save
      </Link>
    );
  }

  function change(next: WatchStatus | null) {
    setError("");
    startTransition(async () => {
      const result = await setWatchStatus(movie, next);
      if (result.ok) {
        setStatus(result.status);
      } else {
        setError(result.error);
      }
    });
  }

  const inWatchlist = status === "to_watch";
  const watched = status === "watched";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => change(inWatchlist ? null : "to_watch")}
          disabled={pending}
          className={`${base} ${
            inWatchlist ? active : "bg-accent text-accent-fg hover:opacity-90"
          }`}
        >
          {inWatchlist ? "✓ In watchlist" : "+ Add to watchlist"}
        </button>

        <button
          onClick={() => change(watched ? null : "watched")}
          disabled={pending}
          className={`${base} ${
            watched
              ? active
              : "border border-line text-soft hover:text-foreground"
          }`}
        >
          {watched ? "✓ Watched" : "Mark as watched"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}