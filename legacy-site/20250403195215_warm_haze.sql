/*
  # Add description field to team outcome metrics

  1. Changes
    - Add description field to team_outcome_metrics table
    - Make description field required
    - Set default value to empty string for existing records
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_outcome_metrics' AND column_name = 'description'
  ) THEN
    ALTER TABLE team_outcome_metrics ADD COLUMN description text NOT NULL DEFAULT '';
    
    -- Remove the default after migration
    ALTER TABLE team_outcome_metrics ALTER COLUMN description DROP DEFAULT;
  END IF;
END $$;