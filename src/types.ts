export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  team_id: string;
  is_public: boolean;
  created_at?: string;
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
}

export interface Column {
  id: 'now' | 'near' | 'next';
  title: string;
}

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