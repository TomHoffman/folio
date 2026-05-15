import type { Metadata } from "next";
import { HomeAltHeader } from "@/components/HomeAltHeader";
import { HomepageHero } from "@/components/HomepageHero";
import styles from "./homeAlt.module.css";

export const metadata: Metadata = {
  title: "Home (alt)",
};

export default function HomeAltPage() {
  return (
    <main
      data-page="home-alt"
      className={styles.root}
      key="route-home-alt"
    >
      <HomeAltHeader />
      <HomepageHero variant="cluster4Only" />
    </main>
  );
}
