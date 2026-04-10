"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { ProjectStatus } from "@/data/projects";
import { ProjectAccessModal } from "@/components/ProjectAccessModal";
import { isProjectProtectedUnlockedClient } from "@/lib/protectedProjectUnlock";

export function ProjectWorkAccessGate({
  status,
  slug,
  children,
}: {
  status: ProjectStatus;
  slug: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [protectedUnlocked, setProtectedUnlocked] = useState(false);

  useEffect(() => {
    if (status !== "protected") return;
    if (!isProjectProtectedUnlockedClient(slug)) return;
    // sessionStorage is unavailable during SSR; sync after mount only (avoids hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount sessionStorage read
    setProtectedUnlocked(true);
  }, [status, slug]);

  const goHome = () => {
    router.push("/");
  };

  if (status === "active") {
    return <>{children}</>;
  }

  if (status === "coming-soon") {
    return (
      <ProjectAccessModal
        isOpen
        variant="coming-soon"
        onDismiss={goHome}
      />
    );
  }

  const locked = !protectedUnlocked;

  return (
    <>
      {protectedUnlocked ? children : null}
      <ProjectAccessModal
        isOpen={locked}
        variant="protected"
        projectSlug={slug}
        pinInputId="protected-project-pin-work"
        onDismiss={goHome}
        onProtectedSuccess={() => setProtectedUnlocked(true)}
      />
    </>
  );
}
