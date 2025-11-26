"use client";

import * as React from "react";
import { Toast, ToastProps } from "./toast";

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
}

export interface ToasterProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

const MAX_VISIBLE_TOASTS = 3;

export function Toaster({ toasts, onClose }: ToasterProps) {
  // Only show the most recent 3 toasts
  const visibleToasts = toasts.slice(-MAX_VISIBLE_TOASTS);

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="flex flex-col gap-2">
        {visibleToasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}
