import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ZoomLevel = 'executive' | 'management' | 'team';

interface ZoomContextType {
  zoomLevel: ZoomLevel;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoomLevel: (level: ZoomLevel) => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

const zoomLevels: ZoomLevel[] = ['executive', 'management', 'team'];

interface ZoomProviderProps {
  children: ReactNode;
  initialLevel?: ZoomLevel;
}

export const ZoomProvider: React.FC<ZoomProviderProps> = ({
  children,
  initialLevel = 'executive', // Default to executive view
}) => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(initialLevel);

  const currentLevelIndex = zoomLevels.indexOf(zoomLevel);
  const canZoomIn = currentLevelIndex < zoomLevels.length - 1;
  const canZoomOut = currentLevelIndex > 0;

  const zoomIn = () => {
    if (canZoomIn) {
      const nextLevel = zoomLevels[currentLevelIndex + 1];
      setZoomLevel(nextLevel);
    }
  };

  const zoomOut = () => {
    if (canZoomOut) {
      const prevLevel = zoomLevels[currentLevelIndex - 1];
      setZoomLevel(prevLevel);
    }
  };

  return (
    <ZoomContext.Provider
      value={{
        zoomLevel,
        zoomIn,
        zoomOut,
        setZoomLevel,
        canZoomIn,
        canZoomOut,
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
