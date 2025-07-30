import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
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
  const { objectiveId } = useParams<{ objectiveId?: string }>();
  const location = useLocation();
  const { roadmapItems, metrics, teams, objectives, outcomes, bets } = getConnectedData();
  const [selectedMetricId, setSelectedMetricId] = useState<string>();
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());

  // Auto-expand objective if objectiveId is provided
  useEffect(() => {
    if (objectiveId) {
      setExpandedObjectives(new Set([objectiveId]));
      
      // If we're not already in outcomes view, scroll to the objective
      if (zoomLevel !== 'outcomes') {
        // Use a small timeout to ensure the view has updated before scrolling
        const timer = setTimeout(() => {
          const element = document.getElementById(`objective-${objectiveId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Add a temporary highlight
            element.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
            }, 2000);
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    } else if ((location.pathname === '/outcomes' || location.pathname === '/bets') && expandedObjectives.size > 0) {
      // Clear expanded objectives when navigating back to the main views
      setExpandedObjectives(new Set());
    }
  }, [objectiveId, location.pathname, zoomLevel]);

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
            {zoomLevel === 'objectives' && 'Objectives View'}
            {zoomLevel === 'outcomes' && 'Outcomes View'}
            {zoomLevel === 'bets' && 'Bets View'}
          </h1>
          <Link 
            to="/metrics"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Metrics
          </Link>
        </div>
        
        {zoomLevel === 'objectives' && (
          <>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Debug Info: Showing {roadmapItems.filter(item => item.type === 'objective').length} objectives
                    <br />
                    Total items: {roadmapItems.length}
                  </p>
                </div>
              </div>
            </div>
            <ExecutiveView items={roadmapItems} />
          </>
        )}
        {zoomLevel === 'outcomes' && (
          <ManagementView 
            items={roadmapItems} 
            expandedObjectives={expandedObjectives}
            onToggleObjective={(id) => {
              const newExpanded = new Set(expandedObjectives);
              if (newExpanded.has(id)) {
                newExpanded.delete(id);
              } else {
                newExpanded.add(id);
              }
              setExpandedObjectives(newExpanded);
            }}
          />
        )}
        {zoomLevel === 'bets' && <TeamView items={roadmapItems} />}
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
