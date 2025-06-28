import React from 'react';
import { RoadmapItem } from '../../types';
import BaseZoomView from './BaseZoomView';
import { Target, BarChart2, Users, Calendar } from 'lucide-react';

interface ExecutiveViewProps {
  items: RoadmapItem[];
}

const ExecutiveView: React.FC<ExecutiveViewProps> = ({ items }) => {
  // Only show objectives in executive view
  const objectives = items.filter(item => item.type === 'objective');

  // Count outcomes for each objective
  const getOutcomeCount = (objectiveId: string) => {
    return items.filter(item => item.type === 'outcome' && item.objective_id === objectiveId).length;
  };

  // Calculate progress (mock implementation - replace with real data)
  const getProgress = () => Math.floor(Math.random() * 100);

  return (
    <BaseZoomView
      items={objectives}
      title="Executive View"
      description="High-level strategic objectives and key results"
    >
      <div className="space-y-6">
        {objectives.map((objective) => (
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
                  <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                  {objective.description && (
                    <p className="mt-2 text-gray-600">{objective.description}</p>
                  )}
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BarChart2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>Progress: {getProgress()}%</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-5 w-5 text-blue-500 mr-2" />
                      <span>{getOutcomeCount(objective.id)} Key Results</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                      <span>Q3 2023 - Q2 2024</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${getProgress()}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BaseZoomView>
  );
};

export default ExecutiveView;
