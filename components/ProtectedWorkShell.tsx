"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { isProjectProtectedUnlockedClient } from "@/lib/protectedProjectUnlock";
import styles from "./ProtectedAccessPage.module.css";

/**
 * Renders project content only when the protected project is unlocked in session;
 * otherwise replaces the URL with the dedicated access page (reliable on iOS vs portaled modals).
 */
export function ProtectedWorkShell({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    if (isProjectProtectedUnlockedClient(slug)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage only after mount
      setUnlocked(true);
      return;
    }
    router.replace(`/work/${slug}/access`);
    setUnlocked(false);
  }, [slug, router]);

  if (unlocked !== true) {
    return <div className={styles.hold} aria-busy="true" />;
  }

  return <>{children}</>;
}
