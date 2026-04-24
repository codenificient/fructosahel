"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// Auth page uses proxy-auth pattern — email + password are submitted via
// authClient.signIn.email() which POSTs to /api/auth/sign-in/email.
// The [...path]/route.ts proxy forwards that request to CodeniServer with
// X-Client-App: fructosahel. On success CodeniServer sets a session cookie
// that the proxy re-scopes onto fructosahel's domain.
//
// The path param drives sign-in vs sign-up:
//   /[locale]/auth/sign-in  → login form
//   /[locale]/auth/sign-up  → registration form

export default function AuthPage() {
  const params = useParams();
  const path = Array.isArray(params.path) ? params.path[0] : (params.path as string);
  const isSignUp = path === "sign-up";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const search = useSearchParams();

  // Get locale from params for redirect path
  const locale = Array.isArray(params.locale)
    ? params.locale[0]
    : (params.locale as string) || "en";

  // If already authenticated, forward to dashboard.
  useEffect(() => {
    if (!isPending && session) {
      const callbackURL = search.get("callbackURL") || `/${locale}/dashboard`;
      router.replace(callbackURL);
    }
  }, [session, isPending, router, search, locale]);

  // Surface query-string errors (e.g. after middleware-level rejection).
  useEffect(() => {
    if (search.get("error")) {
      setError("Sign-in failed. Please try again.");
    }
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (result.error) {
          setError(result.error.message || "Sign-up failed. Please try again.");
          setIsLoading(false);
          return;
        }
      } else {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message || "Invalid email or password.");
          setIsLoading(false);
          return;
        }
      }

      // useSession useEffect handles the redirect, but push here as well
      // in case the hook fires slowly.
      const callbackURL = search.get("callbackURL") || `/${locale}/dashboard`;
      router.push(callbackURL);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const altPath = isSignUp ? "sign-in" : "sign-up";
  const altLabel = isSignUp ? "Already have an account? Sign in" : "New here? Create an account";

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Brand mark */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-sahel-terracotta">Fructo</span>
          <span className="text-sahel-earth">Sahel</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {isSignUp ? "Create account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-xs">
            {isSignUp
              ? "Enter your details to get started."
              : "Enter your credentials to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {isSignUp && (
              <div className="space-y-1">
                <label
                  htmlFor="name"
                  className="text-xs font-medium text-foreground"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={isLoading}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-xs font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-foreground"
                >
                  Password
                </label>
                {!isSignUp && (
                  <Link
                    href="https://auth.afrotomation.com/forgot-password"
                    className="text-xs text-primary hover:text-primary/80"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isPending}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating account…" : "Signing in…"}
                </>
              ) : isSignUp ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        <Link
          href={`/${locale}/auth/${altPath}`}
          className="text-primary hover:text-primary/80 underline underline-offset-2"
        >
          {altLabel}
        </Link>
      </p>
    </div>
  );
}
