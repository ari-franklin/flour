import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './styles.css';
import {
  sampleTracks,
  type Initiative,
  type Metric,
  type TracksByKey,
} from './data/sampleTracks';

const KPIDashboard = () => {
  const [expandedSections, setExpandedSections] = useState({
    performance: true,
    platform: true,
    telemetry: true
  });

  const [tracksState, setTracksState] = useState<TracksByKey>(sampleTracks);

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
        <h1>TEAM </h1>
        <p>
          <strong>Mission</strong>
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
