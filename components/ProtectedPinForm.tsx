"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { PROTECTED_PROJECT_ACCESS_CODE } from "@/lib/protectedProjectCode";
import { markProjectProtectedUnlocked } from "@/lib/protectedProjectUnlock";
import styles from "./ProjectAccessModal.module.css";

export function ProtectedPinForm({
  projectSlug,
  inputId,
  headingId = "project-modal-protected-heading",
  onSuccess,
}: {
  projectSlug: string;
  inputId: string;
  /** Distinct id when multiple PIN UIs could exist in the document tree history */
  headingId?: string;
  onSuccess: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState("");
  const [shakeGeneration, setShakeGeneration] = useState(0);
  const [showTryAgain, setShowTryAgain] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [projectSlug]);

  const onPinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value ?? "";
    const next = raw.replace(/\D/g, "").slice(0, 6);
    if (next.length === 6) {
      if (next === PROTECTED_PROJECT_ACCESS_CODE) {
        markProjectProtectedUnlocked(projectSlug);
        onSuccess();
        return;
      }
      setPin("");
      setShakeGeneration((g) => g + 1);
      setShowTryAgain(true);
      return;
    }
    setPin(next);
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className={styles.modalProtectedInner}>
      <form
        className={styles.pinFormProtected}
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor={inputId} className="sr-only">
          Enter the six-digit access code
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={6}
          className="sr-only"
          value={pin}
          onChange={onPinChange}
        />
        <div
          key={shakeGeneration}
          className={`${styles.protectedPinShakeGroup} ${
            shakeGeneration > 0 ? styles.protectedPinShakePlay : ""
          }`}
        >
          <div className={styles.protectedHeader}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from public */}
            <img
              src="/svg/icons/lock.svg"
              alt=""
              width={24}
              height={24}
              className={styles.protectedLock}
            />
            <h2 id={headingId} className={styles.protectedTitle}>
              This project is password protected
            </h2>
          </div>
          <div
            className={styles.pinRow}
            onPointerDown={(e) => {
              focusInput();
              if (e.pointerType === "mouse") {
                e.preventDefault();
              }
            }}
            role="presentation"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`${styles.pinCircle} ${
                  i === pin.length && pin.length < 6 ? styles.pinCircleActive : ""
                }`}
                aria-hidden
              >
                {pin[i] ?? ""}
              </div>
            ))}
          </div>
        </div>
        <p
          className={`${styles.tryAgain} ${
            showTryAgain ? "" : styles.tryAgainHidden
          }`}
          role={showTryAgain ? "status" : undefined}
          aria-hidden={!showTryAgain}
        >
          {showTryAgain ? "Try again" : "\u00a0"}
        </p>
      </form>
    </div>
  );
}
