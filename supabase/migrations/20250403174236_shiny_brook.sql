/*
  # Insert initial teams

  1. Changes
    - Insert initial teams with proper UUIDs
*/

INSERT INTO teams (id, name, color)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'Team 1', '#3B82F6'),
  ('123e4567-e89b-12d3-a456-426614174001', 'Team 2', '#10B981'),
  ('123e4567-e89b-12d3-a456-426614174002', 'Team 3', '#8B5CF6')
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  color = EXCLUDED.color;