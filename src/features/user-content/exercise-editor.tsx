"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publishExercise, saveExerciseDraft } from "./user-content-actions";
import { ExerciseTestsEditor } from "./exercise-tests-editor";
import { ExerciseAiProposalPanel } from "./exercise-ai-proposal-panel";
import { applyAcceptedExerciseOperations, type ExerciseAuthoringOperation } from "./exercise-ai-authoring";
import { CODE_CONTRACT_MODES, EVALUATION_MODES, type ExercisePayload, type ExerciseTest } from "./exercise-content-types";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

type ExerciseFields = {
  title: string;
  prompt: string;
  mode: (typeof CODE_CONTRACT_MODES)[number];
  evaluationMode: (typeof EVALUATION_MODES)[number];
  difficulty: (typeof DIFFICULTIES)[number];
  estimatedMinutes: string;
  tags: string;
  starterCode: string;
  referenceSolution: string;
  solutionExplanation: string;
  stdinFormat: string;
  stdoutFormat: string;
  functionSignature: string;
  tests: ExerciseTest[];
};

type SaveState = "idle" | "saving" | "saved" | "local_only" | "conflict" | "invalid" | "error";

export function fieldsFromExercisePayload(payload: ExercisePayload | null): ExerciseFields {
  return {
    title: payload?.title ?? "",
    prompt: payload?.prompt ?? "",
    mode: payload?.mode ?? "stdin_program",
    evaluationMode: payload?.evaluationMode ?? "self_evaluation",
    difficulty: payload?.difficulty ?? "beginner",
    estimatedMinutes: payload?.estimatedMinutes ? String(payload.estimatedMinutes) : "",
    tags: payload?.tags ? payload.tags.join(", ") : "",
    starterCode: payload?.starterCode ?? "",
    referenceSolution: payload?.referenceSolution ?? "",
    solutionExplanation: payload?.solutionExplanation ?? "",
    stdinFormat: payload?.stdinFormat ?? "",
    stdoutFormat: payload?.stdoutFormat ?? "",
    functionSignature: payload?.functionSignature ?? "",
    tests: payload?.tests ? payload.tests.map((t) => ({ ...t })) : []
  };
}

