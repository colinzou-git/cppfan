"use client";

import type { CodeTagClassification } from "./code-error-tags";

const SOURCE_LABELS: Record<CodeTagClassification["source"], string> = {
  compiler: "compiler",
  runtime: "runtime",
  test: "test",
  ai: "AI"
};

/**
 * Shows deterministic error-tag classifications (#412) for a run/test attempt.
 * These come from real compiler/runtime/test output (not AI), so they are framed
 * as detected — distinct from the advisory AI feedback panel.
 */
export function CodeErrorTagPanel({
  classifications
}: {
  classifications?: CodeTagClassification[];
}) {
  if (!classifications || classifications.length === 0) return null;

  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2"
      data-testid="code-error-tags"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Likely issue detected</p>
      <ul className="flex flex-col gap-1.5">
        {classifications.map((item) => (
          <li key={`${item.source}:${item.tag}`} className="text-xs text-slate-700">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
                {item.tag}
              </span>
              <span className="text-slate-500">
                source: {SOURCE_LABELS[item.source]} · confidence: {item.confidence}
              </span>
            </span>
            <span className="mt-0.5 block">{item.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
