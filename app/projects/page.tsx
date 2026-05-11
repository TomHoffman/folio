import type { Metadata } from "next";
import { ProjectGrid } from "@/components/ProjectGrid";
import mainStyles from "../main.module.css";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <main className={`${mainStyles.main} ${mainStyles.mainHome}`} key="route-projects">
      <ProjectGrid
        showTitle={false}
        indicatorColor="secondary"
        animateCardsOnMount
      />
    </main>
  );
}
