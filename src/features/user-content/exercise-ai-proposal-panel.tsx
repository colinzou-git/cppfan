"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  describeExerciseOperation,
  type ExerciseAuthoringOperation,
  type ExerciseAuthoringProposal,
  type IdentifiedExerciseOperation
} from "./exercise-ai-authoring";

type PanelStatus = "idle" | "loading" | "ready" | "error";

/**
 * AI authoring assistant panel for exercises (#488). Asks /api/ai/author (which
 * branches to the exercise service) for a structured proposal, lists the
 * operations with per-item accept toggles, and hands the accepted ones back to
 * the editor — it never overwrites the draft directly.
 */
export function ExerciseAiProposalPanel({
  contentId,
  onApply
}: {
  contentId?: string;
  onApply: (operations: ExerciseAuthoringOperation[]) => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [proposal, setProposal] = useState<ExerciseAuthoringProposal | null>(null);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<PanelStatus>("idle");
  const [message, setMessage] = useState("");

  async function ask() {
    if (!contentId) {
      setStatus("error");
      setMessage("Save the exercise first so the assistant can read it.");
      return;
    }
    if (instruction.trim().length === 0) {
      return;
    }
    setStatus("loading");
    setMessage("");
    setProposal(null);
    try {
      const res = await fetch("/api/ai/author", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentId, instruction })
      });
      if (!res.ok) {
        setStatus("error");
        setMessage(res.status === 422 ? "The assistant did not return usable changes. Try rephrasing." : "The assistant is unavailable right now.");
        return;
      }
      const data = (await res.json()) as { proposal?: ExerciseAuthoringProposal };
      const next = data?.proposal ?? null;
      if (!next || next.operations.length === 0) {
        setStatus("error");
        setMessage("No changes were proposed.");
        return;
      }
      setProposal(next);
      setAccepted(Object.fromEntries(next.operations.map((o) => [o.id, true])));
      setStatus("ready");
    } catch {
      setStatus("error");
      setMessage("Could not reach the assistant.");
    }
  }

  function applySelected() {
    if (!proposal) {
      return;
    }
    const ops = proposal.operations.filter((o) => accepted[o.id]);
    onApply(ops);
    setProposal(null);
    setStatus("idle");
    setMessage(`Applied ${ops.length} suggestion(s).`);
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
      <div className="text-sm font-bold text-violet-900">AI authoring assistant</div>
      <textarea
        className="min-h-16 rounded-xl border border-slate-300 px-3 py-2 text-sm"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="e.g. Tighten the prompt and add two edge-case tests"
      />
      <div className="flex items-center gap-3">
        <Button type="button" onClick={() => void ask()} disabled={status === "loading"}>
          {status === "loading" ? "Thinking…" : "Ask AI"}
        </Button>
        {message ? (
          <span className={status === "error" ? "text-sm font-semibold text-rose-700" : "text-sm font-semibold text-emerald-700"}>
            {message}
          </span>
        ) : null}
      </div>

      {proposal ? (
        <div className="grid gap-2">
          {proposal.summary ? <p className="text-sm text-slate-700">{proposal.summary}</p> : null}
          <ul className="grid gap-1">
            {(proposal.operations as IdentifiedExerciseOperation[]).map((op) => (
              <li key={op.id} className="flex items-start gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={accepted[op.id] ?? false}
                  onChange={(e) => setAccepted((prev) => ({ ...prev, [op.id]: e.target.checked }))}
                  aria-label={describeExerciseOperation(op)}
                />
                <span>{describeExerciseOperation(op)}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button type="button" onClick={applySelected}>Apply selected</Button>
            <Button type="button" variant="secondary" onClick={() => { setProposal(null); setStatus("idle"); }}>
              Discard
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
