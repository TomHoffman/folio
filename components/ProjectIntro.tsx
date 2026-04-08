import type { Project } from "@/data/projects";
import styles from "./ProjectIntro.module.css";

type MetaRow = { label: string; value: string };

function buildMetadataRows(project: Project): MetaRow[] {
  const rows: MetaRow[] = [];
  if (project.industry) {
    rows.push({ label: "Industry", value: project.industry });
  }
  if (project.role) {
    rows.push({ label: "Role", value: project.role });
  }
  if (project.deliverables) {
    rows.push({ label: "Deliverables", value: project.deliverables });
  }
  if (project.year) {
    rows.push({ label: "Year", value: project.year });
  }
  return rows;
}

export function ProjectIntro({ project }: { project: Project }) {
  const metaRows = buildMetadataRows(project);
  const hasDescription = Boolean(project.description?.trim());
  const hasMeta = metaRows.length > 0;

  if (!hasDescription && !hasMeta) {
    return null;
  }

  return (
    <section className={styles.section}>
      {hasDescription ? (
        <p className={styles.lede}>{project.description}</p>
      ) : null}

      {hasMeta ? (
        <>
          <hr
            className={`${styles.hr} ${hasDescription ? styles.hrAfterDescription : ""}`}
          />
          <dl className={styles.meta}>
            {metaRows.flatMap((row) => [
              <dt key={`${row.label}-label`} className={styles.dt}>
                {row.label}
              </dt>,
              <dd key={`${row.label}-value`} className={styles.dd}>
                {row.value}
              </dd>,
            ])}
          </dl>
        </>
      ) : null}
    </section>
  );
}
