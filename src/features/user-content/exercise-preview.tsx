import { FormattedContent } from "@/features/learning-items/formatted-content";
import { ContentSourceBadge } from "./content-source-badge";
import type { ExercisePayload } from "./exercise-content-types";

/**
 * Renders an exercise payload as a learner would see it (#488): prompt, code
 * contract, starter code, examples, and VISIBLE tests only. Reference solution,
 * solution explanation, and hidden tests are gated behind an author-only
 * disclosure and never rendered on the learner path.
 */
export function ExercisePreview({ payload, status }: { payload: ExercisePayload; status: string }) {
  const visibleTests = (payload.tests ?? []).filter((t) => !t.hidden);
  const hiddenCount = (payload.tests ?? []).length - visibleTests.length;
  const meta = [payload.mode, payload.evaluationMode, payload.difficulty, payload.estimatedMinutes ? `${payload.estimatedMinutes} min` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="grid gap-5 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ContentSourceBadge source="user" />
          <span className="text-xs font-semibold text-slate-500">exercise · {status}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950">{payload.title || "Untitled exercise"}</h1>
        {meta ? <p className="text-sm font-semibold text-slate-500">{meta}</p> : null}
        {payload.tags && payload.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {payload.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {payload.prompt ? <FormattedContent content={payload.prompt} /> : null}

      {payload.mode === "function" ? (
        payload.functionSignature ? (
          <section className="grid gap-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Function signature</h2>
            <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm">{payload.functionSignature}</pre>
          </section>
        ) : null
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {payload.stdinFormat ? (
            <section className="grid gap-1">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Input</h2>
              <p className="text-sm text-slate-700">{payload.stdinFormat}</p>
            </section>
          ) : null}
          {payload.stdoutFormat ? (
            <section className="grid gap-1">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Output</h2>
              <p className="text-sm text-slate-700">{payload.stdoutFormat}</p>
            </section>
          ) : null}
        </div>
      )}

      {payload.starterCode ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Starter code</h2>
          <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm">{payload.starterCode}</pre>
        </section>
      ) : null}

      {payload.examples && payload.examples.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-lg font-bold text-slate-900">Examples</h2>
          {payload.examples.map((example, i) => (
            <div key={i} className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <div><span className="font-semibold text-slate-600">Input:</span> <code>{example.input}</code></div>
              <div><span className="font-semibold text-slate-600">Output:</span> <code>{example.output}</code></div>
              {example.note ? <div className="text-slate-500">{example.note}</div> : null}
            </div>
          ))}
        </section>
      ) : null}

      {visibleTests.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-lg font-bold text-slate-900">Sample tests</h2>
          <ul className="grid gap-1.5">
            {visibleTests.map((test, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <span className="font-semibold text-slate-700">{test.name}</span>
                <div className="mt-1 grid gap-0.5 font-mono text-xs text-slate-600">
                  <div>in: {test.input || "(none)"}</div>
                  <div>out: {test.expectedOutput || "(none)"}</div>
                </div>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 ? <p className="text-xs text-slate-400">+ {hiddenCount} hidden test(s) run on submission.</p> : null}
        </section>
      ) : null}

      {payload.referenceSolution || payload.solutionExplanation ? (
        <details className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <summary className="cursor-pointer text-sm font-bold text-amber-800">Show reference (author preview — hidden from learners)</summary>
          {payload.referenceSolution ? (
            <pre className="mt-2 overflow-x-auto rounded-xl border border-amber-200 bg-white p-3 font-mono text-sm">{payload.referenceSolution}</pre>
          ) : null}
          {payload.solutionExplanation ? <p className="mt-2 text-sm text-slate-700">{payload.solutionExplanation}</p> : null}
        </details>
      ) : null}
    </article>
  );
}
