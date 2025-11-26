"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ToastVariant } from "@/components/ui/toast";

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

const DEFAULT_DURATION = 5000;

let toastCount = 0;
const generateId = () => {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${toastCount}-${Date.now()}`;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    // Clear timeout if exists
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);

    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = generateId();
      const duration = options.duration ?? DEFAULT_DURATION;

      const newToast: ToastData = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? "default",
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after duration
      if (duration > 0) {
        const timeout = setTimeout(() => {
          dismiss(id);
        }, duration);

        timeoutsRef.current.set(id, timeout);
      }

      return id;
    },
    [dismiss]
  );

  // Helper methods for different toast types
  const success = useCallback(
    (title: string, description?: string, duration?: number) => {
      return toast({ title, description, variant: "success", duration });
    },
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string, duration?: number) => {
      return toast({ title, description, variant: "error", duration });
    },
    [toast]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) => {
      return toast({ title, description, variant: "warning", duration });
    },
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string, duration?: number) => {
      return toast({ title, description, variant: "default", duration });
    },
    [toast]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };
}
