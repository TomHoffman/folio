import { ProjectGrid } from "@/components/ProjectGrid";
import mainStyles from "./main.module.css";

export default function HomePage() {
  return (
    <main className={mainStyles.main}>
      <ProjectGrid />
    </main>
  );
}
