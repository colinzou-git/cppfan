"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { logInterviewEvidence } from "./interview-evidence-actions";
import type { InterviewContext } from "./readiness";

export type EvidenceProblemOption = { id: string; title: string; group: string };

const CONTEXTS: { value: InterviewContext; label: string }[] = [
  { value: "independent", label: "Independent" },
  { value: "mock", label: "Mock interview" },
  { value: "guided", label: "Guided" },
  { value: "diagnostic", label: "Diagnostic" }
];

const MODES: { value: "practice" | "interview"; label: string }[] = [
  { value: "practice", label: "Practice" },
  { value: "interview", label: "Interview" }
];

/**
 * Logs a self-reported interview practice outcome (#180): which problem, whether
 * it was unseen, mode, whether it was solved, hints used, and context. The
 * outcome feeds the dimension-level readiness report. Self-reported and honest —
 * the learner reports the result; cppFan does not run interview code.
 */
export function EvidenceLog({
  problems,
  authenticated
}: {
  problems: EvidenceProblemOption[];
  authenticated: boolean;
}) {
  const [problemId, setProblemId] = useState<string>(problems[0]?.id ?? "");
  const [context, setContext] = useState<InterviewContext>("independent");
  const [mode, setMode] = useState<"practice" | "interview">("practice");
  const [unseen, setUnseen] = useState(true);
  const [correct, setCorrect] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  const selected = problems.find((p) => p.id === problemId);

  function onSave() {
    if (!selected) {
      return;
    }
    startTransition(async () => {
      const result = await logInterviewEvidence({
        pattern: selected.group,
        problemId: selected.id,
        unseen,
        mode,
        correct,
        hintsUsed,
        context
      });
      if (result.status === "signed_out") {
        setNotice("Sign in to save this outcome to your readiness evidence.");
      } else if (result.status === "error") {
        setNotice("Could not log this outcome just now.");
      } else {
        setNotice("Logged. Your readiness report reflects it.");
      }
    });
  }

  return (
    <div className="grid gap-4" data-testid="evidence-log">
      <label className="grid gap-1 text-sm font-semibold text-slate-800">
        Problem
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-normal"
          value={problemId}
          onChange={(event) => setProblemId(event.target.value)}
          data-testid="evidence-problem"
        >
          {problems.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.title}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-slate-800">
          Context
          <select
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-normal"
            value={context}
            onChange={(event) => setContext(event.target.value as InterviewContext)}
            data-testid="evidence-context"
          >
            {CONTEXTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-800">
          Mode
          <select
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-normal"
            value={mode}
            onChange={(event) => setMode(event.target.value as "practice" | "interview")}
            data-testid="evidence-mode"
          >
            {MODES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={unseen}
            onChange={(event) => setUnseen(event.target.checked)}
            data-testid="evidence-unseen"
          />
          First time seeing this problem
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={correct}
            onChange={(event) => setCorrect(event.target.checked)}
            data-testid="evidence-correct"
          />
          Solved it correctly
        </label>
      </div>

      <label className="grid w-32 gap-1 text-sm font-semibold text-slate-800">
        Hints used
        <input
          type="number"
          min={0}
          value={hintsUsed}
          onChange={(event) => setHintsUsed(Math.max(0, Math.trunc(Number(event.target.value) || 0)))}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-normal"
          data-testid="evidence-hints"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onSave} disabled={saving || !selected} data-testid="evidence-save">
          {saving ? "Saving…" : "Log outcome"}
        </Button>
        {notice ? (
          <p className="text-sm font-semibold text-amber-700" role="status" data-testid="evidence-notice">
            {notice}
          </p>
        ) : null}
      </div>

      <p className="text-xs font-medium text-slate-500">
        Independent, unhinted success on an unseen problem is the strongest readiness evidence. Mock and
        interview-mode outcomes count toward consistency.
        {!authenticated ? " Sign in to save your evidence across sessions." : ""}
      </p>
    </div>
  );
}
