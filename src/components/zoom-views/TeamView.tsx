import React, { useState } from 'react';
import { RoadmapItem } from '../../types';
import BaseZoomView from './BaseZoomView';
import { Target, ChevronDown, ChevronRight, ListChecks, Flag, Check, X, AlertTriangle, Clock, User, Calendar, Tag, ArrowUpRight } from 'lucide-react';

interface TeamViewProps {
  items: RoadmapItem[];
}

const TeamView: React.FC<TeamViewProps> = ({ items }) => {
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [expandedOutcomes, setExpandedOutcomes] = useState<Set<string>>(new Set());
  
  // Filter items by type
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

  // Toggle outcome expansion
  const toggleOutcome = (id: string) => {
    const newExpanded = new Set(expandedOutcomes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOutcomes(newExpanded);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" /> Completed
          </span>
        );
      case 'in progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" /> Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" /> Not Started
          </span>
        );
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { color: string; label: string }> = {
      high: { color: 'red', label: 'High' },
      medium: { color: 'yellow', label: 'Medium' },
      low: { color: 'gray', label: 'Low' }
    };
    
    const { color, label } = priorityMap[priority.toLowerCase()] || { color: 'gray', label: 'None' };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {label}
      </span>
    );
  };

  // Mock progress calculation
  const getProgress = () => Math.floor(Math.random() * 100);

  return (
    <BaseZoomView
      items={items}
      title="Team View"
      description="Detailed view of all work items with execution details"
    >
      <div className="space-y-6">
        {objectives.map((objective) => {
          const objectiveOutcomes = outcomes.filter(outcome => outcome.objective_id === objective.id);
          const isObjectiveExpanded = expandedObjectives.has(objective.id);
          
          return (
            <div key={objective.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Objective Header */}
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
                      <span className="text-sm text-gray-500">
                        {objectiveOutcomes.length} {objectiveOutcomes.length === 1 ? 'outcome' : 'outcomes'}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {getProgress()}% complete
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  {isObjectiveExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </div>
              
              {isObjectiveExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                  {objectiveOutcomes.length > 0 ? (
                    objectiveOutcomes.map((outcome) => {
                      const outcomeBets = bets.filter(bet => bet.outcome_id === outcome.id);
                      const isOutcomeExpanded = expandedOutcomes.has(outcome.id);
                      
                      return (
                        <div key={outcome.id} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                          {/* Outcome Header */}
                          <div 
                            className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                            onClick={() => toggleOutcome(outcome.id)}
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-green-100 p-1.5 rounded-md mr-3">
                                <ListChecks className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{outcome.title}</h4>
                                <div className="flex items-center mt-1 space-x-2">
                                  <span className="text-xs text-gray-500">
                                    {outcomeBets.length} {outcomeBets.length === 1 ? 'bet' : 'bets'}
                                  </span>
                                  <span className="text-xs text-gray-500">•</span>
                                  <span className="text-xs text-gray-500">
                                    {getProgress()}% complete
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-gray-400">
                              {isOutcomeExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </div>
                          </div>
                          
                          {/* Bets List */}
                          {isOutcomeExpanded && outcomeBets.length > 0 && (
                            <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-3">
                              {outcomeBets.map((bet) => (
                                <div key={bet.id} className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-yellow-100 p-1 rounded mr-2">
                                          <Flag className="h-3.5 w-3.5 text-yellow-600" />
                                        </div>
                                        <h5 className="font-medium text-gray-900">{bet.title}</h5>
                                      </div>
                                      {bet.description && (
                                        <p className="mt-1 text-sm text-gray-600">{bet.description}</p>
                                      )}
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {getStatusBadge(['not started', 'in progress', 'completed', 'blocked'][Math.floor(Math.random() * 4)])}
                                        {getPriorityBadge(['high', 'medium', 'low'][Math.floor(Math.random() * 3)])}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex -space-x-1">
                                        {[1, 2, 3].map((i) => (
                                          <div key={i} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700">
                                            {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                                          </div>
                                        ))}
                                      </div>
                                      <a href="#" className="text-gray-400 hover:text-gray-600">
                                        <ArrowUpRight className="h-4 w-4" />
                                      </a>
                                    </div>
                                  </div>
                                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center space-x-3">
                                      <span className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Due: {new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                      </span>
                                      <span className="flex items-center">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {['Frontend', 'Backend', 'Design', 'QA'][Math.floor(Math.random() * 4)]}
                                      </span>
                                    </div>
                                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-600" 
                                        style={{ width: `${getProgress()}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No outcomes defined for this objective
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BaseZoomView>
  );
};

export default TeamView;
