/*
  Seed Data for Flour Roadmap Application
  
  This script populates the database with the exact same sample data
  that's currently in exampleRoadmapData.ts, maintaining all relationships.
*/

-- Clear existing data (be careful with this in production!)
TRUNCATE TABLE metrics, bets, outcomes, objectives RESTART IDENTITY CASCADE;

-- Create a function to generate deterministic UUIDs from strings
CREATE OR REPLACE FUNCTION gen_deterministic_uuid(seed text) RETURNS uuid AS $$
BEGIN
  RETURN md5(seed::bytea)::uuid;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Insert Objectives with deterministic UUIDs
WITH 
objective_data AS (
  SELECT 
    gen_deterministic_uuid('objective-1') AS id, 
    'Improve User Experience' AS title, 
    'Deliver a seamless and intuitive product experience' AS description, 
    true AS is_public,
    NULL::uuid AS team_id,
    '2025-05-01T00:00:00Z'::timestamptz AS created_at, 
    '2025-06-28T00:00:00Z'::timestamptz AS updated_at
  UNION ALL
  SELECT 
    gen_deterministic_uuid('objective-2'),
    'Expand Market Reach',
    'Grow our presence in international markets',
    true,
    NULL::uuid,
    '2025-05-05T00:00:00Z'::timestamptz,
    '2025-06-28T00:00:00Z'::timestamptz
  UNION ALL
  SELECT 
    gen_deterministic_uuid('objective-3'),
    'Increase Operational Efficiency',
    'Streamline internal processes and reduce costs',
    false,
    NULL::uuid,
    '2025-05-10T00:00:00Z'::timestamptz,
    '2025-06-28T00:00:00Z'::timestamptz
)
INSERT INTO objectives (id, title, description, is_public, team_id, created_at, updated_at)
SELECT id, title, description, is_public, team_id, created_at, updated_at
FROM objective_data;

-- Insert Outcomes with references to objectives
WITH 
objective_ids AS (
  SELECT 
    gen_deterministic_uuid('objective-1') AS id1,
    gen_deterministic_uuid('objective-2') AS id2,
    gen_deterministic_uuid('objective-3') AS id3
),
outcome_ids AS (
  SELECT 
    gen_deterministic_uuid('outcome-1') AS id1,
    gen_deterministic_uuid('outcome-2') AS id2,
    gen_deterministic_uuid('outcome-3') AS id3,
    gen_deterministic_uuid('outcome-4') AS id4
)
INSERT INTO outcomes (id, title, description, objective_id, team_id, status, is_public, created_at, updated_at)
  SELECT 
    outcome_id,
    title,
    description,
    objective_id,
    NULL::uuid as team_id,
    status::text::roadmap_status,
    is_public,
    created_at,
    updated_at
  FROM default_team dt
  CROSS JOIN (
  SELECT 
    oi.id1 AS outcome_id, 
    'Enhance User Onboarding' AS title, 
    'Improve new user activation and retention' AS description, 
    obj.id1 AS objective_id, 
    'now' AS status, 
    true AS is_public, 
    '2025-05-15T00:00:00Z'::timestamptz AS created_at, 
    '2025-06-28T00:00:00Z'::timestamptz AS updated_at 
  FROM outcome_ids oi, objective_ids obj
  
  UNION ALL 
  
  SELECT 
    oi.id2, 
    'Improve Core Performance', 
    'Enhance application speed and reliability', 
    obj.id1, 
    'now', 
    true, 
    '2025-05-15T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM outcome_ids oi, objective_ids obj
  
  UNION ALL 
  
  SELECT 
    oi.id3, 
    'Launch in EMEA Region', 
    'Expand product availability to European markets', 
    obj.id2, 
    'next', 
    true, 
    '2025-05-20T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM outcome_ids oi, objective_ids obj
  
  UNION ALL 
  
  SELECT 
    oi.id4, 
    'Implement CI/CD Pipeline', 
    'Automate build, test, and deployment processes', 
    obj.id3, 
    'next', 
    false, 
    '2025-05-25T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM outcome_ids oi, objective_ids obj, default_team dt
) outcomes_data;

