import type { ProjectOverviewData } from "@/data/projects";
import enterStyles from "./ProjectPageEnter.module.css";
import railStyles from "./projectContentRail.module.css";
import styles from "./ProjectOverview.module.css";

const META_ROWS: {
  label: string;
  key: keyof Pick<ProjectOverviewData, "role" | "duration"> | "category";
}[] = [
  { label: "Role:", key: "role" },
  { label: "Duration:", key: "duration" },
  { label: "Category:", key: "category" },
];

type Props = { overview: ProjectOverviewData; category: string };

export function ProjectOverview({ overview, category }: Props) {
  const { introText } = overview;
  const values = {
    role: overview.role,
    category,
    duration: overview.duration,
  };

  return (
    <section className={styles.section} aria-label="Project overview">
      <div className={`${styles.inner} ${railStyles.contentRail}`}>
        <div className={styles.split}>
          <p className={`${styles.intro} ${enterStyles.enterOverviewIntro}`}>
            {introText}
          </p>
          <hr
            className={`${styles.rule} ${styles.ruleBleed} ${styles.ruleBetweenIntroMeta}`}
          />
          <dl className={styles.meta}>
            {META_ROWS.flatMap(({ label, key }, index) => [
              <dt key={`overview-${index}-t`}>{label}</dt>,
              <dd key={`overview-${index}-d`}>{values[key]}</dd>,
            ])}
          </dl>
        </div>
        <hr className={`${styles.rule} ${styles.ruleBleed}`} />
      </div>
    </section>
  );
}
