import type { CardGroupData } from "@/components/cardGroupTypes";
import type { FocusLayerBlockData } from "@/components/focusLayerBlockTypes";
import type { ImageBlockData } from "@/components/imageBlockTypes";
import type { ImageGridData } from "@/components/imageGridTypes";
import type { TestimonialData } from "@/components/testimonialTypes";

export type ProjectStatus = "active" | "protected" | "coming-soon";

/** Intro + fixed meta rows: Role, Duration, Team. */
export type ProjectOverviewData = {
  introText: string;
  role: string;
  duration: string;
  team: string;
};

export type Project = {
  slug: string;
  title: string;
  industry: string;
  image: string | null;
  status: ProjectStatus;
  /** Hex fill for the custom “view” cursor on hover */
  cursorColor: string;
  /** Optional hex for “view” label (default white) */
  cursorTextColor?: string;
  /** Grid card bottom fade: full CSS `background` (usually linear-gradient). Omit for default teal fade. */
  cardBottomGradient?: string;
  /** Full-width media in ProjectImageContainer (e.g. hero SVG) */
  heroImage?: string;
  /** Optional second media slot in ProjectImageContainer. */
  heroImageSecondary?: string;
  /** ProjectImageContainer slot count (single or split). */
  heroImageCount?: 1 | 2;
  /** Grid card image: translateY on small viewports only (px, negative = up) */
  cardImageMobileOffsetY?: number;
  /** Grid card image: uniform scale on small viewports only (e.g. 0.95 = 5% smaller) */
  cardImageMobileScale?: number;
  /** Grid card image: uniform scale from tablet/desktop breakpoint up */
  cardImageDesktopScale?: number;
  /** Intro paragraph on the project page */
  description?: string;
  role?: string;
  deliverables?: string;
  year?: string;
  /** Overview block (intro + Role, Duration, Team) */
  overview?: ProjectOverviewData;
  /** Optional icon / image card grid (e.g. project detail). */
  cardGroup?: CardGroupData;
  /** Optional image group blocks (e.g. below CardGroup on project detail). */
  imageBlocks?: ImageBlockData[];
  /** Optional collage/grid image module. */
  imageGrids?: ImageGridData[];
  /** Optional focus layer explainer blocks. */
  focusLayerBlocks?: FocusLayerBlockData[];
  /** Optional image blocks rendered below focus layer content. */
  imageBlocksAfterFocus?: ImageBlockData[];
  /** Optional testimonial module. */
  testimonial?: TestimonialData;
  /** Optional explicit slugs for the "More projects" module. */
  moreProjectSlugs?: string[];
  /** Omit from home grid; `/work/[slug]` returns 404 */
  hidden?: boolean;
  /** Bump when replacing `image` / `heroImage` in place so `next/image` skips stale cache */
  assetVersion?: string;
};

