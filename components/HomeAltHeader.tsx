import { HomeAltAvailability } from "@/components/HomeAltAvailability";
import styles from "./HomeAltHeader.module.css";

export function HomeAltHeader() {
  return (
    <header className={styles.header}>
      <HomeAltAvailability className={styles.availability} />
    </header>
  );
}
