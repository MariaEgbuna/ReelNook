import { redirect } from "next/navigation";
import { getRandomMovie } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET() {
  let target = "/";

  try {
    const movie = await getRandomMovie();
    if (movie) target = `/movie/${movie.id}`;
  } catch {
    // If TMDB can't be reached, send the visitor home instead of showing a blank error
  }

  // redirect() must stay outside the try/catch, because it works by throwing a special error
  redirect(target);
}