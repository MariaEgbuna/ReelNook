"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setInWatchlist } from "@/app/actions/watchlist";
import type { Movie } from "@/lib/tmdb";

export default function WatchlistButton({
  movie,
  signedIn,
  initialSaved,
}: {
  movie: Movie;
  signedIn: boolean;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
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

  function handleClick() {
    setError("");
    startTransition(async () => {
      const result = await setInWatchlist(movie, !saved);
      if (result.ok) {
        setSaved(result.saved);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={pending}
        className={`rounded-lg px-4 py-2 font-semibold transition disabled:opacity-60 ${
          saved
            ? "bg-surface-2 text-foreground ring-1 ring-line hover:opacity-80"
            : "bg-accent text-accent-fg hover:opacity-90"
        }`}
      >
        {pending ? "Saving..." : saved ? "✓ In watchlist" : "+ Add to watchlist"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}