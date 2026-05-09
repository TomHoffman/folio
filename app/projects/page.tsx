import type { Metadata } from "next";
import mainStyles from "../main.module.css";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return <main className={mainStyles.main} />;
}
