import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, CheckCircle2 } from 'lucide-react';
import { Column, RoadmapItem, Team, SuccessMetric } from '../types';
import RoadmapCard from './RoadmapCard';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface RoadmapColumnProps {
  column: Column;
  items: RoadmapItem[];
  teams: Team[];
  onAddItem: () => void;
  onUpdateItem: (item: RoadmapItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateMetrics: (metrics: Column['metrics']) => void;
  publicView?: boolean;
}

export default function RoadmapColumn({
  column,
  items,
  teams,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateMetrics,
  publicView = false,
}: RoadmapColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="bg-gray-100 rounded-lg p-4 w-80">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{column.title}</h2>
          {!publicView && (
            <button
              onClick={onAddItem}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <h3 className="font-medium text-sm">Bets</h3>
            </div>
            <span className="text-xs text-gray-500">
              {items.length} bet{items.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div ref={setNodeRef} className="space-y-2">
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <RoadmapCard
                key={item.id}
                item={item}
                teams={teams}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
                publicView={publicView}
              />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}