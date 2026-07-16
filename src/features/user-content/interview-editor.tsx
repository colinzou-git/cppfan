"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publishInterview, saveInterviewDraft } from "./user-content-actions";
import { VersionHistory } from "./version-history";
import { ExerciseTestsEditor } from "./exercise-tests-editor";
import type { ContentVersionSummary } from "./user-content-queries";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_EVALUATION_MODES,
  INTERVIEW_EDITABLE_FILENAME,
  type ExerciseTest,
  type InterviewProblemPayload,
  type VisibleExample
} from "./interview-content-types";

// Runtime copies of the native vocabularies for the editor selects.
const PROBLEM_GROUPS = [
  "arrays_hashing_prefix",
  "two_pointers_sliding_window",
  "binary_search",
  "intervals_sweepline",
  "stacks_queues_monotonic",
  "heaps_topk_streaming",
  "linked_cache",
  "trees_bst",
  "graphs_paths",
  "union_find",
  "dp_backtracking",
  "cpp_implementation"
] as const;
const ROLE_RELEVANCE = ["general", "systems", "storage", "streaming", "concurrency-adjacent"] as const;

type InterviewFields = {
  title: string;
  statement: string;
  evaluationMode: (typeof INTERVIEW_EVALUATION_MODES)[number];
  group: "" | (typeof PROBLEM_GROUPS)[number];
  roleRelevance: "" | (typeof ROLE_RELEVANCE)[number];
  difficulty: "" | (typeof INTERVIEW_DIFFICULTIES)[number];
  tags: string;
  patternTags: string;
  constraints: string;
  targetComplexity: string;
  requiredEdgeCases: string;
  clarifyingQuestions: string;
  hintLadder: string;
  estimatedMinutes: string;
  visibleExamples: VisibleExample[];
  starterCode: string;
  referenceSolution: string;
  solutionExplanation: string;
  tests: ExerciseTest[];
  aiRubric: string;
};

type SaveState = "idle" | "saving" | "saved" | "local_only" | "conflict" | "invalid" | "error";

const listToLines = (xs: string[] | undefined): string => (xs && xs.length > 0 ? xs.join("\n") : "");
const linesToList = (s: string): string[] => s.split("\n").map((x) => x.trim()).filter((x) => x.length > 0);

export function fieldsFromInterviewPayload(payload: InterviewProblemPayload | null): InterviewFields {
  return {
    title: payload?.title ?? "",
    statement: payload?.statement ?? "",
    evaluationMode: payload?.evaluationMode ?? "self_evaluation",
    group: payload?.group ?? "",
    roleRelevance: payload?.roleRelevance ?? "",
    difficulty: payload?.difficulty ?? "",
    tags: payload?.tags ? payload.tags.join(", ") : "",
    patternTags: payload?.patternTags ? payload.patternTags.join(", ") : "",
    constraints: payload?.constraints ?? "",
    targetComplexity: payload?.targetComplexity ?? "",
    requiredEdgeCases: listToLines(payload?.requiredEdgeCases),
    clarifyingQuestions: listToLines(payload?.clarifyingQuestions),
    hintLadder: listToLines(payload?.hintLadder),
    estimatedMinutes: payload?.estimatedMinutes ? String(payload.estimatedMinutes) : "",
    visibleExamples: payload?.visibleExamples ? payload.visibleExamples.map((e) => ({ ...e })) : [],
    starterCode: payload?.starterCode ?? "",
    referenceSolution: payload?.referenceSolution ?? "",
    solutionExplanation: payload?.solutionExplanation ?? "",
    tests: payload?.tests ? payload.tests.map((t) => ({ ...t })) : [],
    aiRubric: payload?.aiRubric ?? ""
  };
}

