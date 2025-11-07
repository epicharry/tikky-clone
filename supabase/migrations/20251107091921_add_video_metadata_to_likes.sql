-- Add video metadata to video_likes table
--
-- Description:
-- Adds columns to store complete video information so liked videos can be replayed.
-- This includes video URL, thumbnail, creator info, and description.
--
-- Changes:
--   - Add video_url column to store the playable video link
--   - Add thumbnail_url column for video preview
--   - Add video_data JSONB column to store complete video metadata
--
-- Note: Using JSONB for flexibility to store different video structures from various sources

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_likes' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE video_likes ADD COLUMN video_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_likes' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE video_likes ADD COLUMN thumbnail_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_likes' AND column_name = 'video_data'
  ) THEN
    ALTER TABLE video_likes ADD COLUMN video_data jsonb;
  END IF;
END $$;