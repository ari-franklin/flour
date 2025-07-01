import React from 'react';
import { RoadmapItem } from '../../types';
import BaseZoomView from './BaseZoomView';
import { Target, BarChart2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock teams - this should come from props or context in a real app
const exampleTeams = [
  { id: 'team-1', name: 'Product', color: 'bg-blue-500', textColor: 'text-blue-800' },
  { id: 'team-2', name: 'Engineering', color: 'bg-green-500', textColor: 'text-green-800' },
  { id: 'team-3', name: 'Design', color: 'bg-purple-500', textColor: 'text-purple-800' },
  { id: 'team-4', name: 'Marketing', color: 'bg-yellow-500', textColor: 'text-yellow-800' },
];

interface ExecutiveViewProps {
  items: RoadmapItem[];
}

const ExecutiveView: React.FC<ExecutiveViewProps> = ({ items }) => {
  // Only show objectives in executive view
  const objectives = items.filter(item => item.type === 'objective');

  // Get outcomes for each objective
  const getOutcomes = (objectiveId: string) => {
    return items.filter(item => item.type === 'outcome' && item.objective_id === objectiveId);
  };

  // Check if an outcome is 100% complete based on its metrics
  const isOutcomeComplete = (outcome: any) => {
    if (!outcome.metrics || outcome.metrics.length === 0) return false;
    
    // An outcome is complete if all its metrics have current_value >= target_value
    return outcome.metrics.every((metric: any) => {
      if (metric.current_value === undefined || metric.target_value === undefined) return false;
      return metric.current_value >= metric.target_value;
    });
  };

  // Count outcomes by completion status
  const countOutcomesByStatus = (outcomes: any[]) => {
    const achieved = outcomes.filter(outcome => isOutcomeComplete(outcome)).length;
    const inProgress = outcomes.length - achieved;
    
    return {
      total: outcomes.length,
      achieved,
      inProgress
    };
  };

  // Get primary metric for an objective
  const getPrimaryMetric = (objective: any) => {
    const metrics = objective.metrics || [];
    return metrics.find((m: any) => m.level === 'executive') || metrics[0];
  };
  
  // Calculate progress percentage
  const calculateProgress = (achieved: number, total: number) => {
    return total > 0 ? Math.round((achieved / total) * 100) : 0;
  };

  return (
    <BaseZoomView
      items={objectives}
      title="Executive View"
      description="High-level strategic objectives and key results"
    >
      <div className="space-y-6">
        {objectives.map((objective) => {
          const outcomes = getOutcomes(objective.id);
          const { total, achieved, inProgress } = countOutcomesByStatus(outcomes);
          const progress = calculateProgress(achieved, total);
          const primaryMetric = getPrimaryMetric(objective);
          const team = exampleTeams.find(t => t.id === objective.team_id);

          return (
            <div 
              key={objective.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                      {team && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${team.color} bg-opacity-20 ${team.textColor}`}>
                          {team.name}
                        </span>
                      )}
                    </div>
                    
                    {objective.description && (
                      <p className="mt-2 text-gray-600">{objective.description}</p>
                    )}
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>
                          {achieved} achieved • {inProgress} in progress
                        </span>
                      </div>
                      
                      {primaryMetric && (
                        <div className="flex items-center text-sm text-gray-600">
                          <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
                          <span>
                            {primaryMetric.name}: {primaryMetric.current_value}
                            {primaryMetric.unit} of {primaryMetric.target_value}
                            {primaryMetric.unit}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span>{total} total outcomes</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* View outcomes link */}
                    <div className="mt-4 flex justify-end">
                      <Link
                        to={`/outcomes?objective=${objective.id}`}
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        View outcomes <span className="ml-1">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </BaseZoomView>
  );
};

export default ExecutiveView;
