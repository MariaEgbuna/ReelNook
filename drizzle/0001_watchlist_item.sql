CREATE TABLE "watchlist_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"movie_id" integer NOT NULL,
	"title" text NOT NULL,
	"poster_path" text,
	"release_date" text DEFAULT '' NOT NULL,
	"vote_average" real DEFAULT 0 NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_item_user_movie_unique" UNIQUE("user_id","movie_id")
);
--> statement-breakpoint
ALTER TABLE "watchlist_item" ADD CONSTRAINT "watchlist_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;