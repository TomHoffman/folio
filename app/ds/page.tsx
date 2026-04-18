import type { Metadata } from "next";
import { CardGroup } from "@/components/CardGroup";
import type { CardGroupData } from "@/components/cardGroupTypes";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { HomepageHero } from "@/components/HomepageHero";
import { LogoGrid } from "@/components/LogoGrid";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ProjectOverview } from "@/components/ProjectOverview";
import { getProjectBySlug } from "@/data/projects";
import mainStyles from "../main.module.css";
import dsStyles from "./ds.module.css";

export const metadata: Metadata = {
  title: "DS",
  description: "Component playground for layout and QA.",
};

/** Unified card copy on `/ds` for layout QA (icon + image groups). */
const dsCardTitle = "Title";
const dsCardParagraph =
  "Voluptates aut dicta aperiam molestiae illo omnis hic sunt voluptatum soluta. Aut quidem itaque et. Voluptates aut dicta aperiam.";

const iconCardItems = [1, 2, 3, 4].map(() => ({
  type: "icon" as const,
  title: dsCardTitle,
  body: dsCardParagraph,
  iconSrc: "/svg/lock.svg",
}));

const imageThumb = "/images/xshore-thumb.jpg";

const iconCardGroupStackedSample: CardGroupData = {
  title: "Outcomes",
  headingId: "ds-icon-card-group-stacked",
  indicatorColor: "blue",
  columnCount: 4,
  mobileLayout: "stack",
  items: iconCardItems,
};

const iconCardGroupCarouselSample: CardGroupData = {
  title: "Outcomes",
  headingId: "ds-icon-card-group-carousel",
  indicatorColor: "blue",
  columnCount: 4,
  mobileLayout: "carousel",
  items: iconCardItems,
};

const imageCardItems = [1, 2, 3, 4].map(() => ({
  type: "image" as const,
  title: dsCardTitle,
  body: dsCardParagraph,
  imageSrc: imageThumb,
  imageAlt: "",
}));

const imageCardGroupStackedSample: CardGroupData = {
  title: "Outcomes",
  headingId: "ds-image-card-group-stacked",
  indicatorColor: "blue",
  columnCount: 4,
  mobileLayout: "stack",
  items: imageCardItems,
};

const imageCardGroupCarouselSample: CardGroupData = {
  title: "Outcomes",
  headingId: "ds-image-card-group-carousel",
  indicatorColor: "blue",
  columnCount: 4,
  mobileLayout: "carousel",
  items: imageCardItems,
};

export default function DsPage() {
  const licelOverview = getProjectBySlug("licel")?.overview;

  return (
    <main className={`${mainStyles.main} ${mainStyles.mainHome}`}>
      <div className={dsStyles.stack}>
        <section className={dsStyles.block} aria-labelledby="ds-label-dark-toggle">
          <h2 id="ds-label-dark-toggle" className={dsStyles.label}>
            DarkModeToggle
          </h2>
          <div className={dsStyles.toggleRow}>
            <DarkModeToggle />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-homepage-hero">
          <h2 id="ds-label-homepage-hero" className={dsStyles.label}>
            HomepageHero
          </h2>
          <HomepageHero />
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-logo-grid">
          <h2
            id="ds-label-logo-grid"
            className={`${dsStyles.label} ${dsStyles.labelLogoGrid}`}
          >
            LogoGrid
          </h2>
          <LogoGrid title="Selected clients" indicatorColor="secondary" />
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-project-grid">
          <h2 id="ds-label-project-grid" className={dsStyles.label}>
            ProjectGrid
          </h2>
          <ProjectGrid title="Projects" showTitle indicatorColor="secondary" />
        </section>

        {licelOverview ? (
          <section className={dsStyles.block} aria-labelledby="ds-label-project-overview">
            <h2 id="ds-label-project-overview" className={dsStyles.label}>
              ProjectOverview
            </h2>
            <div className={dsStyles.projectMock}>
              <ProjectOverview overview={licelOverview} />
            </div>
          </section>
        ) : null}

        <section className={dsStyles.block} aria-labelledby="ds-label-icon-cards-stacked">
          <h2 id="ds-label-icon-cards-stacked" className={dsStyles.label}>
            CardGroup Icons (stacked)
          </h2>
          <div className={dsStyles.projectMock}>
            <CardGroup {...iconCardGroupStackedSample} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-icon-cards-carousel">
          <h2 id="ds-label-icon-cards-carousel" className={dsStyles.label}>
            CardGroup Icons (carousel)
          </h2>
          <div className={dsStyles.projectMock}>
            <CardGroup {...iconCardGroupCarouselSample} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-image-cards-stacked">
          <h2 id="ds-label-image-cards-stacked" className={dsStyles.label}>
            CardGroup Image (stacked)
          </h2>
          <div className={dsStyles.projectMock}>
            <CardGroup {...imageCardGroupStackedSample} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-image-cards-carousel">
          <h2 id="ds-label-image-cards-carousel" className={dsStyles.label}>
            CardGroup Image (carousel)
          </h2>
          <div className={dsStyles.projectMock}>
            <CardGroup {...imageCardGroupCarouselSample} />
          </div>
        </section>
      </div>
    </main>
  );
}
