/*
  # Update success metrics to link with teams and bets

  1. Changes
    - Add team_id column to success_metrics if it doesn't exist
    - Update existing metrics to set team_id based on roadmap_items
    - Add foreign key constraint to teams table
    - Add index for performance

  2. Notes
    - Maintains existing data while adding team association
    - Allows metrics to be filtered by team
*/

DO $$ 
BEGIN
  -- Add team_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'success_metrics' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE success_metrics 
    ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

    -- Update existing metrics to set team_id based on roadmap_items
    UPDATE success_metrics sm
    SET team_id = ri.team
    FROM roadmap_items ri
    WHERE sm.roadmap_item_id = ri.id;
  END IF;

  -- Create index for performance
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'success_metrics' AND indexname = 'success_metrics_team_id_idx'
  ) THEN
    CREATE INDEX success_metrics_team_id_idx ON success_metrics(team_id);
  END IF;
END $$;