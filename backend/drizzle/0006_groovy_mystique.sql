-- Drop Foreign Key Constraints
ALTER TABLE "activity_comments" DROP CONSTRAINT IF EXISTS "activity_comments_activity_id_activities_id_fk";--> statement-breakpoint
ALTER TABLE "activity_likes" DROP CONSTRAINT IF EXISTS "activity_likes_activity_id_activities_id_fk";--> statement-breakpoint
ALTER TABLE "event_participants" DROP CONSTRAINT IF EXISTS "event_participants_event_id_events_id_fk";--> statement-breakpoint
ALTER TABLE "gear_categories" DROP CONSTRAINT IF EXISTS "gear_categories_gear_list_id_gear_lists_id_fk";--> statement-breakpoint

-- Alter Column Types
ALTER TABLE "activity_comments" ALTER COLUMN "activity_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity_likes" ALTER COLUMN "activity_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "event_participants" ALTER COLUMN "event_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gear_categories" ALTER COLUMN "gear_list_id" SET DATA TYPE text;--> statement-breakpoint

ALTER TABLE "activities" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "camp_areas" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "camp_areas" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gear_lists" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gear_lists" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint

-- Re-add Foreign Key Constraints
ALTER TABLE "activity_comments" ADD CONSTRAINT "activity_comments_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "activity_likes" ADD CONSTRAINT "activity_likes_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "gear_categories" ADD CONSTRAINT "gear_categories_gear_list_id_gear_lists_id_fk" FOREIGN KEY ("gear_list_id") REFERENCES "gear_lists"("id") ON DELETE cascade;