import MovieGrid from "@/components/MovieGrid";
import SearchBar from "@/components/SearchBar";
import { searchMovies } from "@/lib/tmdb";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const movies = query ? await searchMovies(query) : [];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <SearchBar defaultValue={query} />

      {!query ? (
        <p className="text-muted">Type a movie name to search.</p>
      ) : movies.length === 0 ? (
        <p className="text-muted">No results found for &quot;{query}&quot;.</p>
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-bold">
            Results for &quot;{query}&quot;
          </h1>
          <MovieGrid movies={movies} />
        </>
      )}
    </main>
  );
}