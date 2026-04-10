"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { ProtectedPinForm } from "@/components/ProtectedPinForm";
import styles from "./ProjectAccessModal.module.css";

export function ProjectAccessModal({
  isOpen,
  variant,
  projectSlug,
  pinInputId,
  onDismiss,
  onProtectedSuccess,
}: {
  isOpen: boolean;
  variant: "protected" | "coming-soon";
  projectSlug?: string;
  pinInputId?: string;
  onDismiss: () => void;
  onProtectedSuccess?: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target only exists in the browser after hydration
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, mounted, onDismiss]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className={styles.modalBackdrop}
      onClick={onDismiss}
      role="presentation"
    >
      <div
        id={
          variant === "protected"
            ? "project-modal-protected"
            : "project-modal-coming-soon"
        }
        className={styles.modalPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          variant === "protected"
            ? "project-modal-protected-heading"
            : "project-modal-coming-soon-heading"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {variant === "protected" && projectSlug && onProtectedSuccess ? (
          <ProtectedPinForm
            key={projectSlug}
            projectSlug={projectSlug}
            inputId={pinInputId ?? "protected-project-pin"}
            onSuccess={onProtectedSuccess}
          />
        ) : (
          <h2
            id="project-modal-coming-soon-heading"
            className={styles.modalHeading}
          >
            Coming soon
          </h2>
        )}
      </div>
    </div>,
    document.body,
  );
}
