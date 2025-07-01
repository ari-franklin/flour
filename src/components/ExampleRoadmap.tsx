import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getConnectedData } from '../data/exampleRoadmapData';
import ExecutiveView from './zoom-views/ExecutiveView';
import ManagementView from './zoom-views/ManagementView';
import TeamView from './zoom-views/TeamView';
import { ZoomLevel } from '../contexts/ZoomContext';
import MetricTreeView from './MetricTreeView';

interface ExampleRoadmapProps {
  zoomLevel: ZoomLevel;
  isPublicView?: boolean;
}

export const ExampleRoadmap: React.FC<ExampleRoadmapProps> = ({ zoomLevel }) => {
  const { roadmapItems, metrics, teams, objectives, outcomes, bets } = getConnectedData();
  const [selectedMetricId, setSelectedMetricId] = useState<string>();

  // Handle metric selection
  const handleSelectMetric = (metricId: string) => {
    setSelectedMetricId(metricId);
  };

  // Render the appropriate view based on zoom level
  const renderView = () => {
    if (zoomLevel === 'metrics') {
      return (
        <MetricTreeView 
          metrics={metrics} 
          teams={teams}
          objectives={objectives}
          outcomes={outcomes}
          bets={bets}
          selectedMetricId={selectedMetricId}
          onSelectMetric={handleSelectMetric}
        />
      );
    }

    // For roadmap views
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {zoomLevel === 'executive' && 'Executive View'}
            {zoomLevel === 'management' && 'Management View'}
            {zoomLevel === 'team' && 'Team View'}
          </h1>
          <Link 
            to="/metrics"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Metrics
          </Link>
        </div>
        
        {zoomLevel === 'executive' && <ExecutiveView items={roadmapItems} />}
        {zoomLevel === 'management' && <ManagementView items={roadmapItems} />}
        {zoomLevel === 'team' && <TeamView items={roadmapItems} />}
      </div>
    );
  };

  return (
    <div className="p-6">
      {zoomLevel !== 'metrics' && (
        <h2 className="text-2xl font-bold mb-6">
          Example Roadmap
        </h2>
      )}
      <div className="bg-white rounded-lg shadow">
        {renderView()}
      </div>
    </div>
  );
};

export default ExampleRoadmap;
