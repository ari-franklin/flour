import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Team, RoadmapItem } from './types';
import ZoomableRoadmap from './components/ZoomableRoadmap';
import { ZoomProvider, useZoom } from './contexts/ZoomContext';
import ZoomControls from './components/ZoomControls';
import OutcomesView from './components/OutcomesView';
import { Toaster } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const App: React.FC = () => {
  return (
    <Router>
      <ZoomProvider>
        <AppContent />
      </ZoomProvider>
    </Router>
  );
};

const AppContent: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { zoomIn, zoomOut } = useZoom();
  
  const isPublicView = location.pathname === '/public';
  const isOutcomesView = location.pathname === '/outcomes';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*');
        
        if (teamsError) throw teamsError;
        setTeams(teamsData || []);

        // Fetch objectives
        const { data: objectivesData, error: objectivesError } = await supabase
          .from('objectives')
          .select('*');
        
        if (objectivesError) throw objectivesError;

        // Fetch outcomes
        const { data: outcomesData, error: outcomesError } = await supabase
          .from('outcomes')
          .select('*');
        
        if (outcomesError) throw outcomesError;

        // Transform data into RoadmapItem format
        const transformedItems: RoadmapItem[] = [
          ...(objectivesData || []).map(obj => ({
            id: obj.id,
            title: obj.title,
            description: obj.description || '',
            team_id: obj.team_id,
            type: 'objective' as const,
            is_public: obj.is_public || false,
            created_at: obj.created_at,
            updated_at: obj.updated_at,
          })),
          ...(outcomesData || []).map(outcome => ({
            id: outcome.id,
            title: outcome.title,
            description: outcome.description || '',
            team_id: outcome.team_id,
            objective_id: outcome.objective_id,
            type: 'outcome' as const,
            is_public: outcome.is_public || false,
            created_at: outcome.created_at,
            updated_at: outcome.updated_at,
          }))
        ];

        setRoadmapItems(transformedItems);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (isOutcomesView) {
      return <OutcomesView teams={teams} publicView={isPublicView} />;
    }

    return (
      <ZoomableRoadmap 
        items={isPublicView ? roadmapItems.filter(item => item.is_public) : roadmapItems} 
        teams={teams} 
        publicView={isPublicView} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">Flour</Link>
            <nav className="ml-10 flex space-x-8">
              <Link to="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Roadmap</Link>
              <Link to="/outcomes" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Outcomes</Link>
              <Link to="/public" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Public View</Link>
            </nav>
          </div>
          <ZoomControls />
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
