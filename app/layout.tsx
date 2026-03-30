import type { Metadata } from "next";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
