import Link from "next/link";
import { Compass } from "lucide-react";
import {
  getBaselineComparison,
  getReadinessAssistance,
  getReadinessFacets,
  getReadinessInputs,
  getReadinessTiming
} from "@/features/interview/readiness-store";
import type { AssistanceBand } from "@/features/interview/interview-assistance";
import { hasComparableArea, type AreaTrend } from "@/features/interview/interview-baseline";
import { buildReadinessReport, completionGate, type ReadinessStatus } from "@/features/interview/readiness-report";
import type { DimensionStatus, ReadinessDimension } from "@/features/interview/readiness";
import type { ScoreBand } from "@/features/interview/rubric";

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

const BAND_STYLE: Record<ScoreBand, string> = {
  strong: "bg-emerald-100 text-emerald-800",
  solid: "bg-blue-100 text-blue-800",
  developing: "bg-amber-100 text-amber-800",
  needs_work: "bg-rose-100 text-rose-800"
};

const ASSIST_STYLE: Record<AssistanceBand, string> = {
  independent: "bg-emerald-100 text-emerald-800",
  light: "bg-amber-100 text-amber-800",
  reliant: "bg-rose-100 text-rose-800"
};

const ASSIST_LABEL: Record<AssistanceBand, string> = {
  independent: "Mostly independent",
  light: "Some hint use",
  reliant: "Hint-reliant"
};

const TREND_STYLE: Record<AreaTrend, string> = {
  improved: "bg-emerald-100 text-emerald-800",
  steady: "bg-blue-100 text-blue-800",
  declined: "bg-rose-100 text-rose-800",
  unknown: "bg-slate-100 text-slate-600"
};

const TREND_LABEL: Record<AreaTrend, string> = {
  improved: "Improved",
  steady: "Steady",
  declined: "Declined",
  unknown: "No comparison yet"
};

function pct(score: number | null): string {
  return score === null ? "—" : `${Math.round(score * 100)}%`;
}

const BAND_LABEL: Record<ScoreBand, string> = {
  strong: "Strong",
  solid: "Solid",
  developing: "Developing",
  needs_work: "Needs work"
};

export default async function InterviewReadinessPage() {
  const now = Date.now();
  const { evidence, mocksCompleted, quality } = await getReadinessInputs(now);
  const report = buildReadinessReport(evidence, mocksCompleted, quality, { now });
  const dimensions = Object.keys(report.dimensions) as ReadinessDimension[];
  const facets = await getReadinessFacets();
  const timing = await getReadinessTiming(now);
  const assistance = await getReadinessAssistance(now);
  const gate = completionGate(report);
  const baseline = await getBaselineComparison(now);

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

      <section
        className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"
        data-testid="readiness-gate"
        data-gate-ready={gate.ready}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${gate.ready ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}
          >
            {gate.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          The coding-rounds gate requires every condition below within the recent window. It reflects
          your practice evidence only — not an endorsement or a prediction of any hiring decision.
        </p>
        <ul className="mt-2 grid gap-1">
          {gate.conditions.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 text-sm"
              data-testid="readiness-gate-condition"
              data-condition-id={c.id}
              data-met={c.met}
            >
              <span className={c.met ? "text-emerald-700" : "text-slate-600"} aria-hidden="true">
                {c.met ? "✓" : "○"}
              </span>
              <span className="text-slate-700">{c.label}</span>
              <span className="sr-only">{c.met ? "met" : "not met"}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-2" data-testid="readiness-baseline">
        <h2 className="text-lg font-black text-slate-900">Baseline vs current</h2>
        {!hasComparableArea(baseline) ? (
          <p className="text-sm text-slate-600" data-testid="readiness-baseline-empty">
            Rate your{" "}
            <Link href="/interview/diagnostic" className="font-bold text-blue-700">
              baseline diagnostic
            </Link>{" "}
            and log outcomes in each area to see how your current performance compares.
          </p>
        ) : (
          <div className="grid gap-2">
            {baseline.map((area) => (
              <div
                key={area.sectionId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm"
                data-testid="readiness-baseline-area"
                data-section-id={area.sectionId}
                data-trend={area.trend}
              >
                <span className="min-w-0 flex-1 font-semibold text-slate-800">{area.title}</span>
                <span className="text-xs font-medium text-slate-600">
                  baseline {pct(area.baselineScore)} → now {pct(area.currentScore)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${TREND_STYLE[area.trend]}`}>
                  {TREND_LABEL[area.trend]}
                </span>
              </div>
            ))}
          </div>
        )}
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

      <section className="grid gap-2" data-testid="readiness-facets">
        <h2 className="text-lg font-black text-slate-900">Skill facets</h2>
        <p className="text-sm text-slate-600">
          Self-rated detail from your{" "}
          <Link href="/interview/rubric" className="font-bold text-blue-700">
            rubric review
          </Link>
          . These inform — but do not gate — the verdict above.
        </p>
        <div className="grid gap-2">
          {facets.map((facet) => (
            <div
              key={facet.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm"
              data-testid="readiness-facet"
              data-facet-id={facet.id}
              data-facet-band={facet.band ?? "unrated"}
            >
              <span className="font-semibold text-slate-800">{facet.label}</span>
              {facet.band ? (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${BAND_STYLE[facet.band]}`}>
                  {BAND_LABEL[facet.band]}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                  Not rated
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-2" data-testid="readiness-timing">
        <h2 className="text-lg font-black text-slate-900">Timing breakdown</h2>
        {timing.approachSamples === 0 && timing.implementationSamples === 0 ? (
          <p className="text-sm text-slate-600" data-testid="readiness-timing-empty">
            No session timings logged yet — add minutes-to-approach / minutes-to-working-code when you{" "}
            <Link href="/interview/log" className="font-bold text-blue-700">
              log an outcome
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
              data-testid="readiness-timing-approach"
            >
              Median to approach:{" "}
              {timing.approachMedianMinutes === null ? "—" : `${timing.approachMedianMinutes} min`}
              {timing.approachSamples > 0 ? ` (${timing.approachSamples})` : ""}
            </span>
            <span
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
              data-testid="readiness-timing-impl"
            >
              Median to working code:{" "}
              {timing.implementationMedianMinutes === null ? "—" : `${timing.implementationMedianMinutes} min`}
              {timing.implementationSamples > 0 ? ` (${timing.implementationSamples})` : ""}
            </span>
          </div>
        )}
      </section>

      <section className="grid gap-2" data-testid="readiness-assistance">
        <h2 className="text-lg font-black text-slate-900">Assistance dependence</h2>
        {assistance.recentSolves === 0 || assistance.band === null ? (
          <p className="text-sm text-slate-600" data-testid="readiness-assistance-empty">
            No solved outcomes logged yet — independent (unhinted) solves are the strongest readiness
            signal.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2" data-band={assistance.band}>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${ASSIST_STYLE[assistance.band]}`}>
              {ASSIST_LABEL[assistance.band]}
            </span>
            <span className="text-sm text-slate-700" data-testid="readiness-assistance-counts">
              {assistance.independentSolves} of {assistance.recentSolves} recent solves were independent
              {assistance.hintedSolves > 0 ? ` (${assistance.hintedSolves} used hints)` : ""}.
            </span>
          </div>
        )}
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
