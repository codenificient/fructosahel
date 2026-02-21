import Link from "next/link";
import { useTranslations } from "next-intl";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-primary">Fructo</span>
                <span className="text-sahel-terracotta">Sahel</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("common.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("nav.blog")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Crops */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
              {t("landing.crops.title")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href={`/${locale}/blog/pineapple`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("landing.crops.pineapple")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog/cashew`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("landing.crops.cashew")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog/mango`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("landing.crops.mango")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog/avocado`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("landing.crops.avocado")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
              {t("nav.contact")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                {t("contact.info.address")}
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                {t("contact.info.email")}
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                {t("contact.info.phone")}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} FructoSahel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
