export type ProjectStatus = "active" | "protected" | "coming-soon";

export type Project = {
  slug: string;
  title: string;
  industry: string;
  image: string | null;
  status: ProjectStatus;
  /** Hex fill for the custom “view” cursor on hover */
  cursorColor: string;
};

export const projects: Project[] = [
  {
    slug: "licel",
    title: "Licel",
    industry: "Cyber security",
    image: null,
    status: "active",
    cursorColor: "#2d6a8f",
  },
  {
    slug: "x-shore-1",
    title: "X Shore 1",
    industry: "Electric boating + mobility",
    image: null,
    status: "protected",
    cursorColor: "#1f6b5c",
  },
  {
    slug: "british-heart-foundation",
    title: "British Heart Foundation",
    industry: "Healthcare",
    image: null,
    status: "active",
    cursorColor: "#c41e3a",
  },
  {
    slug: "volta-zero",
    title: "Volta Zero",
    industry: "Electric mobility",
    image: null,
    status: "active",
    cursorColor: "#3d7c47",
  },
  {
    slug: "zeppelin-rental",
    title: "Zeppelin Rental",
    industry: "Construction",
    image: null,
    status: "active",
    cursorColor: "#b8860b",
  },
  {
    slug: "jobhelp",
    title: "JobHelp",
    industry: "Government",
    image: null,
    status: "coming-soon",
    cursorColor: "#4a5f8f",
  },
];
