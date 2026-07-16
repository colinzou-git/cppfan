import { FormattedContent } from "@/features/learning-items/formatted-content";
import { ContentSourceBadge } from "./content-source-badge";
import type { InterviewProblemPayload } from "./interview-content-types";

/**
 * Renders an interview problem as a learner sees it under the FIXED reveal policy
 * (#490): statement + visible examples + constraints/complexity/clarifying
 * questions, and a hidden-test COUNT only. Hint ladder is shown here as an
 * author preview note (in real sessions hints are gated by mode). The reference
 * solution, hidden test I/O, and AI rubric are gated behind an author-only
 * disclosure and never rendered on the learner path.
 */
export function InterviewPreview({ payload, status }: { payload: InterviewProblemPayload; status: string }) {
  const visibleTests = (payload.tests ?? []).filter((t) => !t.hidden);
  const hiddenCount = (payload.tests ?? []).length - visibleTests.length;
  const meta = [payload.evaluationMode, payload.difficulty, payload.group, payload.roleRelevance]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="grid gap-5 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ContentSourceBadge source="user" />
          <span className="text-xs font-semibold text-slate-500">interview · {status}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950">{payload.title || "Untitled problem"}</h1>
        {meta ? <p className="text-sm font-semibold text-slate-500">{meta}</p> : null}
        {payload.patternTags && payload.patternTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {payload.patternTags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {payload.statement ? <FormattedContent content={payload.statement} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {payload.constraints ? (
          <section className="grid gap-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Constraints</h2>
            <p className="text-sm text-slate-700">{payload.constraints}</p>
          </section>
        ) : null}
        {payload.targetComplexity ? (
          <section className="grid gap-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Target complexity</h2>
            <p className="text-sm text-slate-700">{payload.targetComplexity}</p>
          </section>
        ) : null}
      </div>

      {payload.clarifyingQuestions && payload.clarifyingQuestions.length > 0 ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Clarifying questions</h2>
          <ul className="grid gap-1">
            {payload.clarifyingQuestions.map((q, i) => (
              <li key={i} className="text-sm text-slate-700">• {q}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {payload.visibleExamples && payload.visibleExamples.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-lg font-bold text-slate-900">Examples</h2>
          {payload.visibleExamples.map((example, i) => (
            <div key={i} className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <div><span className="font-semibold text-slate-600">Input:</span> <code>{example.input}</code></div>
              <div><span className="font-semibold text-slate-600">Output:</span> <code>{example.output}</code></div>
              {example.note ? <div className="text-slate-500">{example.note}</div> : null}
            </div>
          ))}
        </section>
      ) : null}

      {payload.starterCode ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Starter code</h2>
          <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm">{payload.starterCode}</pre>
        </section>
      ) : null}

      {visibleTests.length > 0 || hiddenCount > 0 ? (
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

      {payload.hintLadder && payload.hintLadder.length > 0 ? (
        <details className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Hint ladder ({payload.hintLadder.length}) — gated by session mode</summary>
          <ol className="mt-2 grid gap-1">
            {payload.hintLadder.map((hint, i) => (
              <li key={i} className="text-sm text-slate-700">{i + 1}. {hint}</li>
            ))}
          </ol>
        </details>
      ) : null}

      {payload.referenceSolution || payload.solutionExplanation || payload.aiRubric ? (
        <details className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <summary className="cursor-pointer text-sm font-bold text-amber-800">Show reference + rubric (author preview — hidden from learners before reveal)</summary>
          {payload.referenceSolution ? (
            <pre className="mt-2 overflow-x-auto rounded-xl border border-amber-200 bg-white p-3 font-mono text-sm">{payload.referenceSolution}</pre>
          ) : null}
          {payload.solutionExplanation ? <p className="mt-2 text-sm text-slate-700">{payload.solutionExplanation}</p> : null}
          {payload.aiRubric ? <p className="mt-2 text-sm text-slate-600"><span className="font-bold">AI rubric:</span> {payload.aiRubric}</p> : null}
        </details>
      ) : null}
    </article>
  );
}
