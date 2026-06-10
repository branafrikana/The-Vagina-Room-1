import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface NotificationContextType {
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              layout
              className={`pointer-events-auto min-w-[300px] max-w-md p-4 bg-zinc-900 border border-white/10 rounded shadow-2xl flex items-start gap-3 relative group overflow-hidden`}
            >
              {/* Progress bar */}
              {toast.duration && (
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-0.5 ${
                    toast.type === 'success' ? 'bg-emerald-500' :
                    toast.type === 'error' ? 'bg-rose-500' :
                    toast.type === 'warning' ? 'bg-amber-500' : 'bg-brand-gold'
                  }`}
                />
              )}

              <div className={`mt-0.5 ${
                toast.type === 'success' ? 'text-emerald-500' :
                toast.type === 'error' ? 'text-rose-500' :
                toast.type === 'warning' ? 'text-amber-500' : 'text-brand-gold'
              }`}>
                {toast.type === 'success' && <CheckCircle2 size={18} />}
                {toast.type === 'error' && <AlertCircle size={18} />}
                {toast.type === 'warning' && <AlertCircle size={18} />}
                {toast.type === 'info' && <Bell size={18} />}
              </div>

              <div className="flex-1 pr-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-1">System Notification</p>
                <p className="text-xs font-medium text-white/90 leading-relaxed font-sans">{toast.message}</p>
              </div>

              <button 
                onClick={() => removeToast(toast.id)}
                className="text-white/20 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
