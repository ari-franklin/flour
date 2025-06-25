import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Share2, Wheat, ZoomIn, ZoomOut, Pencil, Check, X } from 'lucide-react';
import { RoadmapItem, Team, Column } from './types';
import RoadmapBoard from './components/RoadmapBoard';
import OutcomesView from './components/OutcomesView';
import { supabase } from './lib/supabase';
import { Toaster, toast } from 'react-hot-toast';

const defaultTeams: Team[] = [
  { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Team 1', color: '#EAB308' },
  { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Team 2', color: '#EF4444' },
  { id: '123e4567-e89b-12d3-a456-426614174002', name: 'Team 3', color: '#8B5CF6' },
];

function Layout() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [teams, setTeams] = useState<Team[]>(defaultTeams);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const location = useLocation();
  const isPublicView = location.pathname === '/public';
  const isOutcomesView = location.pathname === '/outcomes';

  useEffect(() => {
    fetchRoadmapItems();
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    }
  };

  const fetchRoadmapItems = async () => {
    try {
      let query = supabase.from('roadmap_items').select('*');
      
      if (isPublicView) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedItems = (data || []).map(item => ({
        ...item,
        isPublic: item.is_public
      }));
      
      setItems(mappedItems);
    } catch (error) {
      toast.error('Failed to load roadmap items');
      console.error('Error fetching roadmap items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const updatedItem = items.find(item => item.id === active.id);
    if (!updatedItem) return;

    const newStatus = over.id as RoadmapItem['status'];
    
    try {
      const { error } = await supabase
        .from('roadmap_items')
        .update({ status: newStatus })
        .eq('id', active.id);

      if (error) throw error;

      setItems(items.map(item =>
        item.id === active.id ? { ...item, status: newStatus } : item
      ));
      
      toast.success('Item status updated');
    } catch (error) {
      toast.error('Failed to update item status');
      console.error('Error updating item status:', error);
    }
  };

  const handleAddItem = async (status: RoadmapItem['status']) => {
    const newItem = {
      title: 'New Item',
      description: 'Description',
      is_public: false,
      status,
      team: teams[0].id,
    };

    try {
      const { data, error } = await supabase
        .from('roadmap_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      const mappedItem = {
        ...data,
        isPublic: data.is_public
      };

      setItems([mappedItem, ...items]);
      toast.success('Item created');
    } catch (error) {
      toast.error('Failed to create item');
      console.error('Error creating item:', error);
    }
  };

  const handleUpdateItem = async (updatedItem: RoadmapItem) => {
    try {
      const { error } = await supabase
        .from('roadmap_items')
        .update({
          title: updatedItem.title,
          description: updatedItem.description,
          is_public: updatedItem.isPublic,
          team: updatedItem.team,
          status: updatedItem.status
        })
        .eq('id', updatedItem.id);

      if (error) throw error;

      setItems(items.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      ));
      
      toast.success('Item updated');
    } catch (error) {
      toast.error('Failed to update item');
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roadmap_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
      toast.success('Item deleted');
    } catch (error) {
      toast.error('Failed to delete item');
      console.error('Error deleting item:', error);
    }
  };

  const handleUpdateMetrics = (columnId: Column['id'], metrics: Column['metrics']) => {
    console.log('Updating metrics for column:', columnId, metrics);
  };

  const handleEditTeam = (teamId: string, currentName: string) => {
    setEditingTeam(teamId);
    setEditedName(currentName);
  };

  const handleSaveTeamName = async () => {
    if (!editingTeam || !editedName.trim()) return;

    try {
      const { error } = await supabase
        .from('teams')
        .update({ name: editedName.trim() })
        .eq('id', editingTeam);

      if (error) throw error;

      setTeams(teams.map(team =>
        team.id === editingTeam ? { ...team, name: editedName.trim() } : team
      ));
      
      toast.success('Team name updated');
    } catch (error) {
      console.error('Error updating team name:', error);
      toast.error('Failed to update team name');
    } finally {
      setEditingTeam(null);
      setEditedName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setEditedName('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Wheat className="w-6 h-6 text-amber-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {isPublicView ? 'Public Roadmap' : 'The Flour'}
                </h1>
              </div>

            </div>
            <div className="flex gap-4 items-center">
              {!isOutcomesView && (
                <>
                  <Link
                    to={isPublicView ? '/' : '/public'}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {isPublicView ? 'Switch to Team View' : 'Switch to Public View'}
                  </Link>
                  {!isPublicView && (
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/public`;
                        navigator.clipboard.writeText(url);
                        toast.success('Public URL copied to clipboard!');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Public View
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation and Teams Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Teams */}
          {!isPublicView && (
            <div className="flex gap-4">
              {teams.map(team => (
                <div 
                  key={team.id} 
                  className="group flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-shadow"
                >
                  {editingTeam === team.id ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="px-2 py-1 text-sm border rounded w-32"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTeamName();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <button
                        onClick={handleSaveTeamName}
                        className="p-1 hover:bg-gray-100 rounded text-green-600"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-sm text-gray-700 font-medium">{team.name}</span>
                      <button
                        onClick={() => handleEditTeam(team.id, team.name)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-opacity"
                        title="Edit team name"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div>
            {isOutcomesView ? (
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom in
              </Link>
            ) : (
              <Link
                to="/outcomes"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom out
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-6">
        {isOutcomesView ? (
          <OutcomesView teams={teams} publicView={isPublicView} />
        ) : (
          <RoadmapBoard
            items={items}
            teams={teams}
            onDragEnd={handleDragEnd}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onUpdateMetrics={handleUpdateMetrics}
            publicView={isPublicView}
          />
        )}
      </main>
      
      <footer className="py-4 border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <a
            href="https://www.productaf.com/p/product-managers-are-like-flour-hear?r=2qc8t&utm_campaign=post&utm_medium=web&showWelcomeOnShare=false"
            className="text-sm text-gray-500 hover:text-gray-700 italic"
            target="_blank"
            rel="noopener noreferrer"
          >
            why flour?
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/public" element={<Layout />} />
        <Route path="/outcomes" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}