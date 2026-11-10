# ReelNook

ReelNook is a movie discovery app. Browse what's trending, search for any movie, watch the trailer, check the cast, or let the app pick something for tonight. Sign in and you also get a personal watchlist, plus a shelf for the movies you've already watched.

**Live demo:** https://reelnook-dusky.vercel.app (sign ups are open, so please use a throwaway email and password)

![Home page](docs/screenshots/home.png)

**Details page**

| Overview | Trailer |
|---|---|
| ![Details](docs/screenshots/details.png) | ![Trailer](docs/screenshots/trailer.png) |

**Accounts and watchlist**

| Sign up | Sign in | Watchlist (signed in) |
|---|---|---|
| ![Sign up](docs/screenshots/sign-up.png) | ![Sign in](docs/screenshots/sign-in.png) | ![Watchlist](docs/screenshots/watchlist.png) |

| Light Theme | Dark Theme |
|---|---|
| ![Mobile light](docs/screenshots/mobile-light.png) | ![Mobile dark](docs/screenshots/mobile-dark.png) |

## Features

- **Trending today.** The home page shows what's trending, with posters, year, and rating.
- **Search.** The search term lives in the URL (`/search?q=batman`), so results can be refreshed, bookmarked, and shared.
- **Details page.** Poster, tagline, genres, runtime, overview, an embedded trailer, and the top cast.
- **Random pick.** One click opens a random well-reviewed movie, and it skips anything you've already marked as watched. If you're signed in, a second button picks from your own watchlist instead.
- **Accounts.** Sign up, sign in, and sign out with an email and password.
- **A watchlist and a watched shelf.** Save a movie to "To watch", or mark it as watched. Both lists live in PostgreSQL, so they follow you across devices, and the header shows how many movies are still waiting for you.
- **Private by design.** The watchlist page is only for signed-in users, and everyone only ever sees their own lists.
- **Loading, empty, error, and not-found states.** Skeleton placeholders while data loads, friendly messages when there's nothing to show, and a proper page for bad URLs.
- **Light and dark theme.** It follows the device setting.
- **Responsive.** It works on phones, tablets, and desktops.
- **Live.** The demo runs on Vercel with a Neon database.

## Built from feedback

After I shared ReelNook on X, a couple of people replied with questions that turned into features:

- **One person asked whether the random pick draws from your watchlist or from the whole catalogue.** At that point it did neither. It picked from TMDB's top-rated list, about 200 well-reviewed movies. Now there are two buttons, so you can choose between the top-rated list and your own watchlist.
- **Another asked if the random pick could skip films you've already watched.** There was no "watched" idea in the app yet, only a watchlist. So I added a "Mark as watched" button and a Watched tab on the watchlist page, and the top-rated pick now leaves out anything you've watched.

Both ideas turned out to need the same small change in the database: a `status` on each saved movie, either `to_watch` or `watched`. It was a nice reminder that a good question from a stranger is often a design review in disguise.

## Tech stack

| Tool | Why I used it |
|---|---|
| Next.js 16 (App Router) | Server components let me call APIs and the database on the server, so keys and passwords never reach the browser. |
| TypeScript | It catches mistakes early, and the TMDB response shapes and database tables are typed. |
| Tailwind CSS v4 | Fast to style with, and the color variables make the light and dark theme easy. |
| TMDB API | A free, large movie database with images, cast, and trailers. |
| PostgreSQL | A real relational database. I already knew it, and it enforces rules like unique rows and foreign keys. |
| Drizzle ORM and drizzle-kit | Close to plain SQL, with typed queries and migration files that record how the database changed. |
| Better Auth | Handles sign up, sign in, sessions, and password hashing, and stores users in my own database. |
| Neon | Hosted PostgreSQL for the live site. The free plan puts the database to sleep when idle, so the first request after a quiet spell can be a little slower. |
| Vercel | Hosting. It deploys automatically from `main`. |

## Getting started

