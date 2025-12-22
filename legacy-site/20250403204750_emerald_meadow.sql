/*
  # Fix team outcomes persistence

  1. Changes
    - Clean up and standardize RLS policies for team_outcomes and team_outcome_metrics
    - Enable public read access
    - Restrict write operations to authenticated users
  
  2. Security
    - Public can read all outcomes and metrics
    - Only authenticated users can modify data
*/

-- Clean up existing policies
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
CREATE POLICY "Enable public read access for outcomes"
  ON team_outcomes FOR SELECT
  USING (true);

CREATE POLICY "Enable authenticated write access for outcomes"
  ON team_outcomes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable authenticated update access for outcomes"
  ON team_outcomes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable authenticated delete access for outcomes"
  ON team_outcomes FOR DELETE
  TO authenticated
  USING (true);

-- Policies for team_outcome_metrics
CREATE POLICY "Enable public read access for metrics"
  ON team_outcome_metrics FOR SELECT
  USING (true);

CREATE POLICY "Enable authenticated write access for metrics"
  ON team_outcome_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable authenticated update access for metrics"
  ON team_outcome_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable authenticated delete access for metrics"
  ON team_outcome_metrics FOR DELETE
  TO authenticated
  USING (true);