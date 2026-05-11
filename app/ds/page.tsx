import type { Metadata } from "next";
import { CardGroup } from "@/components/CardGroup";
import type { CardGroupData } from "@/components/cardGroupTypes";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { FocusLayerBlock } from "@/components/FocusLayerBlock";
import type { FocusLayerBlockData } from "@/components/focusLayerBlockTypes";
import { ImageBlock } from "@/components/ImageBlock";
import { ImageGrid } from "@/components/ImageGrid";
import type { ImageGridData } from "@/components/imageGridTypes";
import type { ImageBlockRow } from "@/components/imageBlockTypes";
import { LogoGrid } from "@/components/LogoGrid";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ProjectOverview } from "@/components/ProjectOverview";
import { defaultLogoGridItems } from "@/data/logoGridItems";
import type { ProjectOverviewData } from "@/data/projects";
import { visibleProjects } from "@/data/projects";
import mainStyles from "../main.module.css";
import dsStyles from "./ds.module.css";

const dsTitle = "Title";
const dsLorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

export const metadata: Metadata = {
  title: dsTitle,
  description: dsLorem,
};

const dsLogoGridItems = defaultLogoGridItems.map((item) => ({
  ...item,
  name: dsTitle,
}));

const dsProjectGridProjects = visibleProjects.map((p) => ({
  ...p,
  title: dsTitle,
}));

const dsProjectOverview: ProjectOverviewData = {
  introText: dsLorem,
  role: dsTitle,
  duration: dsTitle,
  team: dsLorem,
};

const dsFocusLayerBlock: FocusLayerBlockData = {
  title: dsTitle,
  description: dsLorem,
  headingId: "ds-focus-layer-heading",
  indicatorColor: "powderBlue",
  visualVariant: "demo-square",
  items: [
    { title: dsTitle, body: dsLorem },
    { title: dsTitle, body: dsLorem },
    { title: dsTitle, body: dsLorem },
  ],
};

const iconCardItems = [1, 2, 3, 4].map(() => ({
  type: "icon" as const,
  title: dsTitle,
  body: dsLorem,
  iconSrc: "/svg/icons/lock.svg",
}));

