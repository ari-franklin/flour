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

// Helper function to create metrics with relationships
const createMetric = (
  id: string, 
  name: string, 
  current: string, 
  target: string, 
  parentId: string, 
  parentType: ParentType, 
  teamId: string,
  options: {
    child_metrics?: string[];
    parent_metric_id?: string;
    contribution_type?: 'direct' | 'weighted' | 'formula';
    weight?: number;
    formula?: string;
    unit?: string;
    description?: string;
    metricType?: 'business' | 'product';
    timeframe?: 'leading' | 'lagging';
    isNorthStar?: boolean;
  } = {}
): Omit<Metric, 'team'> & { team?: Team } => {
  const level: MetricLevel = 
    parentType === 'objective' ? 'executive' : 
    parentType === 'outcome' ? 'management' : 'team';
    
  // Determine if this is a business metric (only Revenue Growth for now)
  const isBusinessMetric = name.toLowerCase().includes('revenue') || 
                         name.toLowerCase().includes('growth') ||
                         options.metricType === 'business';
  
  // Default to lagging for business metrics, leading for others
  const defaultTimeframe = isBusinessMetric ? 'lagging' : 'leading';
  
  return {
    id,
    name,
    description: options.description || `Target ${target} for ${name}`,
    current_value: parseFloat(current.replace(/[^0-9.]/g, '')),
    target_value: parseFloat(target.replace(/[^0-9.]/g, '')),
    unit: options.unit || (name.includes('Time') ? 'ms' : name.includes('Rate') || name.includes('CSAT') || name.includes('%') ? '%' : ''),
    level,
    parent_type: parentType,
    parent_id: parentId,
    team_id: teamId,
    metricType: options.metricType || (isBusinessMetric ? 'business' : 'product'),
    timeframe: options.timeframe || defaultTimeframe,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    team: exampleTeams.find(t => t.id === teamId),
    ...options
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

// Generate metrics for all items with hierarchical relationships
const allMetrics = [
  // ===== Company-Wide Metrics =====
  createMetric('m-company-1', 'Revenue Growth', '5', '10', 'company', 'objective', 'team-1', {
    child_metrics: ['m-exec-1', 'm-exec-2'],
    formula: 'weighted_average',
    unit: '%',
    description: 'Year-over-year revenue growth target',
    metricType: 'business',
    timeframe: 'lagging'
  }),
  
  // ===== Objective 1: Improve User Experience =====
  createMetric('m-exec-1', 'User Experience Impact', '65', '85', 'objective-1', 'objective', 'team-1', {
    child_metrics: ['m-mgmt-1', 'm-mgmt-2'],
    parent_metric_id: 'm-company-1',
    contribution_type: 'weighted',
    weight: 70,
    unit: '%',
    description: 'Impact of user experience improvements on revenue'
  }),
  
  // Management Level Metrics (Outcome Level)
  // Outcome 1: Enhance User Onboarding
  createMetric('m-mgmt-1', 'Onboarding Completion', '60', '85', 'outcome-1', 'outcome', 'team-1', {
    child_metrics: ['m-team-1', 'm-team-2', 'm-b2-1'],
    parent_metric_id: 'm-exec-1',
    contribution_type: 'weighted',
    weight: 60,
    unit: '%',
    description: 'Metrics related to user onboarding success'
  }),
  
  // Outcome 2: Improve Core Performance
  createMetric('m-mgmt-2', 'System Performance', '70', '95', 'outcome-2', 'outcome', 'team-2', {
    child_metrics: ['m-team-3', 'm-team-4', 'm-b3-1'],
    parent_metric_id: 'm-exec-1',
    contribution_type: 'weighted',
    weight: 40,
    unit: '%',
    description: 'Technical performance metrics'
  }),
  
  // ===== Objective 2: Expand Market Reach =====
  createMetric('m-exec-2', 'Market Expansion', '0', '90', 'objective-2', 'objective', 'team-1', {
    child_metrics: ['m-mgmt-3'],
    parent_metric_id: 'm-company-1',
    contribution_type: 'weighted',
    weight: 30,
    unit: '%',
    description: 'Contribution to revenue growth from market expansion'
  }),
  
  // Outcome 3: Launch in EMEA Region
  createMetric('m-mgmt-3', 'EMEA Launch Progress', '0', '100', 'outcome-3', 'outcome', 'team-1', {
    child_metrics: ['m-b4-1'],
    parent_metric_id: 'm-exec-2',
    contribution_type: 'direct',
    unit: '%',
    description: 'Progress on EMEA region launch'
  }),
  
  // ===== Objective 3: Increase Operational Efficiency =====
  createMetric('m-exec-3', 'Operational Efficiency', '50', '90', 'objective-3', 'objective', 'team-2', {
    child_metrics: ['m-mgmt-4'],
    unit: '%',
    description: 'Overall operational efficiency score'
  }),
  
  // Outcome 4: Implement CI/CD Pipeline
  createMetric('m-mgmt-4', 'CI/CD Implementation', '30', '100', 'outcome-4', 'outcome', 'team-2', {
    parent_metric_id: 'm-exec-3',
    contribution_type: 'direct',
    unit: '%',
    description: 'Progress on CI/CD pipeline implementation'
  }),
  
  // ===== Team Level Metrics (Bet Level) =====
  // Bet 1: Implement interactive product tour
  createMetric('m-team-1', 'Product Tour Completion', '65', '90', 'bet-1', 'bet', 'team-1', {
    parent_metric_id: 'm-mgmt-1',
    contribution_type: 'weighted',
    weight: 50,
    unit: '%',
    description: 'Percentage of new users who complete the product tour'
  }),
  
  createMetric('m-team-2', 'Feature Adoption', '35', '60', 'bet-1', 'bet', 'team-1', {
    parent_metric_id: 'm-mgmt-1',
    contribution_type: 'weighted',
    weight: 50,
    unit: '%',
    description: 'Key features used after completing the tour'
  }),
  
  // Bet 2: Redesign welcome email sequence
  createMetric('m-b2-1', 'Email Engagement', '25', '50', 'bet-2', 'bet', 'team-4', {
    parent_metric_id: 'm-mgmt-1',
    contribution_type: 'weighted',
    weight: 30,
    unit: '%',
    description: 'Open and click-through rates for welcome emails'
  }),
  
  // Bet 3: Optimize database queries
  createMetric('m-team-3', 'Query Performance', '80', '95', 'bet-3', 'bet', 'team-2', {
    parent_metric_id: 'm-mgmt-2',
    contribution_type: 'weighted',
    weight: 40,
    unit: '%',
    description: 'Performance score of optimized queries'
  }),
  
  createMetric('m-team-4', 'System Uptime', '99.5', '99.95', 'bet-3', 'bet', 'team-2', {
    parent_metric_id: 'm-mgmt-2',
    contribution_type: 'weighted',
    weight: 30,
    unit: '%',
    description: 'System availability percentage'
  }),
  
  createMetric('m-b3-1', 'Query Response Time', '350', '200', 'bet-3', 'bet', 'team-2', {
    parent_metric_id: 'm-mgmt-2',
    contribution_type: 'weighted',
    weight: 30,
    unit: 'ms',
    description: 'Average response time for database queries'
  }),
  
  // Bet 4: Localize product for European markets
  createMetric('m-b4-1', 'Localization Coverage', '0', '95', 'bet-4', 'bet', 'team-1', {
    parent_metric_id: 'm-mgmt-3',
    contribution_type: 'direct',
    unit: '%',
    description: 'Percentage of UI and content localized for target markets'
  })
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
  
  // Get company-wide business metrics
  const companyBusinessMetrics = allMetrics.filter(m => 
    m.parent_type === 'objective' && m.parent_id === 'company' && m.metricType === 'business'
  ).map(({ team, ...metric }) => metric as MetricWithoutTeam);
  
  // Add metrics to each item
  const objectivesWithMetrics = exampleObjectives.map(obj => {
    // Get direct objective metrics
    const directMetrics = allMetrics.filter(m => 
      m.parent_type === 'objective' && m.parent_id === obj.id
    ).map(({ team, ...metric }) => metric as MetricWithoutTeam);
    
    // Get all outcomes for this objective
    const objectiveOutcomes = exampleOutcomes.filter(oc => oc.objective_id === obj.id);
    
    // Get all North Star metrics from outcomes under this objective
    const northStarMetrics = objectiveOutcomes.flatMap(oc => 
      allMetrics
        .filter(m => m.parent_type === 'outcome' && m.parent_id === oc.id && m.isNorthStar)
        .map(({ team, ...metric }) => ({
          ...metric,
          // Add a reference to the outcome it came from
          description: `${metric.description} (from ${oc.title})`
        } as MetricWithoutTeam))
    );
    
    // Get business metrics specific to this objective
    const objectiveBusinessMetrics = allMetrics.filter(m => 
      m.parent_type === 'objective' && m.parent_id === obj.id && m.metricType === 'business'
    ).map(({ team, ...metric }) => metric as MetricWithoutTeam);
    
    // Combine all relevant metrics
    const allRelevantMetrics = [
      ...companyBusinessMetrics, // Include company-wide business metrics
      ...objectiveBusinessMetrics, // Include objective-specific business metrics
      ...directMetrics.filter(m => m.metricType !== 'business'), // Include non-business direct metrics
      ...northStarMetrics // Include North Star metrics
    ];
    
    return {
      ...obj,
      // Combine all relevant metrics, removing duplicates by ID
      metrics: allRelevantMetrics.filter((metric, index, self) => 
        index === self.findIndex(m => m.id === metric.id)
      ),
      outcomes: objectiveOutcomes.map(oc => {
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

  // Process metrics to ensure they have all required fields
  const processedMetrics = allMetrics.map(metric => {
    const { team, ...rest } = metric;
    return {
      ...rest,
      // Ensure all metrics have a valid parent_type, defaulting to 'objective' for root metrics
      parent_type: rest.parent_type || (rest.parent_id ? 'objective' : 'objective'),
      // Ensure all metrics have a valid parent_id, defaulting to empty string
      parent_id: rest.parent_id || '',
      // Ensure all metrics have a valid level
      level: rest.level || 'executive',
      // Ensure all metrics have a valid unit
      unit: rest.unit || (rest.name.includes('%') ? '%' : '')
    } as MetricWithoutTeam;
  });

  return {
    objectives: objectivesWithMetrics,
    outcomes: outcomesWithMetrics,
    bets: betsWithMetrics,
    teams: exampleTeams,
    metrics: processedMetrics,
    roadmapItems,
  };
};