-- Insert Bets with references to outcomes
WITH 
outcome_ids AS (
  SELECT 
    gen_deterministic_uuid('outcome-1') AS id1,
    gen_deterministic_uuid('outcome-2') AS id2,
    gen_deterministic_uuid('outcome-3') AS id3
),
bet_ids AS (
  SELECT 
    gen_deterministic_uuid('bet-1') AS id1,
    gen_deterministic_uuid('bet-2') AS id2,
    gen_deterministic_uuid('bet-3') AS id3,
    gen_deterministic_uuid('bet-4') AS id4
)
INSERT INTO bets (id, title, description, outcome_id, team_id, status, is_public, created_at, updated_at)
SELECT 
  bet_id,
  title,
  description,
  outcome_id,
  NULL::uuid as team_id,
  status::text::roadmap_status,
  is_public,
  created_at,
  updated_at
FROM default_team dt
CROSS JOIN (
  SELECT 
    bi.id1 AS bet_id, 
    'Implement interactive product tour' AS title, 
    'Create a step-by-step interactive guide for new users' AS description, 
    oi.id1 AS outcome_id, 
    'now' AS status, 
    true AS is_public, 
    '2025-06-01T00:00:00Z'::timestamptz AS created_at, 
    '2025-06-28T00:00:00Z'::timestamptz AS updated_at 
  FROM bet_ids bi, outcome_ids oi
  
  UNION ALL 
  
  SELECT 
    bi.id2, 
    'Redesign welcome email sequence', 
    'Improve email engagement with personalized content', 
    oi.id1, 
    'next', 
    true, 
    '2025-06-15T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM bet_ids bi, outcome_ids oi
  
  UNION ALL 
  
  SELECT 
    bi.id3, 
    'Optimize database queries', 
    'Identify and optimize slow database queries', 
    oi.id2, 
    'now', 
    true, 
    '2025-06-01T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM bet_ids bi, outcome_ids oi
  
  UNION ALL 
  
  SELECT 
    bi.id4, 
    'Localize product for European markets', 
    'Translate UI and content for EMEA region', 
    oi.id3, 
    'next', 
    true, 
    '2025-06-20T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM bet_ids bi, outcome_ids oi) bets_data;

-- Insert Metrics with proper UUIDs and relationships
WITH 
objective_ids AS (
  SELECT gen_deterministic_uuid('objective-1') AS id1
),
outcome_ids AS (
  SELECT 
    gen_deterministic_uuid('outcome-1') AS id1,
    gen_deterministic_uuid('outcome-2') AS id2
),
bet_ids AS (
  SELECT 
    gen_deterministic_uuid('bet-1') AS id1,
    gen_deterministic_uuid('bet-2') AS id2,
    gen_deterministic_uuid('bet-3') AS id3
),
metric_ids AS (
  SELECT 
    gen_deterministic_uuid('m-company-1') AS id1,
    gen_deterministic_uuid('m-company-2') AS id2,
    gen_deterministic_uuid('m-obj-1') AS id3,
    gen_deterministic_uuid('m-obj-2') AS id4,
    gen_deterministic_uuid('m-out-1') AS id5,
    gen_deterministic_uuid('m-out-2') AS id6,
    gen_deterministic_uuid('m-out-3') AS id7,
    gen_deterministic_uuid('m-bet-1') AS id8,
    gen_deterministic_uuid('m-bet-2') AS id9,
    gen_deterministic_uuid('m-bet-3') AS id10,
    gen_deterministic_uuid('m-company-1') AS id11,
    gen_deterministic_uuid('m-company-2') AS id12
)
-- Company-level metrics
WITH 
objective_ids AS (
  SELECT gen_deterministic_uuid('objective-1') AS id1
),
metric_ids AS (
  SELECT 
    gen_deterministic_uuid('m-company-1') AS id1,
    gen_deterministic_uuid('m-company-2') AS id2
),
company_metrics_data AS (
  SELECT 
    mi.id1 AS metric_id, 
    'Revenue Growth' AS name, 
    'Target 10% for Revenue Growth' AS description, 
    5 AS current_value, 
    10 AS target_value, 
    '%' AS unit, 
    'executive' AS level, 
    'objective' AS parent_type, 
    obj.id1 AS parent_id, 
    'business' AS metric_type, 
    'in_progress' AS status, 
    '2025-05-01T00:00:00Z'::timestamptz AS created_at, 
    '2025-06-28T00:00:00Z'::timestamptz AS updated_at 
  FROM metric_ids mi, objective_ids obj
  
  UNION ALL 
  
  SELECT 
    mi.id2, 
    'Customer Satisfaction', 
    'Target 90% for Customer Satisfaction', 
    85, 
    90, 
    '%', 
    'executive', 
    'objective', 
    obj.id1, 
    'business', 
    'in_progress', 
    '2025-05-01T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM metric_ids mi, objective_ids obj
)

INSERT INTO metrics (
  id, name, description, current_value, target_value, unit, 
  level, parent_type, parent_id, team_id, metric_type, status, 
  created_at, updated_at
)
SELECT 
  metric_id, 
  name, 
  description, 
  current_value, 
  target_value, 
  unit, 
  level::text::metric_level, 
  parent_type::text::parent_type, 
  parent_id, 
  NULL::uuid as team_id, 
  metric_type::text::metric_type, 
  status::text::metric_status, 
  created_at, 
  updated_at
FROM company_metrics_data;
  SELECT 
    mi.id11 AS metric_id, 
    'Revenue Growth' AS name, 
    'Target 10% for Revenue Growth' AS description, 
    5 AS current_value, 
    10 AS target_value, 
    '%' AS unit, 
    'executive' AS level, 
    'objective' AS parent_type, 
    obj.id1 AS parent_id, 
    'business' AS metric_type, 
    'in_progress' AS status, 
    '2025-05-01T00:00:00Z'::timestamptz AS created_at, 
    '2025-06-28T00:00:00Z'::timestamptz AS updated_at 
  FROM metric_ids mi, (SELECT gen_deterministic_uuid('objective-1') AS id1) obj
  
  UNION ALL 
  
  SELECT 
    mi.id12, 
    'Customer Satisfaction', 
    'Target 90% for Customer Satisfaction', 
    85, 
    90, 
    '%', 
    'executive', 
    'objective', 
    obj.id1, 
    'business', 
    'in_progress', 
    '2025-05-01T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM metric_ids mi, (SELECT gen_deterministic_uuid('objective-1') AS id1) obj) company_metrics;
  SELECT 
    mi.id1 AS metric_id, 
    'Revenue Growth' AS name, 
    'Target 10% for Revenue Growth' AS description, 
    5 AS current_value, 
    10 AS target_value, 
    '%' AS unit, 
    'executive' AS level, 
    'objective' AS parent_type, 
    obj.id1 AS parent_id, 
    'business' AS metric_type, 
    'in_progress' AS status, 
    '2025-05-01T00:00:00Z'::timestamptz AS created_at, 
    '2025-06-28T00:00:00Z'::timestamptz AS updated_at 
  FROM metric_ids mi, objective_ids obj
  
  UNION ALL 
  
  SELECT 
    mi.id2, 
    'Customer Satisfaction', 
    'Target 90% for Customer Satisfaction', 
    85, 
    90, 
    '%', 
    'executive', 
    'objective', 
    obj.id1, 
    'business', 
    'in_progress', 
    '2025-05-01T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM metric_ids mi, objective_ids obj) company_metrics;

-- Objective-level metrics
WITH 
objective_ids AS (
  SELECT 
    gen_deterministic_uuid('objective-1') AS id1,
    gen_deterministic_uuid('objective-2') AS id2,
    gen_deterministic_uuid('objective-3') AS id3
),
metric_ids AS (
  SELECT 
    gen_deterministic_uuid('metric-1') AS id1,
    gen_deterministic_uuid('metric-2') AS id2,
    gen_deterministic_uuid('metric-3') AS id3,
    gen_deterministic_uuid('metric-4') AS id4,
    gen_deterministic_uuid('metric-5') AS id5,
    gen_deterministic_uuid('metric-6') AS id6,
    gen_deterministic_uuid('metric-7') AS id7,
    gen_deterministic_uuid('metric-8') AS id8,
    gen_deterministic_uuid('metric-9') AS id9
)
INSERT INTO metrics (id, name, description, current_value, target_value, unit, level, parent_type, parent_id, parent_metric_id, contribution_type, weight, metric_type, status, created_at, updated_at, team_id)
SELECT 
  metric_id,
  name,
  description,
  current_value,
  target_value,
  unit,
  level::text::metric_level,
  parent_type::text::parent_type,
  parent_id,
  parent_metric_id,
  contribution_type::text::contribution_type,
  weight,
  metric_type::text::metric_type,
  status::text::metric_status,
  created_at,
  updated_at,
  dt.id as team_id
FROM default_team dt, (
  SELECT 
    mi.id3 AS metric_id, 
    'User Retention' AS name, 
    'Improve user retention rate' AS description, 
    65 AS current_value, 
    75 AS target_value, 
    '%' AS unit, 
    'management' AS level, 
    'objective' AS parent_type, 
    obj.id1 AS parent_id, 
    (SELECT id1 FROM metric_ids) AS parent_metric_id, 
    'weighted' AS contribution_type, 
    40 AS weight, 
    'product' AS metric_type, 
    'in_progress' AS status, 
    '2025-05-01T00:00:00Z'::timestamptz AS created_at, 
    '2025-06-28T00:00:00Z'::timestamptz AS updated_at 
  FROM metric_ids mi, objective_ids obj
  
  UNION ALL 
  
  SELECT 
    mi.id4, 
    'NPS Score', 
    'Improve Net Promoter Score', 
    45, 
    60, 
    '', 
    'management', 
    'objective', 
    obj.id1, 
    (SELECT id2 FROM metric_ids), 
    'weighted', 
    60, 
    'product', 
    'in_progress', 
    '2025-05-01T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM metric_ids mi, objective_ids obj) objective_metrics_data) objective_metrics;

-- Outcome-level metrics
INSERT INTO metrics (id, name, description, current_value, target_value, unit, level, parent_type, parent_id, parent_metric_id, contribution_type, weight, metric_type, status, created_at, updated_at)
SELECT 
  metric_id,
  name,
  description,
  current_value,
  target_value,
  unit,
  level::text::metric_level,
  parent_type::text::parent_type,
  parent_id,
  parent_metric_id,
  contribution_type::text::contribution_type,
  weight,
  metric_type::text::metric_type,
  status::text::metric_status,
  created_at,
  updated_at
FROM (
  SELECT 
    mi.id5 AS metric_id, 
    'Activation Rate' AS name, 
    'Increase user activation rate' AS description, 
    30 AS current_value, 
    50 AS target_value, 
    '%' AS unit, 
    'management' AS level, 
    'outcome' AS parent_type, 
    oi.id1 AS parent_id, 
    (SELECT id3 FROM metric_ids) AS parent_metric_id, 
    'weighted' AS contribution_type, 
    50 AS weight, 
    'product' AS metric_type, 
    'in_progress' AS status, 
    '2025-05-15T00:00:00Z'::timestamptz AS created_at, 
    '2025-06-28T00:00:00Z'::timestamptz AS updated_at 
  FROM metric_ids mi, outcome_ids oi
  
  UNION ALL 
  
  SELECT 
    mi.id6, 
    'Time to Value', 
    'Reduce time to value for new users', 
    7, 
    3, 
    'days', 
    'management', 
    'outcome', 
    oi.id1, 
    (SELECT id3 FROM metric_ids), 
    'weighted', 
    50, 
    'product', 
    'in_progress', 
    '2025-05-15T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM metric_ids mi, outcome_ids oi
  
  UNION ALL 
  
  SELECT 
    mi.id7, 
    'Page Load Time', 
    'Reduce average page load time', 
    2.5, 
    1.5, 
    's', 
    'management', 
    'outcome', 
    oi.id2, 
    (SELECT id4 FROM metric_ids), 
    'weighted', 
    70, 
    'product', 
    'in_progress', 
    '2025-05-15T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM metric_ids mi, outcome_ids oi) outcome_metrics_data) outcome_metrics;

-- Bet-level metrics
INSERT INTO metrics (id, name, description, current_value, target_value, unit, level, parent_type, parent_id, parent_metric_id, contribution_type, weight, metric_type, status, created_at, updated_at)
SELECT 
  metric_id,
  name,
  description,
  current_value,
  target_value,
  unit,
  level::text::metric_level,
  parent_type::text::parent_type,
  parent_id,
  parent_metric_id,
  contribution_type::text::contribution_type,
  weight,
  metric_type::text::metric_type,
  status::text::metric_status,
  created_at,
  updated_at
FROM (
  SELECT 
    mi.id8 AS metric_id, 
    'Feature Adoption' AS name, 
    'Increase adoption of new features' AS description, 
    25 AS current_value, 
    50 AS target_value, 
    '%' AS unit, 
    'team' AS level, 
    'bet' AS parent_type, 
    bi.id1 AS parent_id, 
    (SELECT id5 FROM metric_ids) AS parent_metric_id, 
    'weighted' AS contribution_type, 
    60 AS weight, 
    'product' AS metric_type, 
    'in_progress' AS status, 
    '2025-06-01T00:00:00Z'::timestamptz AS created_at, 
    '2025-06-28T00:00:00Z'::timestamptz AS updated_at 
  FROM metric_ids mi, bet_ids bi
  
  UNION ALL 
  
  SELECT 
    mi.id9, 
    'Email Open Rate', 
    'Improve email open rate', 
    15, 
    30, 
    '%', 
    'team', 
    'bet', 
    bi.id2, 
    (SELECT id5 FROM metric_ids), 
    'weighted', 
    40, 
    'product', 
    'todo', 
    '2025-06-15T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM metric_ids mi, bet_ids bi
  
  UNION ALL 
  
  SELECT 
    mi.id10, 
    'API Response Time', 
    'Reduce API response time', 
    350, 
    200, 
    'ms', 
    'team', 
    'bet', 
    bi.id3, 
    (SELECT id7 FROM metric_ids), 
    'weighted', 
    30, 
    'product', 
    'in_progress', 
    '2025-06-01T00:00:00Z', 
    '2025-06-28T00:00:00Z' 
  FROM metric_ids mi, bet_ids bi) bet_metrics_data) bet_metrics;

-- Update sequence values to prevent primary key conflicts
-- This ensures that new auto-generated IDs will start after our seeded data
SELECT setval('objectives_id_seq', (SELECT MAX(CAST(SUBSTRING(id, 11) AS INTEGER)) FROM objectives) + 1, false) WHERE EXISTS (SELECT 1 FROM objectives LIMIT 1);
SELECT setval('outcomes_id_seq', (SELECT MAX(CAST(SUBSTRING(id, 9) AS INTEGER)) FROM outcomes) + 1, false) WHERE EXISTS (SELECT 1 FROM outcomes LIMIT 1);
SELECT setval('bets_id_seq', (SELECT MAX(CAST(SUBSTRING(id, 5) AS INTEGER)) FROM bets) + 1, false) WHERE EXISTS (SELECT 1 FROM bets LIMIT 1);
