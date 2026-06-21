"use client";

import type { CodeRunResult } from "./code-lab-types";
import { CodeErrorTagPanel } from "./code-error-tag-panel";

const STATUS_LABELS: Record<CodeRunResult["status"], string> = {
  success: "Ran successfully",
  compile_error: "Compile error",
  runtime_error: "Runtime error",
  timeout: "Timed out",
  runner_error: "Runner error",
  runner_unconfigured: "Runner unavailable"
};

export function CodeOutputPanel({ result }: { result: CodeRunResult | null }) {
  if (!result) return null;

  const isError =
    result.status !== "success" && result.status !== "runner_unconfigured";

  return (
    <section
      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
      data-testid="code-output"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            isError ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
          }`}
        >
          {STATUS_LABELS[result.status]}
        </span>
        {result.simulated ? (
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            Simulated runner
          </span>
        ) : null}
        {result.durationMs !== null ? (
          <span className="text-xs text-slate-500">{result.durationMs} ms</span>
        ) : null}
      </div>

      {result.note ? <p className="text-xs text-slate-600">{result.note}</p> : null}

      {result.compileOutput ? (
        <OutputBlock title="Compiler output" text={result.compileOutput} tone="error" />
      ) : null}
      {result.stdout ? <OutputBlock title="Output (stdout)" text={result.stdout} /> : null}
      {result.stderr ? <OutputBlock title="Errors (stderr)" text={result.stderr} tone="error" /> : null}
      {!result.compileOutput && !result.stdout && !result.stderr ? (
        <p className="text-xs text-slate-500">No output was produced.</p>
      ) : null}

      <CodeErrorTagPanel classifications={result.classifications} />
    </section>
  );
}

function OutputBlock({
  title,
  text,
  tone = "normal"
}: {
  title: string;
  text: string;
  tone?: "normal" | "error";
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</span>
      <pre
        className={`max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-lg border p-2 text-xs ${
          tone === "error"
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-slate-200 bg-white text-slate-800"
        }`}
      >
        {text}
      </pre>
    </div>
  );
}
