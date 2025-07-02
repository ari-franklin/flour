import React from 'react';
import { RoadmapItem } from '../../types';
import BaseZoomView from './BaseZoomView';
import { Target, BarChart2, TrendingUp, Check } from 'lucide-react';
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

  // Get all metrics for an objective
  const getMetrics = (objective: any) => {
    return objective.metrics || [];
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
                    
                    {/* North Star Metrics */}
                    {objective.metrics?.some(m => m.isNorthStar) && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">North Star Metrics</h4>
                        <div className="space-y-2">
                          {objective.metrics
                            .filter(metric => metric.isNorthStar)
                            .map(metric => (
                              <div 
                                key={metric.id}
                                className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-100 shadow-sm"
                                title={metric.description}
                              >
                                <div className="flex items-center">
                                  <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                                    <TrendingUp className="h-2.5 w-2.5 text-indigo-600" />
                                  </div>
                                  <span className="font-medium text-gray-700">{metric.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className={`font-medium ${(metric.current_value || 0) >= (metric.target_value || 0) ? 'text-green-600' : 'text-amber-600'}`}>
                                    {metric.current_value?.toLocaleString()}{metric.unit}
                                  </span>
                                  <span className="mx-1 text-gray-400">/</span>
                                  <span className="text-gray-500">{metric.target_value?.toLocaleString()}{metric.unit}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-wrap items-center gap-2 md:gap-1.5 text-sm text-gray-600">
                        <div className="flex items-center bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                          <Check className="h-4 w-4 text-green-600 mr-1.5 flex-shrink-0" />
                          <span className="font-medium text-gray-800">{achieved}</span>
                          <span className="mx-1 text-gray-400">•</span>
                          <span className="text-gray-600">achieved</span>
                        </div>
                        
                        <div className="hidden md:block h-4 w-px bg-gray-200"></div>
                        
                        <div className="flex items-center bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                          <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 flex-shrink-0"></span>
                          <span className="font-medium text-gray-800">{inProgress}</span>
                          <span className="mx-1 text-gray-400">•</span>
                          <span className="text-gray-600">in progress</span>
                        </div>
                        
                        <div className="hidden md:block h-4 w-px bg-gray-200"></div>
                        
                        <Link
                          to={`/outcomes/${objective.id}`}
                          className="group flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-150 whitespace-nowrap"
                        >
                          <span className="font-medium">View {total} outcomes</span>
                          <svg 
                            className="ml-1 h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7" 
                            />
                          </svg>
                        </Link>
                      </div>
                      
                      {(() => {
                        // Get all metrics and filter for business metrics
                        const metrics = getMetrics(objective);
                        const businessMetrics = metrics.filter((m: any) => m.metricType === 'business');
                        const nonNorthStarBusinessMetrics = businessMetrics.filter((m: any) => !m.isNorthStar);
                        
                        // If we have business metrics that aren't North Star, show them
                        if (nonNorthStarBusinessMetrics.length > 0) {
                          return nonNorthStarBusinessMetrics.map((metric: any) => (
                            <div key={metric.id} className="flex items-center text-sm text-gray-600">
                              <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
                              <span>
                                {metric.name}: {metric.current_value}{metric.unit} of {metric.target_value}{metric.unit}
                              </span>
                            </div>
                          ));
                        }
                        
                        // Fallback to any non-North Star metrics if no business metrics found
                        const nonNorthStarMetrics = metrics.filter((m: any) => !m.isNorthStar);
                        if (nonNorthStarMetrics.length > 0) {
                          return nonNorthStarMetrics.map((metric: any) => (
                            <div key={metric.id} className="flex items-center text-sm text-gray-600">
                              <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
                              <span>
                                {metric.name}: {metric.current_value}{metric.unit} of {metric.target_value}{metric.unit}
                              </span>
                            </div>
                          ));
                        }
                        
                        return null;
                      })()}
                      
                      <div className="flex items-center justify-end">
                        {/* Empty column for alignment */}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Progress bar */}
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
