// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Enable performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Enable session replay for errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Debug mode for development
  debug: process.env.NODE_ENV === "development",

  // Environment tag
  environment: process.env.NODE_ENV,

  // Release tag (set by build process)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "development",

  // Filter out noisy errors
  beforeSend(event, hint) {
    // Filter out common browser extension errors
    const errorMessage =
      hint?.originalException instanceof Error
        ? hint.originalException.message
        : "";

    // Ignore ResizeObserver errors (common, non-critical)
    if (errorMessage.includes("ResizeObserver")) {
      return null;
    }

    // Ignore cancelled navigation errors
    if (errorMessage.includes("cancelled")) {
      return null;
    }

    // Ignore chunk load failures (handled by Next.js)
    if (errorMessage.includes("Loading chunk")) {
      return null;
    }

    return event;
  },

  // Integrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Allowed URLs for source map resolution
  allowUrls: [/https?:\/\/fructosahel\.vercel\.app/, /https?:\/\/localhost/],

  // Tags for filtering
  initialScope: {
    tags: {
      app: "fructosahel",
      platform: "web",
    },
  },
});
