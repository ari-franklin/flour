import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ZoomProvider, useZoom } from './contexts/ZoomContext';
import ZoomControls from './components/ZoomControls';
import { Toaster } from 'react-hot-toast';
import ExampleRoadmap from './components/ExampleRoadmap';

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
  const location = useLocation();
  const { zoomLevel } = useZoom();
  
  const isPublicView = location.pathname === '/public';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <Link to="/" className="hover:bg-gray-700 px-3 py-2 rounded">
              Roadmap
            </Link>
            <Link to="/public" className="hover:bg-gray-700 px-3 py-2 rounded">
              Public View
            </Link>
          </div>
          {!isPublicView && <ZoomControls />}
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Roadmap</h1>
                <ExampleRoadmap zoomLevel={zoomLevel} />
              </div>
            } 
          />
          <Route 
            path="/public" 
            element={
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Public Roadmap</h1>
                <ExampleRoadmap zoomLevel={zoomLevel} />
              </div>
            } 
          />
        </Routes>
        <Toaster position="bottom-right" />
      </main>
    </div>
  );
};

export default App;
