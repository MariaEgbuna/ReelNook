import { getSession } from "@/lib/session";
import { getWatchlistCount } from "@/lib/watchlist-queries";
import HeaderNav from "@/components/HeaderNav";

export default async function Header() {
  const session = await getSession();
  const count = session ? await getWatchlistCount(session.user.id) : 0;

  return <HeaderNav userName={session?.user.name ?? null} count={count} />;
}