import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Not found</h1>
      <p className="mb-4 text-muted">
        We could not find that movie or page.
      </p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  );
}