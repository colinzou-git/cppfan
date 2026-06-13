/*
 * Presentational explanation block. Rendered inline for lessons (it is lesson
 * content), and only after grading/reveal for graded items (#145) — gating
 * lives in AnswerForm and RevealExplanation, never here.
 */
export function ExplanationPanel({ explanation }: { explanation: string }) {
  return (
    <div
      className="rounded-2xl bg-emerald-50/80 p-4 text-sm text-emerald-950"
      data-testid="learning-item-explanation"
    >
      <p className="font-bold">Explanation</p>
      <p className="mt-2 whitespace-pre-wrap break-words leading-6">{explanation}</p>
    </div>
  );
}