export function buildExercisePayload(fields: ExerciseFields): Record<string, unknown> {
  const minutes = Number(fields.estimatedMinutes);
  const tags = fields.tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const isFunction = fields.mode === "function";
  return {
    title: fields.title,
    prompt: fields.prompt,
    mode: fields.mode,
    evaluationMode: fields.evaluationMode,
    difficulty: fields.difficulty,
    ...(Number.isInteger(minutes) && minutes > 0 ? { estimatedMinutes: minutes } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(fields.starterCode ? { starterCode: fields.starterCode } : {}),
    ...(fields.referenceSolution ? { referenceSolution: fields.referenceSolution } : {}),
    ...(fields.solutionExplanation ? { solutionExplanation: fields.solutionExplanation } : {}),
    ...(isFunction && fields.functionSignature ? { functionSignature: fields.functionSignature } : {}),
    ...(!isFunction && fields.stdinFormat ? { stdinFormat: fields.stdinFormat } : {}),
    ...(!isFunction && fields.stdoutFormat ? { stdoutFormat: fields.stdoutFormat } : {}),
    ...(fields.tests.length > 0 ? { tests: fields.tests } : {})
  };
}

export function ExerciseEditor({
  initialContentId,
  initialRevision,
  initialPayload,
  initialLifecycle
}: {
  initialContentId?: string;
  initialRevision?: number;
  initialPayload?: ExercisePayload | null;
  initialLifecycle?: string;
}) {
  const storageKey = `cppfan:user-content:exercise:${initialContentId ?? "new"}:v1`;
  const [fields, setFields] = useState<ExerciseFields>(() => fieldsFromExercisePayload(initialPayload ?? null));
  const [contentId, setContentId] = useState<string | undefined>(initialContentId);
  const revisionRef = useRef<number | null>(initialRevision ?? null);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string>("");
  const [lifecycle, setLifecycle] = useState<string>(initialLifecycle ?? "draft");
  const dirtyRef = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ExerciseFields>;
        if (parsed && typeof parsed.title === "string") {
          setFields((prev) => ({ ...prev, ...parsed }));
          setState("local_only");
          setMessage("Recovered unsaved local changes.");
        }
      }
    } catch {
      // ignore malformed local recovery data
    }
  }, [storageKey]);

  const update = useCallback(
    (patch: Partial<ExerciseFields>) => {
      setFields((prev) => {
        const next = { ...prev, ...patch };
        dirtyRef.current = true;
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore quota/availability errors
        }
        return next;
      });
    },
    [storageKey]
  );

  const save = useCallback(async () => {
    if (fields.title.trim().length === 0) {
      setState("invalid");
      setMessage("A title is required.");
      return;
    }
    setState("saving");
    setMessage("");
    const result = await saveExerciseDraft({
      contentId: contentId ?? null,
      kind: "exercise",
      title: fields.title,
      expectedRevision: revisionRef.current,
      payload: buildExercisePayload(fields)
    });
    if (result.status === "ok") {
      setContentId(result.contentId);
      revisionRef.current = result.revision;
      dirtyRef.current = false;
      setState("saved");
      setMessage("Saved.");
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    } else if (result.status === "conflict") {
      setState("conflict");
      setMessage("This exercise changed on another device. Reload to get the latest version.");
    } else if (result.status === "invalid") {
      setState("invalid");
      setMessage(result.issues.map((i) => `${i.field}: ${i.message}`).join("; "));
    } else if (result.status === "unconfigured") {
      setState("local_only");
      setMessage("Saved locally only (no backend configured).");
    } else {
      setState("error");
      setMessage("Could not save. Try again.");
    }
  }, [contentId, fields, storageKey]);

  useEffect(() => {
    if (!dirtyRef.current || fields.title.trim().length === 0) {
      return;
    }
    const handle = window.setTimeout(() => {
      void save();
    }, 1500);
    return () => window.clearTimeout(handle);
  }, [fields, save]);

  const publish = useCallback(async () => {
    if (dirtyRef.current || !contentId) {
      await save();
    }
    if (!contentId) {
      return;
    }
    setState("saving");
    setMessage("Publishing…");
    const result = await publishExercise({ contentId, expectedRevision: revisionRef.current });
    if (result.status === "ok") {
      setLifecycle("published");
      setState("saved");
      setMessage("Published.");
    } else if (result.status === "invalid") {
      setState("invalid");
      setMessage(result.issues.map((i) => `${i.field}: ${i.message}`).join("; "));
    } else if (result.status === "conflict") {
      setState("conflict");
      setMessage("This exercise changed elsewhere. Reload before publishing.");
    } else if (result.status === "unconfigured") {
      setState("local_only");
      setMessage("Publishing needs a configured backend.");
    } else {
      setState("error");
      setMessage("Could not publish.");
    }
  }, [contentId, save]);

  const applyAiOperations = useCallback(
    (ops: ExerciseAuthoringOperation[]) => {
      if (ops.length === 0) {
        return;
      }
      const current = buildExercisePayload(fields) as unknown as ExercisePayload;
      const applied = applyAcceptedExerciseOperations(current, ops);
      update(fieldsFromExercisePayload(applied));
    },
    [fields, update]
  );

  const isFunction = fields.mode === "function";
  const codeArea = "min-h-24 rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm";

  return (
    <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
        <div className="flex items-center gap-3">
          {contentId ? (
            <Link href={`/my-content/exercises/${contentId}/preview`} className="text-sm font-bold text-blue-700">Preview</Link>
          ) : null}
          <span className="text-xs font-semibold text-slate-500">Status: {lifecycle}</span>
        </div>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Title
        <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.title} onChange={(e) => update({ title: e.target.value })} placeholder="Exercise title" />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Prompt
        <textarea className="min-h-32 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.prompt} onChange={(e) => update({ prompt: e.target.value })} placeholder="Describe the task, input, and output…" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Code contract
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.mode} onChange={(e) => update({ mode: e.target.value as ExerciseFields["mode"] })}>
            {CODE_CONTRACT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Evaluation
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.evaluationMode} onChange={(e) => update({ evaluationMode: e.target.value as ExerciseFields["evaluationMode"] })}>
            {EVALUATION_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Difficulty
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.difficulty} onChange={(e) => update({ difficulty: e.target.value as ExerciseFields["difficulty"] })}>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Est. minutes
          <input type="number" min={1} className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.estimatedMinutes} onChange={(e) => update({ estimatedMinutes: e.target.value })} />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Tags (comma-separated)
        <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="strings, io" />
      </label>

      {isFunction ? (
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Function signature
          <input className="rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm" value={fields.functionSignature} onChange={(e) => update({ functionSignature: e.target.value })} placeholder="std::string solve(std::string input)" />
        </label>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Input format
            <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.stdinFormat} onChange={(e) => update({ stdinFormat: e.target.value })} placeholder="What the program reads…" />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Output format
            <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.stdoutFormat} onChange={(e) => update({ stdoutFormat: e.target.value })} placeholder="What the program prints…" />
          </label>
        </div>
      )}

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Starter code
        <textarea className={codeArea} value={fields.starterCode} onChange={(e) => update({ starterCode: e.target.value })} placeholder="Editable starting point for the learner…" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Reference solution
        <textarea className={codeArea} value={fields.referenceSolution} onChange={(e) => update({ referenceSolution: e.target.value })} placeholder="Author-facing solution (validated before publish)…" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Solution explanation
        <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.solutionExplanation} onChange={(e) => update({ solutionExplanation: e.target.value })} placeholder="Why the solution works…" />
      </label>

      <ExerciseTestsEditor tests={fields.tests} onChange={(tests) => update({ tests })} />

      <ExerciseAiProposalPanel contentId={contentId} onApply={applyAiOperations} />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void save()} disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save draft"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => void publish()} disabled={state === "saving"}>
          Publish
        </Button>
        {message ? (
          <span className={state === "error" || state === "conflict" || state === "invalid" ? "text-sm font-semibold text-rose-700" : "text-sm font-semibold text-emerald-700"}>{message}</span>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">In-app Code Lab execution for published exercises arrives with the learner-resolver slice.</p>
    </div>
  );
}
