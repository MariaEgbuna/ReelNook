import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "../db/auth-schema";
import * as watchlistSchema from "../db/watchlist-schema";

const schema = { ...authSchema, ...watchlistSchema };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check .env.local");
}

// In development, Next.js reloads your code often. Keeping the pool on
// globalThis stops a new pool (and new connections) from being created
// on every reload.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    connectionTimeoutMillis: 5000, // fail fast if the database is down
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool, { schema });