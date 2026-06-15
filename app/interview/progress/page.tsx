import Link from "next/link";
import { LineChart } from "lucide-react";
import { getProgressView } from "@/features/interview/interview-progress-store";
import type { ReadinessDimension } from "@/features/interview/readiness";

export const metadata = {
  title: "Interview progress — cppFan"
};

const DIMENSION_LABEL: Record<ReadinessDimension, string> = {
  core_pattern_coverage: "Core pattern coverage",
  unseen_problem_success: "Unseen-problem success",
  no_critical_weak_cluster: "Critical weak cluster",
  mock_sessions: "Completed mock sessions",
  quality_scores: "Testing / complexity / communication",
  not_single_session: "Consistency across sessions"
};

function formatRate(rate: number | null): string {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

export default async function InterviewProgressPage() {
  const view = await getProgressView();
  const hasEvidence = view.summary.totalAttempts > 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <Link href="/interview" className="text-sm font-bold text-blue-700">
          ← Interview practice
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <LineChart className="h-7 w-7 text-blue-700" />
          Weekly progress
        </h1>
        <p className="mt-1 text-slate-600">
          Your trailing weeks of interview practice. Progress is measured by independent transfer to
          unseen problems and mock days — not how many problems you have done.
        </p>
      </header>

      <section className="grid gap-2" data-testid="progress-weakest">
        <h2 className="text-lg font-black text-slate-900">Weakest dimensions to target</h2>
        {view.verdict === "not_enough_evidence" || view.weakest.length === 0 ? (
          <p className="text-sm text-slate-600" data-testid="progress-weakest-none">
            {view.verdict === "not_enough_evidence"
              ? "Not enough evidence yet — log a few independent and mock outcomes to see your weakest areas."
              : "No unmet dimensions right now — keep your strengths warm."}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {view.weakest.map((dimension) => (
              <span
                key={dimension}
                className="rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-800"
                data-testid="progress-weakest-item"
                data-dimension-id={dimension}
              >
                {DIMENSION_LABEL[dimension]}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-2" data-testid="progress-weeks">
        <h2 className="text-lg font-black text-slate-900">Week by week</h2>
        {!hasEvidence ? (
          <p className="text-sm text-slate-600" data-testid="progress-empty">
            No logged outcomes in the recent window yet.{" "}
            <Link href="/interview/log" className="font-bold text-blue-700">
              Log a practice outcome
            </Link>{" "}
            to start your history.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Week</th>
                  <th className="py-2 pr-3 font-semibold">Attempts</th>
                  <th className="py-2 pr-3 font-semibold">Indep. unseen</th>
                  <th className="py-2 pr-3 font-semibold">Mock days</th>
                  <th className="py-2 font-semibold">Correct</th>
                </tr>
              </thead>
              <tbody>
                {view.summary.weeks.map((week) => (
                  <tr
                    key={week.weekIndex}
                    className="border-t border-slate-200"
                    data-testid="progress-week-row"
                    data-week-index={week.weekIndex}
                  >
                    <td className="py-2 pr-3 font-semibold text-slate-800">{week.label}</td>
                    <td className="py-2 pr-3 text-slate-700">{week.attempts}</td>
                    <td className="py-2 pr-3 text-slate-700">{week.independentUnseenSuccesses}</td>
                    <td className="py-2 pr-3 text-slate-700">{week.mockDays}</td>
                    <td className="py-2 text-slate-700">{formatRate(week.correctRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs font-medium text-slate-500" data-testid="progress-totals">
        {view.summary.totalIndependentUnseenSuccesses} distinct unseen problem
        {view.summary.totalIndependentUnseenSuccesses === 1 ? "" : "s"} solved independently across the
        last {view.weeks} weeks.
      </p>
    </main>
  );
}
