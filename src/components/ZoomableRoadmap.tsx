import React from 'react';
import { useZoomLevel } from '../hooks/useZoomLevel';
import RoadmapBoard from './RoadmapBoard';
import { Team, RoadmapItem } from '../types';

interface ZoomableRoadmapProps {
  items: RoadmapItem[];
  teams: Team[];
  publicView?: boolean;
}

const ZoomableRoadmap: React.FC<ZoomableRoadmapProps> = ({
  items,
  teams,
  publicView = false,
}) => {
  const { isExecutiveView, isManagementView } = useZoomLevel();

  // Filter items based on the current zoom level
  const getFilteredItems = () => {
    if (isExecutiveView) {
      // Show only high-level objectives in executive view
      return items.filter(item => item.type === 'objective');
    } else if (isManagementView) {
      // Show objectives and outcomes in management view
      return items.filter(item => item.type !== 'bet');
    }
    // Show all items in team view
    return items;
  };

  // Stub functions for the RoadmapBoard
  const handleDragEnd = () => {
    // Implement drag and drop logic
  };

  const handleAddItem = () => {
    // Implement add item logic
  };

  const handleUpdateItem = () => {
    // Implement update item logic
  };

  const handleDeleteItem = () => {
    // Implement delete item logic
  };

  const handleUpdateMetrics = () => {
    // Implement update metrics logic
  };

  return (
    <div className="transition-all duration-300">
      <RoadmapBoard
        items={getFilteredItems()}
        teams={teams}
        onDragEnd={handleDragEnd}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onUpdateMetrics={handleUpdateMetrics}
        publicView={publicView}
      />
    </div>
  );
};

export default ZoomableRoadmap;
