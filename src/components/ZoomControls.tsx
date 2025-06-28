import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useZoomLevel } from '../hooks/useZoomLevel';

const ZoomControls: React.FC = () => {
  const {
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut,
    isExecutiveView,
    isManagementView,
    isTeamView,
  } = useZoomLevel();

  const getZoomLabel = () => {
    if (isExecutiveView) return 'Executive View';
    if (isManagementView) return 'Management View';
    if (isTeamView) return 'Team View';
    return 'View';
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2 z-50">
      <div className="text-sm font-medium text-gray-700 mr-2">
        {getZoomLabel()}
      </div>
      
      <div className="h-6 w-px bg-gray-300" />
      
      <button
        onClick={zoomOut}
        disabled={!canZoomOut}
        className={`p-1.5 rounded-md ${
          canZoomOut
            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      
      <div className="flex items-center text-xs text-gray-500">
        <span className="w-6 text-center">
          {isExecutiveView ? '1x' : isManagementView ? '2x' : '3x'}
        </span>
      </div>
      
      <button
        onClick={zoomIn}
        disabled={!canZoomIn}
        className={`p-1.5 rounded-md ${
          canZoomIn
            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      
      <div className="h-6 w-px bg-gray-300" />
      
      <button
        onClick={() => {
          // Reset to default zoom level (executive view)
          if (!isExecutiveView) {
            // We'll need to implement reset functionality in the context
            // For now, this is a placeholder
            window.location.reload();
          }
        }}
        className="p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
        aria-label="Reset zoom"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ZoomControls;
