"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { CodeLabWorkspace } from "@/features/code-lab/code-lab-workspace";
import type { CodeTestResult } from "@/features/code-lab/code-lab-types";
import { markUserLabComplete } from "@/features/labs/user-lab-progress";
import type { LabMilestoneView } from "./lab-code-lab";

/** Explicit completion-persistence lifecycle so the banner never lies (#610). */
type CompletionSaveState = "idle" | "saving" | "saved" | "error";

/**
 * Lab workspace with a milestone navigator (#489). One shared codebase (the
 * CodeLabWorkspace is keyed by itemId, never remounted on milestone switch, so
 * the learner's code/draft persists across checkpoints). Run/Test grade the
 * ACTIVE milestone via its index. A milestone is marked passed for this session
 * when a Test run passes every case.
 *
 * Completion is only announced after it is DURABLY saved (#610): the one-shot
 * guard is set on success, a failed save surfaces a retry, and the banner shows
 * only once persistence succeeds. Milestone navigation is open (every tab is
 * clickable), so the icons show passed / current / upcoming — never a lock the
 * UI does not enforce.
 */
export function LabWorkspace({
  itemId,
  title,
  milestones,
  contentVersionId,
  backHref,
  backLabel
}: {
  itemId: string;
  title: string;
  milestones: LabMilestoneView[];
  contentVersionId?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const [passed, setPassed] = useState<Record<number, boolean>>({});
  const [saveState, setSaveState] = useState<CompletionSaveState>("idle");
  const activeView = milestones[active] ?? milestones[0];
  const isSingleTask = milestones.length === 1 && milestones[0]?.label === "Task";

  const requiredRemaining = useMemo(
    () => milestones.filter((m) => m.required && !passed[m.index]).length,
    [milestones, passed]
  );
  const labComplete = milestones.length > 0 && requiredRemaining === 0;

  // Persist completion durably; only mark done on a confirmed successful save, so
  // mastery/history can never disagree with a shown banner (#610).
  const persistedRef = useRef(false);
  const saveCompletion = useCallback(async () => {
    if (persistedRef.current) return;
    setSaveState("saving");
    try {
      const result = await markUserLabComplete({ itemId });
      if (result.status === "ok") {
        persistedRef.current = true;
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
    } catch {
      setSaveState("error");
    }
  }, [itemId]);

  // Attempt the save once when the lab first becomes complete. On failure we stop
  // at "error" (no auto-retry loop) and expose an explicit Retry button.
  useEffect(() => {
    if (labComplete && saveState === "idle") {
      void saveCompletion();
    }
  }, [labComplete, saveState, saveCompletion]);

  function handleResult(result: { test?: CodeTestResult | null }) {
    const test = result.test;
    if (!test || test.staleDefinition) return;
    // A checkpoint passes when every case (visible + hidden) passes.
    if (test.status === "ok" && test.total > 0 && test.passed === test.total) {
      setPassed((prev) => (prev[activeView.index] ? prev : { ...prev, [activeView.index]: true }));
    }
  }

  return (
    <div className="grid gap-3">
      {!isSingleTask ? (
        <nav
          className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/85 p-3"
          aria-label="Milestones"
          data-testid="lab-milestone-nav"
        >
          {milestones.map((m) => {
            const isActive = m.index === active;
            const done = passed[m.index];
            return (
              <button
                key={m.index}
                type="button"
                onClick={() => setActive(m.index)}
                aria-current={isActive ? "step" : undefined}
                data-testid="lab-milestone-tab"
                className={
                  isActive
                    ? "flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-bold text-white"
                    : "flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-slate-300"
                }
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                ) : (
                  // Open navigation: every tab is clickable, so an upcoming
                  // checkpoint is a hollow circle, not a (never-enforced) lock.
                  <Circle className={isActive ? "h-4 w-4" : "h-3.5 w-3.5 text-slate-300"} aria-hidden="true" />
                )}
                <span>{m.index + 1}. {m.label}</span>
                {m.required ? null : <span className="text-[10px] font-bold uppercase text-slate-400">opt</span>}
              </button>
            );
          })}
        </nav>
      ) : null}

      {labComplete && !isSingleTask ? (
        saveState === "saved" ? (
          <div
            className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800"
            role="status"
            data-testid="lab-complete-banner"
          >
            🎉 All required milestones passed — this lab is complete.
          </div>
        ) : saveState === "error" ? (
          <div
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800"
            role="alert"
            data-testid="lab-complete-error"
          >
            <span>All required milestones passed, but saving completion failed.</span>
            <button
              type="button"
              onClick={() => void saveCompletion()}
              className="rounded-md bg-amber-600 px-2 py-1 text-white hover:bg-amber-700"
            >
              Retry completion
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600"
            role="status"
            data-testid="lab-complete-saving"
          >
            Saving completion…
          </div>
        )
      ) : null}

      <CodeLabWorkspace
        key={itemId}
        itemId={itemId}
        title={isSingleTask ? title : `${title} — ${activeView.label}`}
        config={activeView.config}
        sourceVersion={`user-lab:${contentVersionId ?? "1"}`}
        contentVersionId={contentVersionId}
        milestoneIndex={activeView.index}
        onResult={handleResult}
        backHref={backHref}
        backLabel={backLabel}
      />
    </div>
  );
}
