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

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </div>

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
