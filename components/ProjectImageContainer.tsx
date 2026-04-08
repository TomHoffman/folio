import enterStyles from "./ProjectPageEnter.module.css";
import styles from "./ProjectImageContainer.module.css";

/** Placeholder block for project imagery; same fill as grid cards (#16343f). */
export function ProjectImageContainer() {
  return (
    <div
      className={`${styles.stage} ${enterStyles.enterMedia}`}
      role="presentation"
    />
  );
}
