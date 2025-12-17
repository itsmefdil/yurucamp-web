-- Add video_id to activity_likes
ALTER TABLE public.activity_likes 
ADD COLUMN IF NOT EXISTS video_id text;

-- Add video_id to activity_comments
ALTER TABLE public.activity_comments 
ADD COLUMN IF NOT EXISTS video_id text;

-- Update unique constraint for likes to allow uniqueness either by activity_id OR video_id
ALTER TABLE public.activity_likes 
DROP CONSTRAINT IF EXISTS activity_likes_unique_user_activity;

-- We can't easily enforce XOR (activity_id vs video_id) uniquely with a single constraint in Postgres 
-- without partial indexes or complex check constraints. 
-- For simplicity, we'll create a unique index for video_id likes.
CREATE UNIQUE INDEX IF NOT EXISTS activity_likes_unique_user_video 
ON public.activity_likes (user_id, video_id) 
WHERE video_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS activity_likes_unique_user_activity_new
ON public.activity_likes (user_id, activity_id) 
WHERE activity_id IS NOT NULL;

-- Make activity_id nullable so we can have likes only for videos
ALTER TABLE public.activity_likes 
ALTER COLUMN activity_id DROP NOT NULL;

-- Make activity_id nullable for comments too
ALTER TABLE public.activity_comments 
ALTER COLUMN activity_id DROP NOT NULL;
