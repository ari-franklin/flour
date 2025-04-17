import React, { useState, useEffect } from 'react';
import { Team, TeamOutcome, TeamOutcomeMetric } from '../types';
import { supabase } from '../lib/supabase';
import { Target, PlusCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TeamOutcomesProps {
  teams: Team[];
  publicView?: boolean;
}

export default function TeamOutcomes({ teams, publicView = false }: TeamOutcomesProps) {
  const [outcomes, setOutcomes] = useState<TeamOutcome[]>([]);
  const [metrics, setMetrics] = useState<TeamOutcomeMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingMetrics, setEditingMetrics] = useState<string | null>(null);
  const [newOutcome, setNewOutcome] = useState({ title: '', description: '' });
  const [newMetrics, setNewMetrics] = useState<{
    description: string;
    baseline: string;
    now: string;
    next: string;
    later: string;
  }>({
    description: '',
    baseline: '',
    now: '',
    next: '',
    later: '',
  });

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

      const latestOutcomes = outcomesRes.data.reduce((acc: Record<string, TeamOutcome>, curr: TeamOutcome) => {
        if (!acc[curr.team_id] || new Date(curr.created_at) > new Date(acc[curr.team_id].created_at)) {
          acc[curr.team_id] = curr;
        }
        return acc;
      }, {});

      setOutcomes(Object.values(latestOutcomes));
      setMetrics(metricsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOutcome = async (teamId: string) => {
    if (!newOutcome.title.trim() || !newOutcome.description.trim()) return;

    try {
      const { data, error } = await supabase
        .from('team_outcomes')
        .insert([{
          team_id: teamId,
          title: newOutcome.title,
          description: newOutcome.description
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned');

      setOutcomes(prev => {
        const filtered = prev.filter(o => o.team_id !== teamId);
        return [...filtered, data];
      });

      setEditingTeamId(null);
      setNewOutcome({ title: '', description: '' });
      toast.success('Team outcome updated');
    } catch (error) {
      console.error('Error saving outcome:', error);
      toast.error('Failed to save team outcome');
    }
  };

  const handleSaveMetrics = async (outcomeId: string) => {
    try {
      // Get existing metrics for this outcome
      const { data: existingMetrics, error: fetchError } = await supabase
        .from('team_outcome_metrics')
        .select('*')
        .eq('outcome_id', outcomeId);

      if (fetchError) throw fetchError;

      // Create a map of existing metrics by status
      const existingMetricsByStatus = (existingMetrics || []).reduce((acc: Record<string, string>, metric) => {
        acc[metric.status] = metric.id;
        return acc;
      }, {});

      // First, update any existing metrics
      const updatePromises = Object.entries(existingMetricsByStatus).map(([status, id]) => {
        const metricData = {
          description: newMetrics.description,
          target_value: status === 'now' ? newMetrics.now : status === 'next' ? newMetrics.next : newMetrics.later,
          current_value: status === 'now' ? newMetrics.baseline : undefined
        };

        return supabase
          .from('team_outcome_metrics')
          .update(metricData)
          .eq('id', id);
      });

      // Execute all updates
      await Promise.all(updatePromises);

      // Insert new metrics for any status that didn't exist
      const statuses = ['now', 'next', 'later'] as const;
      const newMetricsToInsert = statuses
        .filter(status => !existingMetricsByStatus[status])
        .map(status => ({
          outcome_id: outcomeId,
          status,
          description: newMetrics.description,
          target_value: status === 'now' ? newMetrics.now : status === 'next' ? newMetrics.next : newMetrics.later,
          current_value: status === 'now' ? newMetrics.baseline : undefined
        }));

      if (newMetricsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('team_outcome_metrics')
          .insert(newMetricsToInsert);

        if (insertError) throw insertError;
      }

      // Refresh metrics data
      const { data: updatedMetrics, error: refreshError } = await supabase
        .from('team_outcome_metrics')
        .select('*')
        .eq('outcome_id', outcomeId);

      if (refreshError) throw refreshError;

      setMetrics(prev => {
        const filtered = prev.filter(m => m.outcome_id !== outcomeId);
        return [...filtered, ...(updatedMetrics || [])];
      });

      setEditingMetrics(null);
      setNewMetrics({
        description: '',
        baseline: '',
        now: '',
        next: '',
        later: '',
      });
      toast.success('Metrics updated');
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('Failed to save metrics');
    }
  };

  const getOutcomeMetrics = (outcomeId: string) => {
    return metrics.filter(m => m.outcome_id === outcomeId);
  };

  return (
    <div className="w-80">
      <h2 className="text-lg font-semibold mb-4">Outcomes</h2>
      <div className="space-y-3">
        {teams.map(team => {
          const outcome = outcomes.find(o => o.team_id === team.id);
          const isEditing = editingTeamId === team.id;
          const isEditingOutcomeMetrics = outcome && editingMetrics === outcome.id;
          const outcomeMetrics = outcome ? getOutcomeMetrics(outcome.id) : [];
          const nowMetric = outcomeMetrics.find(m => m.status === 'now');

          return (
            <div 
              key={team.id} 
              className="group relative border-l-4 pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r"
              style={{ borderColor: team.color }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" style={{ color: team.color }} />
                <div className="flex-1">
                  <h3 className="font-medium">
                    {outcome ? outcome.title : 'No outcome defined'}
                  </h3>
                  <span 
                    className="text-xs"
                    style={{ color: team.color }}
                  >
                    {team.name}
                  </span>
                </div>
                {!publicView && !isEditing && (
                  <button
                    onClick={() => {
                      setEditingTeamId(team.id);
                      setNewOutcome(outcome ? {
                        title: outcome.title,
                        description: outcome.description
                      } : { title: '', description: '' });
                    }}
                    className="opacity-0 group-hover:opacity-100 text-xs text-gray-500 hover:text-gray-700 transition-opacity"
                  >
                    {outcome ? 'Edit' : 'Add'}
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newOutcome.title}
                    onChange={(e) => setNewOutcome(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter outcome title..."
                    className="w-full p-2 text-sm border rounded"
                  />
                  <textarea
                    value={newOutcome.description}
                    onChange={(e) => setNewOutcome(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter outcome description..."
                    className="w-full p-2 text-sm border rounded"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingTeamId(null);
                        setNewOutcome({ title: '', description: '' });
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveOutcome(team.id)}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : outcome && (
                <>
                  <p className="text-sm text-gray-600 mb-3">{outcome.description}</p>
                  
                  {isEditingOutcomeMetrics ? (
                    <div className="space-y-3 pt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Success Definition</label>
                        <input
                          type="text"
                          value={newMetrics.description}
                          onChange={(e) => setNewMetrics(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="e.g., Reduce number of pricing data sources"
                          className="w-full p-1 text-sm border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Baseline</label>
                        <input
                          type="text"
                          value={newMetrics.baseline}
                          onChange={(e) => setNewMetrics(prev => ({ ...prev, baseline: e.target.value }))}
                          placeholder="Current value"
                          className="w-full p-1 text-sm border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Now</label>
                        <input
                          type="text"
                          value={newMetrics.now}
                          onChange={(e) => setNewMetrics(prev => ({ ...prev, now: e.target.value }))}
                          placeholder="Target value"
                          className="w-full p-1 text-sm border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Next</label>
                        <input
                          type="text"
                          value={newMetrics.next}
                          onChange={(e) => setNewMetrics(prev => ({ ...prev, next: e.target.value }))}
                          placeholder="Target value"
                          className="w-full p-1 text-sm border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Later</label>
                        <input
                          type="text"
                          value={newMetrics.later}
                          onChange={(e) => setNewMetrics(prev => ({ ...prev, later: e.target.value }))}
                          placeholder="Target value"
                          className="w-full p-1 text-sm border rounded"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingMetrics(null);
                            setNewMetrics({
                              description: '',
                              baseline: '',
                              now: '',
                              next: '',
                              later: '',
                            });
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveMetrics(outcome.id)}
                          className="text-sm text-blue-500 hover:text-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {nowMetric && (
                        <div>
                          <p className="text-sm font-medium">{nowMetric.description}</p>
                          <p className="text-sm text-gray-600">baseline: {nowMetric.current_value}</p>
                        </div>
                      )}
                      {!publicView && (
                        <button
                          onClick={() => {
                            setEditingMetrics(outcome.id);
                            const now = outcomeMetrics.find(m => m.status === 'now');
                            const next = outcomeMetrics.find(m => m.status === 'next');
                            const later = outcomeMetrics.find(m => m.status === 'later');
                            setNewMetrics({
                              description: now?.description || '',
                              baseline: now?.current_value || '',
                              now: now?.target_value || '',
                              next: next?.target_value || '',
                              later: later?.target_value || '',
                            });
                          }}
                          className="opacity-0 group-hover:opacity-100 text-xs text-gray-500 hover:text-gray-700 transition-opacity"
                        >
                          {outcomeMetrics.length ? 'Edit Metrics' : 'Add Metrics'}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}