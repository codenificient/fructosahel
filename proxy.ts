import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ["/dashboard"];
const signInRoutes = ["/auth/sign-in", "/auth/sign-up"];

function getLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|fr)/);
  return match ? match[1] : "en";
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|fr)/, "") || "/";
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = stripLocale(pathname);

  // Neon Auth (Better Auth) uses this cookie for sessions
  const hasSession = request.cookies.has("better-auth.session_token");

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
  matcher: ["/((?!api|_next|_vercel|monitoring|.*\\..*).*)"],
};
