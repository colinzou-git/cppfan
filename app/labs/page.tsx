import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { projectLabs } from "@/features/labs/project-labs";
import { createClient } from "@/lib/supabase/server";
import { CapstoneTracksView } from "@/features/labs/capstone-tracks-view";
import { buildCapstoneTrackView } from "@/features/labs/capstone-view";
import { getProjectProgressForUser } from "@/features/labs/project-progress";
import { ProjectCard } from "@/features/labs/project-card";

export default async function LabsPage() {
  const tracks = buildCapstoneTrackView();
  const projectProgress = await getProjectProgressForUser();
  const statusByProject = new Map(projectProgress.map((row) => [row.project_id, row.status]));

  let authenticated = false;
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    authenticated = Boolean(user);
  }

  return (
    <PageShell className="grid gap-6" size="wide">
      <header>
        <Link href="/dashboard" className="text-sm font-bold text-blue-700">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <FlaskConical className="h-7 w-7 text-blue-700" />
          Project labs
        </h1>
        <p className="mt-1 text-slate-600">
          Small, guided C++ projects to apply what you learn. Each project is one codebase you edit,
          run, and test in the Code Lab — milestones are checkpoints inside it.
        </p>
      </header>

      <CapstoneTracksView
        tracks={tracks}
        projectProgress={projectProgress}
        authenticated={authenticated}
      />

      <section className="grid gap-3" aria-label="More projects">
        <h2 className="text-xl font-black text-slate-900">More projects</h2>
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3" data-testid="project-labs-grid">
          {projectLabs.map((lab) => (
            <ProjectCard
              key={lab.id}
              project={{
                id: lab.id,
                title: lab.title,
                summary: lab.summary,
                difficulty: lab.difficulty,
                focus: lab.focus,
                milestones: lab.milestones,
                sourceVersion: lab.version
              }}
              completionStatus={statusByProject.get(lab.id)}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
