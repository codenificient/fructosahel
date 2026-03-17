import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ["/dashboard"];
const signInRoutes = ["/auth/sign-in", "/auth/sign-up"];

// API routes that require authentication (exclude auth, analytics, and cron)
const protectedApiPattern = /^\/api\/(?!auth|analytics|notifications\/cron)/;

function getLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|fr)/);
  return match ? match[1] : "en";
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|fr)/, "") || "/";
}

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("__Secure-neon-auth.session_token") ||
    request.cookies.has("neon-auth.session_token") ||
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token")
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect API routes that require authentication
  if (protectedApiPattern.test(pathname)) {
    if (!hasSessionCookie(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const path = stripLocale(pathname);
  const hasSession = hasSessionCookie(request);
  const isProtectedRoute = protectedRoutes.some((r) => path.startsWith(r));
  const isSignInRoute = signInRoutes.some((r) => path.startsWith(r));
  const locale = getLocale(pathname);

  // Authenticated user on sign-in/sign-up → send to dashboard
  if (hasSession && isSignInRoute) {
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard`, request.url),
    );
  }

  // Unauthenticated user on protected route → send to sign-in
  if (!hasSession && isProtectedRoute) {
    const signInUrl = new URL(`/${locale}/auth/sign-in`, request.url);
    signInUrl.searchParams.set("callbackURL", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // All other requests → next-intl handles locale rewriting
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|manifest|webmanifest|json|js|css|woff|woff2|ttf|eot)$).*)",
  ],
};
