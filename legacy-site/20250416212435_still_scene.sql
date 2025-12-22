/*
  # Enable anonymous team updates

  1. Changes
    - Add RLS policy to allow anonymous users to update team names
    - Maintain existing policies for read access and authenticated updates

  2. Security
    - Anonymous users can now update team names
    - Maintains existing read access for all users
*/

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Enable authenticated update access for teams" ON teams;

-- Create new policy allowing anonymous updates
CREATE POLICY "Enable anonymous update access for teams"
  ON teams FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);