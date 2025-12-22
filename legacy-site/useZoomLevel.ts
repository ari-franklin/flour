import { useZoom } from '../contexts/ZoomContext';

export const useZoomLevel = () => {
  const { zoomLevel, zoomIn, zoomOut, canZoomIn, canZoomOut, setZoomLevel } = useZoom();
  
  return {
    // Current zoom level
    zoomLevel,
    
    // Zoom controls
    zoomIn,
    zoomOut,
    setZoomLevel,
    
    // Zoom capabilities
    canZoomIn,
    canZoomOut,
    
    // Helper methods
    isObjectivesView: zoomLevel === 'objectives',
    isOutcomesView: zoomLevel === 'outcomes',
    isBetsView: zoomLevel === 'bets',
    
    // Get the next zoom level (if available)
    getNextZoomLevel: () => {
      const levels = ['objectives', 'outcomes', 'bets'] as const;
      const currentIndex = levels.indexOf(zoomLevel as any);
      return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    },
    
    // Get the previous zoom level (if available)
    getPrevZoomLevel: () => {
      const levels = ['objectives', 'outcomes', 'bets'] as const;
      const currentIndex = levels.indexOf(zoomLevel as any);
      return currentIndex > 0 ? levels[currentIndex - 1] : null;
    },
  };
};

export default useZoomLevel;
