# ReelNook

**ReelNook** is a movie discovery app where you can browse what's trending, search for any movie, watch trailers, see the cast, get a random pick for tonight, and sign in to keep a personal watchlist that is saved in a database.

**Live demo:** https://reelnook-dusky.vercel.app

![Home page](docs/screenshots/home.png)

**Details page**

| Overview | Trailer | Cast |
|---|---|---|
| ![Details](docs/screenshots/details.png) | ![Trailer](docs/screenshots/trailer.png) | ![Cast](docs/screenshots/cast.png) |

**Accounts and watchlist**

| Sign up | Sign in | Watchlist (signed in) |
|---|---|---|
| ![Sign up](docs/screenshots/sign-up.png) | ![Sign in](docs/screenshots/sign-in.png) | ![Watchlist](docs/screenshots/watchlist.png) |

| Light Theme | Dark Theme |
|---|---|
| ![Mobile light](docs/screenshots/mobile-light.png) | ![Mobile dark](docs/screenshots/mobile-dark.png) |

## Features

- **Trending today:** the home page shows what's trending, with posters, year, and rating.
- **Search:** the search term lives in the URL (`/search?q=batman`), so results can be refreshed, bookmarked, and shared.
- **Details page:** poster, tagline, genres, runtime, overview, embedded trailer, and top cast.
- **Random pick:** one click opens a random well-reviewed movie.
- **Accounts:** sign up, sign in, and sign out with email and password.
- **Personal watchlist:** signed-in users can save and remove movies. The list is stored in PostgreSQL, so it follows the user across devices, and the header shows a live count.
- **Protected pages:** the watchlist page is only for signed-in users, and every user only ever sees their own list.
- **Loading, empty, error, and not-found states:** skeleton placeholders while data loads, friendly messages when there are no results, and a proper page for bad URLs.
- **Light and dark theme:** follows the device setting.
- **Responsive:** works on phones, tablets, and desktops.
- **Deployed:** the live demo runs on Vercel with a Neon database.

## Tech stack

| Tool | Why I used it |
|---|---|
| Next.js 16 (App Router) | Server components let me call APIs and the database on the server, so keys and passwords never reach the browser. |
| TypeScript | Catches mistakes early, and the TMDB response shapes and database tables are typed. |
| Tailwind CSS v4 | Fast styling, with color variables for the light and dark theme. |
| TMDB API | Free, large movie database with images, cast, and trailers. |
| PostgreSQL | A real relational database. I already knew it, and it enforces rules like unique rows and foreign keys. |
| Drizzle ORM and drizzle-kit | Close to plain SQL, with typed queries and migration files that record how the database changed. |
| Better Auth | Handles sign up, sign in, sessions, and password hashing, and stores users in my own database. |
| Neon | Hosted PostgreSQL for the live site. The free plan puts the database to sleep when idle, so the first request after a quiet spell can be slower. |
| Vercel | Hosting. Deploys automatically from `main`. |

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

Make the secret with `openssl rand -base64 32`. The TMDB key can be the short API key or the long "Read Access Token" (the app detects which one you used). Keep this file out of git: it is already in `.gitignore`.

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
   The `read -s` form keeps the password out of the screen and the shell history.
3. **Import the repo in Vercel** and add the environment variables before the first deploy, because the build needs `DATABASE_URL`:
   - `TMDB_API_KEY`
   - `DATABASE_URL` (the pooled string)
   - `BETTER_AUTH_SECRET` (a new secret, not the one from `.env.local`)
   - `BETTER_AUTH_URL` (the exact production address, with no slash at the end)
4. **Sign in only works on the address named in `BETTER_AUTH_URL`.** If Vercel gives your project a different address than you expected, correct the variable and redeploy.

## Project structure

