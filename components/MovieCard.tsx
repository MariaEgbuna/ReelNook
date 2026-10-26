import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/lib/tmdb";

export default function MovieCard({ movie }: { movie: Movie }) {
  const year = movie.release_date?.slice(0, 4);

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="block overflow-hidden rounded-lg border border-line bg-surface text-foreground hover:ring-2 hover:ring-muted"
    >
      <div className="relative aspect-[2/3] bg-surface-2">
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No poster
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate font-semibold">{movie.title}</h3>
        <p className="text-sm text-muted">
          {year} | ⭐ {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </Link>
  );
}