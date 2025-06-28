import { Objective, Outcome, Bet, Team, Metric, MetricLevel, ParentType, RoadmapItem } from '../types';

// Utility function to safely get status with a default value
const getStatus = (item: { status?: string } | { status: string } | any): 'now' | 'next' | 'near' => {
  const validStatuses = ['now', 'next', 'near'] as const;
  const status = ('status' in item && item.status) ? String(item.status).toLowerCase() : 'now';
  return validStatuses.includes(status as any) ? status as any : 'now';
};

export const exampleTeams: Team[] = [
  { id: 'team-1', name: 'Product', color: 'bg-blue-500' },
  { id: 'team-2', name: 'Engineering', color: 'bg-green-500' },
  { id: 'team-3', name: 'Design', color: 'bg-purple-500' },
  { id: 'team-4', name: 'Marketing', color: 'bg-yellow-500' },
];

// Helper function to create metrics
const createMetric = (
  id: string, 
  name: string, 
  current: string, 
  target: string, 
  parentId: string, 
  parentType: ParentType, 
  teamId: string
): Omit<Metric, 'team'> & { team?: Team } => {
  const level: MetricLevel = 
    parentType === 'objective' ? 'executive' : 
    parentType === 'outcome' ? 'management' : 'team';
    
  return {
    id,
    name,
    description: `Target ${target} for ${name}`,
    current_value: parseFloat(current.replace(/[^0-9.]/g, '')),
    target_value: parseFloat(target.replace(/[^0-9.]/g, '')),
    unit: name.includes('Time') ? 'ms' : name.includes('Rate') || name.includes('CSAT') ? '%' : '',
    level,
    parent_type: parentType,
    parent_id: parentId,
    team_id: teamId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    team: exampleTeams.find(t => t.id === teamId),
  };
};

