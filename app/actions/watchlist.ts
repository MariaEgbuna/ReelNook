"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { watchlistItem } from "@/db/watchlist-schema";

type SetResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: string };

type MovieInput = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

// Never trust data from the browser. Check every field before using it.
function parseMovie(input: unknown): MovieInput | null {
  if (typeof input !== "object" || input === null) return null;
  const m = input as Record<string, unknown>;

  const { id, title, poster_path, release_date, vote_average } = m;

  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) return null;
  if (typeof title !== "string" || title.length === 0 || title.length > 300) {
    return null;
  }
  if (
    poster_path !== null &&
    (typeof poster_path !== "string" ||
      !/^\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(poster_path))
  ) {
    return null;
  }
  if (typeof release_date !== "string" || release_date.length > 10) return null;
  if (
    typeof vote_average !== "number" ||
    !Number.isFinite(vote_average) ||
    vote_average < 0 ||
    vote_average > 10
  ) {
    return null;
  }

  return { id, title, poster_path, release_date, vote_average };
}

export async function setInWatchlist(
  input: unknown,
  shouldSave: boolean
): Promise<SetResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Please sign in to save movies." };
  }

  const movie = parseMovie(input);
  if (!movie) {
    return { ok: false, error: "That movie could not be saved." };
  }

  // The user id comes from the session on the server, never from the browser
  const userId = session.user.id;

  try {
    if (shouldSave) {
      await db
        .insert(watchlistItem)
        .values({
          userId,
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date,
          voteAverage: movie.vote_average,
        })
        .onConflictDoNothing();
    } else {
      await db
        .delete(watchlistItem)
        .where(
          and(
            eq(watchlistItem.userId, userId),
            eq(watchlistItem.movieId, movie.id)
          )
        );
    }

    revalidatePath("/", "layout");
    return { ok: true, saved: shouldSave };
  } catch {
    return {
      ok: false,
      error: "Could not update your watchlist. Please try again.",
    };
  }
}