"use client";

import { LESSON_LIMITS, type LessonParsonsBlock } from "./user-content-types";

/**
 * Recompute correctOrder from list position: solution blocks are numbered 1..n
 * in their current order; distractors get 0. Keeps the stored order consistent
 * with what the author sees, so reordering the list is the single source of
 * truth for the solution sequence.
 */
export function normalizeParsonsOrder(blocks: LessonParsonsBlock[]): LessonParsonsBlock[] {
  let order = 0;
  return blocks.map((block) => {
    if (block.isDistractor) {
      return { ...block, correctOrder: 0 };
    }
    order += 1;
    return { ...block, correctOrder: order };
  });
}

/**
 * Manual authoring for Parsons blocks (#487). Solution lines are ordered with
 * move up/down; distractors are marked and excluded from the solution sequence.
 * Publish-time validation requires >=2 solution blocks.
 */
export function ParsonsEditor({
  blocks,
  onChange
}: {
  blocks: LessonParsonsBlock[];
  onChange: (next: LessonParsonsBlock[]) => void;
}) {
  function update(next: LessonParsonsBlock[]) {
    onChange(normalizeParsonsOrder(next));
  }
  function setText(index: number, text: string) {
    update(blocks.map((block, i) => (i === index ? { ...block, text } : block)));
  }
  function toggleDistractor(index: number) {
    update(blocks.map((block, i) => (i === index ? { ...block, isDistractor: !block.isDistractor } : block)));
  }
  function remove(index: number) {
    update(blocks.filter((_, i) => i !== index));
  }
  function add() {
    if (blocks.length < LESSON_LIMITS.maxParsonsBlocks) {
      update([...blocks, { text: "", correctOrder: 0, isDistractor: false }]);
    }
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) {
      return;
    }
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  }

  return (
    <div className="grid gap-2 rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
      <div className="text-sm font-bold text-teal-900">Parsons blocks</div>
      {blocks.length === 0 ? (
        <p className="text-xs text-slate-500">Add the solution lines in order; mark any distractor lines.</p>
      ) : (
        <ul className="grid gap-2">
          {blocks.map((block, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs font-bold text-slate-500">
                {block.isDistractor ? "distractor" : `#${block.correctOrder}`}
              </span>
              <input
                className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1 font-mono text-sm"
                value={block.text}
                onChange={(e) => setText(index, e.target.value)}
                placeholder={`Line ${index + 1}`}
                aria-label={`Block ${index + 1} text`}
              />
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={block.isDistractor}
                  onChange={() => toggleDistractor(index)}
                  aria-label={`Block ${index + 1} is a distractor`}
                />
                distractor
              </label>
              <button type="button" className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-40" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move block ${index + 1} up`}>↑</button>
              <button type="button" className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-40" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label={`Move block ${index + 1} down`}>↓</button>
              <button type="button" className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700" onClick={() => remove(index)} aria-label={`Remove block ${index + 1}`}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      <div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50"
          onClick={add}
          disabled={blocks.length >= LESSON_LIMITS.maxParsonsBlocks}
        >
          Add block
        </button>
      </div>
    </div>
  );
}
