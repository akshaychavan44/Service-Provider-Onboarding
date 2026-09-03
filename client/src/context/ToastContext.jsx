import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    showToast(message, type, duration);
  }, [showToast]);

  const toastValue = {
    addToast,
    showToast,
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error', 5000),
    info: (msg) => showToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toastValue}>
      {children}
      {/* Toast floating container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const config = {
            success: {
              bg: 'bg-emerald-600 text-white shadow-emerald-600/20',
              icon: CheckCircle2,
            },
            error: {
              bg: 'bg-rose-600 text-white shadow-rose-600/20',
              icon: AlertCircle,
            },
            info: {
              bg: 'bg-slate-900 text-white shadow-slate-900/20',
              icon: Info,
            },
          }[t.type] || {
            bg: 'bg-slate-900 text-white',
            icon: Info,
          };

          const Icon = config.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border border-white/10 ${config.bg} animate-fade-in transition-all`}
            >
              <Icon size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-70 hover:opacity-100 transition p-0.5"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
