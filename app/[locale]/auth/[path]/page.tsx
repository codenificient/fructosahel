import { AuthView } from "@neondatabase/auth/react";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="auth-card animate-scale-in w-full max-w-md">
        <div className="auth-card-accent" />
        <div className="auth-card-inner">
          <AuthView path={path} />
        </div>
      </div>
    </main>
  );
}
