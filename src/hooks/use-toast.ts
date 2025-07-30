import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface Toast extends ToastOptions {
  id: string;
  isOpen: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 5000,
  }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      title,
      description,
      variant,
      isOpen: true,
    };

    setToast(newToast);

    if (duration > 0) {
      setTimeout(() => {
        setToast((current) => (current?.id === id ? { ...current, isOpen: false } : current));
      }, duration);
    }

    return id;
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    dismissToast,
  };
};

export default useToast;
