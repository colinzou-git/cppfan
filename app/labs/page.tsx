import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemHelpLinks } from "@/components/item-help-links";
import { PageShell } from "@/components/page-shell";
import { projectLabs } from "@/features/labs/project-labs";
import { createClient } from "@/lib/supabase/server";
import { CapstoneTracksView } from "@/features/labs/capstone-tracks-view";
import { CapstoneHelp } from "@/features/labs/capstone-help";
import { buildCapstoneTrackView } from "@/features/labs/capstone-view";
import { canRunMilestoneInApp } from "@/features/labs/milestone-code-lab-adapter";
import { getMilestoneProgressForUser } from "@/features/labs/milestone-progress";
import { getPassingCodeLabItemIds } from "@/features/code-lab/code-attempt-service";

export default async function LabsPage() {
  const tracks = buildCapstoneTrackView();
  const milestoneProgress = await getMilestoneProgressForUser();
  // In-app milestones now complete via a passing /lab attempt (#431); resolve
  // which the learner has already passed so "Mark complete" stays gated.
  const inAppMilestoneIds = tracks.flatMap((track) =>
    track.projects.flatMap((project) => project.milestones.filter(canRunMilestoneInApp).map((m) => m.id))
  );
  const passingMilestoneIds = await getPassingCodeLabItemIds(inAppMilestoneIds);

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
          Small, guided C++ projects to apply what you learn. Build them in your own editor — cppFan
          does not run code in the browser.
        </p>
      </header>

      <CapstoneTracksView
        tracks={tracks}
        initialProgress={milestoneProgress}
        authenticated={authenticated}
        passingMilestoneIds={passingMilestoneIds}
      />
      <CapstoneHelp tracks={tracks} />

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {projectLabs.map((lab) => (
          <Card
            key={lab.id}
            className="border-white/70 bg-white/85 shadow-sm backdrop-blur"
            data-testid="project-lab"
          >
            <CardHeader>
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                {lab.difficulty}
              </span>
              <CardTitle className="mt-2">{lab.title}</CardTitle>
              <CardDescription>{lab.summary}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                {lab.focus.map((tag) => (
                  <span key={tag} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900">
                    {tag}
                  </span>
                ))}
              </div>
              <ol className="grid list-decimal gap-1 pl-5 text-sm text-slate-700">
                {lab.milestones.map((milestone) => (
                  <li key={milestone}>{milestone}</li>
                ))}
              </ol>
              <ItemHelpLinks
                context={{
                  schemaVersion: 1,
                  sourceKind: "lab_item",
                  sourceId: lab.id,
                  sourceVersion: "1",
                  title: lab.title,
                  prompt: lab.summary,
                  topic: lab.focus.join(", "),
                  instructions: lab.milestones,
                  assessmentState: "instructional",
                  revealPolicy: "normal",
                  metadata: {
                    difficulty: lab.difficulty,
                    milestoneCount: lab.milestones.length
                  }
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
