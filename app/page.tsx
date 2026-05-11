import Link from "next/link";
import { HomepageHero } from "@/components/HomepageHero";
import { LogoGrid } from "@/components/LogoGrid";
import { ProjectGrid } from "@/components/ProjectGrid";
import mainStyles from "./main.module.css";

export default function HomePage() {
  return (
    <main className={`${mainStyles.main} ${mainStyles.mainHome}`} key="route-home">
      <HomepageHero />
      <LogoGrid
        title="Clients"
        indicatorColor="secondary"
        className={mainStyles.homeLogoGridBeforeProjects}
      />
      <ProjectGrid
        title="Featured projects"
        showTitle={true}
        indicatorColor="secondary"
        animateOnScroll
        maxProjects={5}
        desktopHomeFeaturedGrid
      />
      <p className={mainStyles.mainHomeFooterLink}>
        <Link href="/ds">DS — component playground</Link>
      </p>
    </main>
  );
}
