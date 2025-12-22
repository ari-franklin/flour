/*
  # Add team name update functionality

  1. Changes
    - Add RLS policies for team name updates
    - Enable authenticated users to update team names
    - Maintain existing team data integrity

  2. Security
    - Only authenticated users can update team names
    - Public read access is maintained
*/

-- Enable RLS on teams table if not already enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Allow public read access to teams
CREATE POLICY "Enable public read access for teams"
  ON teams FOR SELECT
  USING (true);

-- Allow authenticated users to update team names
CREATE POLICY "Enable authenticated update access for teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);