import React, { createContext, useContext, useCallback } from 'react';
import { Toast as ToastComponent } from '../components/ui/Toast';
import { Toast as ToastType, useToast as useBaseToast, ToastOptions } from '../hooks/use-toast';

interface ToastContextType {
  showToast: (options: ToastOptions) => string;
  dismissToast: () => void;
  toast: ToastType | null;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast, showToast: baseShowToast, dismissToast } = useBaseToast();

  const showToast = useCallback((options: ToastOptions) => {
    return baseShowToast({
      variant: 'default',
      duration: 5000,
      ...options,
    });
  }, [baseShowToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, toast }}>
      {children}
      <ToastComponent 
        toast={toast} 
        onDismiss={dismissToast} 
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
