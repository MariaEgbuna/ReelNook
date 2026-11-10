import MovieGrid from "@/components/MovieGrid";
import SearchBar from "@/components/SearchBar";
import { getSession } from "@/lib/session";
import { getTrendingMovies } from "@/lib/tmdb";

const pickButton =
  "shrink-0 whitespace-nowrap rounded-lg px-4 py-2 font-semibold hover:opacity-90";

export default async function Home() {
  const [movies, session] = await Promise.all([
    getTrendingMovies(),
    getSession(),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <SearchBar />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Trending Today</h1>
        <div className="flex flex-wrap gap-2">
          <a href="/random" className={`${pickButton} bg-accent text-accent-fg`}>
            🎲 Random pick
          </a>
          {session && (
            <a
              href="/random?from=watchlist"
              className={`${pickButton} border border-line text-soft hover:text-foreground`}
            >
              From my watchlist
            </a>
          )}
        </div>
      </div>

      <MovieGrid movies={movies} />
    </main>
  );
}