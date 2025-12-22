import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Toast as ToastType } from '../../hooks/use-toast';

interface ToastProps {
  toast: ToastType | null;
  onDismiss: () => void;
}

const variantClasses = {
  default: 'bg-white border-gray-200',
  destructive: 'bg-red-50 border-red-200',
  success: 'bg-green-50 border-green-200',
};

const variantIcons = {
  default: null,
  destructive: (
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
    </div>
  ),
  success: (
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
    </div>
  ),
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast?.isOpen) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast || !toast.isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <div className={`rounded-lg border p-4 shadow-lg ${variantClasses[toast.variant || 'default']}`}>
        <div className="flex items-start">
          {variantIcons[toast.variant || 'default']}
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">{toast.title}</h3>
            {toast.description && (
              <p className="mt-1 text-sm text-gray-500">{toast.description}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onDismiss}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
