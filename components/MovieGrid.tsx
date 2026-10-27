import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/lib/tmdb";

export default function MovieGrid({ movies }: { movies: Movie[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} eager={index < 5} />
      ))}
    </div>
  );
}