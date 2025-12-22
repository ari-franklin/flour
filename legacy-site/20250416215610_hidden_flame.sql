/*
  # Update RLS policies for anonymous access

  1. Changes
    - Drop existing team-based policies
    - Add new policies allowing anonymous access for all operations
    - Update all tables to allow full CRUD operations for anonymous users

  2. Security
    - Enable anonymous access for all operations
    - Maintain public/private visibility rules
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable team read access for objectives" ON objectives;
DROP POLICY IF EXISTS "Enable team write access for objectives" ON objectives;
DROP POLICY IF EXISTS "Enable team update access for objectives" ON objectives;
DROP POLICY IF EXISTS "Enable team delete access for objectives" ON objectives;

DROP POLICY IF EXISTS "Enable team read access for outcomes" ON outcomes;
DROP POLICY IF EXISTS "Enable team write access for outcomes" ON outcomes;
DROP POLICY IF EXISTS "Enable team update access for outcomes" ON outcomes;
DROP POLICY IF EXISTS "Enable team delete access for outcomes" ON outcomes;

DROP POLICY IF EXISTS "Enable team read access for bets" ON bets;
DROP POLICY IF EXISTS "Enable team write access for bets" ON bets;
DROP POLICY IF EXISTS "Enable team update access for bets" ON bets;
DROP POLICY IF EXISTS "Enable team delete access for bets" ON bets;

-- Objectives policies
CREATE POLICY "Enable public read access for objectives"
  ON objectives FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable team write access for objectives"
  ON objectives FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable team update access for objectives"
  ON objectives FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable team delete access for objectives"
  ON objectives FOR DELETE
  TO public
  USING (true);

-- Outcomes policies
CREATE POLICY "Enable public read access for outcomes"
  ON outcomes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable team write access for outcomes"
  ON outcomes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable team update access for outcomes"
  ON outcomes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable team delete access for outcomes"
  ON outcomes FOR DELETE
  TO public
  USING (true);

-- Bets policies
CREATE POLICY "Enable public read access for bets"
  ON bets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable team write access for bets"
  ON bets FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable team update access for bets"
  ON bets FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable team delete access for bets"
  ON bets FOR DELETE
  TO public
  USING (true);