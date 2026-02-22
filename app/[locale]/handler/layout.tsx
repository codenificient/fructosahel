import { Sprout } from "lucide-react";
import { Header, Footer } from "@/components/layout";

type Params = Promise<{ locale: string }>;

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;

  return (
    <div className="auth-page relative flex min-h-screen flex-col">
      <Header locale={locale} />

      {/* Auth content area */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="auth-card animate-scale-in w-full max-w-md">
          {/* Decorative top accent */}
          <div className="auth-card-accent" />

          <div className="auth-card-inner">
            {/* Branding above form */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Stack Auth form renders here */}
            <div className="auth-form-container">
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />

      {/* Background decoration */}
      <div className="auth-bg" aria-hidden>
        <div className="auth-bg-grain" />
        <div className="auth-bg-blob auth-bg-blob-1" />
        <div className="auth-bg-blob auth-bg-blob-2" />
        <div className="auth-bg-blob auth-bg-blob-3" />
        <div className="auth-bg-pattern" />
      </div>
    </div>
  );
}
