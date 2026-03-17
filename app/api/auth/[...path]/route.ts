import { NextRequest, NextResponse } from "next/server";

// Lazily import authApiHandler to avoid build-time errors when
// NEON_AUTH_BASE_URL is not set (e.g., during CI builds)
let _handler: ReturnType<typeof import("@neondatabase/auth/next/server").authApiHandler> | null = null;

async function getHandler() {
  if (!_handler) {
    const { authApiHandler } = await import("@neondatabase/auth/next/server");
    _handler = authApiHandler();
  }
  return _handler;
}

function createMethodHandler(method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") {
  return async (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => {
    try {
      const handler = await getHandler();
      const fn = handler[method];
      if (!fn) {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
      }
      return fn(req, ctx);
    } catch {
      return NextResponse.json(
        { error: "Auth service unavailable" },
        { status: 503 },
      );
    }
  };
}

export const GET = createMethodHandler("GET");
export const POST = createMethodHandler("POST");
export const PUT = createMethodHandler("PUT");
export const DELETE = createMethodHandler("DELETE");
export const PATCH = createMethodHandler("PATCH");
