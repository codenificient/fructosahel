import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import { routing } from "@/i18n/routing";
import { ToastProvider } from "@/components/toast-provider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { SentryUserProvider } from "@/components/sentry-user-provider";
import {
  ServiceWorkerProvider,
  ServiceWorkerUpdatePrompt,
} from "@/components/service-worker-provider";
import { OfflineBanner } from "@/components/offline-indicator";
import { CurrencyProvider } from "@/contexts/currency-context";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://fructosahel.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FructoSahel - Transforming Sahel Agriculture",
    template: "%s | FructoSahel",
  },
  description:
    "Empowering farmers in Burkina Faso, Mali, and Niger with AI-driven insights and modern farm management tools for pineapple, cashew, mango, avocado, banana, and papaya production.",
  keywords: [
    "agriculture",
    "sahel",
    "farming",
    "burkina faso",
    "mali",
    "niger",
    "pineapple",
    "cashew",
    "mango",
    "avocado",
    "banana",
    "papaya",
    "farm management",
    "AI agriculture",
  ],
  authors: [{ name: "FructoSahel Team" }],
  creator: "FructoSahel",
  publisher: "FructoSahel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "FructoSahel - Transforming Sahel Agriculture",
    description:
      "Empowering farmers in Burkina Faso, Mali, and Niger with AI-driven insights and modern farm management tools for pineapple, cashew, mango, avocado, banana, and papaya production.",
    siteName: "FructoSahel",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FructoSahel - AI-Powered Farm Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FructoSahel - Transforming Sahel Agriculture",
    description:
      "Empowering farmers in Burkina Faso, Mali, and Niger with AI-driven insights and modern farm management tools.",
    images: ["/og-image.png"],
    creator: "@fructosahel",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "fr")) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FructoSahel",
    description:
      "AI-powered farm management platform for Sahel fruit production",
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
    sameAs: [
      "https://twitter.com/fructosahel",
      "https://linkedin.com/company/fructosahel",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English", "French"],
    },
    areaServed: [
      {
        "@type": "Country",
        name: "Burkina Faso",
      },
      {
        "@type": "Country",
        name: "Mali",
      },
      {
        "@type": "Country",
        name: "Niger",
      },
    ],
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <NextIntlClientProvider messages={messages}>
              <CurrencyProvider>
                <ServiceWorkerProvider>
                  <SentryUserProvider>
                    <AnalyticsProvider>
                      <ToastProvider>
                        <OfflineBanner />
                        {children}
                        <ServiceWorkerUpdatePrompt />
                      </ToastProvider>
                    </AnalyticsProvider>
                  </SentryUserProvider>
                </ServiceWorkerProvider>
              </CurrencyProvider>
            </NextIntlClientProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
