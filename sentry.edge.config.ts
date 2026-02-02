// This file configures the initialization of Sentry for edge features (Middleware, Edge API routes, and so on).
// The config you add here will be used whenever one of the above edge features runs.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Enable performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Debug mode for development
  debug: process.env.NODE_ENV === "development",

  // Environment tag
  environment: process.env.NODE_ENV,

  // Release tag (set by build process)
  release: process.env.SENTRY_RELEASE || "development",

  // Filter out noisy errors
  beforeSend(event, hint) {
    const errorMessage =
      hint?.originalException instanceof Error
        ? hint.originalException.message
        : "";

    // Ignore edge timeout errors
    if (errorMessage.includes("timeout")) {
      return null;
    }

    return event;
  },

  // Tags for filtering
  initialScope: {
    tags: {
      app: "fructosahel",
      platform: "edge",
    },
  },
});
