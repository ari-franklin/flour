/*
  # Fractal Roadmap Data Model Enhancements

  1. Add Metrics Table
    - `metrics`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `current_value` (numeric)
      - `target_value` (numeric)
      - `unit` (text)
      - `level` (metric_level: executive/management/team)
      - `parent_type` (parent_type: objective/outcome/bet)
      - `parent_id` (uuid, references objectives/outcomes/bets)
      - `team_id` (uuid, references teams)
      - `created_at` (timestamptz)

  2. Add Enums
    - `metric_level`: executive/management/team
    - `parent_type`: objective/outcome/bet

  3. Add Summary Fields
    - Add `executive_summary` to objectives
    - Add `management_summary` to outcomes
    - Add `team_summary` to bets

  4. Update Existing Tables
    - Add summary fields to objectives, outcomes, and bets
*/

-- Create enums
CREATE TYPE metric_level AS ENUM ('executive', 'management', 'team');
CREATE TYPE parent_type AS ENUM ('objective', 'outcome', 'bet');

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  current_value numeric,
  target_value numeric,
  unit text,
  level metric_level NOT NULL,
  parent_type parent_type NOT NULL,
  parent_id uuid NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add summary fields to objectives
ALTER TABLE objectives 
  ADD COLUMN IF NOT EXISTS executive_summary text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add summary fields to outcomes
ALTER TABLE outcomes
  ADD COLUMN IF NOT EXISTS management_summary text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add summary fields to bets
ALTER TABLE bets
  ADD COLUMN IF NOT EXISTS team_summary text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_metrics_parent ON metrics(parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_metrics_team ON metrics(team_id);

-- Enable RLS on metrics
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Policies for metrics
CREATE POLICY "Enable public read access for public metrics"
  ON metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM objectives o 
    WHERE o.id = metrics.parent_id AND o.is_public = true AND metrics.parent_type = 'objective'
  ) OR EXISTS (
    SELECT 1 FROM outcomes o 
    WHERE o.id = metrics.parent_id AND o.is_public = true AND metrics.parent_type = 'outcome'
  ) OR EXISTS (
    SELECT 1 FROM bets b 
    WHERE b.id = metrics.parent_id AND b.is_public = true AND metrics.parent_type = 'bet'
  ));

CREATE POLICY "Enable team read access for metrics"
  ON metrics FOR SELECT
  USING (true);

CREATE POLICY "Enable team write access for metrics"
  ON metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable team update access for metrics"
  ON metrics FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable team delete access for metrics"
  ON metrics FOR DELETE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update updated_at
CREATE TRIGGER update_objectives_updated_at
  BEFORE UPDATE ON objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outcomes_updated_at
  BEFORE UPDATE ON outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bets_updated_at
  BEFORE UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_updated_at
  BEFORE UPDATE ON metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update the search path to include the public schema
SET search_path TO public;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
