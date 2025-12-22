import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type ZoomLevel = 'objectives' | 'outcomes' | 'bets' | 'metrics';

interface ZoomContextType {
  zoomLevel: ZoomLevel;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoomLevel: (level: ZoomLevel) => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isObjectivesView: boolean;
  isOutcomesView: boolean;
  isBetsView: boolean;
  isMetricsView: boolean;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

// These are the zoom levels that participate in the zoom in/out flow
const zoomLevels: ZoomLevel[] = ['objectives', 'outcomes', 'bets'];

interface ZoomProviderProps {
  children: ReactNode;
  initialLevel?: ZoomLevel;
}

export const ZoomProvider: React.FC<ZoomProviderProps> = ({
  children,
  initialLevel = 'objectives',
}) => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(initialLevel);

  // Zoom level is now controlled by the route in App.tsx

  // Only calculate zoom in/out for non-metrics views
  const currentIndex = zoomLevel === 'metrics' ? -1 : zoomLevels.indexOf(zoomLevel);
  const canZoomIn = zoomLevel !== 'metrics' && currentIndex < zoomLevels.length - 1;
  const canZoomOut = zoomLevel !== 'metrics' && currentIndex > 0;
  const isObjectivesView = zoomLevel === 'objectives';
  const isOutcomesView = zoomLevel === 'outcomes';
  const isBetsView = zoomLevel === 'bets';
  const isMetricsView = zoomLevel === 'metrics';

  const updateZoomLevel = useCallback((newLevel: ZoomLevel) => {
    setZoomLevel(newLevel);
    // Navigation is now handled by the ZoomControls component
  }, []);

  const zoomIn = useCallback(() => {
    if (canZoomIn) {
      const nextLevel = zoomLevels[currentIndex + 1];
      if (nextLevel) {
        updateZoomLevel(nextLevel);
      }
    }
  }, [canZoomIn, currentIndex, updateZoomLevel]);

  const zoomOut = useCallback(() => {
    if (canZoomOut) {
      const prevLevel = zoomLevels[currentIndex - 1];
      if (prevLevel) {
        updateZoomLevel(prevLevel);
      }
    }
  }, [canZoomOut, currentIndex, updateZoomLevel]);

  return (
    <ZoomContext.Provider
      value={{
        zoomLevel,
        zoomIn,
        zoomOut,
        setZoomLevel: updateZoomLevel,
        canZoomIn,
        canZoomOut,
        isObjectivesView,
        isOutcomesView,
        isBetsView,
        isMetricsView,
      }}
    >
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = (): ZoomContextType => {
  const context = useContext(ZoomContext);
  if (context === undefined) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};
