import React from 'react';
import { Link } from 'react-router-dom';
import { RoadmapItem } from '../../types';
import BaseZoomView from './BaseZoomView';
import { Target, ChevronDown, ChevronRight, Users, BarChart2, TrendingUp, Target as TargetIcon, Gauge, ArrowUpRight } from 'lucide-react';

interface ManagementViewProps {
  items: RoadmapItem[];
  expandedObjectives: Set<string>;
  onToggleObjective: (id: string) => void;
}

const ManagementView: React.FC<ManagementViewProps> = ({ items, expandedObjectives, onToggleObjective }) => {
  // Filter for outcomes-level items (objectives, outcomes, and bets)
  const objectives = items.filter(item => item.type === 'objective');
  const outcomes = items.filter(item => item.type === 'outcome');
  const bets = items.filter(item => item.type === 'bet');
  
  // Get all metrics for an outcome (both direct and from its bets)
  const getOutcomeMetrics = (outcomeId: string) => {
    const directMetrics = outcomes.find(o => o.id === outcomeId)?.metrics || [];
    const betMetrics = bets
      .filter(bet => bet.outcome_id === outcomeId)
      .flatMap(bet => bet.metrics || []);
    
    // Combine and deduplicate metrics by ID
    const allMetrics = [...directMetrics, ...betMetrics];
    return allMetrics.filter((metric, index, self) => 
      index === self.findIndex(m => m.id === metric.id)
    );
  };

  return (
    <BaseZoomView
      items={items}
      title="Outcomes View"
      description="Objectives with their key outcomes and progress"
    >
      <div className="space-y-4">
        {objectives.map((objective) => {
          const objectiveOutcomes = outcomes.filter(outcome => outcome.objective_id === objective.id);
          const isExpanded = expandedObjectives.has(objective.id);
          
          return (
            <div 
              key={objective.id} 
              id={`objective-${objective.id}`}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
            >
              <div 
                className="bg-white p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                onClick={() => onToggleObjective(objective.id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-md mr-4">
                    <Target className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{objective.title}</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <div className="text-sm text-gray-500">
                        {objectiveOutcomes.length} {objectiveOutcomes.length === 1 ? 'outcome' : 'outcomes'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </div>
              
              {isExpanded && objectiveOutcomes.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Key Outcomes
                  </h4>
                  <div className="space-y-3">
                    {objectiveOutcomes.map((outcome) => (
                      <Link 
                        key={outcome.id} 
                        to={`/outcomes/${objective.id}/outcome/${outcome.id}`}
                        className="block bg-white p-4 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{outcome.title}</h3>
                            {outcome.description && (
                              <p className="text-sm text-gray-500 mt-1">{outcome.description}</p>
                            )}
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            Team {outcome.team_id?.substring(0, 4) || 'N/A'}
                          </span>
                          <span>•</span>
                          <span>Due: Q2 2024</span>
                        </div>
                        
                        {/* Linked Metrics */}
                        {(() => {
                          const outcomeMetrics = getOutcomeMetrics(outcome.id);
                          return outcomeMetrics.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center text-xs font-medium text-gray-500">
                                <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                                Metrics
                              </div>
                              <div className="space-y-2">
                                {outcomeMetrics.map((metric) => (
                                  <div key={metric.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                    <div className="flex items-center">
                                      <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                                        {metric.name.toLowerCase().includes('rate') || 
                                         metric.name.toLowerCase().includes('growth') ? (
                                          <TrendingUp className="h-2.5 w-2.5 text-indigo-600" />
                                        ) : metric.name.toLowerCase().includes('target') ? (
                                          <TargetIcon className="h-2.5 w-2.5 text-indigo-600" />
                                        ) : (
                                          <Gauge className="h-2.5 w-2.5 text-indigo-600" />
                                        )}
                                      </div>
                                      <div className="flex items-center">
                                        <span className="font-medium text-gray-700">{metric.name}</span>
                                        {metric.status && (() => {
                                          const statusMap = {
                                            done: { label: 'Done', className: 'bg-green-100 text-green-800' },
                                            in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
                                            todo: { label: 'To Do', className: 'bg-gray-100 text-gray-800' },
                                            blocked: { label: 'Blocked', className: 'bg-red-100 text-red-800' }
                                          };
                                          
                                          const status = statusMap[metric.status as keyof typeof statusMap] || 
                                                       { label: 'To Do', className: 'bg-gray-100 text-gray-800' };
                                          
                                          return (
                                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                                              {status.label}
                                            </span>
                                          );
                                        })()}
                                      </div>
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
                          ) : null;
                        })()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BaseZoomView>
  );
};

export default ManagementView;
