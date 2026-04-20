"use client";

import { useRouter } from "next/navigation";
import styles from "./ProtectedAccessPage.module.css";

/** Full-page coming soon — no portal (same iOS reliability as password access page). */
export function ComingSoonWorkShell() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.closeRow}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => router.push("/")}
          aria-label="Back to home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from public */}
          <img src="/svg/icons/close.svg" alt="" width={24} height={24} decoding="async" />
        </button>
      </div>
      <div className={styles.content}>
        <h1 className={styles.comingSoonTitle}>Coming soon</h1>
      </div>
    </div>
  );
}
