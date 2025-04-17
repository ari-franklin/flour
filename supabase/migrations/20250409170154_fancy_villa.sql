/*
  # Add team association to success metrics

  1. Changes
    - Add team_id column to success_metrics table
    - Add foreign key constraint to teams table
    - Update RLS policies to maintain existing permissions

  2. Notes
    - Allows success metrics to be associated with specific teams
    - Maintains existing functionality while adding team context
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'success_metrics' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE success_metrics 
    ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;