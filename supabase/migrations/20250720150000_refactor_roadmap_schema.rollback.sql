/*
  # Rollback Script for Roadmap Schema Refactoring
  
  This script will revert the changes made by the 20250720150000_refactor_roadmap_schema.sql migration.
  Run this script if you need to rollback the schema changes.
*/

-- Drop the new metrics table if it exists
DROP TABLE IF EXISTS metrics_new;

-- Rename the old metrics table back if it was backed up
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metrics_old') THEN
        DROP TABLE IF EXISTS metrics;
        EXECUTE 'ALTER TABLE metrics_old RENAME TO metrics;';
    END IF;
END $$;

-- Drop the new enums if they exist
DROP TYPE IF EXISTS metric_type CASCADE;
DROP TYPE IF EXISTS contribution_type CASCADE;
DROP TYPE IF EXISTS metric_status CASCADE;

-- Drop the updated function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate the original function if needed
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate triggers with original definition
DO $$
BEGIN
    -- Only drop if they exist
    DROP TRIGGER IF EXISTS update_metrics_updated_at ON metrics;
    
    -- Recreate trigger if metrics table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metrics') THEN
        EXECUTE '
        CREATE TRIGGER update_metrics_updated_at
          BEFORE UPDATE ON metrics
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();';
    END IF;
END $$;

-- Output completion message
SELECT 'Rollback completed successfully' AS message;
