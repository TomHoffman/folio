"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { HeaderMinimal } from "@/components/HeaderMinimal";
import { NavigationScrollReset } from "@/components/NavigationScrollReset";
import { HOME_ALT_PATH } from "@/lib/routes";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === HOME_ALT_PATH) {
    return children;
  }

  return (
    <>
      <HeaderMinimal />
      <NavigationScrollReset>{children}</NavigationScrollReset>
      <Footer />
    </>
  );
}
