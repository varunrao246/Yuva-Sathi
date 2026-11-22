'use client';

import React, { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => {
          let bg = 'bg-charcoal-800 text-white';
          if (toast.type === 'success') bg = 'bg-forest-700 text-cream-50 border border-lime-400';
          if (toast.type === 'error') bg = 'bg-red-700 text-white border border-red-500';
          if (toast.type === 'warning') bg = 'bg-amber-600 text-white border border-amber-400';

          return (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 transform transition-all duration-300 pointer-events-auto ${bg}`}
              role="alert"
            >
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
