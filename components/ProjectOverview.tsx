import type { ProjectOverviewData } from "@/data/projects";
import enterStyles from "./ProjectPageEnter.module.css";
import styles from "./ProjectOverview.module.css";

const META_ROWS: { label: string; key: keyof Pick<ProjectOverviewData, "role" | "duration" | "team"> }[] = [
  { label: "Role:", key: "role" },
  { label: "Duration:", key: "duration" },
  { label: "Team:", key: "team" },
];

type Props = { overview: ProjectOverviewData };

export function ProjectOverview({ overview }: Props) {
  const { introText } = overview;

  return (
    <section className={styles.section} aria-label="Project overview">
      <div className={styles.inner}>
        <div className={styles.split}>
          <p className={`${styles.intro} ${enterStyles.enterOverviewIntro}`}>
            {introText}
          </p>
          <hr className={`${styles.rule} ${styles.ruleBetweenIntroMeta}`} />
          <dl className={styles.meta}>
            {META_ROWS.flatMap(({ label, key }, index) => [
              <dt key={`overview-${index}-t`}>{label}</dt>,
              <dd key={`overview-${index}-d`}>{overview[key]}</dd>,
            ])}
          </dl>
        </div>
        <hr className={styles.rule} />
      </div>
    </section>
  );
}
