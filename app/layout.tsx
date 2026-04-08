import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MastheadThemeButton } from "@/components/MastheadThemeButton";
import { Nav } from "@/components/Nav";
import { ThemePreferenceSync } from "@/components/ThemePreferenceSync";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import layoutStyles from "./layout.module.css";
import "./globals.css";
import "./surface.css";

const matterSans = localFont({
  src: [
    {
      path: "../public/fonts/Matter-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Matter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-matter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tom Hoffman",
    template: "%s · Tom Hoffman",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const themePref = jar.get(THEME_STORAGE_KEY)?.value;
  const isDark = themePref !== "light";
  const htmlClass = [isDark && "dark", matterSans.variable]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <body className={layoutStyles.body}>
        <MastheadThemeButton />
        <ThemePreferenceSync />
        <Header />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
