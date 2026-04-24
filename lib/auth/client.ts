"use client";

import { createAuthClient } from "better-auth/react";

// CRITICAL: baseURL MUST be same-origin (window.location.origin), NOT
// auth.afrotomation.com directly. Better Auth cookies are scoped to the
// origin that receives the request — routing everything through the local
// /api/auth/* proxy keeps cookies on fructosahel's domain, satisfying
// Safari/Firefox SameSite=Lax restrictions on cross-origin cookies.
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
});

export const { useSession, signIn, signOut, signUp } = authClient;
