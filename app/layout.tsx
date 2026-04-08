import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Nav } from "@/components/Nav";
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
  return (
    <html lang="en" className={`dark h-full ${matterSans.variable}`}>
      <body className="font-sans min-h-full flex flex-col antialiased">
        <Header />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
