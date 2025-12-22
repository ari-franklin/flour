import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './styles.css';

type Initiative = {
  name: string;
  status: 'idea' | 'active' | 'done';
};

type Metric = {
  metric: string;
  target: string;
  current: string;
  status: 'green' | 'yellow' | 'red' | 'gray';
  outcome: 'CUSTOMER' | 'DEVELOPER';
  outcomeDetail: string;
};

type Track = {
  name: string;
  shortName: string;
  colorClass: string;
  headerClass: string;
  number: string;
  initiatives: Initiative[];
  metrics: Metric[];
};

type TracksByKey = {
  performance: Track;
  platform: Track;
  telemetry: Track;
};

const tracks: TracksByKey = {
    performance: {
      name: 'Enable faster and more responsive digital experiences on a stable modern architecture',
      shortName: 'High quality customer experiences',
      colorClass: 'kpi-track-performance',
      headerClass: 'kpi-track-performance-header',
      number: '1',
      initiatives: [
        { name: 'V3 app migration', status: 'active' },
        { name: 'footer optimization', status: 'idea' },
        { name: 'page caching', status: 'idea' },
        { name: 'analytics blocking rendering', status: 'idea' },
        { name: 'decouple spotlight from catalog call', status: 'idea' },
        { name: 'Additional optimization ideas', status: 'idea' }
      ],
      metrics: [
        {
          metric: 'Apps on 100% v3 traffic',
          target: '18 / 18',
          current: '7 done',
          status: 'green',
          outcome: 'CUSTOMER',
          outcomeDetail: 'Full v3 customer benefits unlocked across all experiences b/c more of the funnel is on v3'
        },
        {
          metric: 'INP (Responsiveness)',
          target: '≤ 500ms',
          current: '≤ 272ms',
          status: 'green',
          outcome: 'CUSTOMER',
          outcomeDetail: 'Site feels snappy and responsive to user interactions'
        },
        {
          metric: 'LCP (Speed)',
          target: '≤ 2.5s',
          current: '≤ 2.47s',
          status: 'green',
          outcome: 'CUSTOMER',
          outcomeDetail: 'Pages load quickly, improving user experience and SEO'
        },
        {
          metric: 'CLS (Stability)',
          target: '≤ 0.1',
          current: '≤ 0.11',
          status: 'yellow',
          outcome: 'CUSTOMER',
          outcomeDetail: 'No unexpected layout shifts during page load'
        },
        {
          metric: 'TBT (Total Blocking Time)',
          target: '< 300ms',
          current: '588ms',
          status: 'yellow',
          outcome: 'CUSTOMER',
          outcomeDetail: 'Reduces lag during page interactivity'
        },
        {
          metric: 'Overall Lighthouse Score',
          target: 'All green',
          current: 'Most green',
          status: 'yellow',
          outcome: 'CUSTOMER',
          outcomeDetail: 'Site meets performance, accessibility, SEO, and best practice standards'
        }
      ]
    },
    platform: {
      name: "Empower fast value delivery on the v3 mono-repo platform",
      shortName: 'deliver value fast',
      colorClass: 'kpi-track-platform',
      headerClass: 'kpi-track-platform-header',
      number: '2',
      initiatives: [
        { name: 'V3 app migration', status: 'active' },
        { name: 'Browser caching improvements', status: 'idea' },
        { name: 'Auto-changelog requests', status: 'idea' },
        { name: 'Feature flagging system', status: 'idea' },
        { name: 'upgrade to react 19', status: 'idea' },
        { name: 'replace semantic-release with release-it for apps', status: 'active' },
        { name: 'completely get off page data (in Launch)', status: 'idea' },
        { name: 'husky commit', status: 'idea' },
        { name: '"shared dependency (component) visualizer', status: 'idea' },
         { name: 'auto chg requests', status: 'idea' },
        { name: 'A/B server side testing', status: 'idea' }
      ],
      metrics: [
        {
          metric: 'Apps migrated to v3',
          target: '18 / 18',
          current: '11 remaining',
          status: 'green',
          outcome: 'DEVELOPER',
          outcomeDetail: 'codebases are easier to understand and modify'
        },
        {
          metric: 'Pipeline cycle time',
          target: 'TBD',
          current: 'TBD',
          status: 'gray',
          outcome: 'DEVELOPER',
          outcomeDetail: 'Faster CI/CD enables quicker iteration and deployment'
        },
        {
          metric: 'Build failure rate',
          target: 'TBD',
          current: 'TBD',
          status: 'gray',
          outcome: 'DEVELOPER',
          outcomeDetail: 'Deployments are more reliable'
        },
        {
          metric: 'MTTR (mean time to restore)',
          target: 'TBD',
          current: 'TBD',
          status: 'gray',
          outcome: 'DEVELOPER',
          outcomeDetail: 'Teams are more confident in deployments'
        }
      ]
    },
    telemetry: {
      name: 'Provide frictionless telemetry that gives teams visibility to build confidently',
      shortName: 'unified insights for confident decisions',
      colorClass: 'kpi-track-telemetry',
      headerClass: 'kpi-track-telemetry-header',
      number: '3',
      initiatives: [
        { name: 'PFM analysis', status: 'idea' },
        { name: 'delay analytics until page is idle', status: 'idea' },
        { name: 'analytics visualizer', status: 'idea' },
        { name: 'decouple spotlight from product grid', status: 'idea' },
        { name: 'A/B testing infrastructure', status: 'idea' },
        { name: '"Unspecified" values cleanup', status: 'idea' },
      
      ],
      metrics: [
        {
          metric: 'Analytics data quality',
          target: '< 5% unspecified values',
          current: 'TBD',
          status: 'gray',
          outcome: 'DEVELOPER',
          outcomeDetail: 'High-integrity data enables confident decision making'
        },
        {
          metric: 'Customer journey tracking completeness',
          target: '100% of critical flows',
          current: 'TBD',
          status: 'gray',
          outcome: 'DEVELOPER',
          outcomeDetail: 'Clear visibility into actual user experience and issues'
        },
        {
          metric: 'data freshness',
          target: 'TBD (Time to insight)',
          current: 'TBD',
          status: 'gray',
          outcome: 'DEVELOPER',
          outcomeDetail: 'Teams can quickly answer questions with reliable data'
        }
      ]
    }
  };

