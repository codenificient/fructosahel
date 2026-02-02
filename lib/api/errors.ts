import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { trackApiError } from "@/lib/utils/error-tracking";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface HandleApiErrorOptions {
  /** The API endpoint that triggered the error */
  endpoint?: string;
  /** The HTTP method used */
  method?: string;
  /** Request body for context (will be sanitized) */
  requestBody?: unknown;
}

export function handleApiError(
  error: unknown,
  options: HandleApiErrorOptions = {},
): NextResponse {
  const { endpoint = "unknown", method = "unknown", requestBody } = options;

  // Log to console for development
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    // Validation errors are expected, track at warning level
    trackApiError(error, {
      endpoint,
      method,
      statusCode: 400,
      requestBody: sanitizeRequestBody(requestBody),
    });

    return NextResponse.json(
      {
        error: "Validation error",
        details: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 },
    );
  }

  if (error instanceof ApiError) {
    // Track API errors with appropriate severity
    trackApiError(error, {
      endpoint,
      method,
      statusCode: error.statusCode,
      requestBody: sanitizeRequestBody(requestBody),
    });

    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    // Unknown errors are most concerning
    trackApiError(error, {
      endpoint,
      method,
      statusCode: 500,
      requestBody: sanitizeRequestBody(requestBody),
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Track unknown error types
  trackApiError(new Error(String(error)), {
    endpoint,
    method,
    statusCode: 500,
    requestBody: sanitizeRequestBody(requestBody),
  });

  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 },
  );
}

/**
 * Sanitize request body to remove sensitive information before logging
 */
function sanitizeRequestBody(body: unknown): unknown {
  if (!body || typeof body !== "object") {
    return body;
  }

  const sensitiveKeys = [
    "password",
    "token",
    "apiKey",
    "secret",
    "authorization",
  ];
  const sanitized = { ...(body as Record<string, unknown>) };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = "[REDACTED]";
    }
  }

  return sanitized;
}

export function notFound(resource: string): NextResponse {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

export function success<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}
