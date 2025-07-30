import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ZoomProvider, useZoom } from './contexts/ZoomContext';
import { ToastProvider } from './contexts/ToastContext';
import { ExampleRoadmap } from './components/ExampleRoadmap';
// Import removed as it's not used directly in this file
import OutcomeView from './components/zoom-views/OutcomeView';

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <ZoomProvider>
          <AppContent />
        </ZoomProvider>
      </ToastProvider>
    </Router>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const { zoomLevel, setZoomLevel } = useZoom();
  
  const isPublicView = location.pathname === '/public';
  const isMetricsView = location.pathname === '/metrics';
  const isOutcomesView = location.pathname === '/outcomes';
  const isBetsView = location.pathname === '/bets';

  // Update zoom level when route changes
  React.useEffect(() => {
    if (isMetricsView && zoomLevel !== 'metrics') {
      setZoomLevel('metrics');
    } else if (isPublicView && zoomLevel !== 'objectives') {
      setZoomLevel('objectives');
    } else if (isOutcomesView && zoomLevel !== 'outcomes') {
      setZoomLevel('outcomes');
    } else if (isBetsView && zoomLevel !== 'bets') {
      setZoomLevel('bets');
    } else if (!isPublicView && !isMetricsView && !isOutcomesView && !isBetsView && zoomLevel !== 'objectives') {
      setZoomLevel('objectives');
    }
  }, [isMetricsView, isPublicView, isOutcomesView, isBetsView, location.pathname, zoomLevel, setZoomLevel]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="font-bold text-xl hover:text-gray-300">Flour</Link>
          <div className="space-x-4">
            <Link 
              to="/" 
              className={`hover:text-gray-300 ${location.pathname === '/' ? 'text-indigo-300 font-medium' : ''}`}
            >
              Roadmap
            </Link>
            <Link 
              to="/metrics" 
              className={`hover:text-gray-300 ${location.pathname === '/metrics' ? 'text-indigo-300 font-medium' : ''}`}
            >
              Metrics Explorer
            </Link>
            {!isPublicView ? (
              <Link to="/public" className="hover:text-gray-300">Public View</Link>
            ) : (
              <Link to="/" className="hover:text-gray-300">Back to App</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/metrics" element={
            <div className="h-full">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Metric Relationships</h2>
                <p className="text-gray-600 mb-4">
                  This view shows how metrics are connected across different levels of the organization.
                  Click on a metric to see its details and relationships.
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <ExampleRoadmap zoomLevel="metrics" />
                </div>
              </div>
            </div>
          } />
          <Route path="/outcomes" element={<ExampleRoadmap zoomLevel="outcomes" />} />
          <Route path="/outcomes/:objectiveId" element={<ExampleRoadmap zoomLevel="outcomes" />} />
          <Route path="/outcomes/:objectiveId/outcome/:outcomeId" element={<OutcomeView />} />
          <Route path="/bets" element={<ExampleRoadmap zoomLevel="bets" />}>
            <Route path="outcome/:outcomeId" element={<ExampleRoadmap zoomLevel="bets" />}>
              <Route path="bet/:betId" element={<ExampleRoadmap zoomLevel="bets" />} />
            </Route>
          </Route>
          <Route path="/public" element={<ExampleRoadmap zoomLevel="objectives" isPublicView />} />
          <Route path="/" element={<ExampleRoadmap zoomLevel="objectives" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
