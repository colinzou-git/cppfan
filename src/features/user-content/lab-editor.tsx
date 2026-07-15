"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publishLab, saveLabDraft } from "./user-content-actions";
import { VersionHistory } from "./version-history";
import type { ContentVersionSummary } from "./user-content-queries";
import {
  LAB_MODES,
  EVALUATION_MODES,
  LAB_EDITABLE_FILENAME,
  type LabFixture,
  type LabMilestone,
  type LabPayload
} from "./lab-content-types";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
const LIBRARY_POLICIES = ["standard_only", "all"] as const;

type MilestoneField = {
  id: string;
  title: string;
  instructions: string;
  objective: string;
  required: boolean;
};

type LabFields = {
  title: string;
  summary: string;
  taskDescription: string;
  mode: (typeof LAB_MODES)[number];
  evaluationMode: (typeof EVALUATION_MODES)[number];
  difficulty: (typeof DIFFICULTIES)[number];
  estimatedMinutes: string;
  tags: string;
  learningObjectives: string;
  starterCode: string;
  referenceSolution: string;
  solutionExplanation: string;
  cppStandard: string;
  allowedLibraries: "" | (typeof LIBRARY_POLICIES)[number];
  runtimeLimitMs: string;
  memoryLimitMb: string;
  fixtures: LabFixture[];
  milestones: MilestoneField[];
  selfChecklist: string;
  hints: string;
};

type SaveState = "idle" | "saving" | "saved" | "local_only" | "conflict" | "invalid" | "error";

const listToLines = (xs: string[] | undefined): string => (xs && xs.length > 0 ? xs.join("\n") : "");
const linesToList = (s: string): string[] => s.split("\n").map((x) => x.trim()).filter((x) => x.length > 0);

export function fieldsFromLabPayload(payload: LabPayload | null): LabFields {
  return {
    title: payload?.title ?? "",
    summary: payload?.summary ?? "",
    taskDescription: payload?.taskDescription ?? "",
    mode: payload?.mode ?? "single_task",
    evaluationMode: payload?.evaluationMode ?? "self_evaluation",
    difficulty: payload?.difficulty ?? "beginner",
    estimatedMinutes: payload?.estimatedMinutes ? String(payload.estimatedMinutes) : "",
    tags: payload?.tags ? payload.tags.join(", ") : "",
    learningObjectives: listToLines(payload?.learningObjectives),
    starterCode: payload?.starterCode ?? "",
    referenceSolution: payload?.referenceSolution ?? "",
    solutionExplanation: payload?.solutionExplanation ?? "",
    cppStandard: payload?.run?.cppStandard ?? "",
    allowedLibraries: payload?.run?.allowedLibraries ?? "",
    runtimeLimitMs: payload?.run?.runtimeLimitMs ? String(payload.run.runtimeLimitMs) : "",
    memoryLimitMb: payload?.run?.memoryLimitMb ? String(payload.run.memoryLimitMb) : "",
    fixtures: payload?.fixtures ? payload.fixtures.map((f) => ({ ...f })) : [],
    milestones: payload?.milestones
      ? payload.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          instructions: m.instructions,
          objective: m.objective ?? "",
          required: m.required
        }))
      : [],
    selfChecklist: listToLines(payload?.completion?.selfChecklist),
    hints: listToLines(payload?.completion?.hints)
  };
}

