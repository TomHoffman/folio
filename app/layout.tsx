import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { HeaderMinimal } from "@/components/HeaderMinimal";
import { ThemeDocumentSync } from "@/components/ThemeDocumentSync";
import layoutStyles from "./layout.module.css";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* Theme `dark` class is not set here — React would overwrite classList on reconcile. */
  const htmlClass = matterSans.variable;

  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <body className={layoutStyles.body}>
        <Script
          id="folio-color-scheme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('folio-color-scheme');var d=document.documentElement;if(s==='light')d.classList.remove('dark');else d.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <ThemeDocumentSync />
        <HeaderMinimal />
        {children}
        <Footer />
      </body>
    </html>
  );
}
