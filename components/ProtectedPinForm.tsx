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
  onSuccess,
}: {
  projectSlug: string;
  inputId: string;
  onSuccess: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState("");
  const [shakeGeneration, setShakeGeneration] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [projectSlug]);

  const onPinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, 6);
    if (next.length === 6) {
      if (next === PROTECTED_PROJECT_ACCESS_CODE) {
        markProjectProtectedUnlocked(projectSlug);
        onSuccess();
        return;
      }
      setPin("");
      setShakeGeneration((g) => g + 1);
      return;
    }
    setPin(next);
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className={styles.modalProtectedInner}>
      <form
        className={styles.pinForm}
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
          <h2
            id="project-modal-protected-heading"
            className={styles.modalHeading}
          >
            Password protected
          </h2>
          <div
            className={styles.pinRow}
            onMouseDown={(e) => {
              e.preventDefault();
              focusInput();
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
      </form>
    </div>
  );
}
