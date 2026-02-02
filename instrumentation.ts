/**
 * Next.js Instrumentation
 *
 * This file is used to initialize monitoring and instrumentation services.
 * It runs once when the Next.js server starts.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry for Node.js runtime
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Initialize Sentry for Edge runtime
    await import("./sentry.edge.config");
  }
}
