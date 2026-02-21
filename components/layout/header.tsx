"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, Leaf } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/blog`, label: t("blog") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  const otherLocale = locale === "en" ? "fr" : "en";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Fructo</span>
            <span className="text-sahel-terracotta">Sahel</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <Button variant="ghost" size="sm" className="gap-2 rounded-lg px-3" asChild>
            <Link href={`/${otherLocale}`}>
              <span className="text-base leading-none">{locale === "en" ? "\uD83C\uDDEB\uD83C\uDDF7" : "\uD83C\uDDEC\uD83C\uDDE7"}</span>
              <span className="text-sm font-medium">{locale === "en" ? "FR" : "EN"}</span>
            </Link>
          </Button>

          {/* CTA Buttons */}
          <div className="hidden md:flex md:items-center md:gap-2">
            <Button variant="ghost" className="text-sm" asChild>
              <Link href={`/${locale}/login`}>{t("login")}</Link>
            </Button>
            <Button className="shadow-sm" asChild>
              <Link href={`/${locale}/dashboard`}>{t("dashboard")}</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="animate-slide-down border-t md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" asChild className="w-full">
                <Link href={`/${locale}/login`}>{t("login")}</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href={`/${locale}/dashboard`}>{t("dashboard")}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
