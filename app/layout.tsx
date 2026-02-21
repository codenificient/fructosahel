import type { Metadata } from "next";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "FructoSahel - Sustainable Fruit Farming in the Sahel",
    template: "%s | FructoSahel",
  },
  description:
    "FructoSahel empowers farmers in the Sahel region with modern tools for sustainable fruit farming, crop management, and agricultural analytics.",
  keywords: [
    "agriculture",
    "farming",
    "Sahel",
    "fruit farming",
    "sustainable agriculture",
    "crop management",
  ],
  authors: [{ name: "FructoSahel" }],
  creator: "FructoSahel",
  metadataBase: new URL("https://fructosahel.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fructosahel.vercel.app",
    title: "FructoSahel - Sustainable Fruit Farming in the Sahel",
    description:
      "Empowering farmers in the Sahel region with modern tools for sustainable fruit farming.",
    siteName: "FructoSahel",
  },
  twitter: {
    card: "summary_large_image",
    title: "FructoSahel - Sustainable Fruit Farming",
    description:
      "Empowering farmers in the Sahel region with modern tools for sustainable fruit farming.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
