import Link from "next/link";
import { useTranslations } from "next-intl";
import { Sprout, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">FructoSahel</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t("common.tagline")}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("nav.blog")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Crops */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("landing.crops.title")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/blog/pineapple`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("landing.crops.pineapple")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog/cashew`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("landing.crops.cashew")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog/mango`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("landing.crops.mango")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog/avocado`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("landing.crops.avocado")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("nav.contact")}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {t("contact.info.address")}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {t("contact.info.email")}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {t("contact.info.phone")}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FructoSahel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
