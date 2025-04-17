import React from 'react';
import { RoadmapItem, Column, Team } from '../types';
import RoadmapColumn from './RoadmapColumn';

interface RoadmapBoardProps {
  items: RoadmapItem[];
  teams: Team[];
  onDragEnd: (event: any) => void;
  onAddItem: (status: Column['id']) => void;
  onUpdateItem: (item: RoadmapItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateMetrics: (columnId: Column['id'], metrics: Column['metrics']) => void;
  publicView?: boolean;
}

const columns: Column[] = [
  {
    id: 'now',
    title: 'Now',
    metrics: []
  },
  {
    id: 'next',
    title: 'Next',
    metrics: []
  },
  {
    id: 'later',
    title: 'Later',
    metrics: []
  },
];

export default function RoadmapBoard({
  items,
  teams,
  onDragEnd,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateMetrics,
  publicView = false,
}: RoadmapBoardProps) {
  return (
    <div className="flex gap-4 p-4 h-full">
      {columns.map((column) => (
        <RoadmapColumn
          key={column.id}
          column={column}
          items={items.filter((item) => item.status === column.id && (publicView ? item.isPublic : true))}
          teams={teams}
          onAddItem={() => onAddItem(column.id)}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onUpdateMetrics={(metrics) => onUpdateMetrics(column.id, metrics)}
          publicView={publicView}
        />
      ))}
    </div>
  );
}