/*
  # Create roadmap items table and policies

  1. New Types
    - `roadmap_status` enum ('now', 'near', 'next')

  2. New Tables
    - `roadmap_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `is_public` (boolean)
      - `team` (text)
      - `status` (roadmap_status)
      - `created_at` (timestamp with time zone, default now())

  3. Security
    - Enable RLS on `roadmap_items` table
    - Add policies for authenticated users to manage items
    - Add policy for public read access to public items
*/

-- Create roadmap_status type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roadmap_status') THEN
    CREATE TYPE roadmap_status AS ENUM ('now', 'near', 'next');
  END IF;
END $$;

-- Create roadmap items table
CREATE TABLE IF NOT EXISTS roadmap_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  team text NOT NULL,
  status roadmap_status NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to public items"
  ON roadmap_items
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Allow authenticated users to manage items"
  ON roadmap_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);