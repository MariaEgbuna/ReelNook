# Movie App

A movie discovery app where you can browse what's trending, search for any movie, watch trailers, see the cast, get a random pick for tonight, and sign in to keep a personal watchlist that is saved in a database.

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

## Getting started

You need:
- Node.js 24 (the current LTS; the Better Auth CLI needs Node 22.12 or newer)
- PostgreSQL 16 or newer, running locally
- A free [TMDB API key](https://www.themoviedb.org/settings/api)

**1. Clone and install**

```bash
git clone https://github.com/MariaEgbuna/movie-app.git
cd movie-app
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

## Project structure

```
app/
  layout.tsx              Page shell: header, content, footer
  page.tsx                Home: search bar, random pick button, trending grid
  loading.tsx             Skeleton for list pages
  error.tsx               Friendly error page with a retry button
  not-found.tsx           Page for missing movies and bad URLs
  search/page.tsx         Search results
  movie/[id]/page.tsx     Details page
  movie/[id]/loading.tsx  Skeleton for the details page
  watchlist/page.tsx      The signed-in user's saved movies
  sign-in/page.tsx        Sign in form
  sign-up/page.tsx        Sign up form
  random/route.ts         Picks a random movie and redirects to it
  api/auth/[...all]/      Better Auth route handler (all auth endpoints)
  actions/watchlist.ts    Server action: add or remove a movie
components/               Header, HeaderNav, Footer, MovieCard, MovieGrid, SearchBar,
                          AuthForm, WatchlistButton, skeletons
db/
  auth-schema.ts          Tables generated for Better Auth (user, session, account, verification)
  watchlist-schema.ts     My own table: watchlist_item
drizzle/                  Migration files (the history of the database)
lib/
  tmdb.ts                 All TMDB requests, with retries and timeouts
  db.ts                   Shared database connection
  auth.ts                 Better Auth setup (server)
  auth-client.ts          Better Auth client (browser)
  session.ts              getSession(): who is signed in on this request
  watchlist-queries.ts    Read queries for the watchlist
proxy.ts                  First gate: redirects signed-out visitors away from /watchlist
drizzle.config.ts         drizzle-kit settings
```

## Database

Better Auth creates four tables: `user`, `session`, `account` (where the password hash is stored), and `verification`. I added one:

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

## Security

- **Passwords are never stored in plain text.** Better Auth hashes them, and I never write code that touches the raw password.
- **Sessions use an HttpOnly cookie**, so scripts on the page cannot read it.
- **Two layers protect the watchlist page.** `proxy.ts` quickly redirects visitors who have no session cookie, but it only checks that a cookie exists. The page itself then validates the session on the server and redirects if it is not real. I tested this by creating a fake session cookie: the proxy let it through, and the page rejected it.
- **The user id always comes from the server session,** never from anything the browser sends. Every watchlist query filters by it, so one user cannot read or change another user's list. I tested this with two accounts.
- **Server actions validate their input.** The movie data sent from the browser is checked field by field before it is saved.
- **Rate limiting is on.** Sign in is limited to 3 attempts per 10 seconds by default. I confirmed it with a test: three wrong attempts got a 401 and the next three got a 429. The form shows a friendly message when blocked.
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

## Known limits and ideas

- Email verification and password reset are not set up yet.
- Rate limit counters are kept in memory, which is fine for one local server. A deployed version would store them in the database.
- The app is not deployed yet. That needs a hosted PostgreSQL database and the environment variables set on the host.
- Ideas for later: GitHub sign in, going back to the movie after signing in, instant button feedback, a genre filter, search-as-you-type, a manual light/dark toggle, TV shows.

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie data and images are provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).