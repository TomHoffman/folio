"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProtectedPinForm } from "@/components/ProtectedPinForm";
import { isProjectProtectedUnlockedClient } from "@/lib/protectedProjectUnlock";
import styles from "./ProtectedAccessPage.module.css";

export function ProtectedAccessClient({ projectSlug }: { projectSlug: string }) {
  const router = useRouter();

  useEffect(() => {
    if (isProjectProtectedUnlockedClient(projectSlug)) {
      router.replace(`/work/${projectSlug}`);
    }
  }, [projectSlug, router]);

  const goHome = () => {
    router.push("/");
  };

  const onSuccess = () => {
    router.replace(`/work/${projectSlug}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.closeRow}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={goHome}
          aria-label="Back to home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from public */}
          <img src="/svg/icons/close.svg" alt="" width={24} height={24} decoding="async" />
        </button>
      </div>
      <div className={styles.content}>
        <ProtectedPinForm
          projectSlug={projectSlug}
          inputId="protected-project-pin-access"
          headingId="project-access-protected-heading"
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
