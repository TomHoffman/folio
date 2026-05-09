import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.copy}>
        <span>&copy; Tom Hoffman {year}</span>
        <span className={styles.sep} aria-hidden="true">
          {" "}
          |{" "}
        </span>
        <span>website designed by me and built using AI and no vibes.</span>
      </p>
    </footer>
  );
}
