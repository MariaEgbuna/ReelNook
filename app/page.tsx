import MovieGrid from "@/components/MovieGrid";
import SearchBar from "@/components/SearchBar";
import { getTrendingMovies } from "@/lib/tmdb";

export default async function Home() {
  const movies = await getTrendingMovies();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <SearchBar />

      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Trending Today</h1>
        <a
          href="/random"
          className="shrink-0 whitespace-nowrap rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg hover:opacity-90"
        >
          🎲 Random pick
        </a>
      </div>

      <MovieGrid movies={movies} />
    </main>
  );
}