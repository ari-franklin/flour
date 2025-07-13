import React from 'react';
import { RoadmapItem } from '../../types';
import BaseZoomView from './BaseZoomView';
import { Target, BarChart2, TrendingUp, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExecutiveViewProps {
  items: RoadmapItem[];
}

const ExecutiveView: React.FC<ExecutiveViewProps> = ({ items }) => {
  // Only show objectives in objectives view
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
                      <h2 className="text-xl font-semibold mb-4">{objective.title}</h2>
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
                    
                    {/* Metrics and outcomes summary */}
                    <div className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current vs. Target Metrics */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                            <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
                            Key Metrics
                          </h3>
                          
                          {objective.metrics?.filter(metric => 
                            !metric.isNorthStar && 
                            (!metric.parent_metric_id || !metric.child_metrics || metric.child_metrics.length === 0)
                          ).map((metric, index) => (
                            <div key={index} className="mb-3 last:mb-0">
                              <div className="flex justify-between items-baseline">
                                  <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                                <div className="flex items-baseline">
                                  <span className={`text-lg font-semibold ${
                                    (metric.current_value || 0) >= (metric.target_value || 0) 
                                      ? 'text-green-600' 
                                      : 'text-amber-600'
                                  }`}>
                                    {metric.current_value?.toLocaleString()}{metric.unit}
                                  </span>
                                  <span className="mx-1 text-gray-400">/</span>
                                  <span className="text-sm text-gray-500">{metric.target_value?.toLocaleString()}{metric.unit} target</span>
                                </div>
                              </div>
                              <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    (metric.current_value || 0) >= (metric.target_value || 0) 
                                      ? 'bg-green-500' 
                                      : 'bg-amber-400'
                                  }`}
                                  style={{ 
                                    width: `${Math.min(100, ((metric.current_value || 0) / (metric.target_value || 1)) * 100)}%` 
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Outcomes Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            Outcomes Summary
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Achieved</span>
                                <span className="font-medium">{achieved} of {total}</span>
                              </div>
                              <div className="h-2 bg-green-50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500"
                                  style={{ width: `${(achieved / total) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">In Progress</span>
                                <span className="font-medium">{inProgress} of {total}</span>
                              </div>
                              <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500"
                                  style={{ width: `${(inProgress / total) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="pt-2 mt-2 border-t border-gray-100">
                              <Link
                                to={`/outcomes/${objective.id}`}
                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                              >
                                View all outcomes
                                <svg 
                                  className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" 
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
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end">
                        {/* Empty column for alignment */}
                      </div>
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
