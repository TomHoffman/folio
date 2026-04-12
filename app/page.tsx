import { LogoGrid } from "@/components/LogoGrid";
import { ProjectGrid } from "@/components/ProjectGrid";
import mainStyles from "./main.module.css";

export default function HomePage() {
  return (
    <main className={`${mainStyles.main} ${mainStyles.mainHome}`}>
      <LogoGrid title="Selected clients" indicatorColor="secondary" />
      <ProjectGrid
        title="Projects"
        showTitle={true}
        indicatorColor="secondary"
      />
    </main>
  );
}
