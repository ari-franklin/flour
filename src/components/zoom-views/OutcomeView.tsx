import React from 'react';
import { Link, useParams } from 'react-router-dom';

import BaseZoomView from './BaseZoomView';
import { 
  ArrowLeft, 
  BarChart2
} from 'lucide-react';
import { getConnectedData } from '../../data/exampleRoadmapData';

// No props needed as we're using context and route params

const OutcomeView: React.FC = () => {
  const { outcomeId } = useParams<{ outcomeId: string }>();
  const { roadmapItems, outcomes } = getConnectedData();
  
  // Find the current outcome
  const currentOutcome = outcomes.find(outcome => outcome.id === outcomeId);
  
  if (!currentOutcome) {
    return (
      <BaseZoomView 
        title="Outcome Not Found" 
        items={roadmapItems}
        description="The requested outcome could not be found."
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
  const getOutcomeMetrics = (outcomeId: string) => {
    const directMetrics = currentOutcome.metrics || [];
    const betMetrics = (roadmapItems || [])
      .filter((item: any) => item.type === 'bet' && item.outcome_id === outcomeId)
      .flatMap((bet: any) => bet.metrics || []);
    
    // Combine and deduplicate metrics by ID
    const allMetrics = [...directMetrics, ...betMetrics];
    return allMetrics.filter((metric, index, self) => 
      index === self.findIndex(m => m.id === metric.id)
    );
  };

  // Get metrics for this outcome
  const outcomeMetrics = getOutcomeMetrics(currentOutcome.id);

  return (
    <BaseZoomView 
      title={currentOutcome.title} 
      description={currentOutcome.description || ''}
      items={roadmapItems}
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
