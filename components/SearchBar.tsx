export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" className="mb-6 flex gap-2">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search for a movie..."
        className="w-full rounded-lg border border-line bg-surface px-4 py-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-muted"
      />
      <button
        type="submit"
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}