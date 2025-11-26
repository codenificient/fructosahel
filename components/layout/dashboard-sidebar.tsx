"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  MapPin,
  Sprout,
  ListTodo,
  DollarSign,
  Users,
  Bot,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
      href: `/${locale}/dashboard/farms/crops`,
      icon: Sprout,
      label: t("crops.title"),
    },
    {
      href: `/${locale}/dashboard/tasks`,
      icon: ListTodo,
      label: t("tasks.title"),
    },
    {
      href: `/${locale}/dashboard/finance`,
      icon: DollarSign,
      label: t("finance.title"),
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
        "relative flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold text-primary">FructoSahel</span>
          </Link>
        )}
        {collapsed && (
          <Link href={`/${locale}/dashboard`}>
            <Sprout className="mx-auto h-8 w-8 text-primary" />
          </Link>
        )}
      </div>

      {/* Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0")} />
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        <Separator className="my-2" />
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{t("nav.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
