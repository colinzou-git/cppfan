import type { SessionReviewSummary } from "./session-review";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs.toString().padStart(2, "0")}s` : `${secs}s`;
}

/**
 * Completed-session review surface (#179): a per-phase timeline, the test/judge
 * summary, code-iteration count, and time-budget standing. Presentational and
 * deterministic — it renders the pure summarizeSessionReview payload only.
 */
export function SessionReview({ summary }: { summary: SessionReviewSummary }) {
  const { testSummary } = summary;
  return (
    <section
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"
      aria-labelledby="session-review-heading"
      data-testid="session-review"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="session-review-heading" className="text-sm font-black text-slate-900">
          Session review
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            summary.withinBudget ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          }`}
          data-testid="session-review-budget"
        >
          {formatDuration(summary.elapsedSeconds)} / {formatDuration(summary.budgetSeconds)}
          {summary.withinBudget ? " · within budget" : " · over budget"}
        </span>
      </div>

      <div className="grid gap-1" data-testid="session-review-timeline">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Time by phase</p>
        {summary.totalPhaseSeconds === 0 ? (
          <p className="text-sm text-slate-600">No per-phase time was logged for this session.</p>
        ) : (
          summary.timeline
            .filter((entry) => entry.seconds > 0)
            .map((entry) => (
              <div key={entry.phase} className="flex items-center gap-2" data-phase={entry.phase}>
                <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">{entry.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      entry.phase === summary.busiestPhase ? "bg-blue-600" : "bg-blue-300"
                    }`}
                    style={{ width: `${Math.round(entry.share * 100)}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-600">
                  {formatDuration(entry.seconds)}
                </span>
              </div>
            ))
        )}
      </div>

      <div className="grid gap-1" data-testid="session-review-tests">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tests</p>
        {testSummary.attempted ? (
          <p className="text-sm text-slate-800">
            {testSummary.compiled ? "Compiled" : "Did not compile"}
            {testSummary.compiled
              ? ` · visible ${testSummary.visiblePassed}/${testSummary.visibleTotal} · hidden ${testSummary.hiddenPassed}/${testSummary.hiddenTotal}`
              : ""}
            {testSummary.allPassed ? " · all tests passed" : testSummary.compiled ? " · some tests failed" : ""}
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            No judge run recorded. Queue a judge run to validate against the hidden tests.
          </p>
        )}
        {testSummary.notes ? (
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Your test notes:</span> {testSummary.notes}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
        <span data-testid="session-review-revisions">Code revisions: {summary.codeRevisionCount}</span>
        <span>Final draft: {summary.codeBytes} bytes</span>
      </div>
    </section>
  );
}
