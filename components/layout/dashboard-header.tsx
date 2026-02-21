"use client";

import { useTranslations } from "next-intl";
import { Bell, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OfflineStatusBadge } from "@/components/offline-indicator";

interface DashboardHeaderProps {
  locale: string;
}

export function DashboardHeader({ locale }: DashboardHeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const otherLocale = locale === "en" ? "fr" : "en";
  const otherLocalePath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl px-6">
      {/* Search */}
      <div className="relative flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={`${t("common.search")}...`}
          className="pl-9 bg-muted/50 border-0 focus-visible:bg-background focus-visible:ring-1"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Offline Status */}
        <OfflineStatusBadge />

        {/* Language Toggle */}
        <Button variant="ghost" size="sm" className="gap-2 rounded-lg px-3" asChild>
          <Link href={otherLocalePath}>
            <span className="text-base leading-none">{locale === "en" ? "\uD83C\uDDEB\uD83C\uDDF7" : "\uD83C\uDDEC\uD83C\uDDE7"}</span>
            <span className="text-sm font-medium">{locale === "en" ? "FR" : "EN"}</span>
          </Link>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-lg">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-sahel-terracotta ring-2 ring-background" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 ring-2 ring-border">
                <AvatarImage src="/avatars/user.jpg" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">
                  admin@fructosahel.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/dashboard/settings`}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
