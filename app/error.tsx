"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-4 text-muted">
        We could not load movies. Check your internet connection and try again.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}