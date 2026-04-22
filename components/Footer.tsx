import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.copy}>&copy; Tom Hoffman {year}</p>
    </footer>
  );
}