function dsPlaceholderImage(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

const imageCardThumbs = [
  dsPlaceholderImage("ds-card-1", 1200, 800),
  dsPlaceholderImage("ds-card-2", 1200, 800),
  dsPlaceholderImage("ds-card-3", 1200, 800),
  dsPlaceholderImage("ds-card-4", 1200, 800),
];

const iconCardGroupStackedSample: CardGroupData = {
  title: dsTitle,
  headingId: "ds-icon-card-group-stacked",
  indicatorColor: "blue",
  columnCount: 4,
  mobileLayout: "stack",
  items: iconCardItems,
};

const iconCardGroupCarouselSample: CardGroupData = {
  title: dsTitle,
  headingId: "ds-icon-card-group-carousel",
  indicatorColor: "blue",
  columnCount: 4,
  mobileLayout: "carousel",
  items: iconCardItems,
};

const imageCardItems = [1, 2, 3, 4].map((n, index) => ({
  type: "image" as const,
  title: dsTitle,
  body: dsLorem,
  imageSrc: imageCardThumbs[index],
  imageAlt: "",
}));

const imageCardGroupStackedSample: CardGroupData = {
  title: dsTitle,
  headingId: "ds-image-card-group-stacked",
  indicatorColor: "blue",
  columnCount: 4,
  mobileLayout: "stack",
  items: imageCardItems,
};

const imageCardGroupCarouselSample: CardGroupData = {
  title: dsTitle,
  headingId: "ds-image-card-group-carousel",
  indicatorColor: "blue",
  columnCount: 4,
  mobileLayout: "carousel",
  items: imageCardItems,
};

const imageGridSample: ImageGridData = {
  title: dsTitle,
  description: dsLorem,
  contained: true,
  mobileContained: false,
  mobileLayout: "carousel",
  columns: [
    {
      items: [{ src: dsPlaceholderImage("ds-grid-1", 1200, 900), alt: "" }],
    },
    {
      items: [
        { src: dsPlaceholderImage("ds-grid-2", 1200, 900), alt: "" },
        { src: dsPlaceholderImage("ds-grid-3", 1200, 900), alt: "" },
      ],
    },
    {
      items: [{ src: dsPlaceholderImage("ds-grid-4", 1200, 900), alt: "" }],
    },
  ],
};

const imageBlockRows: ImageBlockRow[] = [
  {
    rowHeight: "full-width",
    cells: [{ src: dsPlaceholderImage("ds-image-block-1", 1400, 900), alt: "" }],
  },
  {
    rowHeight: "medium",
    cells: [
      { src: dsPlaceholderImage("ds-image-block-2", 1200, 900), alt: "" },
      { src: dsPlaceholderImage("ds-image-block-3", 1200, 900), alt: "" },
    ],
  },
];

export default function DsPage() {
  return (
    <main className={`${mainStyles.main} ${mainStyles.mainHome}`} key="route-ds">
      <div className={dsStyles.stack}>
        <section className={dsStyles.block} aria-labelledby="ds-label-logo-grid">
          <h2
            id="ds-label-logo-grid"
            className={`${dsStyles.label} ${dsStyles.labelLogoGrid}`}
          >
            {dsTitle}
          </h2>
          <LogoGrid title={dsTitle} indicatorColor="secondary" items={dsLogoGridItems} />
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-project-grid">
          <h2 id="ds-label-project-grid" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <ProjectGrid
            title={dsTitle}
            showTitle
            indicatorColor="secondary"
            projects={dsProjectGridProjects}
          />
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-project-overview">
          <h2 id="ds-label-project-overview" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.projectMock}>
            <ProjectOverview overview={dsProjectOverview} category={dsTitle} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-icon-cards-stacked">
          <h2 id="ds-label-icon-cards-stacked" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.projectMock}>
            <CardGroup {...iconCardGroupStackedSample} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-icon-cards-carousel">
          <h2 id="ds-label-icon-cards-carousel" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.projectMock}>
            <CardGroup {...iconCardGroupCarouselSample} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-image-cards-stacked">
          <h2 id="ds-label-image-cards-stacked" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.projectMock}>
            <CardGroup {...imageCardGroupStackedSample} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-image-cards-carousel">
          <h2 id="ds-label-image-cards-carousel" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.projectMock}>
            <CardGroup {...imageCardGroupCarouselSample} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-image-grid">
          <h2 id="ds-label-image-grid" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.projectMock}>
            <ImageGrid {...imageGridSample} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-focus-layer-block">
          <h2 id="ds-label-focus-layer-block" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.projectMock}>
            <FocusLayerBlock {...dsFocusLayerBlock} />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-image-block-stacked">
          <h2 id="ds-label-image-block-stacked" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.projectMock}>
            <ImageBlock
              title={dsTitle}
              description={dsLorem}
              headingId="ds-image-block-stacked-heading"
              indicatorColor="blue"
              contained={false}
              mobileLayout="stacked"
              rows={imageBlockRows}
            />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-image-block-carousel">
          <h2 id="ds-label-image-block-carousel" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.projectMock}>
            <ImageBlock
              title={dsTitle}
              description={dsLorem}
              headingId="ds-image-block-carousel-heading"
              indicatorColor="blue"
              contained={false}
              mobileLayout="mobile-carousel"
              rows={imageBlockRows}
            />
          </div>
        </section>

        <section className={dsStyles.block} aria-labelledby="ds-label-dark-toggle">
          <h2 id="ds-label-dark-toggle" className={dsStyles.label}>
            {dsTitle}
          </h2>
          <div className={dsStyles.toggleRow}>
            <DarkModeToggle />
          </div>
        </section>
      </div>
    </main>
  );
}
