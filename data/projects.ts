import type { CardGroupData } from "@/components/cardGroupTypes";

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

export const projects: Project[] = [
  {
    slug: "licel",
    title: "Licel",
    industry: "Cyber security",
    image: "/images/licel-thumb.svg",
    heroImage: "/images/licel-hero.svg",
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
      indicatorColor: "orange",
      columnCount: 4,
      mobileLayout: "carousel",
      items: [
        {
          type: "icon",
          title: "Enterprise positioning",
          body: "Repositioned Licel as a credible enterprise brand, shifting inbound enquiries toward international banks and large organisations.",
          iconSrc: "/svg/lock.svg",
        },
        {
          type: "icon",
          title: "Unified brand",
          body: "Replaced three disconnected product identities with a single visual language across web, dashboards and mobile apps.",
          iconSrc: "/svg/lock.svg",
        },
        {
          type: "icon",
          title: "Faster to market",
          body: "A modular design system meant the team could respond to security events quickly using reusable components to publish content at pace.",
          iconSrc: "/svg/lock.svg",
        },
        {
          type: "icon",
          title: "Commercial credibility",
          body: "A coherent, polished presence reduced friction in investor and partner conversations as Licel evolved and grew the business.",
          iconSrc: "/svg/lock.svg",
        },
      ],
    },
  },
  {
    slug: "x-shore-1",
    title: "X Shore 1",
    industry: "Electric boating and mobility",
    image: "/images/xshore-thumb.jpg",
    heroImage: "/images/xshore-hero.jpg",
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
  },
  {
    slug: "allied-irish-bank",
    title: "Allied Irish Bank",
    industry: "Banking and finance",
    image: "/images/aib-thumb.jpg",
    heroImage: "/images/aib-hero.jpg",
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
  },
  {
    slug: "volta-zero",
    title: "Volta Zero",
    industry: "Electric mobility",
    image: "/images/volta-thumb.jpg",
    heroImage: "/images/volta-hero.jpg",
    status: "active",
    cursorColor: "#0C0C0C",
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
