import styles from "./AvailabilityContact.module.css";

const CONTACT_MAILTO = "mailto:t.hoffman@me.com";

type AvailabilityContactProps = {
  className?: string;
};

export function AvailabilityContact({ className }: AvailabilityContactProps) {
  return (
    <a
      href={CONTACT_MAILTO}
      className={[styles.contact, className].filter(Boolean).join(" ")}
      aria-label="Email Tom Hoffman — available for new projects"
    >
      <span className={styles.pill}>
        <span className={styles.dot} aria-hidden />
        <span>Available for new projects</span>
      </span>
      <span className={styles.action} aria-hidden>
        <span className={styles.actionIcon} />
      </span>
    </a>
  );
}
