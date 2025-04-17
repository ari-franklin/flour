/*
  # Add team outcomes and tagged metrics

  1. New Tables
    - `team_outcomes`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `description` (text)
      - `created_at` (timestamp)

  2. Changes
    - Add `team_id` to `success_metrics` table
    - Add foreign key constraint to link metrics with teams

  3. Security
    - Enable RLS on `team_outcomes` table
    - Add policies for authenticated users
*/

-- Create team outcomes table
CREATE TABLE IF NOT EXISTS team_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage team outcomes"
  ON team_outcomes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add team_id to success_metrics if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'success_metrics' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE success_metrics ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;