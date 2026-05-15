import styles from "./HomeAltAvailability.module.css";

type HomeAltAvailabilityProps = {
  className?: string;
};

export function HomeAltAvailability({ className }: HomeAltAvailabilityProps) {
  return (
    <p
      className={[styles.status, className].filter(Boolean).join(" ")}
      aria-label="Available for new projects"
    >
      <span className={styles.dot} aria-hidden />
      <span>Available for new projects</span>
    </p>
  );
}
