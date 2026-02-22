"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  MapPin,
  Sprout,
  ListTodo,
  Calendar,
  DollarSign,
  Users,
  Bot,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  Leaf,
  Route,
  Truck,
  GraduationCap,
  FlaskConical,
  Database,
  HardDrive,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AppSidebarProps {
  locale: string;
  mode: "dashboard" | "demo";
}

export function AppSidebar({ locale, mode }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);

  const isDemo = mode === "demo";
  const prefix = `/${locale}/${mode}`;

  const navItems = [
    { href: prefix, icon: LayoutDashboard, label: t("dashboard.title") },
    { href: `${prefix}/farms`, icon: MapPin, label: t("farms.title") },
    { href: `${prefix}/crops`, icon: Sprout, label: t("crops.title") },
    { href: `${prefix}/tasks`, icon: ListTodo, label: t("tasks.title") },
    { href: `${prefix}/calendar`, icon: Calendar, label: "Calendar" },
    { href: `${prefix}/finance`, icon: DollarSign, label: t("finance.title") },
    { href: `${prefix}/reports`, icon: FileBarChart, label: t("reports.title") },
    { href: `${prefix}/roadmap`, icon: Route, label: t("roadmap.title") },
    { href: `${prefix}/logistics`, icon: Truck, label: t("logistics.title") },
    { href: `${prefix}/training`, icon: GraduationCap, label: t("training.title") },
    { href: `${prefix}/team`, icon: Users, label: t("team.title") },
    { href: `${prefix}/agents`, icon: Bot, label: t("agents.title") },
  ];

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href={prefix} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Leaf className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">Fructo</span>
              <span className="text-sahel-terracotta">Sahel</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href={prefix} className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Leaf className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
          </Link>
        )}
      </div>

      {/* Demo Badge */}
      {isDemo && !collapsed && (
        <div className="mx-2 mt-2">
          <Badge
            variant="secondary"
            className="w-full justify-center gap-1 py-1"
          >
            <FlaskConical className="h-3 w-3" />
            Demo Mode
          </Badge>
        </div>
      )}

      {/* Data Source Indicator */}
      {!collapsed && (
        <div className="mx-2 mt-2">
          {isDemo ? (
            <div className="flex items-center justify-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              <HardDrive className="h-3 w-3" />
              Local Data
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
              <Database className="h-3 w-3" />
              Neon Database
            </div>
          )}
        </div>
      )}

      {/* Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5 shrink-0")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t p-2">
        {isDemo ? (
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10"
          >
            <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>Go to Real Dashboard</span>}
          </Link>
        ) : (
          <>
            <Link
              href={`${prefix}/settings`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                pathname === `${prefix}/settings`
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Settings className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Link>
            <Separator className="my-2" />
            <button
              onClick={() =>
                authClient.signOut().then(() => {
                  window.location.href = `/${locale}`;
                })
              }
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>{t("nav.logout")}</span>}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
