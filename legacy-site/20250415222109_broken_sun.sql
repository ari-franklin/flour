/*
  # Add current value column to success metrics

  1. Changes
    - Add `current_value` column to `success_metrics` table
      - Type: text
      - Nullable: true (to maintain compatibility with existing records)

  2. Notes
    - Using IF NOT EXISTS to prevent errors if column already exists
    - Column is nullable to avoid issues with existing data
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'success_metrics' 
    AND column_name = 'current_value'
  ) THEN
    ALTER TABLE success_metrics 
    ADD COLUMN current_value text;
  END IF;
END $$;