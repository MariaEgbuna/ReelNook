import { useMemo, useSyncExternalStore } from "react";
import type { Movie } from "@/lib/tmdb";

const KEY = "watchlist";
const CHANGE_EVENT = "watchlist-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback); // changes from other tabs
  window.addEventListener(CHANGE_EVENT, callback); // changes in this tab
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

// On the server there is no localStorage, so we say "unknown yet" (null)
function getServerSnapshot(): string | null {
  return null;
}

// Returns null until the browser has loaded the list, then the list itself
export function useWatchlist(): Movie[] | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as Movie[];
    } catch {
      return [];
    }
  }, [raw]);
}

// Adds the movie if it's not saved, removes it if it is
export function toggleWatchlist(movie: Movie) {
  let current: Movie[] = [];
  try {
    current = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    current = [];
  }

  const exists = current.some((m) => m.id === movie.id);
  const next = exists
    ? current.filter((m) => m.id !== movie.id)
    : [...current, movie];

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: nothing we can do, so we skip quietly
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}