CREATE TABLE "entries" (
	"id" text PRIMARY KEY,
	"path_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"note" text,
	"date" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paths" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"description" text,
	"banner" text,
	"is_public" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"x_account" text,
	"avatar" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "entries_path_date_unique" ON "entries" ("path_id","date");--> statement-breakpoint
CREATE INDEX "entries_path_date_idx" ON "entries" ("path_id","date");--> statement-breakpoint
CREATE INDEX "feedback_user_idx" ON "feedback" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" ("user_id");--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_path_id_paths_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id");--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "paths" ADD CONSTRAINT "paths_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");