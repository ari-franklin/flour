/*
  # Create success metrics table and policies

  1. New Tables
    - `success_metrics`
      - `id` (uuid, primary key)
      - `status` (roadmap_status, not null)
      - `description` (text, not null)
      - `target_value` (text)
      - `is_hidden` (boolean, default false)
      - `created_at` (timestamp, default now())

  2. Security
    - Enable RLS on `success_metrics` table
    - Add policies for authenticated users to manage their metrics
    - Add policy for public read access to non-hidden metrics
*/

-- Create success metrics table
CREATE TABLE IF NOT EXISTS success_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status roadmap_status NOT NULL,
  description text NOT NULL,
  target_value text,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE success_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to non-hidden metrics"
  ON success_metrics
  FOR SELECT
  TO public
  USING (is_hidden = false);

CREATE POLICY "Allow authenticated users to manage metrics"
  ON success_metrics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);