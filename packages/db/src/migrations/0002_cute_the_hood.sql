CREATE TABLE `__new_restaurants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`image_key` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `__new_restaurants`(
  "id",
  "name",
  "address",
  "latitude",
  "longitude",
  "image_key",
  "created_at",
  "updated_at"
)
SELECT
  r."id",
  r."name",
  COALESCE(r."address", ''),
  COALESCE(r."latitude", 0),
  COALESCE(r."longitude", 0),
  COALESCE(
    (
      SELECT p."r2_key"
      FROM `photos` AS p
      WHERE p."restaurant_id" = r."id"
      ORDER BY p."created_at" DESC, p."id" DESC
      LIMIT 1
    ),
    ''
  ),
  r."created_at",
  r."updated_at"
FROM `restaurants` AS r;
--> statement-breakpoint
DROP TABLE `photos`;--> statement-breakpoint
DROP TABLE `restaurants`;--> statement-breakpoint
ALTER TABLE `__new_restaurants` RENAME TO `restaurants`;--> statement-breakpoint
