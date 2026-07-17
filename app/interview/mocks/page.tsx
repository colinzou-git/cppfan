import Link from "next/link";
import { Timer } from "lucide-react";
import { buildMockPackView } from "@/features/interview/mock-pack-view";
import { getReconciledPersonalMockPacks, savePersonalMockPack } from "@/features/interview/personal-mock-pack-store";
import { PersonalMockPacks } from "@/features/interview/personal-mock-packs";
import { PersonalMockComposer } from "@/features/interview/personal-mock-composer";
import { getInterviewPlanningCandidates } from "@/features/interview/interview-planning-candidates";
import type { PersonalMockSelection } from "@/features/interview/personal-mock-pack";

export const metadata = {
  title: "Mock interview packs — cppFan"
};

const CATEGORY_LABEL: Record<string, string> = {
  core_algorithm: "Core algorithm",
  ds_implementation: "Data-structure implementation",
  cpp_debugging: "C++ debugging"
};

export default async function MockPacksPage() {
  const packs = buildMockPackView();
  // The learner's own mock packs (#613), reconciled against current problems.
  const personalPacks = await getReconciledPersonalMockPacks();
  // All problems (native + the owner's custom) selectable for a personal pack.
  const composerCandidates = (await getInterviewPlanningCandidates()).map((c) => ({
    problemId: c.problemId,
    source: c.source,
    title: c.title,
    contentVersionId: c.contentVersionId ?? null
  }));

  async function saveMockPack(title: string, items: PersonalMockSelection[]): Promise<boolean> {
    "use server";
    return savePersonalMockPack({ title, items });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <Link href="/interview" className="text-sm font-bold text-blue-700">
          ← Interview practice
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <Timer className="h-7 w-7 text-blue-700" />
          Mock interview packs
        </h1>
        <p className="mt-1 text-slate-600">
          Timed practice sets that compose catalog problems with a reviewed follow-up. Run one in a
          single sitting to rehearse pacing.
        </p>
      </header>

      <div className="grid gap-3" data-testid="mock-packs">
        {packs.map((pack) => (
          <article
            key={pack.id}
            className="grid gap-2 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"
            data-testid="mock-pack"
            data-pack-id={pack.id}
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-slate-900">{pack.title}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {CATEGORY_LABEL[pack.category] ?? pack.category}
              </span>
              <span className="text-xs font-medium text-slate-600">{pack.durationMinutes} min</span>
            </div>

            <ul className="grid gap-1">
              {pack.problems.map((problem) => (
                <li key={problem.id} className="text-sm text-slate-700">
                  • {problem.title}
                </li>
              ))}
            </ul>

            <p className="text-xs font-medium text-slate-500">
              {pack.followUpCount} follow-up{pack.followUpCount === 1 ? "" : "s"} · patterns:{" "}
              {pack.patternLabels.join(", ")}
            </p>
          </article>
        ))}
      </div>

      <PersonalMockPacks packs={personalPacks} />
      <PersonalMockComposer candidates={composerCandidates} onSave={saveMockPack} />
    </main>
  );
}
