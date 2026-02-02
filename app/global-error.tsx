"use client";

/**
 * Global Error Boundary
 *
 * This component catches errors in the root layout and provides a full-page error UI.
 * It automatically reports errors to Sentry.
 */

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error, {
      tags: {
        "error.boundary": "global",
        "error.digest": error.digest || "unknown",
      },
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4">
          <div className="max-w-lg w-full text-center">
            {/* Error Icon */}
            <div className="mx-auto w-24 h-24 mb-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We apologize for the inconvenience. An unexpected error has
              occurred and our team has been notified.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Error Details:
                </p>
                <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-32">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Go Home
              </a>
            </div>

            {/* Contact Support */}
            <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
              If the problem persists, please{" "}
              <a
                href="/contact"
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
