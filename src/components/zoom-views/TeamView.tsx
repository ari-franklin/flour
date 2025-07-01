import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { RoadmapItem, Bet as BetType } from '../../types';
import BaseZoomView from './BaseZoomView';
import { 
  Target, ChevronDown, ChevronRight, ListChecks, Flag, 
  Check, Clock, X, Calendar, Tag, ArrowLeft, ArrowUpRight
} from 'lucide-react';

interface TeamViewProps {
  items: RoadmapItem[];
}

// Define a type for bet priority
type BetPriority = 'now' | 'next' | 'near';
type BetStatus = 'not started' | 'in progress' | 'completed' | 'blocked';

// Extend the BetType to include our custom fields
interface ExtendedBetType extends Omit<BetType, 'status'> {
  priority: BetPriority;
  status: BetStatus;
}

const TeamView: React.FC<TeamViewProps> = ({ items }) => {
  const [searchParams] = useSearchParams();
  const outcomeId = searchParams.get('outcome') || '';
  const betId = searchParams.get('bet') || '';
  const objectiveId = searchParams.get('objective') || '';
  
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [expandedOutcomes, setExpandedOutcomes] = useState<Set<string>>(new Set());
  
  // Filter items by type
  const objectives = items.filter(item => item.type === 'objective');
  const outcomes = items.filter(item => item.type === 'outcome');
  
  // We'll use getFilteredBets to get bets for specific outcomes
  
  // Auto-expand the relevant objective and outcome based on URL params
  useEffect(() => {
    const newExpandedObjectives = new Set<string>();
    const newExpandedOutcomes = new Set<string>();

    // If we have an outcome ID, expand its parent objective
    if (outcomeId) {
      const outcome = outcomes.find(o => o.id === outcomeId);
      if (outcome?.objective_id) {
        newExpandedObjectives.add(outcome.objective_id);
        newExpandedOutcomes.add(outcomeId);
      }
    }
    // If we have just an objective ID, expand it
    else if (objectiveId) {
      newExpandedObjectives.add(objectiveId);
    }

    setExpandedObjectives(newExpandedObjectives);
    setExpandedOutcomes(newExpandedOutcomes);
  }, [outcomeId, objectiveId, outcomes]);
  
  // Get the current outcome if viewing a specific one
  const currentOutcome = outcomeId ? outcomes.find(o => o.id === outcomeId) : null;
  const currentObjective = currentOutcome && currentOutcome.objective_id 
    ? objectives.find(o => o.id === currentOutcome.objective_id) 
    : null;

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
  
  // Helper function to safely get outcome ID
  const getOutcomeId = (outcome: RoadmapItem): string => {
    return outcome.id || '';
  };
  
  // Helper function to safely get objective ID
  const getObjectiveId = (objective: RoadmapItem): string => {
    return objective.id || '';
  };

  // Toggle outcome expansion - now handled inline in renderOutcome
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'in progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </span>
        );
      case 'not started':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            Not Started
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {label}
      </span>
    );
  };

  // Mock progress calculation
  const getProgress = () => Math.floor(Math.random() * 100);
  
  // Filter bets based on URL parameters
  const getFilteredBets = (outcomeId: string): ExtendedBetType[] => {
    // First, find all bets in the items array that belong to this outcome
    const betsFromItems = items
      .filter((item): item is RoadmapItem & { type: 'bet' } => 
        item.type === 'bet' && item.outcome_id === outcomeId
      )
      .map(betItem => {
        // Map the priority to a valid BetPriority
        let priority: BetPriority = 'next';
        if ('priority' in betItem) {
          priority = (betItem.priority === 'now' || betItem.priority === 'near') 
            ? betItem.priority 
            : 'next';
        }

        // Map the status to a valid BetStatus
        const statusMap: Record<string, BetStatus> = {
          'now': 'in progress',
          'next': 'not started',
          'near': 'not started',
          'in progress': 'in progress',
          'completed': 'completed',
          'blocked': 'blocked'
        };
        
        const status = statusMap[betItem.status as string] || 'not started';

        return {
          ...betItem,
          priority,
          status,
          outcome_id: betItem.outcome_id || ''
        } as unknown as ExtendedBetType; // Cast needed because of the Omit<>
      });
    
    // If we're viewing a specific bet, filter to just that bet
    if (betId) {
      return betsFromItems.filter(bet => bet.id === betId);
    }
    
    return betsFromItems;
  };

  // Generate title based on context
  const getTitle = () => {
    if (betId && currentOutcome) {
      return `Work: ${currentOutcome.title}`;
    }
    if (outcomeId && currentOutcome) {
      return `Work: ${currentOutcome.title}`;
    }
    return 'Team View';
  };
  
  // Generate description based on context
  const getDescription = () => {
    if (betId && currentOutcome) {
      return `Viewing specific work items for ${currentOutcome.title}`;
    }
    if (outcomeId && currentOutcome) {
      return `Viewing all work items for ${currentOutcome.title}`;
    }
    return 'Detailed view of all work items with execution details';
  };
  
  // Generate back link
  const getBackLink = () => {
    if (betId && currentOutcome) {
      return `/team/outcome/${outcomeId}`;
    }
    if (outcomeId) {
      return '/';
    }
    return null;
  };

  // Render a single bet card
  const renderBetCard = (bet: ExtendedBetType) => (
    <div key={bet.id} className="bg-white p-4 rounded border border-gray-200 mb-3 shadow-sm">
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
            {getStatusBadge(bet.status)}
            {getPriorityBadge(bet.priority)}
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
  );

  // Render a single outcome with its bets
  const renderOutcome = (outcome: RoadmapItem) => {
    const outcomeId = getOutcomeId(outcome);
    const outcomeBets = getFilteredBets(outcomeId);
    const isExpanded = expandedOutcomes.has(outcomeId);
    
    return (
      <div key={outcome.id} className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div 
          className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
          onClick={() => {
            const newExpanded = new Set(expandedOutcomes);
            if (isExpanded) {
              newExpanded.delete(outcomeId);
            } else {
              newExpanded.add(outcomeId);
            }
            setExpandedOutcomes(newExpanded);
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-1.5 rounded-md mr-3">
              <ListChecks className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
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
            <Link 
              to={`/team/outcome/${outcomeId}`}
              className="text-sm text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()} // Prevent the accordion from toggling
            >
              View Work
            </Link>
          </div>
          <div className="text-gray-400">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </div>
        
        {isExpanded && outcomeBets.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-3">
            {outcomeBets.map(bet => renderBetCard(bet))}
          </div>
        )}
      </div>
    );
  };

  // Render a single objective with its outcomes
  const renderObjective = (objective: RoadmapItem) => {
    const objectiveId = getObjectiveId(objective);
    const objectiveOutcomes = outcomes.filter(outcome => outcome.objective_id === objectiveId);
    const isObjectiveExpanded = expandedObjectives.has(objectiveId);
    
    return (
      <div key={objectiveId} className="border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="bg-white p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
          onClick={() => toggleObjective(objectiveId)}
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
              objectiveOutcomes.map(outcome => renderOutcome(outcome))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No outcomes defined for this objective
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render the filtered view when viewing a specific outcome
  const renderFilteredView = () => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Objective Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-md mr-4">
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{currentObjective?.title}</h3>
          </div>
        </div>
      </div>
      
      {/* Outcome */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-100 p-1.5 rounded-md mr-3">
            <ListChecks className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{currentOutcome?.title}</h4>
            {currentOutcome?.description && (
              <p className="mt-1 text-sm text-gray-600">{currentOutcome.description}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Bets List */}
      <div className="bg-gray-50 p-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Work Items</h5>
        {currentOutcome && getFilteredBets(currentOutcome.id).map(bet => renderBetCard(bet))}
      </div>
    </div>
  );

  // Render the main component
  return (
    <BaseZoomView
      items={items}
      title={getTitle()}
      description={getDescription()}
    >
      <div className="space-y-6">
        {/* Back button when viewing specific items */}
        {(outcomeId || betId) && (
          <div className="mb-4">
            <Link 
              to={getBackLink()!}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {betId ? 'Back to outcome' : 'Back to roadmap'}
            </Link>
          </div>
        )}
        
        {/* Show only the relevant objective/outcome when filtered */}
        {outcomeId && currentObjective && currentOutcome ? (
          renderFilteredView()
        ) : (
          // Show all objectives/outcomes when not filtered
          objectives.map(objective => renderObjective(objective))
        )}
      </div>
    </BaseZoomView>
  );
};

export default TeamView;
