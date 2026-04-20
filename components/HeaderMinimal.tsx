import { HeaderProjectNav } from "./HeaderProjectNav";
import { HeaderNav } from "./HeaderNav";
import styles from "./HeaderMinimal.module.css";

export function HeaderMinimal() {
  const headerContent = (
    <>
      <div className={styles.inner}>
        <div className={styles.lead}>
          <HeaderProjectNav />
        </div>
        <HeaderNav />
      </div>
      <div className={styles.bottomRule} aria-hidden />
    </>
  );

  return (
    <header id="main-header" className={styles.root} data-dir="up">
      {headerContent}
    </header>
  );
}
