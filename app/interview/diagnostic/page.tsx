import Link from "next/link";
import { Gauge } from "lucide-react";
import { buildDiagnosticResultView, buildDiagnosticView } from "@/features/interview/diagnostic-view";
import { diagnosticSections } from "@/features/interview/diagnostic";
import { getDiagnosticHistory, getDiagnosticScores } from "@/features/interview/diagnostic-store";
import { DiagnosticRetakeForm } from "@/features/interview/diagnostic-retake-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Interview diagnostic — cppFan" };

function average(scores: Record<string, number>) {
  const values = Object.values(scores);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function levelLabel(level: string) {
  return level.replaceAll("_", " ");
}

export default async function DiagnosticPage() {
  const view = buildDiagnosticView();
  const [initialScores, history] = await Promise.all([getDiagnosticScores(), getDiagnosticHistory()]);
  const resultView = buildDiagnosticResultView(initialScores);

  let authenticated = false;
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    authenticated = Boolean(data.user);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <Link href="/interview" className="text-sm font-bold text-blue-700">← Interview practice</Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <Gauge className="h-7 w-7 text-blue-700" /> Baseline diagnostic
        </h1>
        <p className="mt-1 text-slate-600">
          A {view.totalMinutes}-minute coding-refresh diagnostic across four interview areas. It produces a per-area heat map and a 4–8 week focus plan, never mastery or a hard lock.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm text-slate-700">
        <h2 className="font-bold text-slate-900">How each area is rated</h2>
        <ul className="mt-1 grid gap-1">
          <li><span className="font-semibold text-emerald-700">Interview ready</span> — strong; keep it warm.</li>
          <li><span className="font-semibold text-amber-700">Practice under time</span> — solid, needs timed reps.</li>
          <li><span className="font-semibold text-rose-700">Refresh first</span> — revisit fundamentals before drills.</li>
        </ul>
      </section>

      <div className="grid gap-3" data-testid="diagnostic-sections">
        {view.sections.map((section, index) => (
          <article key={section.id} className="grid gap-2 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm" data-testid="diagnostic-section" data-section-id={section.id}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900">{index + 1}. {section.title}</h3>
              <span className="text-xs font-medium text-slate-600">~{section.estimatedMinutes} min</span>
            </div>
            <p className="text-sm text-slate-700">Problem: {section.sourceTitle}</p>
            <div className="flex flex-wrap gap-1">
              {section.dimensionLabels.map((dimension) => <span key={dimension} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900">{dimension}</span>)}
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
        <DiagnosticRetakeForm
          sections={diagnosticSections.map((section) => ({ id: section.id, title: section.title }))}
          initialScores={initialScores}
          authenticated={authenticated}
          lastCompletedAt={history[0]?.completedAt ?? null}
        />
      </section>

      {resultView.hasScores ? (
        <section className="grid gap-3" data-testid="diagnostic-result-plan">
          <div>
            <h2 className="text-lg font-black text-slate-900">Saved result plan</h2>
            <p className="text-sm text-slate-600">
              This plan uses only diagnostic evidence. It does not mark skills mastered, edit FSRS cards, or lock other cppFan content.
            </p>
          </div>

          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white/85 p-4">
            <h3 className="font-bold text-slate-900">Pattern heat map</h3>
            <div className="grid gap-2">
              {resultView.heatMap.map((entry) => (
                <div key={entry.sectionId} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-center" data-testid="diagnostic-heatmap-row">
                  <span className="text-sm font-semibold text-slate-800">{entry.title}</span>
                  <span className="text-sm font-bold text-blue-800">
                    {Math.round(entry.score * 100)}% - {levelLabel(entry.level)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ol className="grid gap-3">
            {resultView.plan.map((week) => (
              <li key={`${week.week}-${week.sectionId}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm" data-testid="diagnostic-plan-week">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-black text-slate-900">Week {week.week}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{levelLabel(week.level)}</span>
                </div>
                <p className="text-sm text-slate-700">{week.reason}</p>
                {week.problemTitles.length > 0 ? (
                  <p className="text-sm text-slate-600">
                    Catalog options: <span className="font-semibold text-slate-800">{week.problemTitles.slice(0, 3).join(", ")}</span>
                  </p>
                ) : null}
                <div className="grid gap-1">
                  <Link href={week.nextStep.href} className="font-bold text-blue-700" data-testid="diagnostic-plan-link">
                    {week.nextStep.label}
                  </Link>
                  <p className="text-sm text-slate-600">{week.nextStep.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="grid gap-3" data-testid="diagnostic-history">
        <div>
          <h2 className="text-lg font-black text-slate-900">Retake history</h2>
          <p className="text-sm text-slate-600">Each saved attempt remains separate so improvement is not hidden by overwriting the baseline.</p>
        </div>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm text-slate-600" data-testid="diagnostic-history-empty">No saved attempts yet.</p>
        ) : (
          <ol className="grid gap-2">
            {history.map((attempt, index) => {
              const score = average(attempt.scores);
              return (
                <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/85 p-4" data-testid="diagnostic-history-attempt">
                  <span className="font-semibold text-slate-800">{index === history.length - 1 ? "Baseline" : `Retake ${history.length - index - 1}`}</span>
                  <span className="text-sm text-slate-600">{new Date(attempt.completedAt).toLocaleDateString()}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-900">{score === null ? "No score" : `${Math.round(score * 100)}% average`}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <p className="text-sm text-slate-600">
        Configure the separate <Link href="/interview/target" className="font-bold text-blue-700">Staff systems interview target</Link> without changing your ordinary cppFan experience level.
      </p>
    </main>
  );
}
