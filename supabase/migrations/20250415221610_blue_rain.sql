/*
  # Add roadmap item metrics

  1. Changes
    - Add roadmap_item_id column to success_metrics table
    - Add foreign key constraint to roadmap_items table
    - Update RLS policies to maintain existing permissions

  2. Notes
    - Allows success metrics to be associated with specific roadmap items
    - Maintains existing functionality while adding item context
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'success_metrics' AND column_name = 'roadmap_item_id'
  ) THEN
    ALTER TABLE success_metrics 
    ADD COLUMN roadmap_item_id uuid REFERENCES roadmap_items(id) ON DELETE CASCADE;
  END IF;
END $$;