"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publishContent, resetReviewForContent, saveLessonDraft } from "./user-content-actions";
import { PublishChoiceDialog, type PublishMode } from "./publish-choice-dialog";
import { AiProposalPanel } from "./ai-proposal-panel";
import { AttachmentManager } from "./attachment-manager";
import { VersionHistory } from "./version-history";
import { ChoicesEditor } from "./choices-editor";
import { ParsonsEditor } from "./parsons-editor";
import { CompletionEditor } from "./completion-editor";
import { CodeFieldsEditor, type CodeFields } from "./code-fields-editor";
import { ReviewCardsEditor } from "./review-cards-editor";
import { useSerializedDraftPersistence, type DraftFlushResult } from "./use-serialized-draft-persistence";
import type { ContentVersionSummary, UserContentAttachment } from "./user-content-queries";
import { applyAcceptedOperations, type AuthoringOperation } from "./ai-authoring-proposal";
import type { LearningItemType } from "@/features/learning-items/learning-item-types";
import type { LessonChoice, LessonCompletionBlank, LessonExample, LessonParsonsBlock, LessonPayload, LessonReviewCard, LessonSections } from "./user-content-types";

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
  choices: LessonChoice[];
  parsonsBlocks: LessonParsonsBlock[];
  completionBlanks: LessonCompletionBlank[];
  code: CodeFields;
  reviewCards: LessonReviewCard[];
  tags: string[];
  learningObjectives: string[];
  sourceNotes: string;
  sections: LessonSections;
  examples: LessonExample[];
};

const CHOICE_TYPES = new Set<LearningItemType>(["multiple_choice", "concept_check"]);
const CODE_TYPES = new Set<LearningItemType>(["code_reading", "bug_spotting", "worked_example"]);

type SaveState = "idle" | "saving" | "saved" | "local_only" | "conflict" | "invalid" | "error";

export function fieldsFromLessonPayload(payload: LessonPayload | null): EditorFields {
  return {
    title: payload?.title ?? "",
    itemType: payload?.itemType ?? "lesson",
    difficulty: payload?.difficulty ?? "beginner",
    estimatedMinutes: payload?.estimatedMinutes ? String(payload.estimatedMinutes) : "",
    content: payload?.content ?? "",
    explanation: payload?.explanation ?? "",
    choices: payload?.choices ?? [],
    parsonsBlocks: payload?.parsonsBlocks ?? [],
    completionBlanks: payload?.completionBlanks ?? [],
    code: {
      sampleCode: payload?.sampleCode ?? "",
      starterCode: payload?.starterCode ?? "",
      referenceSolution: payload?.referenceSolution ?? "",
      expectedOutput: payload?.expectedOutput ?? "",
      solutionExplanation: payload?.solutionExplanation ?? ""
    },
    reviewCards: payload?.reviewCards?.map((card) => ({ ...card, choices: card.choices.map((choice) => ({ ...choice })) })) ?? [],
    tags: payload?.tags ? [...payload.tags] : [],
    learningObjectives: payload?.learningObjectives ? [...payload.learningObjectives] : [],
    sourceNotes: payload?.sourceNotes ?? "",
    sections: payload?.sections ? { ...payload.sections } : {},
    examples: payload?.examples?.map((example) => ({ ...example })) ?? []
  };
}