You need:
- Node.js 24 (the current LTS; the Better Auth CLI needs Node 22.12 or newer)
- PostgreSQL 16 or newer, running locally
- A free [TMDB API key](https://www.themoviedb.org/settings/api)

**1. Clone and install**

```bash
git clone https://github.com/MariaEgbuna/ReelNook.git
cd ReelNook
npm install
```

**2. Create the database and a user for the app**

```bash
sudo -u postgres psql
```

```sql
CREATE USER movie_app_user WITH PASSWORD 'choose-a-password';
CREATE DATABASE movie_app OWNER movie_app_user;
```

Type `\q` to leave. The app gets its own user, so it only has access to its own database.

**3. Add your environment variables.** Create a file called `.env.local` in the project root:

```
TMDB_API_KEY=your_tmdb_key
DATABASE_URL=postgres://movie_app_user:choose-a-password@localhost:5432/movie_app
BETTER_AUTH_SECRET=a_long_random_value
BETTER_AUTH_URL=http://localhost:3000
```

Make the secret with `openssl rand -base64 32`. The TMDB key can be the short API key or the long "Read Access Token" (the app detects which one you used). Keep this file out of git: it's already in `.gitignore`.

**4. Create the tables**

```bash
npx drizzle-kit migrate
```

**5. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server |
| `npm run dev:ipv4` | Starts the dev server with IPv4 preferred, for networks where Node times out (see "What I learned") |
| `npm run build` | Builds for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Checks the code with ESLint |
| `npx drizzle-kit generate --name some_name` | Creates a new migration after changing a schema file in `db/` |
| `npx drizzle-kit migrate` | Applies migrations to the database |

## Deploying

The live demo runs on Vercel with a Neon database. To set up your own copy:

1. **Create a Neon project** and copy two connection strings: the pooled one (the host name contains `-pooler`) for the app, and the direct one for migrations. End both with `sslmode=verify-full`.
2. **Create the tables once** from your own machine, setting `DATABASE_URL` to the direct string for that one command only:
   ```bash
   read -rsp "Direct connection string: " DATABASE_URL; echo; export DATABASE_URL
   npx drizzle-kit migrate
   unset DATABASE_URL
   ```
   The `read -s` form keeps the password off the screen and out of your shell history.
3. **Import the repo in Vercel** and add the environment variables before the first deploy, because the build needs `DATABASE_URL`:
   - `TMDB_API_KEY`
   - `DATABASE_URL` (the pooled string)
   - `BETTER_AUTH_SECRET` (a new secret, not the one from `.env.local`)
   - `BETTER_AUTH_URL` (the exact production address, with no slash at the end)
4. **Sign in only works on the address named in `BETTER_AUTH_URL`.** If Vercel gives your project a different address than you expected, correct the variable and redeploy.
5. **When a later change adds a migration, run it against the live database before the new code goes live.** A new column with a default value keeps the old code working in the meantime.

## Project structure

```
app/
  layout.tsx              Page shell: header, content, footer
  page.tsx                Home: search bar, random pick buttons, trending grid
  loading.tsx             Skeleton for list pages
  error.tsx               Friendly error page with a retry button
  not-found.tsx           Page for missing movies and bad URLs
  icon.svg                Tab icon (also apple-icon.png and favicon.ico)
  search/page.tsx         Search results
  movie/[id]/page.tsx     Details page
  movie/[id]/loading.tsx  Skeleton for the details page
  watchlist/page.tsx      The signed-in user's lists, with To watch and Watched tabs
  sign-in/page.tsx        Sign in form
  sign-up/page.tsx        Sign up form
  random/route.ts         Picks a random movie (top rated or from the watchlist) and redirects
  api/auth/[...all]/      Better Auth route handler (all auth endpoints)
  actions/watchlist.ts    Server action: set a movie's status, or remove it
components/               Header, HeaderNav, ReelLogo, Footer, MovieCard, MovieGrid,
                          SearchBar, AuthForm, WatchlistButton, skeletons
db/
  auth-schema.ts          Tables generated for Better Auth (user, session, account,
                          verification, rate_limit)
  watchlist-schema.ts     My own table: watchlist_item
drizzle/                  Migration files (the history of the database)
lib/
  tmdb.ts                 All TMDB requests, with retries and timeouts
  db.ts                   Shared database connection (small pool, built for serverless)
  auth.ts                 Better Auth setup (server)
  auth-client.ts          Better Auth client (browser)
  session.ts              getSession(): who is signed in on this request
  watch-status.ts         The two statuses a saved movie can have
  watchlist-queries.ts    Read queries for the watchlist
proxy.ts                  First gate: redirects signed-out visitors away from /watchlist
drizzle.config.ts         drizzle-kit settings
```

## Database

Better Auth creates five tables: `user`, `session`, `account` (where the password hash is stored), `verification`, and `rate_limit` (the counters for rate limiting). I added one:

**`watchlist_item`**

| Column | Notes |
|---|---|
| `id` | Primary key |
| `user_id` | Foreign key to `user`, with `ON DELETE CASCADE` so deleting a user deletes their lists |
| `movie_id` | The TMDB id |
| `title`, `poster_path`, `release_date`, `vote_average` | Saved so the lists can show cards without asking TMDB again |
| `status` | `to_watch` or `watched`, defaulting to `to_watch` |
| `added_at` | Defaults to now |

There's a **unique constraint on (`user_id`, `movie_id`)**, so the same movie can't be saved twice by the same user, even if two clicks arrive at once. It also means a movie can only be in one state at a time, and moving it from "to watch" to "watched" is a single update. That constraint creates an index starting with `user_id`, so lookups by user are fast without a separate index.

A **CHECK constraint** on `status` means the database itself refuses any value other than `to_watch` or `watched`, no matter what the code does.

The table is still called `watchlist_item` even though it now holds watched movies too. Renaming a table that's already live wasn't worth the risk.

My table lives in its own file so that re-running the Better Auth CLI, which rewrites `db/auth-schema.ts`, can never overwrite it.

## How it works

- **Keys and passwords stay on the server.** Pages are server components, and none of the secrets have a `NEXT_PUBLIC_` prefix, so they're never sent to the browser.
- **One place for API calls.** `lib/tmdb.ts` holds the base URL, the key handling, retries (3 attempts), and an 8 second timeout. A 404 from TMDB becomes a proper "not found" page, and other failures reach the error page.
- **Fewer requests.** The details page asks TMDB for the movie, cast, and trailers in a single request, and responses are cached for an hour.
- **Search uses a plain form** that goes to `/search?q=...`, so it works without client-side JavaScript. The watchlist tabs work the same way, through the address (`/watchlist?tab=watched`).
- **The random pick has two sources.** The top-rated pick chooses a random page from the first ten, then a random movie on it, skipping anything you've watched. The watchlist pick asks the database for one random row from your "to watch" list.
- **The movie id from the URL is checked** (digits only) before it's used in an API request.
- **The database connection is built for serverless.** The app keeps a very small pool (2 connections) and tells Vercel to close idle ones, and the live site connects through Neon's pooled address so many short-lived instances share a few real connections.

## Security

- **Passwords are never stored in plain text.** Better Auth hashes them, and I never write code that touches the raw password.
- **Sessions use an HttpOnly cookie**, so scripts on the page can't read it.
- **Two layers protect the watchlist page.** `proxy.ts` quickly redirects visitors who have no session cookie, but it only checks that a cookie exists. The page itself then validates the session on the server and redirects if it isn't real. I tested this with a fake session cookie: the proxy let it through, and the page rejected it.
- **The user id always comes from the server session,** never from anything the browser sends. Every watchlist query filters by it, so one user can't read or change another user's lists. I tested this with two accounts.
- **Server actions validate their input.** The movie data and the status sent from the browser are checked before anything is saved, and the database checks the status again.
- **Rate limiting is on.** Sign in is limited to 3 attempts per 10 seconds by default. I confirmed it with a test: three wrong attempts got a 401 and the next three got a 429. The counters are stored in the database, so the limit works across Vercel's serverless instances and survives restarts. The form shows a friendly message when you're blocked.
- **Sign in errors are generic.** A wrong password and an unknown email both say "Invalid email or password", so the form doesn't reveal which emails have accounts.

## What I learned

Problems I ran into and how I solved them:

- **Images didn't load after I changed `next.config.ts`.** Next.js only reads that file at startup, so I needed to restart the dev server. Later I also deleted the `export default nextConfig;` line by accident, which made Next.js ignore the whole file, including the image host list and the Tailwind rule.
- **Requests to TMDB timed out from Node but worked in `curl`.** On a phone hotspot, Node 20 gave the IPv4 connection too little time before also trying IPv6 (which had no route). Starting Node with `--dns-result-order=ipv4first --no-network-family-autoselection` fixed it, and I added retries and a timeout so real users on weak connections get a friendly error instead of a crash.
- **`loading.tsx` was ignored.** I had created a second `app` folder inside `app`. Special Next.js files only work in the right place.
- **Parts of the UI were invisible in light mode.** My colors were fixed for a dark page. I replaced them with named color variables (`surface`, `muted`, `accent`, and so on) that have a light and a dark value.
- **The watchlist button did nothing when I tested on my phone.** The dev server blocks scripts requested from other addresses, so I added my PC's address to `allowedDevOrigins` (and removed it again before committing).
- **The random pick redirect sent my phone to `localhost`.** Redirecting with a relative path fixed it.
- **The Better Auth CLI crashed with `Object.groupBy is not a function`.** It needs Node 22.12 or newer, and I was on Node 20, which reached end of life in April 2026. Upgrading to Node 24 with nvm fixed it, and my app ran unchanged.
- **`npm install` crashed with `Cannot read properties of null (reading 'edgesOut')`.** The npm debug log pointed to a bug in npm 10 while it resolved the many optional peer packages that Better Auth lists. Installing with `--legacy-peer-deps` worked around it.
- **Moving the watchlist from the browser to a database changed the architecture.** The header became a server component that reads the session and the count, with a small client component for the sign out button. Server actions then call `revalidatePath` so the count updates by itself.
- **Rate limiting in memory doesn't work on serverless hosting.** Counters in memory reset on every restart and aren't shared between instances, so I moved them into the database with a new migration.
- **Serverless functions can use up a small database's connections.** I shrank the connection pool, added Vercel's helper that closes idle connections, and used Neon's pooled address for the app. Migrations use the direct address instead.
- **Login only works on the address named in `BETTER_AUTH_URL`.** Vercel had added a suffix to my project's address, so my first guess was wrong. I corrected the variable and redeployed.
- **Adding a column to a live database safely.** I applied the migration to the live database first and deployed the code second. Because the new column has a default, the old code kept working in between, and every movie already saved became "to watch" on its own.
- **Let the database enforce the rules.** TypeScript only protects the code, so I added a CHECK constraint on the status. Then I tried to store a misspelled status by hand, and PostgreSQL refused it.
- **One row with a status beats two tables.** The unique rule on user and movie already guarantees one row, so a movie can't be both "to watch" and "watched", and changing it is one upsert.

## Known limits and ideas

- Email verification and password reset aren't set up yet, and there's no way to delete an account from the app.
- The free Neon database sleeps when idle, so the first request after a quiet spell can take a moment longer.
- Ideas for later: a visual refresh (a hero search, rating rings, a Day/Week toggle for trending), TV shows, GitHub sign in, going back to the movie after signing in, instant button feedback, a genre filter, search-as-you-type, a manual light/dark toggle, and a custom domain.

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie data and images are provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).