export const exampleBets: Bet[] = [
  // Bets for "Enhance User Onboarding" outcome
  {
    id: 'bet-1',
    title: 'Implement interactive product tour',
    description: 'Create a step-by-step interactive guide for new users',
    team_summary: 'Engineering and Design collaboration required',
    outcome_id: 'outcome-1',
    team_id: 'team-2',
    status: 'now',
    is_public: true,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
  {
    id: 'bet-2',
    title: 'Redesign welcome email sequence',
    description: 'Improve email engagement with personalized content',
    team_summary: 'Marketing lead with Product support',
    outcome_id: 'outcome-1',
    team_id: 'team-4',
    status: 'next',
    is_public: true,
    created_at: '2025-06-15T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
  // Bets for "Improve Core Performance" outcome
  {
    id: 'bet-3',
    title: 'Optimize database queries',
    description: 'Identify and optimize slow database queries',
    team_summary: 'Backend engineering focus',
    outcome_id: 'outcome-2',
    team_id: 'team-2',
    status: 'now',
    is_public: true,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
  // Additional bet for "Launch in EMEA Region" outcome
  {
    id: 'bet-4',
    title: 'Localize product for European markets',
    description: 'Translate UI and content for EMEA region',
    team_summary: 'Localization and internationalization effort',
    outcome_id: 'outcome-3',
    team_id: 'team-1',
    status: 'next',
    is_public: true,
    created_at: '2025-06-20T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
];

export const exampleOutcomes: Outcome[] = [
  // Outcomes for "Improve User Experience" objective
  {
    id: 'outcome-1',
    title: 'Enhance User Onboarding',
    description: 'Improve new user activation and retention',
    management_summary: 'Focusing on first-time user experience and engagement',
    objective_id: 'objective-1',
    team_id: 'team-1',
    status: 'now',
    is_public: true,
    created_at: '2025-05-15T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
  {
    id: 'outcome-2',
    title: 'Improve Core Performance',
    description: 'Enhance application speed and reliability',
    management_summary: 'Technical improvements for better user experience',
    objective_id: 'objective-1',
    team_id: 'team-2',
    status: 'now',
    is_public: true,
    created_at: '2025-05-15T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
  // Outcomes for "Expand Market Reach" objective
  {
    id: 'outcome-3',
    title: 'Launch in EMEA Region',
    description: 'Expand product availability to European markets',
    management_summary: 'International expansion to EMEA region',
    objective_id: 'objective-2',
    team_id: 'team-1',
    status: 'next',
    is_public: true,
    created_at: '2025-05-20T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
  // Outcome for "Increase Operational Efficiency" objective
  {
    id: 'outcome-4',
    title: 'Implement CI/CD Pipeline',
    description: 'Automate build, test, and deployment processes',
    management_summary: 'Streamline development workflow',
    objective_id: 'objective-3',
    team_id: 'team-2',
    status: 'next', // Changed from 'later' to 'next' to match valid status values
    is_public: false,
    created_at: '2025-05-25T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
];

export const exampleObjectives: Objective[] = [
  {
    id: 'objective-1',
    title: 'Improve User Experience',
    description: 'Deliver a seamless and intuitive product experience',
    executive_summary: 'Enhancing overall user satisfaction and engagement',
    team_id: 'team-1',
    is_public: true,
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
  {
    id: 'objective-2',
    title: 'Expand Market Reach',
    description: 'Grow our presence in international markets',
    executive_summary: 'Strategic expansion to new geographical markets',
    team_id: 'team-1',
    is_public: true,
    created_at: '2025-05-05T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
  {
    id: 'objective-3',
    title: 'Increase Operational Efficiency',
    description: 'Streamline internal processes and reduce costs',
    executive_summary: 'Improving development velocity and reducing overhead',
    team_id: 'team-2',
    is_public: false, // Internal objective
    created_at: '2025-05-10T00:00:00Z',
    updated_at: '2025-06-28T00:00:00Z',
  },
];

// Generate metrics for all items
const allMetrics = [
  // Metrics for Objective 1
  createMetric('m-ob1-1', 'NPS', '42', '50', 'objective-1', 'objective', 'team-1'),
  createMetric('m-ob1-2', 'CSAT', '85', '90', 'objective-1', 'objective', 'team-1'),
  
  // Metrics for Outcome 1
  createMetric('m-oc1-1', 'Activation Rate', '65', '75', 'outcome-1', 'outcome', 'team-1'),
  createMetric('m-oc1-2', 'Day 7 Retention', '35', '40', 'outcome-1', 'outcome', 'team-1'),
  
  // Metrics for Outcome 2
  createMetric('m-oc2-1', 'Page Load Time', '1200', '1000', 'outcome-2', 'outcome', 'team-2'),
  createMetric('m-oc2-2', 'API Response Time', '450', '300', 'outcome-2', 'outcome', 'team-2'),
  
  // Metrics for Outcome 3
  createMetric('m-oc3-1', 'EMEA Signups', '0', '500', 'outcome-3', 'outcome', 'team-1'),
  
  // Metrics for Outcome 4
  createMetric('m-oc4-1', 'Deployment Frequency', '30', '50', 'outcome-4', 'outcome', 'team-2'),
  createMetric('m-oc4-2', 'Build Time', '15', '5', 'outcome-4', 'outcome', 'team-2'),
  
  // Metrics for Bet 1
  createMetric('m-b1-1', 'Tour Completion', '30', '100', 'bet-1', 'bet', 'team-2'),
  
  // Metrics for Bet 2
  createMetric('m-b2-1', 'Email Open Rate', '25', '40', 'bet-2', 'bet', 'team-4'),
  
  // Metrics for Bet 3
  createMetric('m-b3-1', 'Query Response Time', '350', '200', 'bet-3', 'bet', 'team-2'),
  
  // Metrics for Bet 4
  createMetric('m-b4-1', 'Localization Coverage', '0', '95', 'bet-4', 'bet', 'team-1'),
] as const;

// Helper function to convert items to RoadmapItem format
const toRoadmapItem = (
  item: {
    id: string;
    title: string;
    description?: string;
    status: 'now' | 'next' | 'near';
    team_id: string;
    is_public: boolean;
    created_at?: string;
    updated_at?: string;
    metrics?: Omit<Metric, 'team'>[];
    objective_id?: string;
    outcome_id?: string;
  },
  type: 'objective' | 'outcome' | 'bet',
  parentId?: string
): RoadmapItem => {
  const roadmapItem: RoadmapItem = {
    id: item.id,
    title: item.title,
    description: item.description,
    type,
    status: item.status,
    team_id: item.team_id,
    is_public: item.is_public,
    created_at: item.created_at,
    updated_at: item.updated_at,
    metrics: item.metrics || [],
  };

  if (type === 'outcome' && parentId) {
    roadmapItem.objective_id = parentId;
  } else if (type === 'bet' && parentId) {
    roadmapItem.outcome_id = parentId;
  }

  return roadmapItem;
};

// Helper function to connect all data with metrics and relationships
export const getConnectedData = () => {
  // Create a type-safe version of metrics without the team property
  type MetricWithoutTeam = Omit<Metric, 'team'>;
  
  // Add metrics to each item
  const objectivesWithMetrics = exampleObjectives.map(obj => {
    const metrics = allMetrics.filter(m => 
      m.parent_type === 'objective' && m.parent_id === obj.id
    ).map(({ team, ...metric }) => metric as MetricWithoutTeam);
    
    return {
      ...obj,
      metrics,
      outcomes: exampleOutcomes
        .filter(oc => oc.objective_id === obj.id)
        .map(oc => {
          const outcomeMetrics = allMetrics
            .filter(m => m.parent_type === 'outcome' && m.parent_id === oc.id)
            .map(({ team, ...metric }) => metric as MetricWithoutTeam);
            
          return {
            ...oc,
            metrics: outcomeMetrics,
            bets: exampleBets
              .filter(bet => bet.outcome_id === oc.id)
              .map(bet => {
                const betMetrics = allMetrics
                  .filter(m => m.parent_type === 'bet' && m.parent_id === bet.id)
                  .map(({ team, ...metric }) => metric as MetricWithoutTeam);
                  
                return {
                  ...bet,
                  metrics: betMetrics,
                };
              }),
          };
        }),
    };
  });

  const outcomesWithMetrics = exampleOutcomes.map(oc => {
    const metrics = allMetrics
      .filter(m => m.parent_type === 'outcome' && m.parent_id === oc.id)
      .map(({ team, ...metric }) => metric as MetricWithoutTeam);
      
    return {
      ...oc,
      metrics,
      bets: exampleBets
        .filter(bet => bet.outcome_id === oc.id)
        .map(bet => {
          const betMetrics = allMetrics
            .filter(m => m.parent_type === 'bet' && m.parent_id === bet.id)
            .map(({ team, ...metric }) => metric as MetricWithoutTeam);
            
          return {
            ...bet,
            metrics: betMetrics,
          };
        }),
    };
  });

  const betsWithMetrics = exampleBets.map(bet => {
    const metrics = allMetrics
      .filter(m => m.parent_type === 'bet' && m.parent_id === bet.id)
      .map(({ team, ...metric }) => metric as MetricWithoutTeam);
      
    return {
      ...bet,
      metrics,
    };
  });

  // Convert to RoadmapItem format for the views
  const roadmapItems: RoadmapItem[] = [
    ...objectivesWithMetrics.map(obj => {
      const status = getStatus(obj);
      return toRoadmapItem({
        ...obj,
        status,
        metrics: obj.metrics || []
      }, 'objective');
    }),
    ...outcomesWithMetrics.map(oc => {
      const status = getStatus(oc);
      return toRoadmapItem({
        ...oc,
        status,
        metrics: oc.metrics || []
      }, 'outcome', oc.objective_id);
    }),
    ...betsWithMetrics.map(bet => {
      const status = getStatus(bet);
      return toRoadmapItem({
        ...bet,
        status,
        metrics: bet.metrics || []
      }, 'bet', bet.outcome_id);
    })
  ];

  return {
    objectives: objectivesWithMetrics,
    outcomes: outcomesWithMetrics,
    bets: betsWithMetrics,
    teams: exampleTeams,
    metrics: allMetrics.map(({ team, ...metric }) => metric as MetricWithoutTeam),
    roadmapItems,
  };
};
