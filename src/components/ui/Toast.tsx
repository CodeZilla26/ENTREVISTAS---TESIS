'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastMessage } from '@/types';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

export const Toast = ({ toast, onRemove }: ToastProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // trigger enter animation
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const styles = {
    success: 'text-white',
    error: 'text-white',
    warning: 'text-black',
    info: 'text-white'
  } as const;

  const styleVars: Record<ToastMessage['type'], React.CSSProperties> = {
    success: { backgroundColor: 'var(--toast-success)', borderColor: 'rgba(16,185,129,0.4)' },
    error:   { backgroundColor: 'var(--toast-error)',   borderColor: 'rgba(244,63,94,0.4)' },
    warning: { backgroundColor: 'var(--toast-warning)', borderColor: 'rgba(245,158,11,0.5)' },
    info:    { backgroundColor: 'var(--toast-info)',    borderColor: 'rgba(14,165,233,0.4)' },
  };

  const icons = {
    success: <CheckCircle2 size={18} className="shrink-0" />,
    error: <XCircle size={18} className="shrink-0" />,
    warning: <AlertTriangle size={18} className="shrink-0" />,
    info: <Info size={18} className="shrink-0" />
  } as const;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        ${styles[toast.type]}
        px-4 py-3 rounded-xl shadow-2xl max-w-sm w-full
        transform transition-all duration-300
        ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}
        backdrop-blur-md border
      `}
      style={styleVars[toast.type]}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icons[toast.type]}</div>
        <div className="text-sm leading-5 flex-1">{toast.message}</div>
        <button
          onClick={() => onRemove(toast.id)}
          aria-label="Cerrar notificación"
          className="ml-1 opacity-80 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-[90%] max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};
