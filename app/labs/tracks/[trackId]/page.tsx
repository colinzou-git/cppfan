import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CapstoneTracksView } from "@/features/labs/capstone-tracks-view";
import { buildCapstoneTrackView } from "@/features/labs/capstone-view";
import { canRunMilestoneInApp } from "@/features/labs/milestone-code-lab-adapter";
import { getMilestoneProgressForUser } from "@/features/labs/milestone-progress";
import { getPassingCodeLabItemIds } from "@/features/code-lab/code-attempt-service";

export default async function CapstoneTrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  const track = buildCapstoneTrackView().find((t) => t.id === decodeURIComponent(trackId));
  if (!track) {
    notFound();
  }

  const milestoneProgress = await getMilestoneProgressForUser();
  const inAppMilestoneIds = track.projects.flatMap((project) =>
    project.milestones.filter(canRunMilestoneInApp).map((m) => m.id)
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
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="grid gap-1">
        <Link href="/labs" className="text-sm font-bold text-blue-700">
          ← All project labs
        </Link>
        <h1 className="text-2xl font-black text-slate-900" data-testid="track-title">
          {track.title}
        </h1>
        <p className="text-sm text-slate-600">{track.summary}</p>
      </header>

      <CapstoneTracksView
        tracks={[track]}
        initialProgress={milestoneProgress}
        authenticated={authenticated}
        passingMilestoneIds={passingMilestoneIds}
        linkToTrack={false}
      />
    </main>
  );
}
