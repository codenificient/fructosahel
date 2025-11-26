import { DashboardSidebar, DashboardHeader } from "@/components/layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar locale={locale} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader locale={locale} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}
