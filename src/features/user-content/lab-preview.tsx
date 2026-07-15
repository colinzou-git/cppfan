import { FormattedContent } from "@/features/learning-items/formatted-content";
import { ContentSourceBadge } from "./content-source-badge";
import type { LabPayload } from "./lab-content-types";

/**
 * Renders a lab payload as a learner would see it (#489): summary, task, starter
 * code, read-only fixtures, and the milestone list (title + instructions + a
 * required badge). Reference solution, design explanation, author notes, hidden
 * tests, and rubrics are gated behind an author-only disclosure and never shown
 * on the learner path.
 */
export function LabPreview({ payload, status }: { payload: LabPayload; status: string }) {
  const meta = [payload.mode === "single_task" ? "single task" : "milestones", payload.evaluationMode, payload.difficulty, payload.estimatedMinutes ? `${payload.estimatedMinutes} min` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="grid gap-5 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ContentSourceBadge source="user" />
          <span className="text-xs font-semibold text-slate-500">lab · {status}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950">{payload.title || "Untitled lab"}</h1>
        {payload.summary ? <p className="text-slate-700">{payload.summary}</p> : null}
        {meta ? <p className="text-sm font-semibold text-slate-500">{meta}</p> : null}
        {payload.tags && payload.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {payload.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {payload.taskDescription ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Task</h2>
          <FormattedContent content={payload.taskDescription} />
        </section>
      ) : null}

      {payload.starterCode ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Starter code ({payload.editableFilename ?? "main.cpp"})</h2>
          <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm">{payload.starterCode}</pre>
        </section>
      ) : null}

      {payload.fixtures && payload.fixtures.length > 0 ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Read-only fixtures</h2>
          <ul className="grid gap-1">
            {payload.fixtures.map((f) => (
              <li key={f.filename} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-600">{f.filename}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {payload.mode === "milestones" && payload.milestones && payload.milestones.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-lg font-bold text-slate-900">Milestones</h2>
          <ol className="grid gap-2">
            {payload.milestones.map((m, i) => (
              <li key={m.id} className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm" data-testid="lab-preview-milestone">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{i + 1}. {m.title}</span>
                  {m.required ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">required</span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">optional</span>
                  )}
                </div>
                {m.instructions ? <p className="text-slate-700">{m.instructions}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {payload.mode === "single_task" && payload.completion?.selfChecklist && payload.completion.selfChecklist.length > 0 ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Self-check</h2>
          <ul className="grid gap-1">
            {payload.completion.selfChecklist.map((item, i) => (
              <li key={i} className="text-sm text-slate-700">• {item}</li>
            ))}
          </ul>
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
