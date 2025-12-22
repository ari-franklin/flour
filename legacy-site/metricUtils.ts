import { Metric } from '../types';

type MetricMap = Record<string, Metric>;

/**
 * Creates a map of metrics by ID for quick lookup
 */
export const createMetricMap = (metrics: Metric[]): MetricMap => {
  return metrics.reduce<MetricMap>((acc, metric) => {
    acc[metric.id] = metric;
    return acc;
  }, {});
};

/**
 * Calculates the roll-up value for a metric based on its children
 */
export const calculateRollupValue = (
  metricId: string,
  metricMap: MetricMap,
  valueType: 'current' | 'target' = 'current'
): number | null => {
  const metric = metricMap[metricId];
  if (!metric) return null;

  // If no children, return the metric's own value
  if (!metric.child_metrics || metric.child_metrics.length === 0) {
    const value = valueType === 'current' ? metric.current_value : metric.target_value;
    return value !== undefined ? value : null;
  }

  // Calculate based on contribution type
  const children = metric.child_metrics
    .map(childId => {
      const child = metricMap[childId];
      if (!child) return null;
      
      const childValue = valueType === 'current' 
        ? child.current_value 
        : child.target_value;
      
      if (childValue === undefined) return null;
      
      return {
        value: childValue,
        weight: child.weight || 1,
        contribution: child.contribution_type || 'direct'
      };
    })
    .filter(Boolean) as Array<{
      value: number;
      weight: number;
      contribution: 'direct' | 'weighted' | 'formula';
    }>;

  if (children.length === 0) return null;

  // Simple average for now - can be enhanced with different calculation methods
  const sum = children.reduce((acc, { value, weight }) => acc + (value * weight), 0);
  const totalWeight = children.reduce((acc, { weight }) => acc + weight, 0);
  
  return totalWeight > 0 ? sum / totalWeight : null;
};

/**
 * Gets all metrics in the hierarchy for a given metric (including itself)
 */
export const getMetricHierarchy = (
  metricId: string,
  metricMap: MetricMap,
  direction: 'up' | 'down' | 'both' = 'both',
  visited = new Set<string>()
): Metric[] => {
  if (visited.has(metricId)) return [];
  visited.add(metricId);
  
  const metric = metricMap[metricId];
  if (!metric) return [];
  
  const result: Metric[] = [];
  
  // Add current metric if going down or both
  if (direction !== 'up') {
    result.push(metric);
  }
  
  // Process children
  if (direction !== 'up' && metric.child_metrics) {
    metric.child_metrics.forEach(childId => {
      result.push(...getMetricHierarchy(childId, metricMap, 'down', visited));
    });
  }
  
  // Process parent
  if (direction !== 'down' && metric.parent_metric_id) {
    result.push(...getMetricHierarchy(metric.parent_metric_id, metricMap, 'up', visited));
  }
  
  return result;
};

/**
 * Gets the progress percentage for a metric (0-100)
 */
export const getMetricProgress = (
  metricId: string,
  metricMap: MetricMap
): { current: number; target: number; percentage: number } | null => {
  const current = calculateRollupValue(metricId, metricMap, 'current');
  const target = calculateRollupValue(metricId, metricMap, 'target');
  
  if (current === null || target === null || target === 0) {
    return null;
  }
  
  return {
    current,
    target,
    percentage: Math.min(100, Math.round((current / target) * 100))
  };
};
