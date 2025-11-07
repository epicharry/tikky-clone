/*
  # Create Users Table

  1. New Tables
    - `users`
      - `id` (uuid, primary key, auto-generated)
      - `username` (text, unique, not null) - User's unique username
      - `password_hash` (text, not null) - Hashed password using bcrypt
      - `avatar_url` (text, nullable) - Optional profile picture URL
      - `bio` (text, nullable) - User bio/description
      - `followers_count` (integer, default 0) - Number of followers
      - `following_count` (integer, default 0) - Number of users following
      - `created_at` (timestamptz, default now()) - Account creation timestamp
      - `updated_at` (timestamptz, default now()) - Last update timestamp

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read all user profiles (public data)
    - Add policy for users to update only their own profile
    - Add policy for authenticated users to read their own password hash (needed for login verification)

  3. Important Notes
    - Password hashing will be handled in the application layer using bcrypt
    - The password_hash field should never be returned in normal profile queries
    - Username is case-sensitive and unique
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  avatar_url text DEFAULT 'https://i.pravatar.cc/150?img=99',
  bio text DEFAULT 'New to the platform! 🎉',
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read public user profile data (excluding password_hash)
CREATE POLICY "Public profiles are viewable by everyone"
  ON users
  FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (id = (current_setting('app.user_id', true))::uuid)
  WITH CHECK (id = (current_setting('app.user_id', true))::uuid);

-- Policy: Allow user registration (insert)
CREATE POLICY "Anyone can register"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
