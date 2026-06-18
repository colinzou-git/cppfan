"use client";

import { useState, useTransition } from "react";
import { Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordParsonsHint, submitParsons } from "./parsons-actions";
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
  const initialRows = () => blocks.map((block) => ({ block, included: true }));
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [isPending, startTransition] = useTransition();

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rows.length) {
      return;
    }
    setFeedback(null);
    const movedContent = rows[index]?.block.content ?? "";
    setAnnouncement(`Moved line ${delta < 0 ? "up" : "down"}: ${movedContent}`);
    setRows((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleInclude(index: number) {
    setFeedback(null);
    setAnnouncement(`${rows[index]?.included ? "Excluded" : "Included"} line: ${rows[index]?.block.content ?? ""}`);
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, included: !row.included } : row)));
  }

  function retry() {
    setRows(initialRows());
    setFeedback(null);
    setHintVisible(false);
    setAnnouncement("Reset the lines. Try the structure again.");
  }

  function showHint() {
    setHintVisible(true);
    setAnnouncement("Hint opened. Look for the setup, loop, update, and return shape.");
    startTransition(async () => {
      await recordParsonsHint({ itemId });
    });
  }

  function check() {
    const blockIds = rows.filter((row) => row.included).map((row) => row.block.id);
    if (blockIds.length === 0) {
      setAnnouncement("Include at least one line before checking.");
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
      setAnnouncement(result.status === "graded" && result.isCorrect ? "Structure complete." : "Structure checked.");
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
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={check} disabled={isPending} data-testid="parsons-check">
            Check structure
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={retry}
            disabled={isPending}
            data-testid="parsons-retry"
            aria-label="Reset Parsons lines and try again"
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={showHint}
            disabled={isPending || hintVisible}
            data-testid="parsons-hint"
            aria-label="Show a Parsons structure hint"
          >
            <Lightbulb className="mr-2 h-4 w-4" aria-hidden="true" />
            Hint
          </Button>
        </div>
      </div>

      {hintVisible ? (
        <p
          className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-950"
          role="status"
          aria-live="polite"
          data-testid="parsons-hint-text"
        >
          Start with setup before the loop, keep the repeated update inside the loop, then return the accumulated
          value after the loop. Leave out the line that changes the total in the wrong direction.
        </p>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite" data-testid="parsons-announcement">
        {announcement}
      </p>

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
