import { and, count, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { watchlistItem } from "../db/watchlist-schema";
import type { Movie } from "./tmdb";
import type { WatchStatus } from "./watch-status";

export async function getWatchlist(
  userId: string,
  status: WatchStatus = "to_watch"
): Promise<Movie[]> {
  const rows = await db
    .select()
    .from(watchlistItem)
    .where(
      and(eq(watchlistItem.userId, userId), eq(watchlistItem.status, status))
    )
    .orderBy(desc(watchlistItem.addedAt));

  // Convert database column names back to the Movie shape the cards expect
  return rows.map((row) => ({
    id: row.movieId,
    title: row.title,
    poster_path: row.posterPath,
    release_date: row.releaseDate,
    vote_average: row.voteAverage,
  }));
}

// null means the user has not saved this movie at all
export async function getWatchStatus(
  userId: string,
  movieId: number
): Promise<WatchStatus | null> {
  const rows = await db
    .select({ status: watchlistItem.status })
    .from(watchlistItem)
    .where(
      and(eq(watchlistItem.userId, userId), eq(watchlistItem.movieId, movieId))
    )
    .limit(1);

  return rows[0]?.status ?? null;
}

// The header count only includes movies still waiting to be watched
export async function getWatchlistCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(watchlistItem)
    .where(
      and(
        eq(watchlistItem.userId, userId),
        eq(watchlistItem.status, "to_watch")
      )
    );

  return row?.value ?? 0;
}