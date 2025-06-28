import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Share2, ZoomIn, ZoomOut, Pencil, Check, X } from 'lucide-react';
import { Team, ViewConfig, Outcome } from './types';
import RoadmapBoard from './components/RoadmapBoard';
import OutcomesView from './components/OutcomesView';
import { supabase } from './lib/supabase';
import { Toaster, toast } from 'react-hot-toast';

// Define the Layout component
const Layout: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [viewConfig, setViewConfig] = useState<ViewConfig>({
    level: 'team',
    showMetrics: true,
    showDetails: true,
    showTeamInfo: true
  });
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  
  const location = useLocation();
  const isPublicView = location.pathname === '/public';
  const isOutcomesView = location.pathname === '/outcomes';

  useEffect(() => {
    fetchTeams();
    fetchRoadmapData();
  }, [viewConfig.level]);

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

  const fetchRoadmapData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('outcomes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setOutcomes(data);
      }
    } catch (error) {
      console.error('Error fetching roadmap data:', error);
      toast.error('Failed to load roadmap data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    // Handle drag end logic
    console.log('Drag end:', result);
  };

  const handleAddItem = (item: any) => {
    // Handle add item logic
    console.log('Add item:', item);
  };

  const handleUpdateItem = (id: string, updates: any) => {
    // Handle update item logic
    console.log('Update item:', id, updates);
  };

  const handleDeleteItem = (id: string) => {
    // Handle delete item logic
    console.log('Delete item:', id);
  };

  const handleUpdateMetrics = (metrics: any) => {
    // Handle update metrics logic
    console.log('Update metrics:', metrics);
  };

  const handleEditTeam = (teamId: string, name: string) => {
    setEditingTeam(teamId);
    setEditedName(name);
  };

  const handleSaveTeamName = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ name: editedName })
        .eq('id', teamId);

      if (error) throw error;
      
      setTeams(teams.map(team => 
        team.id === teamId ? { ...team, name: editedName } : team
      ));
      setEditingTeam(null);
      toast.success('Team name updated');
    } catch (error) {
      console.error('Error updating team name:', error);
      toast.error('Failed to update team name');
    }
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setEditedName('');
  };

  // Function to render the appropriate view based on the current route
  const renderView = () => {
    if (isOutcomesView) {
      return <OutcomesView teams={teams} publicView={isPublicView} />;
    }
    
    return (
      <RoadmapBoard 
        items={outcomes}
        teams={teams}
        onDragEnd={handleDragEnd}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onUpdateMetrics={handleUpdateMetrics}
        publicView={isPublicView}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Flour Roadmap</h1>
                <span className="text-sm text-gray-500">
                  {isPublicView ? 'Public View' : 'Team View'}
                </span>
              </div>
              <nav className="flex space-x-4 mt-2">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${!isOutcomesView ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Roadmap
                </Link>
                <Link 
                  to="/outcomes" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isOutcomesView ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Outcomes
                </Link>
                <button className="ml-4 text-gray-500 hover:text-gray-700">
                  <Share2 className="h-5 w-5" />
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setViewConfig(prev => ({
                    ...prev,
                    level: 'executive'
                  }))}
                  className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Executive
                </button>
                <button 
                  onClick={() => setViewConfig(prev => ({
                    ...prev,
                    level: 'management'
                  }))}
                  className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Management
                </button>
                <button 
                  onClick={() => setViewConfig(prev => ({
                    ...prev,
                    level: 'team'
                  }))}
                  className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Team
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <ZoomIn className="h-5 w-5 text-gray-500" />
                </button>
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <ZoomOut className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {!isPublicView && (
              <div className="flex flex-wrap gap-2">
                {teams.map(team => (
                  <div key={team.id} className="relative group">
                    {editingTeam === team.id ? (
                      <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="text-sm border-0 focus:ring-0 p-0 w-32"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveTeamName(team.id)}
                          className="text-green-500 hover:text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:border-blue-200 hover:shadow-sm">
                        <span className="text-sm font-medium text-gray-700">{team.name}</span>
                        <button
                          onClick={() => handleEditTeam(team.id, team.name)}
                          className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {renderView()}
          </div>
        )}
      </main>
    </div>
  );
};

// Main App component with routing
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/public" element={<Layout />} />
        <Route path="/outcomes" element={<Layout />} />
        <Route path="/" element={<Layout />} />
      </Routes>
    </Router>
  );
};

export default App;
