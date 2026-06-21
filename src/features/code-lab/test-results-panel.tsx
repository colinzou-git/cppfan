"use client";

import { Check, X } from "lucide-react";
import type { CodeTestResult } from "./code-lab-types";
import { CodeErrorTagPanel } from "./code-error-tag-panel";

export function TestResultsPanel({ result }: { result: CodeTestResult | null }) {
  if (!result) return null;

  if (result.status === "compile_error") {
    return (
      <section
        className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"
        data-testid="code-test-results"
      >
        <p className="text-sm font-bold text-amber-900">Tests did not run</p>
        <p className="text-xs text-amber-900">{result.note ?? "Your code did not compile."}</p>
        {result.compileOutput ? (
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-amber-200 bg-white p-2 text-xs text-amber-900">
            {result.compileOutput}
          </pre>
        ) : null}
        <CodeErrorTagPanel classifications={result.classifications} />
      </section>
    );
  }

  const allPassed = result.total > 0 && result.passed === result.total;

  return (
    <section
      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3"
      data-testid="code-test-results"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            allPassed ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
          }`}
          data-testid="code-test-summary"
        >
          {result.passed}/{result.total} tests passed
        </span>
        {result.simulated ? (
          <span className="text-xs text-slate-500">simulated runner</span>
        ) : null}
      </div>

      <ul className="flex flex-col gap-1">
        {result.visible.map((test) => (
          <li
            key={test.name}
            className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs"
            data-testid="code-test-case"
            data-passed={test.passed}
          >
            {test.passed ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <p className="font-bold text-slate-800">{test.name}</p>
              {!test.passed ? (
                <p className="mt-0.5 text-slate-600">
                  expected <code className="break-words">{JSON.stringify(test.expectedStdout ?? "")}</code>, got{" "}
                  <code className="break-words">{JSON.stringify(test.actualStdout ?? "")}</code>
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {result.hiddenTotal > 0 ? (
        <p className="text-xs text-slate-500" data-testid="code-hidden-summary">
          Hidden tests: {result.hiddenPassed}/{result.hiddenTotal} passed. Hidden inputs and expected
          outputs are not shown.
        </p>
      ) : null}

      <CodeErrorTagPanel classifications={result.classifications} />
    </section>
  );
}
