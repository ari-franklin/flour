import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Eye, EyeOff, ChevronRight, BarChart2, ChevronUp, ChevronDown } from 'lucide-react';
import { RoadmapItem, Team, SuccessMetric } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface RoadmapCardProps {
  item: RoadmapItem;
  teams: Team[];
  onUpdate: (item: RoadmapItem) => void;
  onDelete: (id: string) => void;
  publicView?: boolean;
}

export default function RoadmapCard({
  item,
  teams,
  onUpdate,
  onDelete,
  publicView = false,
}: RoadmapCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [team, setTeam] = useState(item.team);
  const [metrics, setMetrics] = useState<SuccessMetric[]>([]);
  const [isEditingMetric, setIsEditingMetric] = useState(false);
  const [newMetric, setNewMetric] = useState({
    description: '',
    target_value: '',
    current_value: ''
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  React.useEffect(() => {
    fetchMetrics();
  }, [item.id, item.team]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('success_metrics')
        .select('*')
        .or(`roadmap_item_id.eq.${item.id},and(team_id.eq.${item.team},roadmap_item_id.is.null)`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMetrics(data || []);
      // Show metrics section by default if there are metrics
      if (data && data.length > 0) {
        setShowMetrics(true);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...item, title, description, team });
    setIsEditing(false);
  };

  const handleSaveMetric = async () => {
    try {
      if (!newMetric.description.trim()) {
        toast.error('Please enter a description');
        return;
      }

      const { data, error } = await supabase
        .from('success_metrics')
        .insert([{
          roadmap_item_id: item.id,
          team_id: item.team,
          description: newMetric.description,
          target_value: newMetric.target_value,
          current_value: newMetric.current_value,
          status: item.status
        }])
        .select()
        .single();

      if (error) throw error;

      setMetrics([...metrics, data]);
      setIsEditingMetric(false);
      setNewMetric({
        description: '',
        target_value: '',
        current_value: ''
      });
      setShowMetrics(true); // Show metrics after adding a new one
      toast.success('Metric added');
    } catch (error) {
      console.error('Error saving metric:', error);
      toast.error('Failed to save metric');
    }
  };

  const handleDeleteMetric = async (metricId: string) => {
    try {
      const { error } = await supabase
        .from('success_metrics')
        .delete()
        .eq('id', metricId);

      if (error) throw error;

      setMetrics(metrics.filter(m => m.id !== metricId));
      toast.success('Metric deleted');
      
      // Hide metrics section if there are no metrics left
      if (metrics.length <= 1) {
        setShowMetrics(false);
      }
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast.error('Failed to delete metric');
    }
  };

  const togglePublicStatus = () => {
    onUpdate({ 
      ...item, 
      isPublic: !item.isPublic 
    });
  };

  const formatDescription = (description: string) => {
    return description.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < description.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const currentTeam = teams.find(t => t.id === item.team);

  if (isEditing && !publicView) {
    return (
      <form
        ref={setNodeRef}
        style={style}
        className="bg-white p-4 rounded shadow-sm"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-1 border rounded"
          placeholder="Title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-2 p-1 border rounded"
          placeholder="Description (use - and space for bullet points)"
          rows={3}
        />
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="w-full mb-2 p-1 border rounded"
        >
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white p-4 rounded shadow-sm hover:shadow transition-shadow"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-2">
        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <h3 className="font-medium">{item.title}</h3>
            {!publicView && showActions && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={togglePublicStatus}
                  className="p-1 hover:bg-gray-100 rounded"
                  title={item.isPublic ? 'Make private' : 'Make public'}
                >
                  {item.isPublic ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            )}
          </div>
          
          {item.description && (
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mt-2"
            >
              {showDescription ? 'Show less' : 'Show more'}
              <ChevronRight 
                className={`w-3 h-3 transition-transform ${showDescription ? 'rotate-90' : ''}`}
              />
            </button>
          )}
        </div>
        
        {item.description && (
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              showDescription ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <p className="text-sm text-gray-600 mt-2 mb-3">
              {formatDescription(item.description)}
            </p>
          </div>
        )}

        {/* Metrics Section */}
        <div className="mt-3 space-y-2 border-t pt-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Metrics</span>
              {showMetrics ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {!showMetrics && metrics.length > 0 && (
                <span className="text-xs text-gray-500">({metrics.length})</span>
              )}
            </button>
            {!publicView && showMetrics && (
              <button
                onClick={() => setIsEditingMetric(true)}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                {metrics.length ? 'Add Metric' : 'Add First Metric'}
              </button>
            )}
          </div>

          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              showMetrics ? 'max-h-96' : 'max-h-0'
            }`}
          >
            {isEditingMetric ? (
              <div className="space-y-2 mt-2">
                <input
                  type="text"
                  value={newMetric.description}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Metric description"
                  className="w-full p-2 text-sm border rounded"
                />
                <input
                  type="text"
                  value={newMetric.current_value}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, current_value: e.target.value }))}
                  placeholder="Current value"
                  className="w-full p-2 text-sm border rounded"
                />
                <input
                  type="text"
                  value={newMetric.target_value}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, target_value: e.target.value }))}
                  placeholder="Target value"
                  className="w-full p-2 text-sm border rounded"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingMetric(false);
                      setNewMetric({
                        description: '',
                        current_value: '',
                        target_value: ''
                      });
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMetric}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {metrics.map((metric) => (
                  <div key={metric.id} className="text-sm group">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{metric.description}</p>
                        <div className="flex items-center gap-2 text-gray-600">
                          {metric.current_value && (
                            <span>Current: {metric.current_value}</span>
                          )}
                          {metric.target_value && (
                            <>
                              <span>→</span>
                              <span>Target: {metric.target_value}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {!publicView && (
                        <button
                          onClick={() => handleDeleteMetric(metric.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {currentTeam && (
          <div className="flex items-center justify-between mt-3">
            <div
              className="inline-flex items-center gap-1.5 text-xs py-0.5 px-2 rounded-full"
              style={{
                backgroundColor: `${currentTeam.color}15`,
                color: currentTeam.color,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentTeam.color }}
              />
              {currentTeam.name}
            </div>
            
            {!publicView && isEditing && (
              <select
                value={item.status}
                onChange={(e) => onUpdate({ ...item, status: e.target.value as RoadmapItem['status'] })}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="now">Now</option>
                <option value="next">Next</option>
                <option value="later">Later</option>
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
}