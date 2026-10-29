"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function HeaderNav({
  userName,
  count,
}: {
  userName: string | null;
  count: number;
}) {
  const router = useRouter();
  const signedIn = userName !== null;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-4">
        <Link
          href="/"
          aria-label="ReelNook home"
          className="shrink-0 text-lg font-bold whitespace-nowrap text-foreground"
        >
          🎬<span className="hidden sm:inline"> ReelNook</span>
        </Link>

        <div className="flex items-center gap-3 text-sm whitespace-nowrap sm:gap-4 sm:text-base">
          <Link href="/watchlist" className="text-soft hover:text-foreground">
            Watchlist{signedIn && count > 0 ? ` (${count})` : ""}
          </Link>

          {signedIn ? (
            <>
              <span className="hidden max-w-32 truncate text-muted sm:inline">
                {userName}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-line px-3 py-1 text-soft hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-soft hover:text-foreground">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-accent px-3 py-1 font-semibold text-accent-fg hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}