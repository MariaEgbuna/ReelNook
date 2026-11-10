ALTER TABLE "watchlist_item" 
ADD COLUMN "status" text DEFAULT 'to_watch' NOT NULL;--> statement-breakpoint
ALTER TABLE "watchlist_item" 
ADD CONSTRAINT "watchlist_item_status_check" CHECK ("watchlist_item"."status" in ('to_watch', 'watched'));