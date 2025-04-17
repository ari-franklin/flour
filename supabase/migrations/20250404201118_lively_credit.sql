/*
  # Add status column to team_outcomes table

  1. Changes
    - Add `status` column to `team_outcomes` table with type `roadmap_status`
    - Set default value to 'now' to ensure backward compatibility
    - Make column nullable to avoid issues with existing records

  2. Notes
    - Using the existing `roadmap_status` enum type for consistency
    - Default value ensures existing functionality won't break
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_outcomes' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE team_outcomes 
    ADD COLUMN status roadmap_status DEFAULT 'now';
  END IF;
END $$;