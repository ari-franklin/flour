export type Initiative = {
  name: string;
  status: 'idea' | 'active' | 'done';
};

export type Metric = {
  metric: string;
  target: string;
  current: string;
  status: 'green' | 'yellow' | 'red' | 'gray';
  outcome: 'CUSTOMER' | 'DEVELOPER';
  outcomeDetail: string;
};

export type Track = {
  name: string;
  shortName: string;
  colorClass: string;
  headerClass: string;
  number: string;
  initiatives: Initiative[];
  metrics: Metric[];
};

export type TracksByKey = {
  performance: Track;
  platform: Track;
  telemetry: Track;
};

export const sampleTracks: TracksByKey = {
  performance: {
    name: 'Improve the core experience through speed and reliability',
    shortName: 'quality & speed',
    colorClass: 'kpi-track-performance',
    headerClass: 'kpi-track-performance-header',
    number: '1',
    initiatives: [
      { name: 'Modernize navigation', status: 'active' },
      { name: 'Reduce layout shifts', status: 'idea' },
      { name: 'Defer non-critical scripts', status: 'idea' },
      { name: 'Optimize critical CSS', status: 'idea' },
      { name: 'Improve perceived loading', status: 'idea' },
      { name: 'Additional improvement ideas', status: 'idea' }
    ],
    metrics: [
      {
        metric: 'Performance score',
        target: '90+',
        current: '82',
        status: 'yellow',
        outcome: 'CUSTOMER',
        outcomeDetail: 'Pages feel fast and responsive for end users'
      },
      {
        metric: 'Largest Contentful Paint',
        target: '≤ 2.5s',
        current: '2.9s',
        status: 'yellow',
        outcome: 'CUSTOMER',
        outcomeDetail: 'Key content appears quickly'
      },
      {
        metric: 'Cumulative Layout Shift',
        target: '≤ 0.1',
        current: '0.12',
        status: 'yellow',
        outcome: 'CUSTOMER',
        outcomeDetail: 'Visual stability improves trust'
      },
      {
        metric: 'Error-free sessions',
        target: '99%',
        current: '98.4%',
        status: 'green',
        outcome: 'CUSTOMER',
        outcomeDetail: 'Users experience fewer failures'
      }
    ]
  },
  platform: {
    name: 'Enable teams to ship quickly on a stable platform',
    shortName: 'delivery platform',
    colorClass: 'kpi-track-platform',
    headerClass: 'kpi-track-platform-header',
    number: '2',
    initiatives: [
      { name: 'Unified deployment workflow', status: 'active' },
      { name: 'Improve CI visibility', status: 'idea' },
      { name: 'Release automation updates', status: 'idea' },
      { name: 'Developer onboarding checklist', status: 'idea' },
      { name: 'Dependency health review', status: 'idea' },
      { name: 'Platform support rotation', status: 'idea' }
    ],
    metrics: [
      {
        metric: 'Deployment frequency',
        target: 'Weekly',
        current: 'Bi-weekly',
        status: 'yellow',
        outcome: 'DEVELOPER',
        outcomeDetail: 'Teams can ship improvements more often'
      },
      {
        metric: 'Build success rate',
        target: '95%',
        current: '92%',
        status: 'yellow',
        outcome: 'DEVELOPER',
        outcomeDetail: 'Fewer blockers during delivery'
      },
      {
        metric: 'Lead time for changes',
        target: '< 3 days',
        current: '5 days',
        status: 'red',
        outcome: 'DEVELOPER',
        outcomeDetail: 'Faster path from idea to production'
      },
      {
        metric: 'Service reliability',
        target: '99.9%',
        current: '99.7%',
        status: 'green',
        outcome: 'DEVELOPER',
        outcomeDetail: 'Stable foundation for teams'
      }
    ]
  },
  telemetry: {
    name: 'Deliver clear, trusted insights for decision making',
    shortName: 'insights & analytics',
    colorClass: 'kpi-track-telemetry',
    headerClass: 'kpi-track-telemetry-header',
    number: '3',
    initiatives: [
      { name: 'Analytics schema cleanup', status: 'idea' },
      { name: 'Event coverage audit', status: 'idea' },
      { name: 'Dashboard refresh', status: 'idea' },
      { name: 'User journey tracking', status: 'idea' },
      { name: 'Experiment reporting', status: 'idea' },
      { name: 'Data freshness alerts', status: 'idea' }
    ],
    metrics: [
      {
        metric: 'Data completeness',
        target: '98%',
        current: '92%',
        status: 'yellow',
        outcome: 'DEVELOPER',
        outcomeDetail: 'Higher confidence in analytics'
      },
      {
        metric: 'Time to insight',
        target: '< 24h',
        current: '48h',
        status: 'red',
        outcome: 'DEVELOPER',
        outcomeDetail: 'Teams answer questions faster'
      },
      {
        metric: 'Dashboard adoption',
        target: '75%',
        current: '61%',
        status: 'yellow',
        outcome: 'DEVELOPER',
        outcomeDetail: 'More teams use shared metrics'
      },
      {
        metric: 'Data error rate',
        target: '< 1%',
        current: '0.8%',
        status: 'green',
        outcome: 'DEVELOPER',
        outcomeDetail: 'Fewer data quality issues'
      }
    ]
  }
};
