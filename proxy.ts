import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware(routing);

// Protected routes that require authentication
const protectedRoutes = ["/dashboard"];

// Auth handler routes that should be public
const authRoutes = ["/handler"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Remove locale prefix for route matching
  const pathnameWithoutLocale = pathname.replace(/^\/(en|fr)/, "") || "/";

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route),
  );

  // Check if this is an auth route (should be public)
  const isAuthRoute = authRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route),
  );

  // If it's a protected route, check for authentication
  if (isProtectedRoute && !isAuthRoute) {
    // Check for Stack Auth session cookie
    const sessionCookie =
      request.cookies.get("stack-refresh-token") ||
      request.cookies.get("stack-access-token");

    if (!sessionCookie) {
      // Get the current locale from the pathname
      const localeMatch = pathname.match(/^\/(en|fr)/);
      const locale = localeMatch ? localeMatch[1] : "en";

      // Redirect to sign-in page
      const signInUrl = new URL(`/${locale}/handler/sign-in`, request.url);
      signInUrl.searchParams.set("after_auth_return_to", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