/** Stable `?v=` for public assets (avoids stale `/_next/image` when the filename is unchanged). */
export function projectAssetSrc(path: string, assetVersion?: string): string {
  if (!assetVersion) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}v=${encodeURIComponent(assetVersion)}`;
}

const outcomesPlaceholderItems: CardGroupData["items"] = Array.from(
  { length: 4 },
  () => ({
    type: "icon",
    title: "Title",
    body: "Description",
    iconSrc: "/svg/icons/brand.svg",
  }),
);

export const projects: Project[] = [
  {
    slug: "licel",
    title: "Licel",
    industry: "Cyber security",
    image: "/images/licel/licel-thumb.svg",
    heroImage: "/images/licel/licel-hero.svg",
    cardImageMobileOffsetY: -30,
    cardImageMobileScale: 0.95,
    cardImageDesktopScale: 0.95,
    status: "active",
    cursorColor: "#3454E1",
    overview: {
      introText:
        "Licel are a cyber security company specialising in app protection for iOS, Android and Java. Their products were trusted by engineers and security specialists but the products had no unifying brand and identity which was critical to their growth strategy as they scaled up with more enterprise customers. I joined as founding designer to establish the brand, design system, and product interfaces across web and mobile.",
      role: "Founding Designer",
      duration: "3 years",
      team: "Direct with founders",
    },
    cardGroup: {
      title: "Outcomes",
      headingId: "licel-card-group-heading",
      indicatorColor: "powderBlue",
      columnCount: 4,
      mobileLayout: "carousel",
      items: [
        {
          type: "icon",
          title: "Enterprise positioning",
          body: "Repositioned Licel as a credible enterprise brand, shifting inbound enquiries toward international banks and large organisations.",
          iconSrc: "/svg/icons/office.svg",
        },
        {
          type: "icon",
          title: "Unified brand",
          body: "Replaced three disconnected product identities with a single visual language across web, dashboards and mobile apps.",
          iconSrc: "/svg/icons/brand.svg",
        },
        {
          type: "icon",
          title: "Faster to market",
          body: "A modular design system meant the team could respond to security events quickly using reusable components to publish content at pace.",
          iconSrc: "/svg/icons/dial.svg",
        },
        {
          type: "icon",
          title: "Commercial credibility",
          body: "A coherent, polished presence reduced friction in investor and partner conversations as Licel evolved and grew the business.",
          iconSrc: "/svg/icons/briefcase.svg",
        },
      ],
    },
    imageBlocks: [
      {
        contained: true,
        mobileLayout: "column",
        scrollReveal: "on-outcomes",
        revealOffset: 2,
        rows: [
          {
            rowHeight: "medium",
            cells: [
              {
                src: "/images/licel/phone-homescreen.jpg",
                alt: "Licel app home screen",
              },
              {
                src: "/images/licel/phone-menu.jpg",
                alt: "Licel app menu screen",
              },
            ],
          },
        ],
      },
      {
        title: "Start-up to scale-up",
        description:
          "With no parent brand, each product was operating independently. I created a brand identity to connect them under a single design language and appeal to both enterprise teams and engineers.",
        headingId: "licel-image-block-brand-heading",
        indicatorColor: "powderBlue",
        contained: true,
        mobileLayout: "stacked",
        mobileStack: "one-then-two",
        scrollReveal: "self",
        scrollRevealTarget: "svg-only",
        revealOffset: 2,
        descriptionRevealOffset: 0,
        rows: [
          {
            rowHeight: "med-tall",
            cells: [
              {
                src: "/images/licel/licel-logo-white.svg",
                alt: "Licel logo",
                bgColor: "#3454E1",
                fit: "containLogoSpaced",
              },
              {
                src: "/images/licel/licel-logo-white.svg",
                alt: "Licel logo",
                bgColor: "#0C232C",
                fit: "containLogoSpaced",
              },
              {
                src: "/images/licel/licel-logo-blue.svg",
                alt: "Licel logo",
                bgColor: "#F3F4EF",
                fit: "containLogoSpaced",
              },
            ],
          },
        ],
      },
      {
        contained: true,
        mobileContained: false,
        mobileLayout: "mobile-carousel",
        rows: [
          {
            rowHeight: "medium",
            cells: [
              {
                src: "/images/licel/dexprotector-symbol.svg",
                alt: "DexProtector symbol",
                bgColor: "#0C232C",
                mobileBgColor: "#172E37",
                fit: "containWide",
              },
              {
                src: "/images/licel/stringer-symbol.svg",
                alt: "Stringer symbol",
                bgColor: "#0C232C",
                mobileBgColor: "#172E37",
                fit: "containWide",
              },
              {
                src: "/images/licel/jcardsim-symbol.svg",
                alt: "jCardSim symbol",
                bgColor: "#0C232C",
                mobileBgColor: "#172E37",
                fit: "containWide",
              },
              {
                src: "/images/licel/alice-symbol.svg",
                alt: "Alice symbol",
                bgColor: "#0C232C",
                mobileBgColor: "#172E37",
                fit: "containWide",
              },
            ],
          },
        ],
      },
      {
        contained: true,
        rows: [
          {
            rowHeight: "short",
            cells: [
              {
                alt: "",
              },
            ],
          },
        ],
      },
    ],
    focusLayerBlocks: [
      {
        title: "Layered illustration system",
        description:
          "Security threats are invisible by nature, which makes them hard to communicate to non-technical audiences. The illustration system uses layers to show where vulnerabilities exist and how Licel's products address them.",
        headingId: "licel-focus-layer-heading",
        indicatorColor: "powderBlue",
        items: [
          {
            title: "OS and flow of data",
            body: "The base layer represents the OS ecosystem, third-party dependencies, and data flows beneath the app.",
          },
          {
            title: "Underlying app code",
            body: "This layer represents the code and files within the app that can expose perosnal data and financial information.",
          },
          {
            title: "UI layer",
            body: "The app surface represents what we see as users, with cutouts showing the vulnerabilities that can be exposed.",
          },
        ],
      },
    ],
    imageBlocksAfterFocus: [
      {
        contained: true,
        mobileLayout: "column",
        rows: [
          {
            rowHeight: "medium",
            cells: [
              {
                inlineSvgSrc: "/images/licel/automotive-illustration.svg",
                alt: "Automotive illustration",
              },
              {
                inlineSvgSrc: "/images/licel/aerospace-illustration-end.svg",
                alt: "Aerospace illustration",
              },
            ],
          },
        ],
      },
      {
        title: "Designed to scale",
        description:
          "The design language was built to work across every surface from website to dashboards, internal tooling and mobile apps so that common tokens and components could be quickly used and adapted.",
        indicatorColor: "powderBlue",
        contained: true,
        mobileContained: false,
        mobileLayout: "mobile-carousel",
        rows: [
          {
            rowHeight: "tall",
            cells: [
              {
                src: "/images/licel/authenticator1.svg",
                alt: "Authenticator screen",
                fit: "contain",
              },
              {
                src: "/images/licel/authenticator2.svg",
                alt: "Authenticator screen",
                fit: "contain",
              },
              {
                src: "/images/licel/authenticator3.svg",
                alt: "Authenticator screen",
                fit: "contain",
              },
            ],
          },
        ],
      },
      {
        contained: true,
        rows: [
          {
            rowHeight: "content",
            cells: [
              {
                src: "/images/licel/alice.jpg",
                alt: "Alice brand asset",
                fit: "containLarge",
              },
            ],
          },
        ],
      },
    ],
    testimonial: {
      imageSrc: "/images/testimonials/stefan-wessels.png",
      imageAlt: "Portrait of Stefan Wessels",
      quote:
        '"Tom is always easy to talk to and give feedback, very mature and open in his approach. Of course, he is a great designer and strategist too. Happy to work with him again - keep him if you get him!"',
      name: "Stefan Wessels",
      jobTitle: "Tech Collab and Innovation Lead",
      company: "X Shore",
    },
  },
  {
    slug: "x-shore-1",
    title: "X Shore 1",
    industry: "Electric boating and mobility",
    image: "/images/xshore/xshore-thumb.jpg",
    heroImage: "/images/xshore/xshore-hero.jpg",
    heroImageSecondary: "/images/xshore/heropanel2.jpg",
    heroImageCount: 2,
    status: "active",
    cursorColor: "#615E56",
    year: "2022",
    overview: {
      introText:
        "The X Shore 1 is a fully electric daycruiser designed to put the experience of being on the water first. I was brought in as lead designer to create a custom interface from the ground up, replacing the off-the-shelf Garmin approach used on the existing vessel. I conducted research at sea to understand how drivers interact at speed, then designed for safety and glanceability, keeping the technology invisible.",
      role: "Lead Product Designer",
      duration: "4 months",
      team: "X Shore and Bejo",
    },
    cardGroup: {
      title: "Outcomes",
      headingId: "xshore-card-group-heading",
      indicatorColor: "powderBlue",
      columnCount: 4,
      mobileLayout: "carousel",
      items: [
        {
          type: "icon",
          title: "Safety by design",
          body: "Designed a glanceable interface that keeps critical information accessible without taking the driver's eyes off the water.",
          iconSrc: "/svg/icons/safety.svg",
        },
        {
          type: "icon",
          title: "Built for real conditions",
          body: "Interaction patterns validated through very cold on-water testing at speeds up to 30 knots at sea in Stockholm.",
          iconSrc: "/svg/icons/boat.svg",
        },
        {
          type: "icon",
          title: "Making range accessible",
          body: "Visualising range as concentric rings on the chart turned an abstract number into actionable planning information.",
          iconSrc: "/svg/icons/range.svg",
        },
        {
          type: "icon",
          title: "Designed to scale",
          body: "A modular design system built to expand across X Shore's product roadmap, reducing design time for new features going forwards.",
          iconSrc: "/svg/icons/scale.svg",
        },
      ],
    },
    imageBlocks: [
      {
        contained: true,
        mobileLayout: "column",
        rows: [
          {
            rowHeight: "full-width",
            cells: [
              {
                alt: "",
              },
            ],
          },
          {
            rowHeight: "medium",
            cells: [
              {
                alt: "",
              },
              {
                alt: "",
              },
            ],
          },
        ],
      },
    ],
    imageGrids: [
      {
        title: "Touchscreens at speed",
        description:
          "Testing at sea showed us that most touchscreen interactions become impossible at speed. The chart needed to stay visible at all times, with common tasks like centre and zoom supported with physical controls.",
        contained: true,
        mobileContained: false,
        mobileLayout: "carousel",
        columns: [
          {
            items: [
              {
                src: "/images/xshore/research1.jpg",
                alt: "",
              },
            ],
          },
          {
            items: [
              {
                src: "/images/xshore/research2.jpg",
                alt: "",
              },
              {
                src: "/images/xshore/research3.jpg",
                alt: "",
              },
            ],
          },
          {
            items: [
              {
                src: "/images/xshore/research4.jpg",
                alt: "",
              },
            ],
          },
        ],
      },
    ],
    focusLayerBlocks: [
      {
        title: "The chart experience",
        description:
          "The interface is built around four modes, designed to keep the chart visible and prioritise safety while keeping the right information easily within reach.",
        headingId: "xshore-chart-focus-heading",
        indicatorColor: "powderBlue",
        inlineSvgSrc: "/images/xshore/full-screen-chart_wires.svg",
        items: [
          {
            title: "Full screen chart",
            body: "Charts are full screen by default to prioritise safety. Key information is available through the widgets and dial.",
          },
          {
            title: "Split screen view",
            body: "Widgets open a detailed split screen view, ensuring the chart is always available without any obstructions.",
          },
          {
            title: "Safety + warnings",
            body: "Critical alerts surface above the dial in the driver's line of sight. Details can be viewed from the left-hand widget.",
          },
          {
            title: "North up",
            body: "North up mode centres the boat marker and shows the direction of travel, keeping the full chart visible in all directions.",
          },
        ],
      },
    ],
  },
  {
    slug: "allied-irish-bank",
    title: "Allied Irish Bank",
    industry: "Banking and finance",
    image: "/images/aib-thumb.jpg",
    heroImage: "/images/aib-hero.jpg",
    heroImageCount: 2,
    status: "active",
    cursorColor: "#811C81",
    assetVersion: "2",
    overview: {
      introText:
        "AIB is one of Ireland's main high-street banks, used by more than 3 million customers for everything from day-to-day spending to major life events. As part of a large programme to rebuild the mobile app from the ground up, I led the design of the home screen and payments experience as one of five design leads, working across research, information architecture, design system and creative direction.",
      role: "Lead Product Designer",
      duration: "15 months",
      team: "AIB and Globant",
    },
    cardGroup: {
      title: "Outcomes",
      headingId: "aib-card-group-heading",
      indicatorColor: "powderBlue",
      columnCount: 4,
      mobileLayout: "carousel",
      items: outcomesPlaceholderItems.map((item) => ({ ...item })),
    },
  },
  {
    slug: "zeppelin-rental",
    title: "Zeppelin Rental",
    industry: "Construction",
    image: "/images/zeppelin-thumb.jpg",
    heroImage: "/images/zeppelin-hero.jpg",
    status: "active",
    cursorColor: "#FFB134",
    cursorTextColor: "#000000",
    cardBottomGradient:
      "linear-gradient(360deg, #282828 0%, rgba(41, 41, 41, 0) 100%)",
    cardGroup: {
      title: "Outcomes",
      headingId: "zeppelin-card-group-heading",
      indicatorColor: "powderBlue",
      columnCount: 4,
      mobileLayout: "carousel",
      items: outcomesPlaceholderItems.map((item) => ({ ...item })),
    },
  },
  {
    slug: "volta-zero",
    title: "Volta Zero",
    industry: "Electric mobility",
    image: "/images/volta-thumb.jpg",
    heroImage: "/images/volta-hero.jpg",
    status: "active",
    cursorColor: "#0C0C0C",
    cardGroup: {
      title: "Outcomes",
      headingId: "volta-card-group-heading",
      indicatorColor: "powderBlue",
      columnCount: 4,
      mobileLayout: "carousel",
      items: outcomesPlaceholderItems.map((item) => ({ ...item })),
    },
  },
  {
    slug: "jobhelp",
    title: "JobHelp",
    industry: "Government",
    image: "/images/jobhelp-thumb.jpg",
    heroImage: "/images/jobhelp-hero.jpg",
    status: "active",
    cursorColor: "#AADDD1",
    cursorTextColor: "#000000",
    cardBottomGradient:
      "linear-gradient(360deg, #273B46 0%, rgba(80, 99, 108, 0) 100%)",
    cardGroup: {
      title: "Outcomes",
      headingId: "jobhelp-card-group-heading",
      indicatorColor: "powderBlue",
      columnCount: 4,
      mobileLayout: "carousel",
      items: outcomesPlaceholderItems.map((item) => ({ ...item })),
    },
  },
  {
    slug: "british-heart-foundation",
    title: "British Heart Foundation",
    industry: "Healthcare",
    image: "/images/bhf-thumb.jpg",
    heroImage: "/images/bhf-hero.jpg",
    status: "active",
    cursorColor: "#A52241",
    cardBottomGradient:
      "linear-gradient(360deg, #2D2D1E 0%, rgba(165, 158, 129, 0) 100%)",
    cardGroup: {
      title: "Outcomes",
      headingId: "bhf-card-group-heading",
      indicatorColor: "powderBlue",
      columnCount: 4,
      mobileLayout: "carousel",
      items: outcomesPlaceholderItems.map((item) => ({ ...item })),
    },
    hidden: true,
  },
];

/** Projects shown on the home grid (excludes `hidden`). */
export const visibleProjects = projects.filter((p) => !p.hidden);

export function getProjectBySlug(slug: string): Project | undefined {
  const p = projects.find((pr) => pr.slug === slug);
  if (!p || p.hidden) return undefined;
  return p;
}

export function getMoreProjectsForProject(
  currentProject: Project,
  count = 2,
): Project[] {
  const maxCount = Math.max(0, count);
  if (maxCount === 0) return [];

  const available = visibleProjects.filter((p) => p.slug !== currentProject.slug);
  if (available.length === 0) return [];

  const selected = (currentProject.moreProjectSlugs ?? [])
    .map((slug) => available.find((p) => p.slug === slug))
    .filter((p): p is Project => Boolean(p));

  const uniqueSelected: Project[] = [];
  for (const project of selected) {
    if (!uniqueSelected.some((p) => p.slug === project.slug)) {
      uniqueSelected.push(project);
    }
  }

  const filledFromSelected = uniqueSelected.slice(0, maxCount);
  if (filledFromSelected.length >= maxCount) return filledFromSelected;

  const currentIndex = visibleProjects.findIndex(
    (p) => p.slug === currentProject.slug,
  );
  if (currentIndex === -1) return filledFromSelected;

  const nextProjects: Project[] = [];
  for (let step = 1; step < visibleProjects.length; step += 1) {
    const index = (currentIndex + step) % visibleProjects.length;
    const candidate = visibleProjects[index];
    if (!candidate || candidate.slug === currentProject.slug) continue;
    if (filledFromSelected.some((p) => p.slug === candidate.slug)) continue;
    nextProjects.push(candidate);
    if (nextProjects.length >= maxCount - filledFromSelected.length) break;
  }

  return [...filledFromSelected, ...nextProjects].slice(0, maxCount);
}
