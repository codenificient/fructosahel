import { DemoSidebar, DashboardHeader } from "@/components/layout";

interface DemoLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DemoLayout({
  children,
  params,
}: DemoLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex h-screen overflow-hidden">
      <DemoSidebar locale={locale} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader locale={locale} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
