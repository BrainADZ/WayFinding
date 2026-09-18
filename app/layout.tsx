import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import "./responsive.css";
import "./explorer.css";

export const metadata: Metadata = {
  title: "BrainADZ Way · Riverside Shopping Centre",
  description:
    "Smart mall wayfinding, mobile directions, and venue management.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = { themeColor: "#0866ff" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
