import Link from "next/link";
import type { Project } from "@/data/projects";
import enterStyles from "./ProjectPageEnter.module.css";
import styles from "./ProjectHero.module.css";

/**
 * Project title row — title + subtitle stack; back control aligned to bottom of that block.
 */
export function ProjectHero({ project }: { project: Project }) {
  return (
    <section className={styles.section}>
      <div className={styles.row}>
        <div className={styles.headCol}>
          <div className={styles.headingsEm}>
            <h1 className={`${styles.title} ${enterStyles.enterTitle}`}>
              {project.title}
            </h1>
            <p className={`${styles.subtitle} ${enterStyles.enterRow2}`}>
              {project.industry}
            </p>
          </div>
        </div>

        <Link
          href="/"
          className={`${styles.back} ${enterStyles.enterRow2}`}
          aria-label="Back to home"
        >
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M8.64648 2.64648C8.84175 2.45127 9.15827 2.45124 9.35352 2.64648C9.54868 2.84174 9.54871 3.15828 9.35352 3.35352L5.70703 7H18C18.2761 7.00007 18.5 7.2239 18.5 7.5V21C18.5 21.2761 18.2761 21.4999 18 21.5C17.7239 21.5 17.5 21.2761 17.5 21V8H5.70703L9.35352 11.6465C9.54868 11.8417 9.54871 12.1583 9.35352 12.3535C9.15828 12.5488 8.84175 12.5487 8.64648 12.3535L4.14648 7.85352C3.95122 7.65825 3.95122 7.34175 4.14648 7.14648L8.64648 2.64648Z" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
