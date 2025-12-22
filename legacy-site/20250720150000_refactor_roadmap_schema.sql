/*
  # Roadmap Schema Refactoring
  
  This migration refactors the roadmap schema to better support:
  1. Hierarchical metrics with parent/child relationships
  2. Different metric types (business/product)
  3. Confidence levels for outcomes and bets
  4. Status tracking for metrics
*/

-- First, create the metric_level enum type that's referenced by the metrics table
CREATE TYPE metric_level AS ENUM ('executive', 'management', 'team');

-- Create other new enums
CREATE TYPE metric_type AS ENUM ('business', 'product');
CREATE TYPE contribution_type AS ENUM ('direct', 'weighted', 'formula');
CREATE TYPE metric_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE parent_type AS ENUM ('objective', 'outcome', 'bet');

-- Check if metrics table exists and rename it if it does
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metrics') THEN
        ALTER TABLE metrics RENAME TO metrics_old;
    END IF;
END $$;

CREATE TABLE metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  current_value numeric,
  target_value numeric,
  unit text,
  level metric_level NOT NULL,
  parent_type parent_type NOT NULL,
  parent_id uuid NOT NULL,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- New fields
  metric_type metric_type NOT NULL DEFAULT 'product',
  parent_metric_id uuid REFERENCES metrics(id) ON DELETE SET NULL,
  contribution_type contribution_type DEFAULT 'direct',
  weight numeric CHECK (weight >= 0 AND weight <= 1),
  formula text,
  status metric_status DEFAULT 'todo',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT valid_weight CHECK (
    (contribution_type = 'weighted' AND weight IS NOT NULL) OR 
    (contribution_type != 'weighted' AND weight IS NULL)
  ),
  CONSTRAINT valid_formula CHECK (
    (contribution_type = 'formula' AND formula IS NOT NULL) OR 
    (contribution_type != 'formula' AND formula IS NULL)
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_metrics_parent ON metrics(parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_metrics_team ON metrics(team_id);
CREATE INDEX IF NOT EXISTS idx_metrics_parent_metric ON metrics(parent_metric_id);

-- Copy data from old metrics table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metrics_old') THEN
        INSERT INTO metrics (
          id, name, description, current_value, target_value, unit, 
          level, parent_type, parent_id, team_id, created_at, updated_at
        )
        SELECT 
          id, name, description, current_value, target_value, unit,
          level, parent_type, parent_id, team_id, created_at, updated_at
        FROM metrics_old;
    END IF;
END $$;

-- Drop old table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metrics_old') THEN
        DROP TABLE metrics_old;
    END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update updated_at
DROP TRIGGER IF EXISTS update_metrics_updated_at ON metrics;
CREATE TRIGGER update_metrics_updated_at
  BEFORE UPDATE ON metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on metrics
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Update policies for metrics
DROP POLICY IF EXISTS "Enable public read access for public metrics" ON metrics;
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

-- Team policies remain the same but need to be recreated
DROP POLICY IF EXISTS "Enable team read access for metrics" ON metrics;
CREATE POLICY "Enable team read access for metrics"
  ON metrics FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable team write access for metrics" ON metrics;
CREATE POLICY "Enable team write access for metrics"
  ON metrics FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable team update access for metrics" ON metrics;
CREATE POLICY "Enable team update access for metrics"
  ON metrics FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable team delete access for metrics" ON metrics;
CREATE POLICY "Enable team delete access for metrics"
  ON metrics FOR DELETE
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE metrics IS 'Stores metrics that can be associated with objectives, outcomes, or bets';
COMMENT ON COLUMN metrics.metric_type IS 'Type of metric: business or product';
COMMENT ON COLUMN metrics.parent_metric_id IS 'Parent metric for hierarchical relationships';
COMMENT ON COLUMN metrics.contribution_type IS 'How this metric contributes to its parent: direct, weighted, or formula';
COMMENT ON COLUMN metrics.weight IS 'Weight for weighted contribution (0-1)';
COMMENT ON COLUMN metrics.formula IS 'Formula for calculated contribution';

-- Update the search path to include the public schema
SET search_path TO public;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
