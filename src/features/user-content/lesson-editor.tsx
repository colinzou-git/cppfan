"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publishContent, saveLessonDraft } from "./user-content-actions";
import { AiProposalPanel } from "./ai-proposal-panel";
import type { AuthoringOperation } from "./ai-authoring-proposal";
import type { LearningItemType } from "@/features/learning-items/learning-item-types";
import type { LessonPayload } from "./user-content-types";

const ITEM_TYPES: LearningItemType[] = [
  "lesson",
  "concept_check",
  "multiple_choice",
  "code_reading",
  "bug_spotting",
  "parsons",
  "worked_example",
  "completion"
];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

type EditorFields = {
  title: string;
  itemType: LearningItemType;
  difficulty: (typeof DIFFICULTIES)[number];
  estimatedMinutes: string;
  content: string;
  explanation: string;
};

type SaveState = "idle" | "saving" | "saved" | "local_only" | "conflict" | "invalid" | "error";

function fieldsFromPayload(payload: LessonPayload | null): EditorFields {
  return {
    title: payload?.title ?? "",
    itemType: payload?.itemType ?? "lesson",
    difficulty: payload?.difficulty ?? "beginner",
    estimatedMinutes: payload?.estimatedMinutes ? String(payload.estimatedMinutes) : "",
    content: payload?.content ?? "",
    explanation: payload?.explanation ?? ""
  };
}

function buildPayload(fields: EditorFields): Record<string, unknown> {
  const minutes = Number(fields.estimatedMinutes);
  return {
    itemType: fields.itemType,
    title: fields.title,
    content: fields.content,
    explanation: fields.explanation,
    difficulty: fields.difficulty,
    ...(Number.isInteger(minutes) && minutes > 0 ? { estimatedMinutes: minutes } : {})
  };
}

export function LessonEditor({
  initialContentId,
  initialRevision,
  initialPayload,
  initialLifecycle
}: {
  initialContentId?: string;
  initialRevision?: number;
  initialPayload?: LessonPayload | null;
  initialLifecycle?: string;
}) {
  const storageKey = `cppfan:user-content:lesson:${initialContentId ?? "new"}:v1`;
  const [fields, setFields] = useState<EditorFields>(() => fieldsFromPayload(initialPayload ?? null));
  const [contentId, setContentId] = useState<string | undefined>(initialContentId);
  const revisionRef = useRef<number | null>(initialRevision ?? null);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string>("");
  const [lifecycle, setLifecycle] = useState<string>(initialLifecycle ?? "draft");
  const dirtyRef = useRef(false);

  // Recover any local copy left from a crash/close before the last cloud save.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EditorFields>;
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
    (patch: Partial<EditorFields>) => {
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
    const result = await saveLessonDraft({
      contentId: contentId ?? null,
      kind: "lesson",
      title: fields.title,
      expectedRevision: revisionRef.current,
      payload: buildPayload(fields)
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
      setMessage("This lesson changed on another device. Reload to get the latest version.");
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

  // Debounced autosave after edits settle.
  useEffect(() => {
    if (!dirtyRef.current || fields.title.trim().length === 0) {
      return;
    }
    const handle = window.setTimeout(() => {
      void save();
    }, 1500);
    return () => window.clearTimeout(handle);
  }, [fields, save]);

  // Apply AI proposal operations the editor's fields support (replace_field for
  // title/content/explanation/difficulty). Richer ops are proposed but need the
  // expanded editor to persist, so they are ignored here for now.
  const applyAiOperations = useCallback(
    (ops: AuthoringOperation[]) => {
      const patch: Partial<EditorFields> = {};
      for (const op of ops) {
        if (op.type !== "replace_field") {
          continue;
        }
        if (op.field === "title") patch.title = op.value;
        else if (op.field === "content") patch.content = op.value;
        else if (op.field === "explanation") patch.explanation = op.value;
        else if (op.field === "difficulty" && (op.value === "beginner" || op.value === "intermediate" || op.value === "advanced")) {
          patch.difficulty = op.value;
        }
      }
      if (Object.keys(patch).length > 0) {
        update(patch);
      }
    },
    [update]
  );

  const publish = useCallback(async () => {
    if (dirtyRef.current || !contentId) {
      await save();
    }
    if (!contentId) {
      return;
    }
    setState("saving");
    setMessage("Publishing…");
    const result = await publishContent({ contentId, expectedRevision: revisionRef.current });
    if (result.status === "ok") {
      setLifecycle("published");
      setState("saved");
      setMessage("Published.");
    } else if (result.status === "invalid") {
      setState("invalid");
      setMessage(result.issues.map((i) => `${i.field}: ${i.message}`).join("; "));
    } else if (result.status === "conflict") {
      setState("conflict");
      setMessage("This lesson changed elsewhere. Reload before publishing.");
    } else if (result.status === "unconfigured") {
      setState("local_only");
      setMessage("Publishing needs a configured backend.");
    } else {
      setState("error");
      setMessage("Could not publish.");
    }
  }, [contentId, save]);

  return (
    <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
        <span className="text-xs font-semibold text-slate-500">Status: {lifecycle}</span>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Title
        <input
          className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
          value={fields.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Lesson title"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Type
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
            value={fields.itemType}
            onChange={(e) => update({ itemType: e.target.value as LearningItemType })}
          >
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Difficulty
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
            value={fields.difficulty}
            onChange={(e) => update({ difficulty: e.target.value as EditorFields["difficulty"] })}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Est. minutes
          <input
            type="number"
            min={1}
            className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
            value={fields.estimatedMinutes}
            onChange={(e) => update({ estimatedMinutes: e.target.value })}
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Lesson content (Markdown)
        <textarea
          className="min-h-40 rounded-xl border border-slate-300 px-3 py-2 font-normal"
          value={fields.content}
          onChange={(e) => update({ content: e.target.value })}
          placeholder="Teach the concept…"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Explanation
        <textarea
          className="min-h-24 rounded-xl border border-slate-300 px-3 py-2 font-normal"
          value={fields.explanation}
          onChange={(e) => update({ explanation: e.target.value })}
          placeholder="Why it matters / the key idea…"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void save()} disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save draft"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => void publish()} disabled={state === "saving"}>
          Publish
        </Button>
        {message ? (
          <span
            className={
              state === "error" || state === "conflict" || state === "invalid"
                ? "text-sm font-semibold text-rose-700"
                : "text-sm font-semibold text-emerald-700"
            }
          >
            {message}
          </span>
        ) : null}
      </div>

      <AiProposalPanel contentId={contentId} onApply={applyAiOperations} />
    </div>
  );
}
