import Link from "next/link";
import { redirect } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import { getSession } from "@/lib/session";
import { getWatchlist } from "@/lib/watchlist-queries";
import type { WatchStatus } from "@/lib/watch-status";

const tabBase = "rounded-lg px-4 py-2 font-semibold";
const tabActive = "bg-accent text-accent-fg";
const tabIdle = "border border-line text-soft hover:text-foreground";

export default async function WatchlistPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const { tab } = await searchParams;
  const status: WatchStatus = tab === "watched" ? "watched" : "to_watch";
  const movies = await getWatchlist(session.user.id, status);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">My Watchlist</h1>

      <nav aria-label="Watchlist tabs" className="mb-6 flex gap-2">
        <Link
          href="/watchlist"
          aria-current={status === "to_watch" ? "page" : undefined}
          className={`${tabBase} ${status === "to_watch" ? tabActive : tabIdle}`}
        >
          To watch
        </Link>
        <Link
          href="/watchlist?tab=watched"
          aria-current={status === "watched" ? "page" : undefined}
          className={`${tabBase} ${status === "watched" ? tabActive : tabIdle}`}
        >
          Watched
        </Link>
      </nav>

      {movies.length === 0 ? (
        status === "to_watch" ? (
          <p className="text-muted">
            Your watchlist is empty.{" "}
            <Link href="/" className="underline hover:text-foreground">
              Browse trending movies
            </Link>
          </p>
        ) : (
          <p className="text-muted">
            Nothing marked as watched yet. Open a movie and press &quot;Mark as
            watched&quot;.
          </p>
        )
      ) : (
        <MovieGrid movies={movies} />
      )}
    </main>
  );
}