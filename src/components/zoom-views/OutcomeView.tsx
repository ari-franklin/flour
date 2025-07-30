import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import BaseZoomView from './BaseZoomView';
import { 
  ArrowLeft, 
  BarChart2,
  Loader2
} from 'lucide-react';
import { getOutcomeWithMetrics, getOutcomesByObjectiveId } from '../../services/roadmapService';
import { useToast } from '../../contexts/ToastContext';

// Define the expected structure of the outcome data
interface OutcomeWithMetrics {
  id: string;
  title: string;
  description?: string;
  objective_id: string;
  team_id: string;
  status: 'now' | 'near' | 'next';
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
  metrics?: Array<{
    id: string;
    name: string;
    current_value?: number;
    target_value?: number;
    unit?: string;
  }>;
  bets?: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
  }>;
  objective?: {
    id: string;
    title: string;
  };
}

// Component to display a single outcome with its metrics and related bets
const OutcomeView: React.FC = () => {
  const { objectiveId, outcomeId } = useParams<{ objectiveId: string; outcomeId: string }>();
  const [currentOutcome, setCurrentOutcome] = useState<OutcomeWithMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Fetch outcome data when the component mounts or outcomeId changes
  const fetchOutcome = useCallback(async () => {
    if (!outcomeId || !objectiveId) {
      console.error('Missing required IDs in OutcomeView');
      setError('Missing required parameters');
      setIsLoading(false);
      showToast({
        title: 'Error',
        description: 'Missing required parameters',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
    
    console.log('Fetching outcome with ID:', { objectiveId, outcomeId });
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Calling getOutcomeWithMetrics...');
      const { outcome, error } = await getOutcomeWithMetrics(outcomeId);
      console.log('getOutcomeWithMetrics response:', { outcome, error });
      
      if (error) {
        console.error('Error from getOutcomeWithMetrics:', error);
        throw new Error(error.message || 'Failed to load outcome data');
      }
      
      if (!outcome) {
        console.error('No outcome data returned for ID:', outcomeId);
        throw new Error('Outcome not found');
      }
      
      // If we don't have the objective ID, try to get it from the outcome
      const effectiveObjectiveId = objectiveId || outcome.objective_id;
      
      // If we still don't have an objective ID, try to fetch it from the outcomes list
      if (!effectiveObjectiveId) {
        console.log('No objective ID available, fetching outcomes to find it...');
        const { data: outcomes } = await getOutcomesByObjectiveId('');
        const foundOutcome = outcomes.find((o: any) => o.id === outcome.id);
        if (foundOutcome?.objective_id) {
          // Update the URL with the correct objective ID
          navigate(`/outcomes/${foundOutcome.objective_id}/outcome/${outcomeId}`, { replace: true });
          return;
        }
      }
      
      console.log('Setting current outcome:', outcome);
      setCurrentOutcome({
        ...outcome,
        // Ensure we have the correct objective ID
        objective_id: effectiveObjectiveId || outcome.objective_id || ''
      });
      
      // Show success toast
      showToast({
        title: 'Success',
        description: 'Outcome data loaded successfully',
        variant: 'default',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error in fetchOutcome:', err);
      setError(errorMessage);
      
      // Show error toast
      showToast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Redirect to the objective view if we have an objective ID
      if (objectiveId) {
        navigate(`/outcomes/${objectiveId}`);
      } else {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [outcomeId, objectiveId, showToast, navigate]);
  
  // Set up the effect to fetch the outcome
  useEffect(() => {
    fetchOutcome();
  }, [fetchOutcome]);

  // Show loading state
  if (isLoading) {
    return (
      <BaseZoomView 
        title="Loading..." 
        items={[]}
        description="Loading outcome details..."
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </BaseZoomView>
    );
  }

  // Show error state
  if (error || !currentOutcome) {
    return (
      <BaseZoomView 
        title="Error Loading Outcome" 
        items={[]}
        description={error || 'The requested outcome could not be found.'}
      >
        <div className="text-center py-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </BaseZoomView>
    );
  }

  // Get all metrics for this outcome (both direct and from its bets)
  const getOutcomeMetrics = () => {
    const directMetrics = currentOutcome.metrics || [];
    const betMetrics = (currentOutcome.bets || [])
      .flatMap((bet: any) => bet.metrics || []);
    
    // Combine and deduplicate metrics by ID
    const allMetrics = [...directMetrics, ...betMetrics];
    return allMetrics.filter((metric, index, self) => 
      index === self.findIndex(m => m.id === metric.id)
    );
  };

  // Get metrics for this outcome
  const outcomeMetrics = getOutcomeMetrics();

  return (
    <BaseZoomView 
      title={currentOutcome.title} 
      description={currentOutcome.description || ''}
      items={[]} // We don't need all roadmap items in this view
    >
      <div className="space-y-6">
        {/* Metrics Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
              Key Metrics
            </h2>
          </div>
          
          <div className="space-y-4">
            {outcomeMetrics.length > 0 ? (
              outcomeMetrics.map((metric) => (
                <div key={metric.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{metric.name}</h3>
                      {metric.description && (
                        <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                      )}
                    </div>
                    {metric.status && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metric.status === 'done' ? 'bg-green-100 text-green-800' :
                        metric.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {metric.status === 'done' ? 'Done' :
                         metric.status === 'in_progress' ? 'In Progress' : 'To Do'}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {metric.current_value?.toLocaleString()}{metric.unit} of {metric.target_value?.toLocaleString()}{metric.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{
                          width: `${Math.min(100, ((metric.current_value || 0) / (metric.target_value || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No metrics found for this outcome.
              </div>
            )}
          </div>
        </div>
        
        {/* Related Bets Section - Removed for now as bets are not directly on RoadmapItem */}
      </div>
    </BaseZoomView>
  );
};

export default OutcomeView;
