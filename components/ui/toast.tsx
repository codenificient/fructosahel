import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ToastVariant = "default" | "success" | "error" | "warning";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
  error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
  warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: (
    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  error: (
    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
  warning: (
    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  ),
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = "default", onClose }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={cn(
          "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
          "animate-in slide-in-from-right-full duration-300",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full",
          variantStyles[variant]
        )}
      >
        <div className="flex items-start gap-3 p-4">
          {variantIcons[variant]}
          <div className="flex-1 min-w-0">
            {title && (
              <div className="font-semibold text-sm leading-5 mb-1">
                {title}
              </div>
            )}
            {description && (
              <div className="text-sm leading-5 opacity-90">
                {description}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onClose(id)}
            className={cn(
              "flex-shrink-0 rounded-md p-1 inline-flex items-center justify-center",
              "hover:bg-black/10 dark:hover:bg-white/10",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              variant === "default" && "focus:ring-gray-500",
              variant === "success" && "focus:ring-green-500",
              variant === "error" && "focus:ring-red-500",
              variant === "warning" && "focus:ring-yellow-500"
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
);

Toast.displayName = "Toast";
