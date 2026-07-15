"use client";

import { LESSON_LIMITS, type LessonCompletionBlank } from "./user-content-types";

/** Renumber blanks 1..n by list order so position always matches the sequence. */
export function normalizeCompletionPositions(blanks: LessonCompletionBlank[]): LessonCompletionBlank[] {
  return blanks.map((blank, index) => ({ ...blank, position: index + 1 }));
}

/**
 * Manual authoring for completion blanks (#487): the ordered list of expected
 * answers. Positions are 1..n by order; publish-time validation requires
 * non-empty answers. The answers stay in the authoring payload (stripped from
 * the learner projection).
 */
export function CompletionEditor({
  blanks,
  onChange
}: {
  blanks: LessonCompletionBlank[];
  onChange: (next: LessonCompletionBlank[]) => void;
}) {
  function update(next: LessonCompletionBlank[]) {
    onChange(normalizeCompletionPositions(next));
  }
  function setAnswer(index: number, answer: string) {
    update(blanks.map((blank, i) => (i === index ? { ...blank, answer } : blank)));
  }
  function remove(index: number) {
    update(blanks.filter((_, i) => i !== index));
  }
  function add() {
    if (blanks.length < LESSON_LIMITS.maxCompletionBlanks) {
      update([...blanks, { position: 0, answer: "" }]);
    }
  }

  return (
    <div className="grid gap-2 rounded-2xl border border-fuchsia-200 bg-fuchsia-50/50 p-4">
      <div className="text-sm font-bold text-fuchsia-900">Completion answers</div>
      {blanks.length === 0 ? (
        <p className="text-xs text-slate-500">Add the expected answer for each blank, in order.</p>
      ) : (
        <ul className="grid gap-2">
          {blanks.map((blank, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-10 shrink-0 text-xs font-bold text-slate-500">#{blank.position}</span>
              <input
                className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1 font-mono text-sm"
                value={blank.answer}
                onChange={(e) => setAnswer(index, e.target.value)}
                placeholder={`Answer ${index + 1}`}
                aria-label={`Blank ${index + 1} answer`}
              />
              <button
                type="button"
                className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700 hover:border-rose-300"
                onClick={() => remove(index)}
                aria-label={`Remove blank ${index + 1}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50"
          onClick={add}
          disabled={blanks.length >= LESSON_LIMITS.maxCompletionBlanks}
        >
          Add answer
        </button>
      </div>
    </div>
  );
}
