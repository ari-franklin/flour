import React from 'react';
import { RoadmapItem } from '../../types';

interface BaseZoomViewProps {
  items: RoadmapItem[];
  title: React.ReactNode;
  description: string;
  children?: React.ReactNode;
}

const BaseZoomView: React.FC<BaseZoomViewProps> = ({ 
  items = [], 
  title, 
  description, 
  children 
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          {description} {items.length > 0 ? `(${items.length} items)` : ''}
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="p-6">
          {children || (
            <div className="text-center py-12">
              <p className="text-gray-500">No items to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseZoomView;
