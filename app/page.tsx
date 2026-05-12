import { HomepageHero } from "@/components/HomepageHero";
import { HomeFeaturedGrids } from "@/components/HomeFeaturedGrids";
import { LogoGrid } from "@/components/LogoGrid";
import { visibleProjectsForHomeFeatured } from "@/data/projects";
import mainStyles from "./main.module.css";

const HOME_FEATURED_COUNT = 5;
const homeFeaturedProjects = visibleProjectsForHomeFeatured.slice(0, HOME_FEATURED_COUNT);

export default function HomePage() {
  return (
    <main
      data-page="home"
      className={`${mainStyles.main} ${mainStyles.mainHome}`}
      key="route-home"
    >
      <HomepageHero />
      <LogoGrid
        title="Clients"
        indicatorColor="secondary"
        className={mainStyles.homeLogoGridBeforeProjects}
      />
      <HomeFeaturedGrids projects={homeFeaturedProjects} />
    </main>
  );
}
