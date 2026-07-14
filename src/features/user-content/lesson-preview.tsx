import { FormattedContent } from "@/features/learning-items/formatted-content";
import { ContentSourceBadge } from "./content-source-badge";
import type { LessonPayload, LessonSections } from "./user-content-types";

const SECTION_LABELS: Array<[keyof LessonSections, string]> = [
  ["introduction", "Introduction"],
  ["syntax", "Syntax"],
  ["examples", "Examples"],
  ["commonMistakes", "Common mistakes"],
  ["bestPractices", "Best practices"],
  ["practice", "Practice"],
  ["summary", "Summary"],
  ["furtherReading", "Further reading"]
];

// Item types where the explanation is instructional (shown inline) rather than
// an answer key. Mirrors the learner-page policy in learning-item-view.
const EXPLANATION_INLINE = new Set(["lesson", "worked_example"]);

/**
 * Renders a lesson payload as a learner would see the published page (#487):
 * prose, structured sections, examples, and any choices — without revealing
 * which choice is correct. For graded item types the explanation (which can
 * contain the answer) is gated behind a disclosure marked as author-only.
 */
export function LessonPreview({ payload, status }: { payload: LessonPayload; status: string }) {
  const showExplanationInline = EXPLANATION_INLINE.has(payload.itemType);
  const meta = [payload.difficulty, payload.estimatedMinutes ? `${payload.estimatedMinutes} min` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="grid gap-5 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ContentSourceBadge source="user" />
          <span className="text-xs font-semibold text-slate-500">{payload.itemType} · {status}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950">{payload.title || "Untitled lesson"}</h1>
        {meta ? <p className="text-sm font-semibold text-slate-500">{meta}</p> : null}
        {payload.tags && payload.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {payload.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {payload.learningObjectives && payload.learningObjectives.length > 0 ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Learning objectives</h2>
          <ul className="list-disc pl-5 text-slate-800">
            {payload.learningObjectives.map((objective, i) => (
              <li key={i}>{objective}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {payload.content ? <FormattedContent content={payload.content} /> : null}

      {payload.sections
        ? SECTION_LABELS.map(([key, label]) => {
            const value = payload.sections?.[key];
            if (!value) {
              return null;
            }
            return (
              <section key={key} className="grid gap-2">
                <h2 className="text-lg font-bold text-slate-900">{label}</h2>
                <FormattedContent content={value} />
              </section>
            );
          })
        : null}

      {payload.examples && payload.examples.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-lg font-bold text-slate-900">Examples</h2>
          <div className="grid gap-2">
            {payload.examples.map((example, i) => (
              <div key={i} className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div><span className="font-semibold text-slate-600">Input:</span> <code>{example.input}</code></div>
                <div><span className="font-semibold text-slate-600">Output:</span> <code>{example.output}</code></div>
                {example.note ? <div className="text-slate-500">{example.note}</div> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {payload.choices && payload.choices.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-lg font-bold text-slate-900">Choices</h2>
          <ul className="grid gap-1.5">
            {payload.choices.map((choice, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800">
                {choice.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {payload.explanation ? (
        showExplanationInline ? (
          <section className="grid gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-700">Explanation</h2>
            <FormattedContent content={payload.explanation} />
          </section>
        ) : (
          <details className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <summary className="cursor-pointer text-sm font-bold text-amber-800">Show explanation (author preview — hidden from learners until answered)</summary>
            <div className="mt-2">
              <FormattedContent content={payload.explanation} />
            </div>
          </details>
        )
      ) : null}
    </article>
  );
}
