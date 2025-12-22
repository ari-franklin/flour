/*
  # Update team outcome metrics RLS policies for anonymous access

  1. Security Changes
    - Update RLS policies on team_outcome_metrics table to allow anonymous access
    - Add policies for anonymous users to:
      - Read all metrics
      - Insert new metrics
      - Update existing metrics
      - Delete metrics
    
  2. Notes
    - Policies allow anonymous users full access to metrics
    - This is a temporary solution until authentication is implemented
*/

-- First disable existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to read metrics" ON team_outcome_metrics;
DROP POLICY IF EXISTS "Allow authenticated users to insert metrics" ON team_outcome_metrics;
DROP POLICY IF EXISTS "Allow authenticated users to update metrics" ON team_outcome_metrics;
DROP POLICY IF EXISTS "Allow authenticated users to delete metrics" ON team_outcome_metrics;

-- Enable RLS
ALTER TABLE team_outcome_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read all metrics
CREATE POLICY "Allow anonymous users to read metrics"
ON team_outcome_metrics
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to insert metrics
CREATE POLICY "Allow anonymous users to insert metrics"
ON team_outcome_metrics
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to update metrics
CREATE POLICY "Allow anonymous users to update metrics"
ON team_outcome_metrics
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anonymous users to delete metrics
CREATE POLICY "Allow anonymous users to delete metrics"
ON team_outcome_metrics
FOR DELETE
TO anon
USING (true);