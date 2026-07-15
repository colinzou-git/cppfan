"use client";

import { LESSON_LIMITS, type LessonChoice } from "./user-content-types";

/**
 * Manual authoring for multiple-choice / concept-check options (#487). Each
 * choice has editable text and a "correct" toggle; the answer key stays in the
 * authoring payload and is stripped from the learner projection. Publication
 * validation (≥2 choices, ≥1 correct) is enforced separately at publish time.
 */
export function ChoicesEditor({
  choices,
  onChange
}: {
  choices: LessonChoice[];
  onChange: (next: LessonChoice[]) => void;
}) {
  function setText(index: number, text: string) {
    onChange(choices.map((choice, i) => (i === index ? { ...choice, text } : choice)));
  }
  function toggleCorrect(index: number) {
    onChange(choices.map((choice, i) => (i === index ? { ...choice, isCorrect: !choice.isCorrect } : choice)));
  }
  function remove(index: number) {
    onChange(choices.filter((_, i) => i !== index));
  }
  function add() {
    if (choices.length < LESSON_LIMITS.maxChoices) {
      onChange([...choices, { text: "", isCorrect: false }]);
    }
  }

  return (
    <div className="grid gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
      <div className="text-sm font-bold text-indigo-900">Choices</div>
      {choices.length === 0 ? (
        <p className="text-xs text-slate-500">Add at least two options and mark the correct one(s).</p>
      ) : (
        <ul className="grid gap-2">
          {choices.map((choice, index) => (
            <li key={index} className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={choice.isCorrect}
                  onChange={() => toggleCorrect(index)}
                  aria-label={`Choice ${index + 1} is correct`}
                />
                correct
              </label>
              <input
                className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-sm"
                value={choice.text}
                onChange={(e) => setText(index, e.target.value)}
                placeholder={`Choice ${index + 1}`}
                aria-label={`Choice ${index + 1} text`}
              />
              <button
                type="button"
                className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700 hover:border-rose-300"
                onClick={() => remove(index)}
                aria-label={`Remove choice ${index + 1}`}
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
          disabled={choices.length >= LESSON_LIMITS.maxChoices}
        >
          Add choice
        </button>
      </div>
    </div>
  );
}
