/*
  # Fix team outcome metrics RLS policies

  1. Security Changes
    - Enable RLS on team_outcome_metrics table
    - Add policies for authenticated users to:
      - Read all metrics
      - Insert new metrics
      - Update existing metrics
      - Delete metrics
    
  2. Notes
    - Policies allow authenticated users full access to metrics
    - This matches the application's current security model where all authenticated users can manage metrics
*/

-- First disable existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to read metrics" ON team_outcome_metrics;
DROP POLICY IF EXISTS "Allow authenticated users to insert metrics" ON team_outcome_metrics;
DROP POLICY IF EXISTS "Allow authenticated users to update metrics" ON team_outcome_metrics;
DROP POLICY IF EXISTS "Allow authenticated users to delete metrics" ON team_outcome_metrics;

-- Enable RLS
ALTER TABLE team_outcome_metrics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all metrics
CREATE POLICY "Allow authenticated users to read metrics"
ON team_outcome_metrics
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert metrics
CREATE POLICY "Allow authenticated users to insert metrics"
ON team_outcome_metrics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update metrics
CREATE POLICY "Allow authenticated users to update metrics"
ON team_outcome_metrics
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete metrics
CREATE POLICY "Allow authenticated users to delete metrics"
ON team_outcome_metrics
FOR DELETE
TO authenticated
USING (true);