import { createAuthServer, neonAuth } from "@neondatabase/auth/next/server";

// Lazy initialization to avoid build-time errors when env vars are missing
let _authServer: ReturnType<typeof createAuthServer> | null = null;

export function getAuthServer() {
  if (!_authServer) {
    _authServer = createAuthServer();
  }
  return _authServer;
}

export { neonAuth };
