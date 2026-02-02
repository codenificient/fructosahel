/**
 * Error Tracking Utility for FructoSahel
 *
 * Provides centralized error tracking with Sentry integration.
 * Supports custom error categorization, user context, and performance monitoring.
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Error categories for better filtering in Sentry
 */
export type ErrorCategory =
  | "api"
  | "ai"
  | "auth"
  | "database"
  | "validation"
  | "network"
  | "ui"
  | "unknown";

/**
 * Error severity levels
 */
export type ErrorSeverity = "fatal" | "error" | "warning" | "info";

/**
 * User context for error tracking
 */
export interface UserContext {
  id: string;
  email?: string;
  username?: string;
  [key: string]: string | undefined;
}

/**
 * Additional context for error tracking
 */
export interface ErrorContext {
  category: ErrorCategory;
  severity?: ErrorSeverity;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: UserContext;
}

/**
 * Set the current user context for all future error reports
 */
export function setUserContext(user: UserContext | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      ...Object.fromEntries(
        Object.entries(user).filter(
          ([key]) => !["id", "email", "username"].includes(key),
        ),
      ),
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture an exception with additional context
 */
export function captureException(
  error: Error | unknown,
  context: ErrorContext,
): string {
  const { category, severity = "error", tags = {}, extra = {}, user } = context;

  // Set user context if provided
  if (user) {
    setUserContext(user);
  }

  // Set scope for this specific error
  Sentry.withScope((scope) => {
    // Set severity level
    scope.setLevel(severity);

    // Set category tag
    scope.setTag("error.category", category);

    // Set additional tags
    for (const [key, value] of Object.entries(tags)) {
      scope.setTag(key, value);
    }

    // Set extra context
    for (const [key, value] of Object.entries(extra)) {
      scope.setExtra(key, value);
    }

    // Capture the exception
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(String(error)));
    }
  });

  // Return event ID for reference
  return Sentry.lastEventId() || "";
}

/**
 * Capture a message (non-exception event)
 */
export function captureMessage(
  message: string,
  context: Omit<ErrorContext, "category"> & { category?: ErrorCategory },
): string {
  const {
    category = "unknown",
    severity = "info",
    tags = {},
    extra = {},
  } = context;

  Sentry.withScope((scope) => {
    scope.setLevel(severity);
    scope.setTag("error.category", category);

    for (const [key, value] of Object.entries(tags)) {
      scope.setTag(key, value);
    }

    for (const [key, value] of Object.entries(extra)) {
      scope.setExtra(key, value);
    }

    Sentry.captureMessage(message);
  });

  return Sentry.lastEventId() || "";
}

/**
 * Track API errors with request/response context
 */
export function trackApiError(
  error: Error | unknown,
  options: {
    endpoint: string;
    method: string;
    statusCode?: number;
    requestBody?: unknown;
    responseBody?: unknown;
    duration?: number;
  },
): string {
  const { endpoint, method, statusCode, requestBody, responseBody, duration } =
    options;

  return captureException(error, {
    category: "api",
    severity: statusCode && statusCode >= 500 ? "error" : "warning",
    tags: {
      "api.endpoint": endpoint,
      "api.method": method,
      ...(statusCode ? { "api.status_code": String(statusCode) } : {}),
    },
    extra: {
      requestBody,
      responseBody,
      duration,
    },
  });
}

/**
 * Track AI/LLM request failures
 */
export function trackAIError(
  error: Error | unknown,
  options: {
    agentType: string;
    prompt?: string;
    model?: string;
    tokensUsed?: number;
    duration?: number;
  },
): string {
  const { agentType, prompt, model, tokensUsed, duration } = options;

  return captureException(error, {
    category: "ai",
    severity: "error",
    tags: {
      "ai.agent_type": agentType,
      ...(model ? { "ai.model": model } : {}),
    },
    extra: {
      // Truncate prompt to avoid sending too much data
      prompt: prompt ? prompt.slice(0, 500) : undefined,
      tokensUsed,
      duration,
    },
  });
}

/**
 * Track authentication failures
 */
export function trackAuthError(
  error: Error | unknown,
  options: {
    action:
      | "sign_in"
      | "sign_up"
      | "sign_out"
      | "password_reset"
      | "token_refresh"
      | "session_check";
    method?: string;
    userId?: string;
  },
): string {
  const { action, method, userId } = options;

  return captureException(error, {
    category: "auth",
    severity: "warning",
    tags: {
      "auth.action": action,
      ...(method ? { "auth.method": method } : {}),
    },
    extra: {
      userId,
    },
  });
}

/**
 * Track database errors
 */
export function trackDatabaseError(
  error: Error | unknown,
  options: {
    operation: "query" | "insert" | "update" | "delete" | "connection";
    table?: string;
    query?: string;
  },
): string {
  const { operation, table, query } = options;

  return captureException(error, {
    category: "database",
    severity: "error",
    tags: {
      "db.operation": operation,
      ...(table ? { "db.table": table } : {}),
    },
    extra: {
      // Only include query in development for debugging
      query: process.env.NODE_ENV === "development" ? query : undefined,
    },
  });
}

/**
 * Start a performance transaction/span
 */
export function startSpan(
  name: string,
  options?: {
    op?: string;
    description?: string;
    data?: Record<string, unknown>;
  },
): Sentry.Span | undefined {
  return Sentry.startInactiveSpan({
    name,
    op: options?.op || "function",
    ...options,
  });
}

/**
 * Measure a function's execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  options?: {
    op?: string;
    description?: string;
  },
): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: options?.op || "function",
    },
    async () => {
      return fn();
    },
  );
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  options?: {
    category?: string;
    level?: "debug" | "info" | "warning" | "error";
    data?: Record<string, unknown>;
  },
): void {
  Sentry.addBreadcrumb({
    message,
    category: options?.category || "custom",
    level: options?.level || "info",
    data: options?.data,
  });
}

/**
 * Create a custom error class with Sentry integration
 */
export class TrackedError extends Error {
  public readonly category: ErrorCategory;
  public readonly eventId: string;

  constructor(
    message: string,
    category: ErrorCategory = "unknown",
    options?: {
      cause?: Error;
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
    },
  ) {
    super(message, { cause: options?.cause });
    this.name = "TrackedError";
    this.category = category;

    this.eventId = captureException(this, {
      category,
      tags: options?.tags,
      extra: options?.extra,
    });
  }
}

/**
 * Flush pending Sentry events (useful for serverless functions)
 */
export async function flush(timeout = 2000): Promise<boolean> {
  return Sentry.flush(timeout);
}
