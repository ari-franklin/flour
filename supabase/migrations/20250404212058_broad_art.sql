/*
  # Update team outcomes schema for strategic view

  1. Changes
    - Add target field to team_outcomes table to store the overall target
    - Add is_public field to team_outcomes for public/private visibility
    - Add order field to team_outcomes for manual sorting

  2. Notes
    - target field stores the overall strategic goal
    - is_public controls visibility in public view
    - order allows manual arrangement within status groups
*/

DO $$ 
BEGIN
  -- Add target field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_outcomes' 
    AND column_name = 'target'
  ) THEN
    ALTER TABLE team_outcomes ADD COLUMN target text;
  END IF;

  -- Add is_public field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_outcomes' 
    AND column_name = 'is_public'
  ) THEN
    ALTER TABLE team_outcomes ADD COLUMN is_public boolean DEFAULT false;
  END IF;

  -- Add order field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_outcomes' 
    AND column_name = 'order'
  ) THEN
    ALTER TABLE team_outcomes ADD COLUMN "order" integer DEFAULT 0;
  END IF;
END $$;