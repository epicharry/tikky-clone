/*
  # Create Follows Table

  1. New Tables
    - `follows`
      - `id` (uuid, primary key, auto-generated)
      - `follower_id` (uuid, not null) - User who is following
      - `following_id` (uuid, not null) - User being followed
      - `created_at` (timestamptz, default now()) - When the follow relationship was created

  2. Security
    - Enable RLS on `follows` table
    - Add policy for users to view all follow relationships
    - Add policy for users to create follows (follow someone)
    - Add policy for users to delete their own follows (unfollow)

  3. Important Notes
    - Unique constraint ensures a user can't follow the same person twice
    - Foreign keys ensure data integrity with users table
*/

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view follow relationships
CREATE POLICY "Follow relationships are viewable by everyone"
  ON follows
  FOR SELECT
  USING (true);

-- Policy: Users can follow others
CREATE POLICY "Users can follow others"
  ON follows
  FOR INSERT
  WITH CHECK (follower_id = (current_setting('app.user_id', true))::uuid);

-- Policy: Users can unfollow
CREATE POLICY "Users can unfollow"
  ON follows
  FOR DELETE
  USING (follower_id = (current_setting('app.user_id', true))::uuid);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment following_count for follower
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    -- Increment followers_count for followed user
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement following_count for follower
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    -- Decrement followers_count for followed user
    UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update follow counts
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();
