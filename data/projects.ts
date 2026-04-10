export type ProjectStatus = "active" | "protected" | "coming-soon";

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
  /** Intro paragraph on the project page */
  description?: string;
  role?: string;
  deliverables?: string;
  year?: string;
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
    cardImageMobileOffsetY: -20,
    status: "active",
    cursorColor: "#3454E1",
  },
  {
    slug: "x-shore-1",
    title: "X Shore 1",
    industry: "Electric boating + mobility",
    image: "/images/xshore-thumb.jpg",
    heroImage: "/images/xshore-hero.jpg",
    status: "active",
    cursorColor: "#615E56",
    description:
      "Placeholder intro for X Shore: a connected electric boat platform where clarity of range, charging, and drive modes mattered as much as the physical helm. This case study outlines how we structured information and interaction patterns for skippers moving between harbour, open water, and assisted docking contexts.",
    role: "Lead HMI Designer",
    deliverables: "IA, wireframes, interface design, prototypes",
    year: "2022",
  },
  {
    slug: "allied-irish-bank",
    title: "Allied Irish Bank",
    industry: "Finance",
    image: "/images/aib-thumb.jpg",
    heroImage: "/images/aib-hero.jpg",
    status: "protected",
    cursorColor: "#811C81",
    assetVersion: "2",
  },
  {
    slug: "zeppelin-rental",
    title: "Zeppelin Rental",
    industry: "Construction",
    image: "/images/zeppelin-thumb.jpg",
    heroImage: "/images/zeppelin-hero.jpg",
    status: "coming-soon",
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
    status: "coming-soon",
    cursorColor: "#0C0C0C",
  },
  {
    slug: "jobhelp",
    title: "JobHelp",
    industry: "Government",
    image: "/images/jobhelp-thumb.jpg",
    heroImage: "/images/jobhelp-hero.jpg",
    status: "coming-soon",
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