const KPIDashboard = () => {
  const [expandedSections, setExpandedSections] = useState({
    performance: true,
    platform: true,
    telemetry: true
  });

  const [tracksState, setTracksState] = useState<TracksByKey>(tracks);

  const toggleSection = (section: keyof TracksByKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColorClass = (status: Metric['status']) => {
    switch (status) {
      case 'green':
        return 'kpi-dot-green';
      case 'yellow':
        return 'kpi-dot-yellow';
      case 'red':
        return 'kpi-dot-red';
      default:
        return 'kpi-dot-gray';
    }
  };

  const getInitiativeStatusBadge = (status: Initiative['status']) => {
    if (status === 'active') {
      return <span className="kpi-badge-active">Active</span>;
    }
    if (status === 'done') {
      return <span className="kpi-badge-done">Done</span>;
    }
    return <span className="kpi-badge-idea">Idea</span>;
  };

  const cycleInitiativeStatus = (trackKey: keyof TracksByKey, initiativeIndex: number) => {
    setTracksState((prevTracks: TracksByKey) => {
      const nextTracks: TracksByKey = { ...prevTracks };
      const track = nextTracks[trackKey];
      const initiativesCopy = [...track.initiatives];

      const currentStatus = initiativesCopy[initiativeIndex].status;
      let nextStatus: Initiative['status'];

      if (currentStatus === 'idea') {
        nextStatus = 'active';
      } else if (currentStatus === 'active') {
        nextStatus = 'done';
      } else {
        nextStatus = 'idea';
      }

      initiativesCopy[initiativeIndex] = {
        ...initiativesCopy[initiativeIndex],
        status: nextStatus
      };

      nextTracks[trackKey] = {
        ...track,
        initiatives: initiativesCopy
      };

      return nextTracks;
    });
  };

  const addInitiative = (trackKey: keyof TracksByKey) => {
    setTracksState((prevTracks: TracksByKey) => {
      const nextTracks: TracksByKey = { ...prevTracks };
      const track = nextTracks[trackKey];

      const initiativesCopy = [
        ...track.initiatives,
        {
          name: 'New idea',
          status: 'idea' as Initiative['status'],
        },
      ];

      nextTracks[trackKey] = {
        ...track,
        initiatives: initiativesCopy,
      };

      return nextTracks;
    });
  };

  const updateInitiativeName = (trackKey: keyof TracksByKey, initiativeIndex: number, name: string) => {
    setTracksState((prevTracks: TracksByKey) => {
      const nextTracks: TracksByKey = { ...prevTracks };
      const track = nextTracks[trackKey];
      const initiativesCopy = [...track.initiatives];

      initiativesCopy[initiativeIndex] = {
        ...initiativesCopy[initiativeIndex],
        name,
      };

      nextTracks[trackKey] = {
        ...track,
        initiatives: initiativesCopy,
      };

      return nextTracks;
    });
  };

  return (
    <div className="kpi-dashboard">
      <div>
        <h1>Site Standards: Building the foundation for faster features and better experience </h1>
        <p>
          <strong>
           We empower Digital teams to confidently build cohesive, high-quality experiences and deliver value fast with reliable tools, clear standards, and frictionless support for web and telemetry.
          </strong>
        </p>
        <h2>Active Focus & Key Performance Indicators</h2>
      </div>

      <div className="kpi-section-list">
        {(Object.keys(tracksState) as (keyof TracksByKey)[]).map((key) => {
          const track = tracksState[key];
          return (
          <div
            key={key}
            className={`kpi-track-card ${track.colorClass}`}
          >
            <button
              onClick={() => toggleSection(key)}
              className={`kpi-track-header ${track.headerClass}`}
            >
              <div className="kpi-track-header-left">
                {expandedSections[key] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <div className="kpi-track-header-left">
                  <div className="kpi-track-number">
                    {track.number}
                  </div>
                  <div className="kpi-track-title-group">
                    <div className="kpi-track-short-title">{track.shortName}</div>
                    <h2 className="kpi-track-title">{track.name}</h2>
                  </div>
                </div>
              </div>
            </button>

            {expandedSections[key] && (
              <div className="kpi-track-body">
                <div>
                  <h3 className="kpi-initiatives-title">Current Tracks:</h3>
                  <div className="kpi-initiative-list">
                    {track.initiatives.map((initiative: Initiative, idx: number) => (
                      <div
                        key={idx}
                        className="kpi-initiative-pill"
                      >
                        <input
                          className="kpi-initiative-name-input"
                          value={initiative.name}
                          onChange={(e) => updateInitiativeName(key, idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="kpi-initiative-status-button"
                          onClick={() => cycleInitiativeStatus(key, idx)}
                          title="Click to change status: Idea → Active → Done"
                        >
                          {getInitiativeStatusBadge(initiative.status)}
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="kpi-initiative-pill kpi-initiative-add-pill"
                      onClick={() => addInitiative(key)}
                      title="Add new idea for this track"
                    >
                      <span className="kpi-initiative-add-plus">+</span>
                    </button>
                  </div>
                </div>

                <div className="kpi-metrics-table-wrapper">
                  <table className="kpi-metrics-table">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th>Metric</th>
                        <th>Target</th>
                        <th>Current</th>
                        <th>Status</th>
                        <th>Impact</th>
                        <th>Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {track.metrics.map((metric: Metric, idx: number) => (
                        <tr key={idx}>
                          <td className="kpi-metric-name">{metric.metric}</td>
                          <td className="kpi-target-cell">{metric.target}</td>
                          <td>{metric.current}</td>
                          <td>
                            <div className="kpi-status-dot-wrapper">
                              <div className={`kpi-status-dot ${getStatusColorClass(metric.status)}`}></div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`kpi-outcome-pill ${
                                metric.outcome === 'CUSTOMER'
                                  ? 'kpi-outcome-customer'
                                  : 'kpi-outcome-developer'
                              }`}
                            >
                              {metric.outcome}
                            </span>
                          </td>
                          <td className="kpi-outcome-text">{metric.outcomeDetail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )})}
      </div>

      <div className="kpi-legend">
        <h3 className="kpi-legend-title">Legend</h3>
        <div className="kpi-legend-items">
          <div className="kpi-legend-item">
            <div className="kpi-legend-dot kpi-dot-green"></div>
            <span>On track / Meeting target</span>
          </div>
          <div className="kpi-legend-item">
            <div className="kpi-legend-dot kpi-dot-yellow"></div>
            <span>In progress / Needs improvement</span>
          </div>
          <div className="kpi-legend-item">
            <div className="kpi-legend-dot kpi-dot-red"></div>
            <span>At risk / Missing target</span>
          </div>
          <div className="kpi-legend-item">
            <div className="kpi-legend-dot kpi-dot-gray"></div>
            <span>Not started / TBD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIDashboard;