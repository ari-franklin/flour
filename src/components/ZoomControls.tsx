import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useZoom, ZoomLevel } from '../contexts/ZoomContext';
import { ZoomIn, ZoomOut, LayoutDashboard, Users, Target, Maximize2, BarChart2 } from 'lucide-react';

type ZoomLevelConfig = {
  label: string;
  icon: React.ReactNode;
  description: string;
  path: string;
};

const zoomLevelConfigs: Record<ZoomLevel, ZoomLevelConfig> = {
  objectives: {
    label: 'Objectives',
    icon: <LayoutDashboard className="h-4 w-4" />,
    description: 'High-level objectives',
    path: '/objectives'
  },
  outcomes: {
    label: 'Outcomes',
    icon: <Target className="h-4 w-4" />,
    description: 'Key results & outcomes',
    path: '/outcomes'
  },
  bets: {
    label: 'Bets',
    icon: <Users className="h-4 w-4" />,
    description: 'Initiatives & bets',
    path: '/bets'
  },
  metrics: {
    label: 'Metrics',
    icon: <BarChart2 className="h-4 w-4" />,
    description: 'View all metrics',
    path: '/metrics'
  }
};

const ZoomControls: React.FC = () => {
  const navigate = useNavigate();
  const { zoomIn, zoomOut, canZoomIn, canZoomOut, zoomLevel, setZoomLevel } = useZoom();
  
  const currentConfig = zoomLevelConfigs[zoomLevel];
  const zoomLevels = (Object.keys(zoomLevelConfigs) as ZoomLevel[]).filter(level => level !== 'metrics');

  const handleZoomChange = (newLevel: ZoomLevel) => {
    // Only navigate if we're not already on the target level
    if (newLevel !== zoomLevel) {
      // Update the URL based on the zoom level
      navigate(zoomLevelConfigs[newLevel].path);
      
      // The zoom level will be updated by the effect in App.tsx
      // when the route changes, so we don't need to call setZoomLevel here
    }
  };

  // Show a simplified view for metrics
  if (zoomLevel === 'metrics') {
    return (
      <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Back to Roadmap</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
      <button
        onClick={zoomOut}
        disabled={!canZoomOut}
        className={`p-2 rounded-md ${
          !canZoomOut 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
        }`}
        aria-label="Zoom out"
        title="Zoom out to higher level"
      >
        <ZoomOut className="h-5 w-5" />
      </button>

      <div className="relative group">
        <button 
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          aria-haspopup="true"
        >
          <span className="flex items-center">
            <span className="mr-2">{currentConfig.icon}</span>
            <span className="hidden sm:inline">{currentConfig.label} View</span>
            <span className="sm:hidden">{currentConfig.label}</span>
          </span>
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="absolute right-0 mt-1 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block z-50">
          <div className="py-1">
            {zoomLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleZoomChange(level)}
                className={`${
                  level === zoomLevel ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                } w-full text-left px-4 py-2 text-sm flex items-center space-x-2`}
              >
                <span className="text-gray-500">{zoomLevelConfigs[level as ZoomLevel].icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{zoomLevelConfigs[level as ZoomLevel].label} View</div>
                  <div className="text-xs text-gray-500">{zoomLevelConfigs[level as ZoomLevel].description}</div>
                </div>
                {level === zoomLevel && (
                  <svg className="h-4 w-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={zoomIn}
        disabled={!canZoomIn}
        className={`p-2 rounded-md ${
          !canZoomIn 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
        }`}
        aria-label="Zoom in"
        title="Zoom in to more detail"
      >
        <ZoomIn className="h-5 w-5" />
      </button>

      <button
        onClick={() => setZoomLevel('objectives')}
        className="p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
        aria-label="Reset zoom"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ZoomControls;
