import Link from "next/link";
import { Compass } from "lucide-react";
import { getReadinessInputs } from "@/features/interview/readiness-store";
import { buildReadinessReport, type ReadinessStatus } from "@/features/interview/readiness-report";
import type { DimensionStatus, ReadinessDimension } from "@/features/interview/readiness";

export const metadata = {
  title: "Interview readiness — cppFan"
};

const STATUS_LABEL: Record<ReadinessStatus, string> = {
  not_assessed: "Not assessed yet",
  refreshing_fundamentals: "Refreshing fundamentals",
  independent_but_inconsistent: "Independent but inconsistent",
  mock_ready: "Mock ready",
  interview_ready: "Interview ready"
};

const STATUS_STYLE: Record<ReadinessStatus, string> = {
  not_assessed: "bg-slate-100 text-slate-700",
  refreshing_fundamentals: "bg-rose-100 text-rose-800",
  independent_but_inconsistent: "bg-amber-100 text-amber-800",
  mock_ready: "bg-blue-100 text-blue-800",
  interview_ready: "bg-emerald-100 text-emerald-800"
};

const DIMENSION_LABEL: Record<ReadinessDimension, string> = {
  core_pattern_coverage: "Core pattern coverage",
  unseen_problem_success: "Unseen-problem success",
  no_critical_weak_cluster: "No critical weak cluster",
  mock_sessions: "Completed mock sessions",
  quality_scores: "Quality (testing / complexity / communication)",
  not_single_session: "Consistency across sessions"
};

const DIMENSION_STYLE: Record<DimensionStatus, string> = {
  met: "bg-emerald-100 text-emerald-800",
  unmet: "bg-rose-100 text-rose-800",
  not_enough_evidence: "bg-slate-100 text-slate-600"
};

const DIMENSION_STATUS_LABEL: Record<DimensionStatus, string> = {
  met: "Met",
  unmet: "Not met",
  not_enough_evidence: "Not enough evidence"
};

export default async function InterviewReadinessPage() {
  const now = Date.now();
  const { evidence, mocksCompleted, quality } = await getReadinessInputs(now);
  const report = buildReadinessReport(evidence, mocksCompleted, quality, { now });
  const dimensions = Object.keys(report.dimensions) as ReadinessDimension[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <Link href="/interview" className="text-sm font-bold text-blue-700">
          ← Interview practice
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <Compass className="h-7 w-7 text-blue-700" />
          Interview readiness
        </h1>
        <p className="mt-1 text-slate-600">
          Readiness is reported per dimension — not a single pass/fail. It depends on recent
          independent transfer to unseen problems and completed mocks, never on how many problems you
          have done.
        </p>
      </header>

      <section
        className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"
        data-testid="readiness-status"
        data-status={report.status}
        data-verdict={report.verdict}
      >
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${STATUS_STYLE[report.status]}`}>
          {STATUS_LABEL[report.status]}
        </span>
        {report.verdict === "not_enough_evidence" ? (
          <p className="mt-3 text-sm text-slate-700" data-testid="readiness-not-enough">
            Not enough recent interview evidence to judge yet. Complete independent, timed, and mock
            sessions on unseen problems to build a readiness picture. Your self-review quality is shown
            below as it accrues.
          </p>
        ) : null}
        {report.evidenceStale ? (
          <p className="mt-3 text-sm text-amber-700">
            Your recent evidence is getting stale — fresh independent practice keeps this current.
          </p>
        ) : null}
      </section>

      <section className="grid gap-2" data-testid="readiness-dimensions">
        <h2 className="text-lg font-black text-slate-900">By dimension</h2>
        <div className="grid gap-2">
          {dimensions.map((dimension) => {
            const status = report.dimensions[dimension];
            return (
              <div
                key={dimension}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm"
                data-testid="readiness-dimension"
                data-dimension-id={dimension}
                data-dimension-status={status}
              >
                <span className="font-semibold text-slate-800">{DIMENSION_LABEL[dimension]}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${DIMENSION_STYLE[status]}`}>
                  {DIMENSION_STATUS_LABEL[status]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {report.reasons.length > 0 ? (
        <section className="grid gap-2" data-testid="readiness-reasons">
          <h2 className="text-lg font-black text-slate-900">What this means</h2>
          <ul className="grid gap-1 text-sm text-slate-700">
            {report.reasons.map((reason) => (
              <li key={reason} className="rounded-lg bg-slate-50 px-3 py-2">
                {reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-xs font-medium text-slate-500" data-testid="readiness-disclaimer">
        {report.disclaimer}
      </p>
    </main>
  );
}
