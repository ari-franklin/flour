/*
  # Clean Schema Reset
  
  This migration drops all existing roadmap-related tables and enums,
  then recreates them with the exact schema we need.
  
  WARNING: This will delete all existing data in these tables!
*/

-- Drop tables if they exist (in reverse order of dependency)
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS outcomes CASCADE;
DROP TABLE IF EXISTS objectives CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Drop enums if they exist
DROP TYPE IF EXISTS metric_level CASCADE;
DROP TYPE IF EXISTS metric_type CASCADE;
DROP TYPE IF EXISTS contribution_type CASCADE;
DROP TYPE IF EXISTS metric_status CASCADE;
DROP TYPE IF EXISTS parent_type CASCADE;
DROP TYPE IF EXISTS roadmap_status CASCADE;

-- Create enums first
CREATE TYPE metric_level AS ENUM ('executive', 'management', 'team');
CREATE TYPE metric_type AS ENUM ('business', 'product');
CREATE TYPE contribution_type AS ENUM ('direct', 'weighted', 'formula');
CREATE TYPE metric_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE parent_type AS ENUM ('objective', 'outcome', 'bet');
CREATE TYPE roadmap_status AS ENUM ('now', 'near', 'next');

-- Create teams table (no dependencies)
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create objectives table (depends on teams)
CREATE TABLE objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create outcomes table (depends on objectives and teams)
CREATE TABLE outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  objective_id uuid REFERENCES objectives(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  status roadmap_status NOT NULL DEFAULT 'now',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bets table (depends on outcomes and teams)
CREATE TABLE bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  outcome_id uuid NOT NULL REFERENCES outcomes(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  status roadmap_status NOT NULL DEFAULT 'now',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create metrics table (depends on all other tables)
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
CREATE INDEX idx_metrics_parent ON metrics(parent_type, parent_id);
CREATE INDEX idx_metrics_team ON metrics(team_id);
CREATE INDEX idx_metrics_parent_metric ON metrics(parent_metric_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you may want to adjust these based on your needs)
-- Teams policies
CREATE POLICY "Enable read access for all users" ON teams FOR SELECT USING (true);

-- Objectives policies
CREATE POLICY "Enable read access for public objectives" ON objectives FOR SELECT USING (is_public = true);
CREATE POLICY "Enable all access for authenticated users" ON objectives USING (true) WITH CHECK (true);

-- Outcomes policies
CREATE POLICY "Enable read access for public outcomes" ON outcomes FOR SELECT USING (is_public = true);
CREATE POLICY "Enable all access for authenticated users" ON outcomes USING (true) WITH CHECK (true);

-- Bets policies
CREATE POLICY "Enable read access for public bets" ON bets FOR SELECT USING (is_public = true);
CREATE POLICY "Enable all access for authenticated users" ON bets USING (true) WITH CHECK (true);

-- Metrics policies
CREATE POLICY "Enable read access for public metrics" ON metrics FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON metrics USING (true) WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE metrics IS 'Stores metrics that can be associated with objectives, outcomes, or bets';
COMMENT ON COLUMN metrics.metric_type IS 'Type of metric: business or product';
COMMENT ON COLUMN metrics.parent_metric_id IS 'Parent metric for hierarchical relationships';
COMMENT ON COLUMN metrics.contribution_type IS 'How this metric contributes to its parent: direct, weighted, or formula';
COMMENT ON COLUMN metrics.weight IS 'Weight for weighted contribution (0-1)';
COMMENT ON COLUMN metrics.formula IS 'Formula for calculated contribution';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Reset the search path
SET search_path TO public;
