CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `entries_path_date_unique` ON `entries` (`path_id`,`date`);--> statement-breakpoint
CREATE INDEX `entries_path_date_idx` ON `entries` (`path_id`,`date`);