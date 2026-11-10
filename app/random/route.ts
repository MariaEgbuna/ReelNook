import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRandomMovie } from "@/lib/tmdb";
import {
  getRandomWatchlistMovieId,
  getWatchedIds,
} from "@/lib/watchlist-queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const from = new URL(request.url).searchParams.get("from");
  const session = await getSession();

  if (from === "watchlist") {
    if (!session) redirect("/sign-in");

    let movieId: number | null = null;
    try {
      movieId = await getRandomWatchlistMovieId(session.user.id);
    } catch {
      // fall through: an empty result sends the visitor to the watchlist page
    }
    redirect(movieId ? `/movie/${movieId}` : "/watchlist");
  }

  let target = "/";
  try {
    const watched = session
      ? await getWatchedIds(session.user.id)
      : new Set<number>();
    const movie = await getRandomMovie(watched);
    if (movie) target = `/movie/${movie.id}`;
  } catch {
    // If TMDB or the database can't be reached, send the visitor home
  }

  redirect(target);
}