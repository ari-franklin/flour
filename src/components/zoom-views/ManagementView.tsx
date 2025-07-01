import React, { useState } from 'react';
import { RoadmapItem } from '../../types';
import BaseZoomView from './BaseZoomView';
import { Target, ChevronDown, ChevronRight, Users, BarChart2, TrendingUp, Target as TargetIcon, Gauge } from 'lucide-react';

interface ManagementViewProps {
  items: RoadmapItem[];
}

const ManagementView: React.FC<ManagementViewProps> = ({ items }) => {
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  
  // Filter for management-level items (objectives, outcomes, and bets)
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
  
  // Toggle objective expansion
  const toggleObjective = (id: string) => {
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedObjectives(newExpanded);
  };

  return (
    <BaseZoomView
      items={items}
      title="Management View"
      description="Objectives with their key outcomes and progress"
    >
      <div className="space-y-4">
        {objectives.map((objective) => {
          const objectiveOutcomes = outcomes.filter(outcome => outcome.objective_id === objective.id);
          const isExpanded = expandedObjectives.has(objective.id);
          
          return (
            <div key={objective.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-white p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                onClick={() => toggleObjective(objective.id)}
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
                      <div key={outcome.id} className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                        <h5 className="font-medium text-gray-900">{outcome.title}</h5>
                        {outcome.description && (
                          <p className="mt-1 text-sm text-gray-600">{outcome.description}</p>
                        )}
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
                          ) : null;
                        })()}
                      </div>
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
