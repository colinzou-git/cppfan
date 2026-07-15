"use client";

import { LESSON_LIMITS, type LessonChoice, type LessonReviewCard } from "./user-content-types";
import { ChoicesEditor } from "./choices-editor";

/**
 * Manual authoring for supplementary review questions (#487). Each card is a
 * multiple-choice question that, on publish, becomes an independent FSRS card
 * mapped to the lesson's owner skill — so a prose lesson can still carry
 * spaced-repetition practice. Answers stay in the authoring payload.
 */
export function ReviewCardsEditor({
  cards,
  onChange
}: {
  cards: LessonReviewCard[];
  onChange: (next: LessonReviewCard[]) => void;
}) {
  function setPrompt(index: number, prompt: string) {
    onChange(cards.map((card, i) => (i === index ? { ...card, prompt } : card)));
  }
  function setChoices(index: number, choices: LessonChoice[]) {
    onChange(cards.map((card, i) => (i === index ? { ...card, choices } : card)));
  }
  function setExplanation(index: number, explanation: string) {
    onChange(cards.map((card, i) => (i === index ? { ...card, explanation } : card)));
  }
  function remove(index: number) {
    onChange(cards.filter((_, i) => i !== index));
  }
  function add() {
    if (cards.length < LESSON_LIMITS.maxReviewCards) {
      onChange([...cards, { prompt: "", choices: [] }]);
    }
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-purple-200 bg-purple-50/50 p-4">
      <div className="text-sm font-bold text-purple-900">Review questions</div>
      <p className="text-xs text-slate-500">Optional. Each becomes its own spaced-repetition card once published.</p>
      {cards.map((card, index) => (
        <div key={index} className="grid gap-2 rounded-xl border border-white bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500">Question {index + 1}</span>
            <button
              type="button"
              className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700 hover:border-rose-300"
              onClick={() => remove(index)}
              aria-label={`Remove question ${index + 1}`}
            >
              Remove
            </button>
          </div>
          <input
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-sm"
            value={card.prompt}
            onChange={(e) => setPrompt(index, e.target.value)}
            placeholder="Question prompt"
            aria-label={`Question ${index + 1} prompt`}
          />
          <ChoicesEditor choices={card.choices} onChange={(choices) => setChoices(index, choices)} />
          <input
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-sm"
            value={card.explanation ?? ""}
            onChange={(e) => setExplanation(index, e.target.value)}
            placeholder="Explanation (optional)"
            aria-label={`Question ${index + 1} explanation`}
          />
        </div>
      ))}
      <div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50"
          onClick={add}
          disabled={cards.length >= LESSON_LIMITS.maxReviewCards}
        >
          Add question
        </button>
      </div>
    </div>
  );
}
