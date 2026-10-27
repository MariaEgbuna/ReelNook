import Link from "next/link";
import { redirect } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import { getSession } from "@/lib/session";
import { getWatchlist } from "@/lib/watchlist-queries";

export default async function WatchlistPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const movies = await getWatchlist(session.user.id);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">My Watchlist</h1>

      {movies.length === 0 ? (
        <p className="text-muted">
          Your watchlist is empty.{" "}
          <Link href="/" className="underline hover:text-foreground">
            Browse trending movies
          </Link>
        </p>
      ) : (
        <MovieGrid movies={movies} />
      )}
    </main>
  );
}