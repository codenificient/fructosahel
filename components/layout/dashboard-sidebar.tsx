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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DashboardSidebarProps {
  locale: string;
}

export function DashboardSidebar({ locale }: DashboardSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      label: t("dashboard.title"),
    },
    {
      href: `/${locale}/dashboard/farms`,
      icon: MapPin,
      label: t("farms.title"),
    },
    {
      href: `/${locale}/dashboard/crops`,
      icon: Sprout,
      label: t("crops.title"),
    },
    {
      href: `/${locale}/dashboard/tasks`,
      icon: ListTodo,
      label: t("tasks.title"),
    },
    {
      href: `/${locale}/dashboard/calendar`,
      icon: Calendar,
      label: "Calendar",
    },
    {
      href: `/${locale}/dashboard/finance`,
      icon: DollarSign,
      label: t("finance.title"),
    },
    {
      href: `/${locale}/dashboard/reports`,
      icon: FileBarChart,
      label: t("reports.title"),
    },
    {
      href: `/${locale}/dashboard/team`,
      icon: Users,
      label: t("team.title"),
    },
    {
      href: `/${locale}/dashboard/agents`,
      icon: Bot,
      label: t("agents.title"),
    },
  ];

  const bottomItems = [
    {
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
      label: "Settings",
    },
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
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2.5"
          >
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
          <Link href={`/${locale}/dashboard`} className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Leaf className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
          </Link>
        )}
      </div>

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
        {bottomItems.map((item) => {
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
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        <Separator className="my-2" />
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span>{t("nav.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
