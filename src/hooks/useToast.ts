import { useState, useCallback } from 'react';
import { ToastMessage } from '@/types';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    message: string, 
    type: ToastMessage['type'] = 'info', 
    duration: number = 3000
  ) => {
    setToasts(prev => {
      // Evitar duplicados exactos (mismo mensaje y tipo)
      if (prev.some(t => t.message === message && t.type === type)) {
        return prev;
      }
      const id = Math.random().toString(36).substr(2, 9);
      const next = [...prev, { id, message, type, duration } as ToastMessage];
      // Limitar a 4 toasts visibles
      return next.slice(-4);
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};
