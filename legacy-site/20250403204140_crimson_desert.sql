/*
  # Update team outcomes policies

  1. Security
    - Enable RLS on team_outcomes table
    - Add policies for CRUD operations
*/

-- First disable existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to read outcomes" ON team_outcomes;
DROP POLICY IF EXISTS "Allow authenticated users to insert outcomes" ON team_outcomes;
DROP POLICY IF EXISTS "Allow authenticated users to update outcomes" ON team_outcomes;
DROP POLICY IF EXISTS "Allow authenticated users to delete outcomes" ON team_outcomes;

-- Enable RLS
ALTER TABLE team_outcomes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read all outcomes
CREATE POLICY "Allow anonymous users to read outcomes"
ON team_outcomes
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to insert outcomes
CREATE POLICY "Allow anonymous users to insert outcomes"
ON team_outcomes
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to update outcomes
CREATE POLICY "Allow anonymous users to update outcomes"
ON team_outcomes
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anonymous users to delete outcomes
CREATE POLICY "Allow anonymous users to delete outcomes"
ON team_outcomes
FOR DELETE
TO anon
USING (true);