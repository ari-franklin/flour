/*
  # Add team outcome metrics

  1. New Tables
    - `team_outcome_metrics`
      - `id` (uuid, primary key)
      - `outcome_id` (uuid, references team_outcomes)
      - `status` (roadmap_status)
      - `target_value` (text)
      - `current_value` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `team_outcome_metrics` table
    - Add policy for authenticated users to manage metrics
*/

CREATE TABLE IF NOT EXISTS team_outcome_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome_id uuid REFERENCES team_outcomes(id) ON DELETE CASCADE,
  status roadmap_status NOT NULL,
  target_value text NOT NULL,
  current_value text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_outcome_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage team outcome metrics"
  ON team_outcome_metrics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);