import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Target, Plus, ChevronDown, ChevronUp, X, ChevronRight, Pencil, Trash2, Eye, EyeOff, BarChart2, Check } from 'lucide-react';
import { Team, TeamOutcome, TeamOutcomeMetric } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface OutcomesViewProps {
  teams: Team[];
  publicView?: boolean;
}

interface OutcomeColumnProps {
  title: string;
  status: 'now' | 'next' | 'later';
  outcomes: TeamOutcome[];
  teams: Team[];
  metrics: Record<string, TeamOutcomeMetric[]>;
  onAddOutcome?: (outcome: Omit<TeamOutcome, 'id'>) => Promise<void>;
  onUpdateOutcome?: (outcome: TeamOutcome) => Promise<void>;
  onUpdateMetrics?: (outcomeId: string, metrics: Partial<TeamOutcomeMetric>) => Promise<void>;
  onDeleteMetric?: (metricId: string) => Promise<void>;
  publicView?: boolean;
}

function OutcomeColumn({
  title,
  status,
  outcomes,
  teams,
  metrics,
  onAddOutcome,
  onUpdateOutcome,
  onUpdateMetrics,
  onDeleteMetric,
  publicView = false
}: OutcomeColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const [showMetrics, setShowMetrics] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [hoveredOutcome, setHoveredOutcome] = useState<string | null>(null);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [newOutcome, setNewOutcome] = useState({
    title: '',
    description: '',
    team_id: teams[0]?.id || ''
  });
  const [newMetric, setNewMetric] = useState({
    description: '',
    current_value: '',
    target_value: ''
  });

  const toggleDescription = (outcomeId: string) => {
    setExpandedDescriptions(prev => {
      const next = new Set(prev);
      if (next.has(outcomeId)) {
        next.delete(outcomeId);
      } else {
        next.add(outcomeId);
      }
      return next;
    });
  };

  const handleCreateOutcome = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!newOutcome.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      await onAddOutcome?.({
        title: newOutcome.title,
        description: newOutcome.description,
        team_id: newOutcome.team_id,
        status: status,
        is_public: false
      });

      setIsCreating(false);
      setNewOutcome({
        title: '',
        description: '',
        team_id: teams[0]?.id || ''
      });
    } catch (error) {
      console.error('Error creating outcome:', error);
      toast.error('Failed to create outcome');
    }
  };

  const handleStartEdit = (outcome: TeamOutcome) => {
    setEditingOutcome(outcome.id);
    setNewOutcome({
      title: outcome.title,
      description: outcome.description || '',
      team_id: outcome.team_id
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, outcome?: TeamOutcome) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (outcome) {
        handleSaveOutcome(outcome);
      } else {
        handleCreateOutcome();
      }
    } else if (e.key === 'Tab' && !e.shiftKey) {
      const textarea = e.currentTarget.form?.querySelector('textarea');
      if (textarea) {
        e.preventDefault();
        textarea.focus();
      }
    }
  };

  const handleDeleteOutcome = async (outcome: TeamOutcome) => {
    try {
      const { error } = await supabase
        .from('team_outcomes')
        .delete()
        .eq('id', outcome.id);

      if (error) throw error;

      // Refresh outcomes after deletion
      const { data: updatedOutcomes, error: fetchError } = await supabase
        .from('team_outcomes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      toast.success('Outcome deleted');
    } catch (error) {
      console.error('Error deleting outcome:', error);
      toast.error('Failed to delete outcome');
    }
  };

  const handleSaveMetric = async (outcomeId: string) => {
    try {
      if (!newMetric.description.trim()) {
        toast.error('Please enter a description');
        return;
      }

      await onUpdateMetrics?.(outcomeId, {
        description: newMetric.description,
        current_value: newMetric.current_value,
        target_value: newMetric.target_value,
        status: status
      });

      setEditingMetric(null);
      setNewMetric({
        description: '',
        current_value: '',
        target_value: ''
      });
    } catch (error) {
      console.error('Error saving metric:', error);
      toast.error('Failed to save metric');
    }
  };

  const handleDeleteMetric = async (metricId: string) => {
    try {
      await onDeleteMetric?.(metricId);
      toast.success('Metric deleted');
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast.error('Failed to delete metric');
    }
  };

  const togglePublicStatus = async (outcome: TeamOutcome) => {
    try {
      const { error } = await supabase
        .from('team_outcomes')
        .update({ is_public: !outcome.is_public })
        .eq('id', outcome.id);

      if (error) throw error;

      await onUpdateOutcome?.({
        ...outcome,
        is_public: !outcome.is_public
      });

      toast.success(outcome.is_public ? 'Outcome made private' : 'Outcome made public');
    } catch (error) {
      console.error('Error updating outcome visibility:', error);
      toast.error('Failed to update outcome visibility');
    }
  };

  const formatDescription = (description: string) => {
    return description.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < description.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleSaveOutcome = async (outcome: TeamOutcome) => {
    try {
      if (!newOutcome.title.trim()) {
        toast.error('Please enter a title');
        return;
      }

      await onUpdateOutcome?.({
        ...outcome,
        title: newOutcome.title,
        description: newOutcome.description
      });

      setEditingOutcome(null);
      setNewOutcome({
        title: '',
        description: '',
        team_id: teams[0]?.id || ''
      });
    } catch (error) {
      console.error('Error saving outcome:', error);
      toast.error('Failed to update outcome');
    }
  };

  const handleStartEditMetrics = (outcome: TeamOutcome) => {
    const outcomeMetrics = metrics[outcome.id] || [];
    const existingMetric = outcomeMetrics[0]; // Get the first metric if it exists

    setEditingMetric(outcome.id);
    setNewMetric({
      description: existingMetric?.description || '',
      current_value: existingMetric?.current_value || '',
      target_value: existingMetric?.target_value || ''
    });
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4 w-80">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {!publicView && (
              <button
                onClick={() => setIsCreating(true)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              {showMetrics ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div ref={setNodeRef} className="space-y-3">
          {isCreating && (
            <form onSubmit={handleCreateOutcome} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newOutcome.title}
                  onChange={(e) => setNewOutcome(prev => ({ ...prev, title: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  placeholder="Outcome title"
                  className="w-full p-2 text-sm border rounded"
                  autoFocus
                />
                <textarea
                  value={newOutcome.description}
                  onChange={(e) => setNewOutcome(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Outcome description (optional)"
                  className="w-full p-2 text-sm border rounded"
                  rows={3}
                />
                <select
                  value={newOutcome.team_id}
                  onChange={(e) => setNewOutcome(prev => ({ ...prev, team_id: e.target.value }))}
                  className="w-full p-2 text-sm border rounded"
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
                    onClick={() => {
                      setIsCreating(false);
                      setNewOutcome({
                        title: '',
                        description: '',
                        team_id: teams[0]?.id || ''
                      });
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          )}

          {outcomes.map((outcome) => {
            const team = teams.find(t => t.id === outcome.team_id);
            if (!team) return null;

            const isEditing = editingOutcome === outcome.id;
            const isExpanded = expandedDescriptions.has(outcome.id);
            const isHovered = hoveredOutcome === outcome.id;
            const outcomeMetrics = metrics[outcome.id] || [];

            return (
              <div
                key={outcome.id}
                className="group bg-white rounded-lg p-4 shadow-sm"
                onMouseEnter={() => setHoveredOutcome(outcome.id)}
                onMouseLeave={() => setHoveredOutcome(null)}
              >
                {isEditing ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveOutcome(outcome);
                  }} className="space-y-3">
                    <input
                      type="text"
                      value={newOutcome.title}
                      onChange={(e) => setNewOutcome(prev => ({ ...prev, title: e.target.value }))}
                      onKeyDown={(e) => handleKeyDown(e, outcome)}
                      className="w-full p-2 text-sm border rounded"
                      placeholder="Outcome title"
                      autoFocus
                    />
                    <textarea
                      value={newOutcome.description}
                      onChange={(e) => setNewOutcome(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 text-sm border rounded"
                      placeholder="Outcome description (optional)"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOutcome(null);
                          setNewOutcome({
                            title: '',
                            description: '',
                            team_id: teams[0]?.id || ''
                          });
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" style={{ color: team.color }} />
                        <h3 className="font-medium flex-grow">{outcome.title}</h3>
                        {!publicView && isHovered && (
                          <div className="flex gap-1 transition-opacity">
                            <button
                              onClick={() => togglePublicStatus(outcome)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title={outcome.is_public ? 'Make private' : 'Make public'}
                            >
                              {outcome.is_public ? (
                                <Eye className="w-4 h-4 text-green-500" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleStartEdit(outcome)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Pencil className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteOutcome(outcome)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                      {outcome.description && (
                        <button
                          onClick={() => toggleDescription(outcome.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mt-2"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                          <ChevronRight 
                            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {outcome.description && (
                      <div
                        className={`overflow-hidden transition-all duration-200 ease-in-out ${
                          isExpanded ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <p className="text-sm text-gray-600 mb-3 mt-2">
                          {formatDescription(outcome.description)}
                        </p>
                      </div>
                    )}

                    {/* Metrics Section */}
                    <div className="mt-3 space-y-2 border-t pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BarChart2 className="w-4 h-4" />
                          <span>Metrics</span>
                        </div>
                        {!publicView && (
                          <button
                            onClick={() => handleStartEditMetrics(outcome)}
                            className="text-xs text-blue-500 hover:text-blue-700"
                          >
                            {outcomeMetrics.length ? 'Edit Metrics' : 'Add Metrics'}
                          </button>
                        )}
                      </div>

                      {editingMetric === outcome.id ? (
                        <div className="space-y-2">
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
                                setEditingMetric(null);
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
                              onClick={() => handleSaveMetric(outcome.id)}
                              className="text-sm text-blue-500 hover:text-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 mt-2">
                          {outcomeMetrics.map((metric) => (
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

                    <div className="mt-3">
                      <div
                        className="inline-flex items-center gap-1.5 text-xs py-0.5 px-2 rounded-full"
                        style={{
                          backgroundColor: `${team.color}15`,
                          color: team.color,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        {team.name}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OutcomesView({ teams, publicView = false }: OutcomesViewProps) {
  const [outcomes, setOutcomes] = useState<TeamOutcome[]>([]);
  const [metrics, setMetrics] = useState<Record<string, TeamOutcomeMetric[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [outcomesRes, metricsRes] = await Promise.all([
        supabase
          .from('team_outcomes')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('team_outcome_metrics')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (outcomesRes.error) throw outcomesRes.error;
      if (metricsRes.error) throw metricsRes.error;

      setOutcomes(outcomesRes.data || []);

      const metricsById = metricsRes.data.reduce((acc: Record<string, TeamOutcomeMetric[]>, metric) => {
        if (!acc[metric.outcome_id]) {
          acc[metric.outcome_id] = [];
        }
        acc[metric.outcome_id].push(metric);
        return acc;
      }, {});

      setMetrics(metricsById);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOutcome = async (outcome: Omit<TeamOutcome, 'id'>) => {
    if (!outcome.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('team_outcomes')
        .insert([{
          team_id: outcome.team_id,
          title: outcome.title,
          description: outcome.description,
          status: outcome.status,
          is_public: outcome.is_public
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned');

      setOutcomes(prev => [...prev, data]);

      toast.success('Team outcome created');
    } catch (error) {
      console.error('Error saving outcome:', error);
      toast.error('Failed to save team outcome');
    }
  };

  const handleUpdateOutcome = async (outcome: TeamOutcome) => {
    try {
      const { error } = await supabase
        .from('team_outcomes')
        .update({
          title: outcome.title,
          description: outcome.description,
          is_public: outcome.is_public
        })
        .eq('id', outcome.id);

      if (error) throw error;

      setOutcomes(prev =>
        prev.map(o => o.id === outcome.id ? { ...o, ...outcome } : o)
      );

      toast.success('Outcome updated successfully');
    } catch (error) {
      console.error('Error updating outcome:', error);
      throw error;
    }
  };

  const handleUpdateMetrics = async (outcomeId: string, metric: Partial<TeamOutcomeMetric>) => {
    try {
      const { data, error } = await supabase
        .from('team_outcome_metrics')
        .insert([{
          outcome_id: outcomeId,
          description: metric.description,
          current_value: metric.current_value,
          target_value: metric.target_value,
          status: metric.status
        }])
        .select()
        .single();

      if (error) throw error;

      setMetrics(prev => ({
        ...prev,
        [outcomeId]: [...(prev[outcomeId] || []), data]
      }));

      toast.success('Metric added successfully');
    } catch (error) {
      console.error('Error adding metric:', error);
      throw error;
    }
  };

  const handleDeleteMetric = async (metricId: string) => {
    try {
      const { error } = await supabase
        .from('team_outcome_metrics')
        .delete()
        .eq('id', metricId);

      if (error) throw error;

      setMetrics(prev => {
        const newMetrics = { ...prev };
        for (const outcomeId in newMetrics) {
          newMetrics[outcomeId] = newMetrics[outcomeId].filter(m => m.id !== metricId);
        }
        return newMetrics;
      });

      toast.success('Metric deleted successfully');
    } catch (error) {
      console.error('Error deleting metric:', error);
      throw error;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag end:', event);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const columnOutcomes = {
    now: outcomes.filter(o => o.status === 'now'),
    next: outcomes.filter(o => o.status === 'next'),
    later: outcomes.filter(o => o.status === 'later')
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-4 overflow-x-auto">
        <OutcomeColumn
          title="Now"
          status="now"
          outcomes={columnOutcomes.now}
          teams={teams}
          metrics={metrics}
          onAddOutcome={handleAddOutcome}
          onUpdateOutcome={handleUpdateOutcome}
          onUpdateMetrics={handleUpdateMetrics}
          onDeleteMetric={handleDeleteMetric}
          publicView={publicView}
        />
        <OutcomeColumn
          title="Next"
          status="next"
          outcomes={columnOutcomes.next}
          teams={teams}
          metrics={metrics}
          onAddOutcome={handleAddOutcome}
          onUpdateOutcome={handleUpdateOutcome}
          onUpdateMetrics={handleUpdateMetrics}
          onDeleteMetric={handleDeleteMetric}
          publicView={publicView}
        />
        <OutcomeColumn
          title="Later"
          status="later"
          outcomes={columnOutcomes.later}
          teams={teams}
          metrics={metrics}
          onAddOutcome={handleAddOutcome}
          onUpdateOutcome={handleUpdateOutcome}
          onUpdateMetrics={handleUpdateMetrics}
          onDeleteMetric={handleDeleteMetric}
          publicView={publicView}
        />
      </div>
    </DndContext>
  );
}