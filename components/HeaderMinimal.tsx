import { HeaderProjectBack } from "./HeaderProjectBack";
import { HeaderNav } from "./HeaderNav";
import styles from "./HeaderMinimal.module.css";

export function HeaderMinimal() {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.lead}>
          <HeaderProjectBack />
        </div>
        <HeaderNav />
      </div>
    </header>
  );
}
