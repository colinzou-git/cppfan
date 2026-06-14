"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { submitParsons } from "./parsons-actions";
import type { PublicParsonsBlock } from "./learning-item-types";

type Row = { block: PublicParsonsBlock; included: boolean };

type Feedback =
  | { kind: "correct" }
  | { kind: "partial"; correctCount: number; total: number }
  | { kind: "error" }
  | null;

/**
 * Accessible Parsons interaction (#124). The learner arranges the included lines
 * into the right order and excludes any distractor, then checks the structure.
 * Reordering uses explicit move-up / move-down buttons so keyboard and screen
 * reader users have a first-class path — drag is NOT required. Grading goes
 * through the server (submitParsons); only structural feedback is shown.
 */
export function ParsonsExercise({ itemId, blocks }: { itemId: string; blocks: PublicParsonsBlock[] }) {
  const [rows, setRows] = useState<Row[]>(() => blocks.map((block) => ({ block, included: true })));
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();

  function move(index: number, delta: number) {
    setFeedback(null);
    setRows((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleInclude(index: number) {
    setFeedback(null);
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, included: !row.included } : row)));
  }

  function check() {
    const blockIds = rows.filter((row) => row.included).map((row) => row.block.id);
    if (blockIds.length === 0) {
      return;
    }
    startTransition(async () => {
      const result = await submitParsons({ itemId, blockIds });
      if (result.status === "graded") {
        setFeedback(
          result.isCorrect
            ? { kind: "correct" }
            : { kind: "partial", correctCount: result.correctCount, total: result.total }
        );
      } else {
        setFeedback({ kind: "error" });
      }
    });
  }

  const feedbackText =
    feedback === null
      ? ""
      : feedback.kind === "correct"
        ? "Correct — the lines are in the right order."
        : feedback.kind === "partial"
          ? `${feedback.correctCount} of ${feedback.total} lines are correctly placed. Adjust the order and check again.`
          : "That could not be graded. Please try again.";

  return (
    <div className="grid gap-3" data-testid="parsons-exercise">
      <ol className="grid gap-2" data-testid="parsons-blocks">
        {rows.map((row, index) => (
          <li
            key={row.block.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
              row.included ? "border-slate-200 bg-white" : "border-dashed border-slate-300 bg-slate-50 opacity-60"
            }`}
            data-testid="parsons-block"
            data-block-id={row.block.id}
            data-included={row.included}
          >
            <pre className="flex-1 whitespace-pre-wrap break-words font-mono text-sm text-slate-800">
              {row.block.content}
            </pre>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                onClick={() => move(index, -1)}
                disabled={isPending || index === 0}
                aria-label={`Move line up: ${row.block.content}`}
                data-testid="parsons-move-up"
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => move(index, 1)}
                disabled={isPending || index === rows.length - 1}
                aria-label={`Move line down: ${row.block.content}`}
                data-testid="parsons-move-down"
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => toggleInclude(index)}
                disabled={isPending}
                aria-pressed={!row.included}
                aria-label={`${row.included ? "Exclude" : "Include"} line: ${row.block.content}`}
                data-testid="parsons-toggle-include"
              >
                {row.included ? "Exclude" : "Include"}
              </Button>
            </div>
          </li>
        ))}
      </ol>

      <div>
        <Button type="button" onClick={check} disabled={isPending} data-testid="parsons-check">
          Check structure
        </Button>
      </div>

      <p
        className={`min-h-[1.25rem] text-sm font-semibold ${
          feedback?.kind === "correct"
            ? "text-emerald-700"
            : feedback?.kind === "error"
              ? "text-rose-700"
              : "text-slate-700"
        }`}
        role="status"
        aria-live="polite"
        data-testid="parsons-feedback"
      >
        {feedbackText}
      </p>
    </div>
  );
}