```
app/
  layout.tsx              Page shell: header, content, footer
  page.tsx                Home: search bar, random pick button, trending grid
  loading.tsx             Skeleton for list pages
  error.tsx               Friendly error page with a retry button
  not-found.tsx           Page for missing movies and bad URLs
  icon.svg                Tab icon (also apple-icon.png and favicon.ico)
  search/page.tsx         Search results
  movie/[id]/page.tsx     Details page
  movie/[id]/loading.tsx  Skeleton for the details page
  watchlist/page.tsx      The signed-in user's saved movies
  sign-in/page.tsx        Sign in form
  sign-up/page.tsx        Sign up form
  random/route.ts         Picks a random movie and redirects to it
  api/auth/[...all]/      Better Auth route handler (all auth endpoints)
  actions/watchlist.ts    Server action: add or remove a movie
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
| `user_id` | Foreign key to `user`, with `ON DELETE CASCADE` so deleting a user deletes their list |
| `movie_id` | The TMDB id |
| `title`, `poster_path`, `release_date`, `vote_average` | Saved so the watchlist can show cards without asking TMDB again |
| `added_at` | Defaults to now |

There is a **unique constraint on (`user_id`, `movie_id`)**, so the same movie cannot be saved twice by the same user, even if two clicks arrive at once. That constraint also creates an index starting with `user_id`, so lookups by user are fast without a separate index.

My table lives in its own file so that re-running the Better Auth CLI, which rewrites `db/auth-schema.ts`, can never overwrite it.

## How it works

- **Keys and passwords stay on the server.** Pages are server components, and none of the secrets have a `NEXT_PUBLIC_` prefix, so they are never sent to the browser.
- **One place for API calls.** `lib/tmdb.ts` holds the base URL, the key handling, retries (3 attempts), and an 8 second timeout. A 404 from TMDB becomes a proper "not found" page, and other failures reach the error page.
- **Fewer requests.** The details page asks TMDB for the movie, cast, and trailers in a single request, and responses are cached for an hour.
- **Search uses a plain form** that goes to `/search?q=...`, so it works without client-side JavaScript.
- **The movie id from the URL is checked** (digits only) before it is used in an API request.
- **The database connection is built for serverless.** The app keeps a very small pool (2 connections) and tells Vercel to close idle ones, and the live site connects through Neon's pooled address so many short-lived instances share a few real connections.

## Security

- **Passwords are never stored in plain text.** Better Auth hashes them, and I never write code that touches the raw password.
- **Sessions use an HttpOnly cookie**, so scripts on the page cannot read it.
- **Two layers protect the watchlist page.** `proxy.ts` quickly redirects visitors who have no session cookie, but it only checks that a cookie exists. The page itself then validates the session on the server and redirects if it is not real. I tested this by creating a fake session cookie: the proxy let it through, and the page rejected it.
- **The user id always comes from the server session,** never from anything the browser sends. Every watchlist query filters by it, so one user cannot read or change another user's list. I tested this with two accounts.
- **Server actions validate their input.** The movie data sent from the browser is checked field by field before it is saved.
- **Rate limiting is on.** Sign in is limited to 3 attempts per 10 seconds by default. I confirmed it with a test: three wrong attempts got a 401 and the next three got a 429. The counters are stored in the database, so the limit works across Vercel's serverless instances and survives restarts. The form shows a friendly message when blocked.
- **Sign in errors are generic.** A wrong password and an unknown email both say "Invalid email or password", so the form does not reveal which emails have accounts.

## What I learned

Problems I ran into and how I solved them:

- **Images didn't load after changing `next.config.ts`.** Next.js only reads that file at startup, so I needed to restart the dev server. Later I also deleted the `export default nextConfig;` line by accident, which made Next.js ignore the whole file, including the image host list and the Tailwind rule.
- **Requests to TMDB timed out from Node but worked in `curl`.** On a phone hotspot, Node 20 gave the IPv4 connection too little time before also trying IPv6 (which had no route). Starting Node with `--dns-result-order=ipv4first --no-network-family-autoselection` fixed it, and I added retries and a timeout so real users on weak connections get a friendly error instead of a crash.
- **`loading.tsx` was ignored.** I had created a second `app` folder inside `app`. Special Next.js files only work in the right place.
- **Parts of the UI were invisible in light mode.** My colors were fixed for a dark page. I replaced them with named color variables (`surface`, `muted`, `accent`, and so on) that have a light and a dark value.
- **The watchlist button did nothing when testing on my phone.** The dev server blocks scripts requested from other addresses, so I added my PC's address to `allowedDevOrigins` (and removed it again before committing).
- **The random pick redirect sent my phone to `localhost`.** Redirecting with a relative path fixed it.
- **The Better Auth CLI crashed with `Object.groupBy is not a function`.** It needs Node 22.12 or newer, and I was on Node 20, which reached end of life in April 2026. Upgrading to Node 24 with nvm fixed it, and my app ran unchanged.
- **`npm install` crashed with `Cannot read properties of null (reading 'edgesOut')`.** The npm debug log showed a bug in npm 10 while it resolved the many optional peer packages that Better Auth lists. Installing with `--legacy-peer-deps` worked around it.
- **Moving the watchlist from the browser to a database changed the architecture.** The header became a server component that reads the session and the count, with a small client component for the sign out button. Server actions then call `revalidatePath` so the count updates by itself.
- **Rate limiting in memory does not work on serverless hosting.** Counters in memory reset on every restart and are not shared between instances, so I moved them into the database with a new migration.
- **Serverless functions can use up a small database's connections.** I shrank the connection pool, added Vercel's helper that closes idle connections, and used Neon's pooled address for the app. Migrations use the direct address instead.
- **Login only works on the address named in `BETTER_AUTH_URL`.** Vercel had added a suffix to my project's address, so my first guess was wrong. I corrected the variable and redeployed.

## Known limits and ideas

- Email verification and password reset are not set up yet, and there is no way to delete an account from the app.
- Sign ups are open on the live demo, so use a throwaway email and password.
- The free Neon database sleeps when idle, so the first request after a quiet spell can take a moment longer.
- Ideas for later: GitHub sign in, going back to the movie after signing in, instant button feedback, a genre filter, search-as-you-type, a manual light/dark toggle, TV shows, a custom domain.

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie data and images are provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).