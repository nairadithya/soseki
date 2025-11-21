CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text,
	`icon` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`highlight_id` text NOT NULL,
	`content_id` text NOT NULL,
	`text` text NOT NULL,
	`author_type` text NOT NULL,
	`llm_metadata` text,
	`parent_comment_id` text,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`highlight_id`) REFERENCES `highlights`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `content` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`url` text,
	`author` text,
	`saved_at` integer NOT NULL,
	`last_accessed_at` integer NOT NULL,
	`metadata` text NOT NULL,
	`content` text NOT NULL,
	`html_content` text,
	`tags` text NOT NULL,
	`collection_ids` text NOT NULL,
	`progress` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `highlights` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`selected_text` text NOT NULL,
	`context` text NOT NULL,
	`position` text NOT NULL,
	`color` text NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade
);