export function buildInterviewPayload(fields: InterviewFields): Record<string, unknown> {
  const minutes = Number(fields.estimatedMinutes);
  const tags = fields.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  const patternTags = fields.patternTags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  const examples = fields.visibleExamples.filter((e) => e.input.trim().length > 0 || e.output.trim().length > 0);
  return {
    title: fields.title,
    statement: fields.statement,
    evaluationMode: fields.evaluationMode,
    ...(fields.group ? { group: fields.group } : {}),
    ...(fields.roleRelevance ? { roleRelevance: fields.roleRelevance } : {}),
    ...(fields.difficulty ? { difficulty: fields.difficulty } : {}),
    ...(Number.isInteger(minutes) && minutes > 0 ? { estimatedMinutes: minutes } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(patternTags.length > 0 ? { patternTags } : {}),
    ...(fields.constraints.trim() ? { constraints: fields.constraints } : {}),
    ...(fields.targetComplexity.trim() ? { targetComplexity: fields.targetComplexity } : {}),
    ...(linesToList(fields.requiredEdgeCases).length > 0 ? { requiredEdgeCases: linesToList(fields.requiredEdgeCases) } : {}),
    ...(linesToList(fields.clarifyingQuestions).length > 0 ? { clarifyingQuestions: linesToList(fields.clarifyingQuestions) } : {}),
    ...(linesToList(fields.hintLadder).length > 0 ? { hintLadder: linesToList(fields.hintLadder) } : {}),
    ...(examples.length > 0 ? { visibleExamples: examples } : {}),
    ...(fields.starterCode ? { starterCode: fields.starterCode } : {}),
    ...(fields.referenceSolution ? { referenceSolution: fields.referenceSolution } : {}),
    ...(fields.solutionExplanation ? { solutionExplanation: fields.solutionExplanation } : {}),
    ...(fields.tests.length > 0 ? { tests: fields.tests } : {}),
    ...(fields.aiRubric.trim() ? { aiRubric: fields.aiRubric } : {})
  };
}

export function InterviewEditor({
  initialContentId,
  initialRevision,
  initialPayload,
  initialLifecycle,
  initialVersions = []
}: {
  initialContentId?: string;
  initialRevision?: number;
  initialPayload?: InterviewProblemPayload | null;
  initialLifecycle?: string;
  initialVersions?: ContentVersionSummary[];
}) {
  const storageKey = `cppfan:user-content:interview:${initialContentId ?? "new"}:v1`;
  const [fields, setFields] = useState<InterviewFields>(() => fieldsFromInterviewPayload(initialPayload ?? null));
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
        const parsed = JSON.parse(raw) as Partial<InterviewFields>;
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
    (patch: Partial<InterviewFields>) => {
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
    const result = await saveInterviewDraft({
      contentId: contentId ?? null,
      kind: "interview_problem",
      title: fields.title,
      expectedRevision: revisionRef.current,
      payload: buildInterviewPayload(fields)
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
      setMessage("This problem changed on another device. Reload to get the latest version.");
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
    const result = await publishInterview({ contentId, expectedRevision: revisionRef.current });
    if (result.status === "ok") {
      setLifecycle("published");
      setState("saved");
      setMessage("Published.");
    } else if (result.status === "invalid") {
      setState("invalid");
      setMessage(result.issues.map((i) => `${i.field}: ${i.message}`).join("; "));
    } else if (result.status === "conflict") {
      setState("conflict");
      setMessage("This problem changed elsewhere. Reload before publishing.");
    } else if (result.status === "unconfigured") {
      setState("local_only");
      setMessage("Publishing needs a configured backend.");
    } else {
      setState("error");
      setMessage("Could not publish.");
    }
  }, [contentId, save]);

  const codeArea = "min-h-24 rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm";

  function updateExample(index: number, patch: Partial<VisibleExample>) {
    update({ visibleExamples: fields.visibleExamples.map((e, i) => (i === index ? { ...e, ...patch } : e)) });
  }
  function addExample() {
    update({ visibleExamples: [...fields.visibleExamples, { input: "", output: "" }] });
  }
  function removeExample(index: number) {
    update({ visibleExamples: fields.visibleExamples.filter((_, i) => i !== index) });
  }

  return (
    <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
        <div className="flex items-center gap-3">
          {contentId ? (
            <Link href={`/my-content/interview/${contentId}/preview`} className="text-sm font-bold text-blue-700">Preview</Link>
          ) : null}
          <span className="text-xs font-semibold text-slate-500">Status: {lifecycle}</span>
        </div>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Title
        <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.title} onChange={(e) => update({ title: e.target.value })} placeholder="Problem title" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Problem statement
        <textarea className="min-h-32 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.statement} onChange={(e) => update({ statement: e.target.value })} placeholder="Describe the problem…" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Evaluation
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.evaluationMode} onChange={(e) => update({ evaluationMode: e.target.value as InterviewFields["evaluationMode"] })} data-testid="interview-eval-select">
            {INTERVIEW_EVALUATION_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Difficulty
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.difficulty} onChange={(e) => update({ difficulty: e.target.value as InterviewFields["difficulty"] })}>
            <option value="">(unset)</option>
            {INTERVIEW_DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Group
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.group} onChange={(e) => update({ group: e.target.value as InterviewFields["group"] })}>
            <option value="">(unset)</option>
            {PROBLEM_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Role relevance
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.roleRelevance} onChange={(e) => update({ roleRelevance: e.target.value as InterviewFields["roleRelevance"] })}>
            <option value="">(unset)</option>
            {ROLE_RELEVANCE.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Pattern tags (comma-separated)
          <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.patternTags} onChange={(e) => update({ patternTags: e.target.value })} placeholder="two-pointers, hashing" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Tags (comma-separated)
          <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.tags} onChange={(e) => update({ tags: e.target.value })} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Constraints
          <textarea className="min-h-16 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.constraints} onChange={(e) => update({ constraints: e.target.value })} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Target complexity
          <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.targetComplexity} onChange={(e) => update({ targetComplexity: e.target.value })} placeholder="O(n)" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Required edge cases (one per line)
          <textarea className="min-h-16 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.requiredEdgeCases} onChange={(e) => update({ requiredEdgeCases: e.target.value })} />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Clarifying questions (one per line)
          <textarea className="min-h-16 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.clarifyingQuestions} onChange={(e) => update({ clarifyingQuestions: e.target.value })} />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Hint ladder (least to most revealing, one per line)
        <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.hintLadder} onChange={(e) => update({ hintLadder: e.target.value })} />
      </label>

      <fieldset className="grid gap-2 rounded-2xl border border-slate-200 p-3">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">Visible examples</legend>
        {fields.visibleExamples.map((ex, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" data-testid="interview-example-row">
            <input className="rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm" value={ex.input} onChange={(e) => updateExample(i, { input: e.target.value })} placeholder="input" />
            <input className="rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm" value={ex.output} onChange={(e) => updateExample(i, { output: e.target.value })} placeholder="output" />
            <button type="button" className="text-xs font-bold text-red-600" onClick={() => removeExample(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="justify-self-start text-xs font-bold text-blue-700" onClick={addExample} data-testid="interview-add-example">+ Add example</button>
      </fieldset>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Starter code ({INTERVIEW_EDITABLE_FILENAME})
        <textarea className={codeArea} value={fields.starterCode} onChange={(e) => update({ starterCode: e.target.value })} />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Reference solution
        <textarea className={codeArea} value={fields.referenceSolution} onChange={(e) => update({ referenceSolution: e.target.value })} placeholder="Author-facing solution (validated before publish)…" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Solution explanation
        <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.solutionExplanation} onChange={(e) => update({ solutionExplanation: e.target.value })} />
      </label>

      <ExerciseTestsEditor tests={fields.tests} onChange={(tests) => update({ tests })} />

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        AI evaluation rubric
        <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.aiRubric} onChange={(e) => update({ aiRubric: e.target.value })} placeholder="What should AI evaluation check? (required for judge + AI)" />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void save()} disabled={state === "saving"}>Save draft</Button>
        <Button type="button" variant="secondary" onClick={() => void publish()} disabled={state === "saving"}>Publish</Button>
        {message ? <span className="text-xs font-semibold text-slate-600" role="status">{message}</span> : null}
      </div>

      {initialVersions.length > 0 && contentId ? (
        <VersionHistory
          contentId={contentId}
          versions={initialVersions}
          currentRevision={revisionRef.current}
          onRestored={() => window.location.reload()}
        />
      ) : null}
    </div>
  );
}
