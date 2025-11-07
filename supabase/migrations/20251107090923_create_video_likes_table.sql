-- Create Video Likes Table
--
-- Description:
-- Creates a table to store video likes from users. Supports videos from any source (internal or third-party like Xanimu).
--
-- New Tables:
--   - video_likes
--     - id (uuid, primary key) - Unique identifier for the like
--     - user_id (uuid) - References the user who liked the video
--     - video_id (text) - ID of the video (can be from any source)
--     - video_source (text) - Source of the video (e.g., 'xanimu', 'local', 'pexels')
--     - created_at (timestamptz) - When the like was created
--
-- Indexes:
--   - Unique constraint on (user_id, video_id, video_source) to prevent duplicate likes
--   - Index on user_id for fast user-specific queries
--   - Index on video_id for fast video-specific queries
--
-- Security:
--   - Enable RLS on video_likes table
--   - Policy: Users can read all likes
--   - Policy: Users can create likes only for themselves
--   - Policy: Users can delete their own likes

CREATE TABLE IF NOT EXISTS video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id text NOT NULL,
  video_source text NOT NULL DEFAULT 'local',
  created_at timestamptz DEFAULT now()
);

-- Create unique constraint to prevent duplicate likes
CREATE UNIQUE INDEX IF NOT EXISTS video_likes_user_video_unique 
  ON video_likes(user_id, video_id, video_source);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS video_likes_user_id_idx ON video_likes(user_id);
CREATE INDEX IF NOT EXISTS video_likes_video_id_idx ON video_likes(video_id);

-- Enable RLS
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read likes (to show like counts)
CREATE POLICY "Anyone can read video likes"
  ON video_likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can create likes only for themselves
CREATE POLICY "Users can create their own likes"
  ON video_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON video_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);