import { ProjectGrid } from "@/components/ProjectGrid";
import mainStyles from "../main.module.css";

export default function WorkPage() {
  return (
    <main className={mainStyles.main} key="route-work-index">
      <ProjectGrid />
    </main>
  );
}
