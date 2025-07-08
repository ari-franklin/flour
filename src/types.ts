export type MetricLevel = 'objectives' | 'outcomes' | 'bets';
export type ParentType = 'objective' | 'outcome' | 'bet';

export interface Team {
  id: string;
  name: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  team_id: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
  metrics?: Metric[];
}

export interface Outcome {
  id: string;
  title: string;
  description?: string;
  objective_id?: string;
  team_id: string;
  status: 'now' | 'near' | 'next';
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
  metrics?: Metric[];
  objective?: Pick<Objective, 'id' | 'title'>;
}

export interface Bet {
  id: string;
  title: string;
  description?: string;
  outcome_id: string;
  team_id: string;
  status: 'now' | 'near' | 'next';
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
  metrics?: Metric[];
  outcome?: Pick<Outcome, 'id' | 'title'>;
}

export interface Metric {
  id: string;
  name: string;
  description?: string;
  current_value?: number;
  target_value?: number;
  unit?: string;
  level: MetricLevel;
  parent_type: ParentType;
  parent_id: string;
  team_id: string;
  created_at?: string;
  updated_at?: string;
  team?: Pick<Team, 'id' | 'name' | 'color'>;
  // Metric classification
  metricType: 'business' | 'product';
  // New fields for metric relationships
  child_metrics?: string[]; // IDs of child metrics that roll up to this one
  parent_metric_id?: string; // ID of parent metric this rolls up to
  contribution_type?: 'direct' | 'weighted' | 'formula';
  weight?: number; // For weighted contributions
  formula?: string; // For formula-based contributions
  // Status for metrics under outcomes without children
  status?: 'todo' | 'in_progress' | 'done' | 'blocked';
  
  // Flags
  isNorthStar?: boolean; // Whether this is a North Star metric
}

export interface Column {
  id: 'now' | 'near' | 'next';
  title: string;
  description?: string;
}

// Legacy interface for backward compatibility
export interface SuccessMetric {
  id: string;
  description: string;
  target_value: string;
  current_value?: string;
  objective_id?: string;
  outcome_id?: string;
  bet_id?: string;
  created_at?: string;
}

// Types for the fractal view
export type ViewLevel = 'objectives' | 'outcomes' | 'bets' | 'roadmap';
export type RoadmapItemType = 'objective' | 'outcome' | 'bet';

export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  type: RoadmapItemType;
  status: 'now' | 'next' | 'later' | 'near';
  team_id: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
  metrics?: Metric[];
  // Additional type-specific fields
  objective_id?: string;
  outcome_id?: string;
}

export interface ViewConfig {
  level: ViewLevel;
  showMetrics: boolean;
  showDetails: boolean;
  showTeamInfo: boolean;
}

// Types for the API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}