export function buildLessonPayload(fields: EditorFields): Record<string, unknown> {
  const minutes = Number(fields.estimatedMinutes);
  return {
    itemType: fields.itemType,
    title: fields.title,
    content: fields.content,
    explanation: fields.explanation,
    difficulty: fields.difficulty,
    ...(Number.isInteger(minutes) && minutes > 0 ? { estimatedMinutes: minutes } : {}),
    ...(CHOICE_TYPES.has(fields.itemType) && fields.choices.length > 0 ? { choices: fields.choices } : {}),
    ...(fields.itemType === "parsons" && fields.parsonsBlocks.length > 0 ? { parsonsBlocks: fields.parsonsBlocks } : {}),
    ...(fields.itemType === "completion" && fields.completionBlanks.length > 0 ? { completionBlanks: fields.completionBlanks } : {}),
    ...(fields.code.sampleCode ? { sampleCode: fields.code.sampleCode } : {}),
    ...(fields.code.starterCode ? { starterCode: fields.code.starterCode } : {}),
    ...(fields.code.referenceSolution ? { referenceSolution: fields.code.referenceSolution } : {}),
    ...(fields.code.expectedOutput ? { expectedOutput: fields.code.expectedOutput } : {}),
    ...(fields.code.solutionExplanation ? { solutionExplanation: fields.code.solutionExplanation } : {}),
    ...(fields.reviewCards.length > 0 ? { reviewCards: fields.reviewCards } : {}),
    ...(fields.tags.length > 0 ? { tags: fields.tags } : {}),
    ...(fields.learningObjectives.length > 0 ? { learningObjectives: fields.learningObjectives } : {}),
    ...(fields.sourceNotes ? { sourceNotes: fields.sourceNotes } : {}),
    ...(Object.keys(fields.sections).length > 0 ? { sections: fields.sections } : {}),
    ...(fields.examples.length > 0 ? { examples: fields.examples } : {})
  };
}

