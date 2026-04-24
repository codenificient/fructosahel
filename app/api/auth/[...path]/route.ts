import { NextRequest, NextResponse } from "next/server";

// Proxy ALL auth requests to CodeniServer.
//
// Why proxy? CodeniServer sets __Secure-* cookies with SameSite=Lax. When
// the browser sends auth requests directly to auth.afrotomation.com from
// fructosahel.afrotomation.com, those cookies won't be scoped to
// fructosahel's domain. The proxy makes all auth requests same-origin so
// cookies are set on fructosahel.afrotomation.com correctly.
//
// Pattern: codeniserver-sso-integration.md (proxy, not OAuth redirect).
// Reference: clickrise commit ea2db2b.

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.afrotomation.com";

async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const authPath = url.pathname.replace("/api/auth", "");
  const targetUrl = `${AUTH_BASE_URL}/api/auth${authPath}${url.search}`;

  const forwardHeaders = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) forwardHeaders.set("cookie", cookie);
  const contentType = request.headers.get("content-type");
  if (contentType) forwardHeaders.set("content-type", contentType);

  // Set origin to CodeniServer so CORS accepts the request.
  forwardHeaders.set("origin", AUTH_BASE_URL);

  // Tell CodeniServer which client app is proxying. This lands in the
  // sessions.clientApp column via CodeniServer's databaseHooks.session.create
  // hook, giving the admin dashboard a "fructosahel" badge for per-app audit
  // and revocation.
  forwardHeaders.set("x-client-app", "fructosahel");

  const init: RequestInit = {
    method: request.method,
    headers: forwardHeaders,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const response = await fetch(targetUrl, init);

  const responseHeaders = new Headers();

  // Forward ALL set-cookie headers — .getSetCookie() is the plural form.
  // .get('set-cookie') returns only the first header and would break
  // multi-cookie flows (e.g. session + CSRF tokens).
  const setCookies = response.headers.getSetCookie?.() || [];
  for (const c of setCookies) {
    responseHeaders.append("set-cookie", c);
  }

  const ct = response.headers.get("content-type");
  if (ct) responseHeaders.set("content-type", ct);

  // Handle redirects — rewrite CodeniServer URLs to the local origin so
  // the browser stays on fructosahel's domain.
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (location) {
      const rewritten = location.replace(AUTH_BASE_URL, url.origin);
      responseHeaders.set("location", rewritten);
    }
    return new NextResponse(null, {
      status: response.status,
      headers: responseHeaders,
    });
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
