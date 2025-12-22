/*
  # Fix RLS policies for data persistence

  1. Changes
    - Remove anonymous access
    - Add proper authenticated user policies
    - Enable RLS on both tables
  
  2. Security
    - Only authenticated users can modify data
    - Public read access is maintained
*/

-- First clean up existing policies
DROP POLICY IF EXISTS "Allow anonymous users to read outcomes" ON team_outcomes;
DROP POLICY IF EXISTS "Allow anonymous users to insert outcomes" ON team_outcomes;
DROP POLICY IF EXISTS "Allow anonymous users to update outcomes" ON team_outcomes;
DROP POLICY IF EXISTS "Allow anonymous users to delete outcomes" ON team_outcomes;

DROP POLICY IF EXISTS "Allow anonymous users to read metrics" ON team_outcome_metrics;
DROP POLICY IF EXISTS "Allow anonymous users to insert metrics" ON team_outcome_metrics;
DROP POLICY IF EXISTS "Allow anonymous users to update metrics" ON team_outcome_metrics;
DROP POLICY IF EXISTS "Allow anonymous users to delete metrics" ON team_outcome_metrics;

-- Enable RLS on both tables
ALTER TABLE team_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_outcome_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for team_outcomes
CREATE POLICY "Enable read access for all users" ON team_outcomes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON team_outcomes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON team_outcomes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON team_outcomes
  FOR DELETE TO authenticated USING (true);

-- Policies for team_outcome_metrics
CREATE POLICY "Enable read access for all users" ON team_outcome_metrics
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON team_outcome_metrics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON team_outcome_metrics
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON team_outcome_metrics
  FOR DELETE TO authenticated USING (true);