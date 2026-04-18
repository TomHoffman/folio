import Link from "next/link";
import { HomepageHero } from "@/components/HomepageHero";
import { LogoGrid } from "@/components/LogoGrid";
import { ProjectGrid } from "@/components/ProjectGrid";
import mainStyles from "./main.module.css";

export default function HomePage() {
  return (
    <main className={`${mainStyles.main} ${mainStyles.mainHome}`}>
      <HomepageHero />
      <LogoGrid title="Selected clients" indicatorColor="secondary" />
      <ProjectGrid
        title="Projects"
        showTitle={true}
        indicatorColor="secondary"
      />
      <p className={mainStyles.mainHomeFooterLink}>
        <Link href="/ds">DS — component playground</Link>
      </p>
    </main>
  );
}
