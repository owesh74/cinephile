ALTER TABLE "movies" ADD COLUMN "season_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "episode_count" integer DEFAULT 0 NOT NULL;