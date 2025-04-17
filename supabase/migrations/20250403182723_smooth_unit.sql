/*
  # Add RLS policies for team outcome metrics

  1. Security
    - Enable RLS on team_outcome_metrics table
    - Add policies for authenticated users to manage metrics
    - Allow authenticated users to read all metrics
    - Allow authenticated users to create and update metrics
*/

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