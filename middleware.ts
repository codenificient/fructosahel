import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedPatterns = ["/dashboard"];

// API routes that require authentication (exclude auth and analytics)
const protectedApiPatterns = /^\/api\/(?!auth|analytics|notifications\/cron)/;

// Public routes that never need auth
const publicPatterns = ["/", "/demo", "/about", "/contact", "/blog", "/auth"];

function isProtectedPage(pathname: string): boolean {
  // Strip locale prefix
  const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, "");
  return protectedPatterns.some((pattern) =>
    pathWithoutLocale.startsWith(pattern),
  );
}

function isProtectedApi(pathname: string): boolean {
  return protectedApiPatterns.test(pathname);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, Next.js internals, and monitoring
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/monitoring") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Check auth for protected API routes
  if (isProtectedApi(pathname)) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ??
      request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  // Check auth for protected pages (dashboard)
  if (isProtectedPage(pathname)) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ??
      request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie?.value) {
      // Extract locale from path or default to "en"
      const localeMatch = pathname.match(/^\/(en|fr)/);
      const locale = localeMatch ? localeMatch[1] : "en";
      const loginUrl = new URL(`/${locale}/auth/sign-in`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply i18n middleware for all page routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|manifest|webmanifest|json|js|css|woff|woff2|ttf|eot)$).*)",
  ],
};
