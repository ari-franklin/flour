import React, { useState } from 'react';
import { RoadmapItem } from '../../types';
import BaseZoomView from './BaseZoomView';
import { Target, ChevronDown, ChevronRight, Check, AlertCircle, Clock, Users, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ManagementViewProps {
  items: RoadmapItem[];
}

const ManagementView: React.FC<ManagementViewProps> = ({ items }) => {
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  
  // Filter for management-level items (objectives and outcomes)
  const objectives = items.filter(item => item.type === 'objective');
  const outcomes = items.filter(item => item.type === 'outcome');
  const bets = items.filter(item => item.type === 'bet');
  
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

  // Get bets for a specific outcome
  const getBetsForOutcome = (outcomeId: string) => {
    return bets.filter(bet => bet.outcome_id === outcomeId);
  };

  // Get bet status counts for an outcome
  const getBetStatusCounts = (outcomeId: string) => {
    const outcomeBets = getBetsForOutcome(outcomeId);
    const completed = outcomeBets.filter(bet => bet.status === 'now').length;
    const inProgress = outcomeBets.filter(bet => bet.status === 'near').length;
    const notStarted = outcomeBets.filter(bet => bet.status === 'next').length;
    
    return {
      total: outcomeBets.length,
      completed,
      inProgress,
      notStarted,
      progress: outcomeBets.length > 0 ? Math.round(((completed + inProgress) / outcomeBets.length) * 100) : 0
    };
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on track':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" /> On Track
          </span>
        );
      case 'at risk':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" /> At Risk
          </span>
        );
      case 'behind':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Clock className="h-3 w-3 mr-1" /> Behind
          </span>
        );
      default:
        return null;
    }
  };

  // Mock progress calculation
  const getProgress = () => Math.floor(Math.random() * 100);

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
                      <div className="text-sm text-gray-500">•</div>
                      <div className="text-sm text-gray-500">
                        {getProgress()}% complete
                      </div>
                      <div className="text-sm text-gray-500">•</div>
                      {getStatusBadge(['on track', 'at risk', 'behind'][Math.floor(Math.random() * 3)])}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </div>
              
              {isExpanded && objectiveOutcomes.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-gray-500" />
                    Key Outcomes
                  </h4>
                  <div className="space-y-3">
                    {objectiveOutcomes.map((outcome) => {
                      const betsStatus = getBetStatusCounts(outcome.id);
                      
                      return (
                        <div key={outcome.id} className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
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
                              
                              {/* Bets Progress */}
                              <div className="mt-4">
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span>
                                    {betsStatus.completed} achieved • {betsStatus.inProgress} in progress
                                    <span className="text-gray-400 mx-1">•</span>
                                    {betsStatus.total} total bets
                                  </span>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                  <div 
                                    className="h-full bg-indigo-600 rounded-full" 
                                    style={{ width: `${betsStatus.progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>{betsStatus.progress}% complete</span>
                                  <span>{betsStatus.completed + betsStatus.inProgress} of {betsStatus.total}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="text-right">
                                <span className="text-sm font-medium text-gray-700">
                                  {betsStatus.completed + betsStatus.inProgress}/{betsStatus.total}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
