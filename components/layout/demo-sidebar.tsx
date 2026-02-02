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
  ChevronLeft,
  ChevronRight,
  FlaskConical,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DemoSidebarProps {
  locale: string;
}

export function DemoSidebar({ locale }: DemoSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      href: `/${locale}/demo`,
      icon: LayoutDashboard,
      label: t("dashboard.title"),
    },
    {
      href: `/${locale}/demo/farms`,
      icon: MapPin,
      label: t("farms.title"),
    },
    {
      href: `/${locale}/demo/crops`,
      icon: Sprout,
      label: t("crops.title"),
    },
    {
      href: `/${locale}/demo/tasks`,
      icon: ListTodo,
      label: t("tasks.title"),
    },
    {
      href: `/${locale}/demo/calendar`,
      icon: Calendar,
      label: "Calendar",
    },
    {
      href: `/${locale}/demo/finance`,
      icon: DollarSign,
      label: t("finance.title"),
    },
    {
      href: `/${locale}/demo/team`,
      icon: Users,
      label: t("team.title"),
    },
    {
      href: `/${locale}/demo/agents`,
      icon: Bot,
      label: t("agents.title"),
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href={`/${locale}/demo`} className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold text-primary">FructoSahel</span>
          </Link>
        )}
        {collapsed && (
          <Link href={`/${locale}/demo`}>
            <Sprout className="mx-auto h-8 w-8 text-primary" />
          </Link>
        )}
      </div>

      {/* Demo Badge */}
      {!collapsed && (
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
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Go to Real Dashboard</span>}
        </Link>
      </div>
    </aside>
  );
}
