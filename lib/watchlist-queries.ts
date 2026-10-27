import { and, count, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { watchlistItem } from "../db/watchlist-schema";
import type { Movie } from "./tmdb";

export async function getWatchlist(userId: string): Promise<Movie[]> {
  const rows = await db
    .select()
    .from(watchlistItem)
    .where(eq(watchlistItem.userId, userId))
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

export async function isInWatchlist(
  userId: string,
  movieId: number
): Promise<boolean> {
  const rows = await db
    .select({ id: watchlistItem.id })
    .from(watchlistItem)
    .where(
      and(eq(watchlistItem.userId, userId), eq(watchlistItem.movieId, movieId))
    )
    .limit(1);

  return rows.length > 0;
}

export async function getWatchlistCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(watchlistItem)
    .where(eq(watchlistItem.userId, userId));

  return row?.value ?? 0;
}