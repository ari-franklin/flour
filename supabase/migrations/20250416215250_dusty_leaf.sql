/*
  # Add support for multi-altitude product work view

  1. New Tables
    - `objectives` (Strategic level)
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `team_id` (uuid, references teams)
      - `is_public` (boolean)
      - `created_at` (timestamptz)

    - `outcomes` (Tactical level)
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `objective_id` (uuid, references objectives)
      - `team_id` (uuid, references teams)
      - `status` (roadmap_status: now/near/next)
      - `is_public` (boolean)
      - `created_at` (timestamptz)

    - `bets` (Initiative level)
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `outcome_id` (uuid, references outcomes)
      - `team_id` (uuid, references teams)
      - `status` (roadmap_status)
      - `is_public` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public/private access
*/

-- Create objectives table
CREATE TABLE IF NOT EXISTS objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create outcomes table
CREATE TABLE IF NOT EXISTS outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  objective_id uuid REFERENCES objectives(id) ON DELETE SET NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  status roadmap_status NOT NULL DEFAULT 'now',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  outcome_id uuid REFERENCES outcomes(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  status roadmap_status NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Policies for objectives
CREATE POLICY "Enable public read access for public objectives"
  ON objectives FOR SELECT
  USING (is_public = true);

CREATE POLICY "Enable team read access for objectives"
  ON objectives FOR SELECT
  USING (true);

CREATE POLICY "Enable team write access for objectives"
  ON objectives FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable team update access for objectives"
  ON objectives FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable team delete access for objectives"
  ON objectives FOR DELETE
  USING (true);

-- Policies for outcomes
CREATE POLICY "Enable public read access for public outcomes"
  ON outcomes FOR SELECT
  USING (is_public = true);

CREATE POLICY "Enable team read access for outcomes"
  ON outcomes FOR SELECT
  USING (true);

CREATE POLICY "Enable team write access for outcomes"
  ON outcomes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable team update access for outcomes"
  ON outcomes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable team delete access for outcomes"
  ON outcomes FOR DELETE
  USING (true);

-- Policies for bets
CREATE POLICY "Enable public read access for public bets"
  ON bets FOR SELECT
  USING (is_public = true);

CREATE POLICY "Enable team read access for bets"
  ON bets FOR SELECT
  USING (true);

CREATE POLICY "Enable team write access for bets"
  ON bets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable team update access for bets"
  ON bets FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable team delete access for bets"
  ON bets FOR DELETE
  USING (true);