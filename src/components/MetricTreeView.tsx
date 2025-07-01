import React, { useMemo, ReactNode } from 'react';
import { Metric, Team, Objective, Outcome, Bet } from '../types';
import { calculateRollupValue } from '../utils/metricUtils';

interface MetricTreeViewProps {
  metrics: Metric[];
  teams: Team[];
  objectives?: Objective[];
  outcomes?: Outcome[];
  bets?: Bet[];
  selectedMetricId?: string;
  onSelectMetric?: (metricId: string) => void;
}

const MetricTreeView: React.FC<MetricTreeViewProps> = ({
  metrics,
  teams,
  objectives = [],
  outcomes = [],
  bets = [],
  selectedMetricId,
  onSelectMetric,
}): ReactNode => {
  // Create a map of metrics by ID for quick lookup
  const metricMap = React.useMemo(() => {
    const map: Record<string, Metric> = {};
    metrics.forEach(metric => {
      map[metric.id] = metric;
    });
    return map;
  }, [metrics]);

  // Get top-level metrics (no parent)
  const rootMetrics = useMemo(() => {
    return metrics.filter((metric) => !metric.parent_metric_id);
  }, [metrics]);
  
  // Check if a metric is unlinked (no parent metric and no valid parent item)
  const isMetricUnlinked = (metric: Metric) => {
    // A metric is considered unlinked if:
    // 1. It has no parent_metric_id AND
    // 2. It has no parent_id (not linked to any objective/outcome/bet) OR
    //    It has an invalid parent_type
    const hasNoParentMetric = !metric.parent_metric_id;
    const hasNoParentItem = !metric.parent_id;
    const hasInvalidParentType = !metric.parent_type || 
                               !['objective', 'outcome', 'bet'].includes(metric.parent_type);
    
    return hasNoParentMetric && (hasNoParentItem || hasInvalidParentType);
  };

  // Helper functions to find related items
  const getTeamById = (teamId: string) => teams.find((team) => team.id === teamId);

  const getParentItem = (metric: Metric) => {
    if (!metric || !metric.parent_id || !metric.parent_type) return null;
    
    switch(metric.parent_type) {
      case 'objective': {
        const objective = objectives.find(o => o && o.id === metric.parent_id);
        return objective ? { type: 'Objective' as const, item: objective } : null;
      }
      case 'outcome': {
        const outcome = outcomes.find(o => o && o.id === metric.parent_id);
        return outcome ? { type: 'Outcome' as const, item: outcome } : null;
      }
      case 'bet': {
        const bet = bets.find(b => b && b.id === metric.parent_id);
        return bet ? { type: 'Bet' as const, item: bet } : null;
      }
      default:
        return null;
    }
  };

  // Get all child metrics for a given metric
  const getChildMetrics = (metricId: string): Metric[] => {
    return metrics.filter((m): m is Metric => m !== undefined && m.parent_metric_id === metricId);
  };

  // Get all parent metrics for a given metric
  const getParentMetrics = (metric: Metric): Metric[] => {
    if (!metric.parent_metric_id) return [];
    const parent = metrics.find(m => m.id === metric.parent_metric_id);
    // Add type assertion to handle possible undefined parent
    return parent ? [parent, ...getParentMetrics(parent as Metric)] : [];
  };

  // Render metric details panel
  const renderMetricDetails = (metric: Metric) => {
    if (metric.id !== selectedMetricId) return null;
    
    // Add null checks for required properties
    if (!metric) return null;
    
    const team = metric.team_id ? getTeamById(metric.team_id) : null;
    const parentItem = getParentItem(metric);
    const progress = calculateRollupValue(metric.id, metricMap, 'current');
    const target = calculateRollupValue(metric.id, metricMap, 'target');
    const progressPercent = progress !== null && target !== null && target > 0 
      ? Math.min(100, Math.round((progress / target) * 100))
      : 0;
    
    const parentMetrics = getParentMetrics(metric);
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">{metric.name} Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Current Value: <span className="font-medium">{progress} {metric.unit || ''}</span></p>
            <p className="text-sm text-gray-600">Target: <span className="font-medium">{target} {metric.unit || ''}</span></p>
            <p className="text-sm text-gray-600">Progress: <span className="font-medium">{progressPercent}%</span></p>
            {team && (
              <p className="text-sm text-gray-600">
                Team: <span className="font-medium" style={{ color: team.color }}>{team.name}</span>
              </p>
            )}
          </div>
          <div>
            {parentItem && (
              <p className="text-sm text-gray-600">
                Parent {parentItem.type}: <span className="font-medium">{parentItem.item.title}</span>
              </p>
            )}
            {metric.description && (
              <p className="text-sm text-gray-600">
                Description: <span className="font-medium">{metric.description}</span>
              </p>
            )}
          </div>
        </div>
        
        {parentMetrics.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Parent Metrics:</h4>
            <div className="flex flex-wrap gap-1">
              {parentMetrics.map(parent => (
                <span key={parent.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {parent.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {getChildMetrics(metric.id).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Child Metrics:</h4>
            <div className="flex flex-wrap gap-1">
              {getChildMetrics(metric.id).map((child: Metric) => (
                <button
                  key={child.id}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMetric?.(child.id);
                  }}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render a single metric with its children
  const renderMetric = (metric: Metric, depth = 0) => {
    if (!metric) return null;
    
    const isSelected = metric.id === selectedMetricId;
    const team = metric.team_id ? getTeamById(metric.team_id) : null;
    const parentItem = getParentItem(metric);
    const progress = calculateRollupValue(metric.id, metricMap, 'current');
    const target = calculateRollupValue(metric.id, metricMap, 'target');
    const progressPercent = progress !== null && target !== null && target > 0 
      ? Math.min(100, Math.round((progress / target) * 100)) 
      : 0;
      
    const isUnlinked = isMetricUnlinked(metric);

    return (
      <div 
        key={metric.id}
        className={`ml-${depth * 4} my-1 p-2 rounded border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50 cursor-pointer'}`}
        onClick={() => onSelectMetric?.(metric.id)}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium">{metric.name}</span>
              {isUnlinked && (
                <span 
                  className="ml-1 text-yellow-600 text-lg" 
                  title="This metric is not linked to any parent metric or item"
                >
                  ⚠️
                </span>
              )}
            </div>
            {team && (
              <span 
                className="px-2 py-1 text-xs rounded-full text-white"
                style={{ backgroundColor: team.color || '#ccc' }}
              >
                {team.name}
              </span>
            )}
          </div>
          
          {parentItem?.item && (
            <div className="text-xs text-gray-500">
              {parentItem.type}: {parentItem.item.title}
              {parentItem.type === 'Outcome' && 'objective_id' in parentItem.item && parentItem.item.objective_id && (
                <span className="ml-2">
                  (Objective: {objectives.find(o => o.id === parentItem.item.objective_id)?.title})
                </span>
              )}
              {parentItem.type === 'Bet' && 'outcome_id' in parentItem.item && parentItem.item.outcome_id && (
                <span className="ml-2">
                  (Outcome: {outcomes.find(o => o.id === parentItem.item.outcome_id)?.title})
                </span>
              )}
            </div>
          )}
        <div className="mt-1 text-sm text-gray-600">
          {progress !== null && (
            <span className="font-mono">
              {progress.toFixed(1)}{metric.unit} 
              {target !== null && ` / ${target}${metric.unit}`}
            </span>
          )}
          {progressPercent > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div 
                className={`h-2.5 rounded-full ${
                  progressPercent < 50 ? 'bg-red-500' : 
                  progressPercent < 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`} 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
      {metric.child_metrics?.map(childId => {
          const childMetric = metrics.find(m => m.id === childId);
          return childMetric ? (
            <div key={childId} className="mt-2">
              {renderMetric(childMetric, depth + 1)}
            </div>
          ) : null;
        })}
      </div>
    );
  };

  // Find the currently selected metric with type safety
  const selectedMetric = useMemo(() => {
    if (!selectedMetricId) return null;
    const found = metrics.find(m => m.id === selectedMetricId);
    return found || null;
  }, [selectedMetricId, metrics]);

  // Filter out any undefined metrics before rendering
  const validRootMetrics = useMemo(() => 
    rootMetrics.filter((m): m is Metric => m !== undefined)
  , [rootMetrics]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 h-full">
      <div className="lg:w-1/2 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Metric Hierarchy</h3>
        <div className="space-y-4">
          {validRootMetrics.length > 0 ? (
            validRootMetrics.map(metric => (
              <div key={metric.id} className="mb-4">
                {renderMetric(metric, 0)}
              </div>
            ))
          ) : (
            <div className="text-gray-500">No metrics available</div>
          )}
        </div>
      </div>
      
      <div className="lg:w-1/2 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {selectedMetric ? 'Metric Details' : 'Select a metric to view details'}
        </h3>
        {selectedMetric ? (
          <div className="animate-fade-in">
            {renderMetricDetails(selectedMetric)}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2">Click on any metric to view its details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { MetricTreeView };
export default MetricTreeView;
