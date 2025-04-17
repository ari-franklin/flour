/*
  # Add target field to team outcome metrics

  1. Changes
    - Add target field to team_outcome_metrics table
    - Make target field optional
    - Update existing metrics to use target_value as target if not set

  2. Notes
    - This allows us to track both target and target_value separately
    - Maintains backward compatibility with existing data
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_outcome_metrics' AND column_name = 'target'
  ) THEN
    ALTER TABLE team_outcome_metrics ADD COLUMN target text;
    
    -- Update existing records to use target_value as target
    UPDATE team_outcome_metrics SET target = target_value WHERE target IS NULL;
  END IF;
END $$;