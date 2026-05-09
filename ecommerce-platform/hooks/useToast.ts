'use client';
import { useState, useCallback } from 'react';
import type { Toast } from '@/lib/types';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success', duration = 3000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const toast: Toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
