import Link from "next/link";
import { Gauge } from "lucide-react";
import { buildDiagnosticView } from "@/features/interview/diagnostic-view";
import { diagnosticSections } from "@/features/interview/diagnostic";
import { getDiagnosticScores } from "@/features/interview/diagnostic-store";
import { DiagnosticForm } from "@/features/interview/diagnostic-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Interview diagnostic — cppFan"
};

export default async function DiagnosticPage() {
  const view = buildDiagnosticView();
  const initialScores = await getDiagnosticScores();

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
      <header>
        <Link href="/interview" className="text-sm font-bold text-blue-700">
          ← Interview practice
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <Gauge className="h-7 w-7 text-blue-700" />
          Baseline diagnostic
        </h1>
        <p className="mt-1 text-slate-600">
          A short baseline across the core interview areas (about {view.totalMinutes} minutes total). It
          produces a per-area heat map — not a single pass/fail — and suggests where to focus. It is a
          suggestion only; nothing is locked.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm text-slate-700">
        <h2 className="font-bold text-slate-900">How each area is rated</h2>
        <ul className="mt-1 grid gap-1">
          <li>
            <span className="font-semibold text-emerald-700">Interview ready</span> — strong; keep it warm.
          </li>
          <li>
            <span className="font-semibold text-amber-700">Practice under time</span> — solid, needs timed reps.
          </li>
          <li>
            <span className="font-semibold text-rose-700">Refresh first</span> — revisit the fundamentals before drills.
          </li>
        </ul>
      </section>

      <div className="grid gap-3" data-testid="diagnostic-sections">
        {view.sections.map((section, index) => (
          <article
            key={section.id}
            className="grid gap-2 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"
            data-testid="diagnostic-section"
            data-section-id={section.id}
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900">
                {index + 1}. {section.title}
              </h3>
              <span className="text-xs font-medium text-slate-600">~{section.estimatedMinutes} min</span>
            </div>
            <p className="text-sm text-slate-700">Problem: {section.sourceTitle}</p>
            <div className="flex flex-wrap gap-1">
              {section.dimensionLabels.map((dimension) => (
                <span key={dimension} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900">
                  {dimension}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
        <DiagnosticForm
          sections={diagnosticSections.map((s) => ({ id: s.id, title: s.title }))}
          initialScores={initialScores}
          authenticated={authenticated}
        />
      </section>
    </main>
  );
}