export function LessonEditor({
  initialContentId,
  initialRevision,
  initialPayload,
  initialLifecycle,
  initialAttachments = [],
  initialVersions = []
}: {
  initialContentId?: string;
  initialRevision?: number;
  initialPayload?: LessonPayload | null;
  initialLifecycle?: string;
  initialAttachments?: UserContentAttachment[];
  initialVersions?: ContentVersionSummary[];
}) {
  const storageKey = `cppfan:user-content:lesson:${initialContentId ?? "new"}:v1`;
  const [fields, setFields] = useState<EditorFields>(() => fieldsFromLessonPayload(initialPayload ?? null));
  const [contentId, setContentId] = useState<string | undefined>(initialContentId);
  const revisionRef = useRef<number | null>(initialRevision ?? null);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string>("");
  const [lifecycle, setLifecycle] = useState<string>(initialLifecycle ?? "draft");
  const [publishOpen, setPublishOpen] = useState(false);
  const publishingRef = useRef(false);

  const applySaveResult = useCallback((result: DraftFlushResult) => {
    if (result.status === "ok") {
      setContentId(result.contentId);
      revisionRef.current = result.revision;
      setState("saved");
      setMessage("Saved.");
      try { window.localStorage.removeItem(storageKey); } catch { /* ignore */ }
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
  }, [storageKey]);

  const { flushDraft, markDirty } = useSerializedDraftPersistence({
    initialSnapshot: fields,
    initialContentId,
    initialRevision,
    saveDraft: (snapshot, identity) => snapshot.title.trim().length === 0
      ? Promise.resolve({ status: "invalid" as const, issues: [{ field: "title", message: "a title is required" }] })
      : saveLessonDraft({ contentId: identity.contentId, kind: "lesson", title: snapshot.title, expectedRevision: identity.revision, payload: buildLessonPayload(snapshot) }),
    onAutosaveStart: () => {
      if (!publishingRef.current) { setState("saving"); setMessage(""); }
    },
    onAutosaveResult: (result) => {
      if (!publishingRef.current) applySaveResult(result);
    }
  });

  // Recover any local copy left from a crash/close before the last cloud save.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EditorFields>;
        if (parsed && typeof parsed.title === "string") {
          setFields((prev) => {
            const next = { ...prev, ...parsed };
            markDirty(next);
            return next;
          });
          setState("local_only");
          setMessage("Recovered unsaved local changes.");
        }
      }
    } catch {
      // ignore malformed local recovery data
    }
  }, [markDirty, storageKey]);

  const update = useCallback(
    (patch: Partial<EditorFields>) => {
      setFields((prev) => {
        const next = { ...prev, ...patch };
        markDirty(next);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore quota/availability errors
        }
        return next;
      });
    },
    [markDirty, storageKey]
  );

  const save = useCallback(async () => {
    setState("saving");
    setMessage("");
    const result = await flushDraft();
    if (!publishingRef.current) applySaveResult(result);
    return result;
  }, [applySaveResult, flushDraft]);

  // Apply accepted AI proposal operations onto the current payload (covering
  // replace_field, sections, objectives/tags, choices, parsons/completion, and
  // review cards), then fold the result back into the editor fields.
  const applyAiOperations = useCallback(
    (ops: AuthoringOperation[]) => {
      if (ops.length === 0) {
        return;
      }
      const current = buildLessonPayload(fields) as unknown as LessonPayload;
      const applied = applyAcceptedOperations(current, ops);
      update(fieldsFromLessonPayload(applied));
    },
    [fields, update]
  );

  const runPublish = useCallback(async (mode: PublishMode) => {
    if (publishingRef.current) return;
    publishingRef.current = true;
    setState("saving");
    setMessage("Saving latest draft…");
    const saved = await flushDraft();
    if (saved.status !== "ok") {
      publishingRef.current = false;
      applySaveResult(saved);
      return;
    }
    setContentId(saved.contentId);
    revisionRef.current = saved.revision;
    setMessage("Publishing…");
    const result = await publishContent({ contentId: saved.contentId, expectedRevision: saved.revision });
    if (result.status === "ok") {
      setLifecycle("published");
      setState("saved");
      if (mode === "reset") {
        const reset = await resetReviewForContent(saved.contentId);
        setMessage(reset.status === "ok" ? "Published. Review cards reset." : "Published. Could not reset review cards.");
      } else {
        setMessage("Published.");
      }
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
    publishingRef.current = false;
  }, [applySaveResult, flushDraft]);

  const ensureSavedForAi = useCallback(async () => {
    const result = await save();
    return result.status === "ok" ? { status: "ok" as const, contentId: result.contentId } : { status: result.status };
  }, [save]);

  const onPublishClick = useCallback(() => {
    if (lifecycle === "published") {
      setPublishOpen(true);
    } else {
      void runPublish("continue");
    }
  }, [lifecycle, runPublish]);

  return (
    <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
        <div className="flex items-center gap-3">
          {contentId ? (
            <Link href={`/my-content/lessons/${contentId}/preview`} className="text-sm font-bold text-blue-700">
              Preview
            </Link>
          ) : null}
          <span className="text-xs font-semibold text-slate-500">Status: {lifecycle}</span>
        </div>
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

      {CHOICE_TYPES.has(fields.itemType) ? (
        <ChoicesEditor choices={fields.choices} onChange={(choices) => update({ choices })} />
      ) : null}

      {fields.itemType === "parsons" ? (
        <ParsonsEditor blocks={fields.parsonsBlocks} onChange={(parsonsBlocks) => update({ parsonsBlocks })} />
      ) : null}

      {fields.itemType === "completion" ? (
        <CompletionEditor blanks={fields.completionBlanks} onChange={(completionBlanks) => update({ completionBlanks })} />
      ) : null}

      {CODE_TYPES.has(fields.itemType) ? (
        <CodeFieldsEditor values={fields.code} onChange={(patch) => update({ code: { ...fields.code, ...patch } })} />
      ) : null}

      <ReviewCardsEditor cards={fields.reviewCards} onChange={(reviewCards) => update({ reviewCards })} />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void save()} disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save draft"}
        </Button>
        <Button type="button" variant="secondary" onClick={onPublishClick} disabled={state === "saving"}>
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

      <PublishChoiceDialog
        open={publishOpen}
        busy={state === "saving"}
        onChoose={(mode) => {
          setPublishOpen(false);
          void runPublish(mode);
        }}
        onCancel={() => setPublishOpen(false)}
      />

      <VersionHistory
        contentId={contentId}
        versions={initialVersions}
        currentRevision={revisionRef.current}
        onRestored={() => window.location.reload()}
      />

      <AttachmentManager contentId={contentId} initialAttachments={initialAttachments} />

      <AiProposalPanel contentId={contentId} ensureSaved={ensureSavedForAi} onApply={applyAiOperations} />
    </div>
  );
}
