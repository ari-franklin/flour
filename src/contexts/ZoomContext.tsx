import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type ZoomLevel = 'executive' | 'management' | 'team';

interface ZoomContextType {
  zoomLevel: ZoomLevel;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoomLevel: (level: ZoomLevel) => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isExecutiveView: boolean;
  isManagementView: boolean;
  isTeamView: boolean;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

const zoomLevels: ZoomLevel[] = ['executive', 'management', 'team'];

interface ZoomProviderProps {
  children: ReactNode;
  initialLevel?: ZoomLevel;
}

export const ZoomProvider: React.FC<ZoomProviderProps> = ({
  children,
  initialLevel = 'executive',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(initialLevel);

  // Initialize from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view') as ZoomLevel;
    if (viewParam && zoomLevels.includes(viewParam)) {
      setZoomLevel(viewParam);
    }
  }, [location.search]);

  const currentLevelIndex = zoomLevels.indexOf(zoomLevel);
  const canZoomIn = currentLevelIndex < zoomLevels.length - 1;
  const canZoomOut = currentLevelIndex > 0;
  const isExecutiveView = zoomLevel === 'executive';
  const isManagementView = zoomLevel === 'management';
  const isTeamView = zoomLevel === 'team';

  const updateZoomLevel = useCallback((newLevel: ZoomLevel) => {
    setZoomLevel(newLevel);
    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('view', newLevel);
    navigate({ search: params.toString() }, { replace: true });
  }, [location.search, navigate]);

  const zoomIn = useCallback(() => {
    if (canZoomIn) {
      const nextLevel = zoomLevels[currentLevelIndex + 1];
      updateZoomLevel(nextLevel);
    }
  }, [canZoomIn, currentLevelIndex, updateZoomLevel]);

  const zoomOut = useCallback(() => {
    if (canZoomOut) {
      const prevLevel = zoomLevels[currentLevelIndex - 1];
      updateZoomLevel(prevLevel);
    }
  }, [canZoomOut, currentLevelIndex, updateZoomLevel]);

  return (
    <ZoomContext.Provider
      value={{
        zoomLevel,
        zoomIn,
        zoomOut,
        setZoomLevel: updateZoomLevel,
        canZoomIn,
        canZoomOut,
        isExecutiveView,
        isManagementView,
        isTeamView,
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
