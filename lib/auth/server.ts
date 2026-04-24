import { headers } from "next/headers";
import { createHash } from "crypto";

// Server-side session helper. Forwards the caller's cookie to CodeniServer's
// /api/auth/get-session endpoint and returns the parsed session object.
//
// Two layers of deduplication prevent cascading 429s when multiple concurrent
// API routes validate the same session on a single page navigation:
//
//   1. In-flight coalescing: N concurrent calls with the same cookie await one
//      shared promise instead of firing N parallel fetches. This is what
//      prevents the rate-limit cascade: one navigation = one upstream request.
//
//   2. Short-lived memo cache (POSITIVE_TTL_MS, 8s): a freshly-validated
//      session is reused in-process for subsequent API routes within the same
//      render burst. The client-side Better Auth cache is 5 minutes; 8s on
//      the server is conservative enough that we never return a session the
//      client considers expired.
//
// Negative results are also cached briefly (NEGATIVE_TTL_MS, 2s) so a stale
// cookie doesn't hammer CodeniServer.
//
// Pattern proven in clickrise commit 2dbb87c (coalesce + cache fix).

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.afrotomation.com";

export type ServerSession = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role?: string;
  };
  session: {
    id: string;
    expiresAt: string;
  };
};

// ---- dedupe + memoization -------------------------------------------

const POSITIVE_TTL_MS = 8_000;
const NEGATIVE_TTL_MS = 2_000;

interface CachedSession {
  session: ServerSession | null;
  expiresAt: number;
}

// SHA-256 hash of the cookie header is the cache key — avoids storing raw
// session tokens in memory and keeps the map bounded by concurrent users,
// not by requests.
function cookieKey(cookie: string): string {
  return createHash("sha256").update(cookie).digest("hex");
}

const sessionCache = new Map<string, CachedSession>();
const inFlight = new Map<string, Promise<ServerSession | null>>();

// Best-effort cache reaper — called on the write path; no background timer.
function pruneIfNeeded(): void {
  if (sessionCache.size < 500) return;
  const now = Date.now();
  for (const [k, v] of sessionCache) {
    if (v.expiresAt <= now) sessionCache.delete(k);
  }
}

async function fetchSession(cookie: string): Promise<ServerSession | null> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const session = await res.json();
    if (!session?.user) return null;
    return session as ServerSession;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<ServerSession | null> {
  const headerStore = await headers();
  const cookie = headerStore.get("cookie") || "";
  if (!cookie) return null;

  const key = cookieKey(cookie);
  const now = Date.now();

  // Memoized hit — skip the network entirely.
  const cached = sessionCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.session;
  }

  // In-flight dedupe — await existing promise if one is already running for
  // this exact cookie.
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const session = await fetchSession(cookie);
      sessionCache.set(key, {
        session,
        expiresAt:
          Date.now() + (session ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS),
      });
      pruneIfNeeded();
      return session;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// neonAuth compat shim
//
// The three AI conversation API routes call `neonAuth()` from this module and
// destructure `{ session, user }`. This shim preserves that calling convention
// without touching each route — replacing Neon Auth with the CodeniServer
// proxy-auth session in a single spot.
//
// Shape returned: { session: SessionObj | null, user: UserObj | null }
// (matches what Neon Auth used to return so no downstream changes are needed)
// ---------------------------------------------------------------------------

export async function neonAuth(): Promise<{
  session: { id: string; expiresAt: string } | null;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role?: string;
  } | null;
}> {
  const data = await getServerSession();
  if (!data) return { session: null, user: null };
  return { session: data.session, user: data.user };
}

// ---------------------------------------------------------------------------
// ensureUserExists — email-shim (pattern: codenibudget d070de8)
//
// CodeniServer issues UUIDs as user IDs. fructosahel's local `users` table
// auto-generates its own UUIDs via defaultRandom(). When a new SSO user logs
// in for the first time, we need a local row for FK relationships
// (agentConversations.userId etc.).
//
// Strategy:
//   1. Look up by SSO id first (happy path — row was already created by SSO id)
//   2. Fall back to email lookup — catches rows inserted pre-migration or via
//      the old Neon Auth flow, avoiding the unique-email constraint collision
//   3. Genuinely new user — insert with SSO id as the local id
//
// The return value's `.id` is ALWAYS the local users.id so downstream
// `eq(*.userId, localUser.id)` queries hit the right rows.
// ---------------------------------------------------------------------------

export type LocalUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "worker" | "viewer";
  avatarUrl: string | null;
  phone: string | null;
  language: string;
  createdAt: Date;
  updatedAt: Date;
};
