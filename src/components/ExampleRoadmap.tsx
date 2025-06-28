import React from 'react';
import { getConnectedData } from '../data/exampleRoadmapData';
import ExecutiveView from './zoom-views/ExecutiveView';
import ManagementView from './zoom-views/ManagementView';
import TeamView from './zoom-views/TeamView';
import { ZoomLevel } from '../contexts/ZoomContext';

interface ExampleRoadmapProps {
  zoomLevel: ZoomLevel;
}

export const ExampleRoadmap: React.FC<ExampleRoadmapProps> = ({ zoomLevel }) => {
  const { roadmapItems } = getConnectedData();

  // Render the appropriate view based on zoom level
  const renderView = () => {

    switch (zoomLevel) {
      case 'executive':
        return <ExecutiveView items={roadmapItems} />;
      case 'management':
        return <ManagementView items={roadmapItems} />;
      case 'team':
        return <TeamView items={roadmapItems} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Example Roadmap</h2>
      <div className="bg-white rounded-lg shadow p-6">
        {renderView()}
      </div>
    </div>
  );
};

export default ExampleRoadmap;
