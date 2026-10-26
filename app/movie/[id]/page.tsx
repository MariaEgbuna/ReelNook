import { notFound } from "next/navigation";
import WatchlistButton from "@/components/WatchlistButton";
import Image from "next/image";
import Link from "next/link";
import { getMovieDetails } from "@/lib/tmdb";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const movie = await getMovieDetails(id);
  if (!movie) notFound();

  const year = movie.release_date?.slice(0, 4);
  const trailer = movie.videos.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  const cast = movie.credits.cast.slice(0, 8);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link
        href="/"
        className="mb-6 inline-block text-muted hover:text-foreground"
      >
        ← Back
      </Link>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden rounded-lg bg-surface-2 md:w-72">
          {movie.poster_path && (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              fill
              sizes="(min-width: 768px) 288px, 100vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {movie.title} <span className="text-muted">({year})</span>
          </h1>
          {movie.tagline && (
            <p className="mt-1 italic text-muted">{movie.tagline}</p>
          )}
          <p className="mt-3 text-soft">
            ⭐ {movie.vote_average.toFixed(1)}
            {movie.runtime ? ` | ${movie.runtime} min` : ""}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={genre.id}
                className="rounded-full bg-surface-2 px-3 py-1 text-sm text-foreground"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <WatchlistButton
              movie={{
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
              }}
            />
          </div>

          <h2 className="mt-6 text-xl font-semibold">Overview</h2>
          <p className="mt-2 text-soft">
            {movie.overview || "No overview available."}
          </p>
        </div>
      </div>

      {trailer && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">Trailer</h2>
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}`}
            title={`${movie.title} trailer`}
            allowFullScreen
            className="aspect-video w-full rounded-lg"
          />
        </section>
      )}

      {cast.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">Cast</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {cast.map((person) => (
              <div
                key={person.id}
                className="overflow-hidden rounded-lg border border-line bg-surface"
              >
                <div className="relative aspect-[2/3] bg-surface-2">
                  {person.profile_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      fill
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-sm font-semibold">
                    {person.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {person.character}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}