export function buildLabPayload(fields: LabFields): Record<string, unknown> {
  const minutes = Number(fields.estimatedMinutes);
  const tags = fields.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  const objectives = linesToList(fields.learningObjectives);

  const run: Record<string, unknown> = {};
  if (fields.cppStandard.trim()) run.cppStandard = fields.cppStandard.trim();
  if (fields.allowedLibraries) run.allowedLibraries = fields.allowedLibraries;
  const rt = Number(fields.runtimeLimitMs);
  if (Number.isInteger(rt) && rt > 0) run.runtimeLimitMs = rt;
  const mem = Number(fields.memoryLimitMb);
  if (Number.isInteger(mem) && mem > 0) run.memoryLimitMb = mem;

  const completion: Record<string, unknown> = {};
  const checklist = linesToList(fields.selfChecklist);
  if (checklist.length > 0) completion.selfChecklist = checklist;
  const hints = linesToList(fields.hints);
  if (hints.length > 0) completion.hints = hints;

  const fixtures = fields.fixtures.filter((f) => f.filename.trim().length > 0);

  return {
    title: fields.title,
    summary: fields.summary,
    taskDescription: fields.taskDescription,
    mode: fields.mode,
    evaluationMode: fields.evaluationMode,
    difficulty: fields.difficulty,
    editableFilename: LAB_EDITABLE_FILENAME,
    ...(Number.isInteger(minutes) && minutes > 0 ? { estimatedMinutes: minutes } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(objectives.length > 0 ? { learningObjectives: objectives } : {}),
    ...(fields.starterCode ? { starterCode: fields.starterCode } : {}),
    ...(fields.referenceSolution ? { referenceSolution: fields.referenceSolution } : {}),
    ...(fields.solutionExplanation ? { solutionExplanation: fields.solutionExplanation } : {}),
    ...(Object.keys(run).length > 0 ? { run } : {}),
    ...(fixtures.length > 0 ? { fixtures } : {}),
    ...(fields.mode === "single_task" && Object.keys(completion).length > 0 ? { completion } : {}),
    ...(fields.mode === "milestones" && fields.milestones.length > 0
      ? {
          milestones: fields.milestones.map((m, i) => ({
            id: m.id || `m${i + 1}`,
            title: m.title,
            instructions: m.instructions,
            ...(m.objective.trim() ? { objective: m.objective.trim() } : {}),
            required: m.required
          })) as unknown as LabMilestone[]
        }
      : {})
  };
}

export function LabEditor({
  initialContentId,
  initialRevision,
  initialPayload,
  initialLifecycle,
  initialVersions = []
}: {
  initialContentId?: string;
  initialRevision?: number;
  initialPayload?: LabPayload | null;
  initialLifecycle?: string;
  initialVersions?: ContentVersionSummary[];
}) {
  const storageKey = `cppfan:user-content:lab:${initialContentId ?? "new"}:v1`;
  const [fields, setFields] = useState<LabFields>(() => fieldsFromLabPayload(initialPayload ?? null));
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
        const parsed = JSON.parse(raw) as Partial<LabFields>;
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
    (patch: Partial<LabFields>) => {
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
    const result = await saveLabDraft({
      contentId: contentId ?? null,
      kind: "lab",
      title: fields.title,
      expectedRevision: revisionRef.current,
      payload: buildLabPayload(fields)
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
      setMessage("This lab changed on another device. Reload to get the latest version.");
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
    const result = await publishLab({ contentId, expectedRevision: revisionRef.current });
    if (result.status === "ok") {
      setLifecycle("published");
      setState("saved");
      setMessage("Published.");
    } else if (result.status === "invalid") {
      setState("invalid");
      setMessage(result.issues.map((i) => `${i.field}: ${i.message}`).join("; "));
    } else if (result.status === "conflict") {
      setState("conflict");
      setMessage("This lab changed elsewhere. Reload before publishing.");
    } else if (result.status === "unconfigured") {
      setState("local_only");
      setMessage("Publishing needs a configured backend.");
    } else {
      setState("error");
      setMessage("Could not publish.");
    }
  }, [contentId, save]);

  const codeArea = "min-h-24 rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm";
  const isMilestones = fields.mode === "milestones";

  function updateMilestone(index: number, patch: Partial<MilestoneField>) {
    update({ milestones: fields.milestones.map((m, i) => (i === index ? { ...m, ...patch } : m)) });
  }
  function addMilestone() {
    update({
      milestones: [
        ...fields.milestones,
        { id: `m${fields.milestones.length + 1}`, title: "", instructions: "", objective: "", required: true }
      ]
    });
  }
  function removeMilestone(index: number) {
    update({ milestones: fields.milestones.filter((_, i) => i !== index) });
  }
  function moveMilestone(index: number, dir: -1 | 1) {
    const next = [...fields.milestones];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ milestones: next });
  }
  function updateFixture(index: number, patch: Partial<LabFixture>) {
    update({ fixtures: fields.fixtures.map((f, i) => (i === index ? { ...f, ...patch } : f)) });
  }
  function addFixture() {
    update({ fixtures: [...fields.fixtures, { filename: "", content: "" }] });
  }
  function removeFixture(index: number) {
    update({ fixtures: fields.fixtures.filter((_, i) => i !== index) });
  }

  return (
    <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
        <div className="flex items-center gap-3">
          {contentId ? (
            <Link href={`/my-content/labs/${contentId}/preview`} className="text-sm font-bold text-blue-700">Preview</Link>
          ) : null}
          <span className="text-xs font-semibold text-slate-500">Status: {lifecycle}</span>
        </div>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Title
        <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.title} onChange={(e) => update({ title: e.target.value })} placeholder="Lab title" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Summary
        <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.summary} onChange={(e) => update({ summary: e.target.value })} placeholder="One-line summary" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Task description
        <textarea className="min-h-32 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.taskDescription} onChange={(e) => update({ taskDescription: e.target.value })} placeholder="Describe the project task…" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Structure
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.mode} onChange={(e) => update({ mode: e.target.value as LabFields["mode"] })} data-testid="lab-mode-select">
            {LAB_MODES.map((m) => <option key={m} value={m}>{m === "single_task" ? "Single task" : "Milestones"}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Evaluation
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.evaluationMode} onChange={(e) => update({ evaluationMode: e.target.value as LabFields["evaluationMode"] })}>
            {EVALUATION_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Difficulty
          <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.difficulty} onChange={(e) => update({ difficulty: e.target.value as LabFields["difficulty"] })}>
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
        <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="io, files" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Learning objectives (one per line)
        <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.learningObjectives} onChange={(e) => update({ learningObjectives: e.target.value })} />
      </label>

      <fieldset className="grid gap-3 rounded-2xl border border-slate-200 p-3">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">Run settings (structured)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            C++ standard
            <input className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.cppStandard} onChange={(e) => update({ cppStandard: e.target.value })} placeholder="c++20" />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Libraries
            <select className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.allowedLibraries} onChange={(e) => update({ allowedLibraries: e.target.value as LabFields["allowedLibraries"] })}>
              <option value="">(default)</option>
              {LIBRARY_POLICIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Runtime limit (ms)
            <input type="number" min={1} className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.runtimeLimitMs} onChange={(e) => update({ runtimeLimitMs: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Memory limit (MB)
            <input type="number" min={1} className="rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.memoryLimitMb} onChange={(e) => update({ memoryLimitMb: e.target.value })} />
          </label>
        </div>
      </fieldset>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Starter code ({LAB_EDITABLE_FILENAME})
        <textarea className={codeArea} value={fields.starterCode} onChange={(e) => update({ starterCode: e.target.value })} placeholder="Editable starting point for the learner…" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Reference solution
        <textarea className={codeArea} value={fields.referenceSolution} onChange={(e) => update({ referenceSolution: e.target.value })} placeholder="Author-facing solution…" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Design explanation
        <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.solutionExplanation} onChange={(e) => update({ solutionExplanation: e.target.value })} />
      </label>

      <fieldset className="grid gap-2 rounded-2xl border border-slate-200 p-3">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">Read-only fixtures</legend>
        {fields.fixtures.map((f, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]" data-testid="lab-fixture-row">
            <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm" value={f.filename} onChange={(e) => updateFixture(i, { filename: e.target.value })} placeholder="input.txt" />
            <input className="rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm" value={f.content} onChange={(e) => updateFixture(i, { content: e.target.value })} placeholder="fixture content" />
            <button type="button" className="text-xs font-bold text-red-600" onClick={() => removeFixture(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="justify-self-start text-xs font-bold text-blue-700" onClick={addFixture} data-testid="lab-add-fixture">+ Add fixture</button>
      </fieldset>

      {isMilestones ? (
        <fieldset className="grid gap-3 rounded-2xl border border-slate-200 p-3" data-testid="lab-milestones">
          <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">Milestones</legend>
          {fields.milestones.map((m, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-slate-200 p-2" data-testid="lab-milestone-row">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                <span className="flex gap-2">
                  <button type="button" className="text-xs font-bold text-slate-600" onClick={() => moveMilestone(i, -1)} aria-label="Move up">↑</button>
                  <button type="button" className="text-xs font-bold text-slate-600" onClick={() => moveMilestone(i, 1)} aria-label="Move down">↓</button>
                  <button type="button" className="text-xs font-bold text-red-600" onClick={() => removeMilestone(i)}>Remove</button>
                </span>
              </div>
              <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm" value={m.title} onChange={(e) => updateMilestone(i, { title: e.target.value })} placeholder="Milestone title" />
              <textarea className="min-h-16 rounded-xl border border-slate-300 px-3 py-2 text-sm" value={m.instructions} onChange={(e) => updateMilestone(i, { instructions: e.target.value })} placeholder="Instructions" />
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={m.required} onChange={(e) => updateMilestone(i, { required: e.target.checked })} />
                Required to complete the lab
              </label>
            </div>
          ))}
          <button type="button" className="justify-self-start text-xs font-bold text-blue-700" onClick={addMilestone} data-testid="lab-add-milestone">+ Add milestone</button>
        </fieldset>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Self-check items (one per line)
            <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.selfChecklist} onChange={(e) => update({ selfChecklist: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Hints (one per line)
            <textarea className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal" value={fields.hints} onChange={(e) => update({ hints: e.target.value })} />
          </label>
        </div>
      )}

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
