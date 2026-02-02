// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

    // Ignore ECONNRESET errors (common in serverless)
    if (errorMessage.includes("ECONNRESET")) {
      return null;
    }

    // Ignore timeout errors that are expected
    if (errorMessage.includes("504") || errorMessage.includes("timeout")) {
      return null;
    }

    return event;
  },

  // Integrations
  integrations: [
    // Enable HTTP request tracing
    Sentry.httpIntegration(),
    // Enable database query tracing
    Sentry.prismaIntegration(),
  ],

  // Tags for filtering
  initialScope: {
    tags: {
      app: "fructosahel",
      platform: "server",
    },
  },
});
