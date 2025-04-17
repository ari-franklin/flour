/*
  # Add title field to team outcomes

  1. Changes
    - Add title column to team_outcomes table
    - Make title column required
    - Update existing rows to use description as title

  2. Security
    - No changes to RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_outcomes' AND column_name = 'title'
  ) THEN
    ALTER TABLE team_outcomes ADD COLUMN title text NOT NULL DEFAULT '';
    
    -- Update existing rows to use description as title
    UPDATE team_outcomes SET title = description WHERE title = '';
    
    -- Remove the default after migration
    ALTER TABLE team_outcomes ALTER COLUMN title DROP DEFAULT;
  END IF;
END $$;