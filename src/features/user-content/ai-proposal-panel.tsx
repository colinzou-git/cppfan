"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AuthoringOperation, AuthoringProposal, IdentifiedOperation } from "./ai-authoring-proposal";

/** One-line human description of a proposed operation, for the accept/reject list. */
export function describeOperation(op: AuthoringOperation): string {
  switch (op.type) {
    case "replace_field":
      return `Replace ${op.field}`;
    case "append_section":
      return `Add to the ${op.section} section`;
    case "set_objectives":
      return `Set ${op.value.length} learning objective(s)`;
    case "set_tags":
      return `Set tags: ${op.value.join(", ")}`;
    case "add_choice":
      return `Add choice: "${op.text}"${op.isCorrect ? " (correct)" : ""}`;
    case "add_parsons_block":
      return `Add Parsons block: "${op.text}"${op.isDistractor ? " (distractor)" : ""}`;
    case "add_completion_blank":
      return `Add completion answer: "${op.answer}"`;
    case "add_review_card":
      return `Add review question: "${op.prompt}" (${op.choices.length} choice${op.choices.length === 1 ? "" : "s"})`;
    default:
      return "Change";
  }
}

type PanelStatus = "idle" | "loading" | "ready" | "error";

/**
 * AI authoring assistant panel (#487). Asks /api/ai/author for a structured
 * proposal, lists the operations with per-item accept toggles, and hands the
 * accepted ones back to the editor — it never overwrites the draft directly.
 */
export function AiProposalPanel({
  contentId,
  onApply
}: {
  contentId?: string;
  onApply: (operations: AuthoringOperation[]) => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [proposal, setProposal] = useState<AuthoringProposal | null>(null);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<PanelStatus>("idle");
  const [message, setMessage] = useState("");

  async function ask() {
    if (!contentId) {
      setStatus("error");
      setMessage("Save a draft first so the assistant can read it.");
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
      const data = (await res.json()) as { proposal?: AuthoringProposal };
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
        placeholder="e.g. Add a common-mistakes section and two learning objectives"
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
            {(proposal.operations as IdentifiedOperation[]).map((op) => (
              <li key={op.id} className="flex items-start gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={accepted[op.id] ?? false}
                  onChange={(e) => setAccepted((prev) => ({ ...prev, [op.id]: e.target.checked }))}
                  aria-label={describeOperation(op)}
                />
                <span>{describeOperation(op)}</span>
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
