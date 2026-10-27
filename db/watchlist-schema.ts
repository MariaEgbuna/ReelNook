import {
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const watchlistItem = pgTable(
  "watchlist_item",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    movieId: integer("movie_id").notNull(),
    title: text("title").notNull(),
    posterPath: text("poster_path"),
    releaseDate: text("release_date").notNull().default(""),
    voteAverage: real("vote_average").notNull().default(0),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => [
    unique("watchlist_item_user_movie_unique").on(table.userId, table.movieId),
  ],
);