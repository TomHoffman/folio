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
  /** Intro paragraph on the project page */
  description?: string;
  role?: string;
  deliverables?: string;
  year?: string;
};

export const projects: Project[] = [
  {
    slug: "licel",
    title: "Licel",
    industry: "Cyber security",
    image: null,
    status: "active",
    cursorColor: "#3454E1",
  },
  {
    slug: "x-shore-1",
    title: "X Shore 1",
    industry: "Electric boating + mobility",
    image: null,
    status: "protected",
    cursorColor: "#615E56",
    description:
      "Placeholder intro for X Shore: a connected electric boat platform where clarity of range, charging, and drive modes mattered as much as the physical helm. This case study outlines how we structured information and interaction patterns for skippers moving between harbour, open water, and assisted docking contexts.",
    role: "Lead HMI Designer",
    deliverables: "IA, wireframes, interface design, prototypes",
    year: "2022",
  },
  {
    slug: "british-heart-foundation",
    title: "British Heart Foundation",
    industry: "Healthcare",
    image: null,
    status: "active",
    cursorColor: "#A52241",
  },
  {
    slug: "volta-zero",
    title: "Volta Zero",
    industry: "Electric mobility",
    image: null,
    status: "active",
    cursorColor: "#0C0C0C",
  },
  {
    slug: "zeppelin-rental",
    title: "Zeppelin Rental",
    industry: "Construction",
    image: null,
    status: "active",
    cursorColor: "#FFB134",
    cursorTextColor: "#000000",
  },
  {
    slug: "jobhelp",
    title: "JobHelp",
    industry: "Government",
    image: null,
    status: "coming-soon",
    cursorColor: "#AADDD1",
    cursorTextColor: "#000000",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
