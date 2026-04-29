import projectGridStyles from "@/components/ProjectGrid.module.css";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import styles from "./HomepageHero.module.css";

/** Home hero region — structure and copy TBD. */
export function HomepageHero() {
  return (
    <div className={`${projectGridStyles.pageInset} ${styles.root}`}>
      <div className={styles.toggleRow}>
        <DarkModeToggle />
      </div>
    </div>
  );
}
