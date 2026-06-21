"use client";

import type { CodeTraceResult } from "./code-trace-types";

/**
 * Renders the AI execution trace (#408). Every successful trace shows the
 * disclaimer that it is AI-generated and approximate; compiler output and test
 * results remain the source of truth. The layout is a compact step table that
 * collapses to stacked cards on narrow (phone) widths.
 */
export function AiTracePanel({
  trace,
  pending
}: {
  trace: CodeTraceResult | null;
  pending: boolean;
}) {
  if (pending) {
    return (
      <section
        className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900"
        data-testid="code-ai-trace"
        aria-live="polite"
      >
        Building an AI trace…
      </section>
    );
  }

  if (!trace) return null;

  if (trace.status !== "ok") {
    return (
      <section
        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
        data-testid="code-ai-trace"
        aria-live="polite"
      >
        {trace.message ?? "AI trace is unavailable."}
      </section>
    );
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-950"
      data-testid="code-ai-trace"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-violet-200 px-2.5 py-0.5 text-xs font-bold text-violet-800">
          AI trace
        </span>
        <span className="text-xs text-violet-700">confidence: {trace.confidence}</span>
      </div>

      {trace.inputSummary ? (
        <p>
          <span className="font-bold">Input: </span>
          {trace.inputSummary}
        </p>
      ) : null}
      {trace.codeSummary ? <p>{trace.codeSummary}</p> : null}

      {trace.steps.length > 0 ? (
        <ol className="flex flex-col gap-2" data-testid="trace-steps">
          {trace.steps.map((step) => (
            <li
              key={step.step}
              className="rounded-lg border border-violet-100 bg-white p-2 text-xs text-slate-800"
            >
              <div className="flex flex-wrap items-center gap-2 font-bold">
                <span>Step {step.step}</span>
                {step.lineHint ? (
                  <span className="font-normal text-slate-500">{step.lineHint}</span>
                ) : null}
              </div>
              {step.variables && Object.keys(step.variables).length > 0 ? (
                <p className="mt-1 font-mono text-[11px] text-slate-600">
                  {Object.entries(step.variables)
                    .map(([name, value]) => `${name}=${value}`)
                    .join(", ")}
                </p>
              ) : null}
              <p className="mt-1">{step.explanation}</p>
            </li>
          ))}
        </ol>
      ) : null}

      {trace.likelyIssue ? (
        <p>
          <span className="font-bold">Likely issue: </span>
          {trace.likelyIssue}
        </p>
      ) : null}
      {trace.nextHint ? (
        <p>
          <span className="font-bold">Next hint: </span>
          {trace.nextHint}
        </p>
      ) : null}
      {trace.relatedSkills && trace.relatedSkills.length > 0 ? (
        <p className="text-xs text-violet-800">
          <span className="font-bold">Related skills: </span>
          {trace.relatedSkills.join(", ")}
        </p>
      ) : null}

      <p className="text-xs text-violet-700" data-testid="trace-disclaimer">
        {trace.disclaimer}
      </p>
    </section>
  );
}
