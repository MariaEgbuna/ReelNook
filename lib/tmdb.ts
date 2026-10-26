const BASE_URL = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  status: number;

  constructor(status: number) {
    super(`TMDB request failed: ${status}`);
    this.status = status;
  }
}

export type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

async function tmdbFetch<T>(path: string, retries = 2): Promise<T> {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is missing. Check .env.local");

  const isToken = key.startsWith("eyJ");
  const separator = path.includes("?") ? "&" : "?";
  const url = isToken
    ? `${BASE_URL}${path}`
    : `${BASE_URL}${path}${separator}api_key=${key}`;

  let res: Response | undefined;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      res = await fetch(url, {
        headers: isToken ? { Authorization: `Bearer ${key}` } : {},
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      });
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!res) {
    throw new Error("Could not reach TMDB. Check your internet connection.", {
      cause: lastError,
    });
  }
  if (!res.ok) throw new TmdbError(res.status);

  return res.json();
}

export async function getTrendingMovies(): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: Movie[] }>("/trending/movie/day");
  return data.results;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: Movie[] }>(
    `/search/movie?query=${encodeURIComponent(query)}`
  );
  return data.results;
}

export type MovieDetails = Movie & {
  tagline: string;
  overview: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
  videos: { results: { key: string; site: string; type: string }[] };
};

export async function getMovieDetails(id: string): Promise<MovieDetails | null> {
  try {
    return await tmdbFetch<MovieDetails>(
      `/movie/${id}?append_to_response=credits,videos`
    );
  } catch (err) {
    if (err instanceof TmdbError && err.status === 404) return null;
    throw err;
  }
}

export async function getRandomMovie(): Promise<Movie | null> {
  const page = Math.floor(Math.random() * 10) + 1;
  const data = await tmdbFetch<{ results: Movie[] }>(
    `/movie/top_rated?page=${page}`
  );

  if (data.results.length === 0) return null;
  return data.results[Math.floor(Math.random() * data.results.length)];
}