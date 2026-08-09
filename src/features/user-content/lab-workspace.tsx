"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, Loader2, RotateCcw } from "lucide-react";
import { CodeLabWorkspace } from "@/features/code-lab/code-lab-workspace";
import type { CodeTestResult } from "@/features/code-lab/code-lab-types";
import { completeUserLab, type CompleteUserLabResult } from "@/features/labs/complete-user-lab";
import {
  recordLabMilestonePass,
  type UserLabMilestoneProgress
} from "@/features/labs/user-lab-milestone-progress";
import type { LabMilestoneView } from "./lab-code-lab";

export type MilestoneProgressState =
  | { status: "not_passed" }
  | { status: "saving"; source: string }
  | { status: "saved"; codeSnapshotHash: string; passedAt: string }
  | { status: "save_error"; source: string; message: string };

type CompletionState = "idle" | "validating" | "saved" | "error" | "stale";

export function LabWorkspace({
  itemId,
  title,
  milestones,
  contentVersionId,
  initialMilestoneProgress = [],
  backHref,
  backLabel
}: {
  itemId: string;
  title: string;
  milestones: LabMilestoneView[];
  contentVersionId?: string;
  initialMilestoneProgress?: UserLabMilestoneProgress[];
  backHref?: string;
  backLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState<Record<string, MilestoneProgressState>>(() =>
    Object.fromEntries(
      initialMilestoneProgress.map((row) => [
        row.milestoneId,
        {
          status: "saved" as const,
          codeSnapshotHash: row.codeSnapshotHash,
          passedAt: row.passedAt
        }
      ])
    )
  );
  const [regressedMilestoneIds, setRegressedMilestoneIds] = useState<Set<string>>(new Set());
  const [completionState, setCompletionState] = useState<CompletionState>("idle");
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const latestSourceRef = useRef("");
  const activeView = milestones[active] ?? milestones[0];
  const isSingleTask = milestones.length === 1 && milestones[0]?.label === "Task";

  const allRequiredSaved = useMemo(
    () =>
      milestones.length > 0 &&
      milestones
        .filter((milestone) => milestone.required)
        .every(
          (milestone) =>
            progress[milestone.milestoneId]?.status === "saved" &&
            !regressedMilestoneIds.has(milestone.milestoneId)
        ),
    [milestones, progress, regressedMilestoneIds]
  );
  const requiredSaveInFlight = milestones.some(
    (milestone) => milestone.required && progress[milestone.milestoneId]?.status === "saving"
  );

  const saveMilestonePass = useCallback(
    async (view: LabMilestoneView, source: string) => {
      if (!contentVersionId) {
        setProgress((previous) => ({
          ...previous,
          [view.milestoneId]: {
            status: "save_error",
            source,
            message: "Reload this lab before saving milestone progress."
          }
        }));
        return;
      }
      setProgress((previous) => ({
        ...previous,
        [view.milestoneId]: { status: "saving", source }
      }));
      const result = await recordLabMilestonePass({
        itemId,
        expectedContentVersionId: contentVersionId,
        milestoneId: view.milestoneId,
        milestoneIndex: view.index,
        source
      });
      if (result.status === "saved") {
        latestSourceRef.current = source;
        setProgress((previous) => ({
          ...previous,
          [view.milestoneId]: {
            status: "saved",
            codeSnapshotHash: result.progress.codeSnapshotHash,
            passedAt: result.progress.passedAt
          }
        }));
        setRegressedMilestoneIds((previous) => {
          const next = new Set(previous);
          next.delete(view.milestoneId);
          return next;
        });
        setCompletionState((state) => (state === "saved" ? "saved" : "idle"));
        setCompletionMessage(null);
        return;
      }
      setProgress((previous) => ({
        ...previous,
        [view.milestoneId]: {
          status: "save_error",
          source,
          message: result.message
        }
      }));
      if (result.status === "stale_definition") {
        setCompletionState("stale");
      }
    },
    [contentVersionId, itemId]
  );

  function handleResult(result: { test?: CodeTestResult | null; source?: string }) {
    const test = result.test;
    if (
      !test ||
      test.staleDefinition ||
      test.status !== "ok" ||
      test.total <= 0 ||
      test.passed !== test.total ||
      typeof result.source !== "string" ||
      !result.source.trim()
    ) {
      return;
    }
    void saveMilestonePass(activeView, result.source);
  }

  const validateAndComplete = useCallback(async () => {
    if (
      !contentVersionId ||
      !allRequiredSaved ||
      !latestSourceRef.current ||
      requiredSaveInFlight
    ) {
      return;
    }
    setCompletionState("validating");
    setCompletionMessage(null);
    let result: CompleteUserLabResult;
    try {
      result = await completeUserLab({
        itemId,
        expectedContentVersionId: contentVersionId,
        source: latestSourceRef.current
      });
    } catch {
      result = {
        status: "validation_unavailable",
        message: "Final validation is temporarily unavailable. Retry completion."
      };
    }

    if (result.status === "completed" || result.status === "already_completed") {
      setCompletionState("saved");
      return;
    }
    if (result.status === "missing_milestone_evidence") {
      setProgress((previous) => {
        const next = { ...previous };
        for (const milestoneId of result.milestoneIds) {
          next[milestoneId] = { status: "not_passed" };
        }
        return next;
      });
      const first = milestones.find((milestone) =>
        result.milestoneIds.includes(milestone.milestoneId)
      );
      if (first) setActive(first.index);
      setCompletionMessage("Some required milestone progress was not saved. Run Tests again.");
      setCompletionState("error");
      return;
    }
    if (result.status === "regressed") {
      setRegressedMilestoneIds(new Set(result.milestoneIds));
      const first = milestones.find((milestone) =>
        result.milestoneIds.includes(milestone.milestoneId)
      );
      if (first) setActive(first.index);
      setCompletionMessage(
        "Current final code regressed required milestones. Repair and re-run them."
      );
      setCompletionState("error");
      return;
    }
    if (result.status === "stale_definition") {
      setCompletionState("stale");
      setCompletionMessage("This lab was republished. Reload before completing it.");
      return;
    }
    setCompletionState("error");
    setCompletionMessage(result.message);
  }, [allRequiredSaved, contentVersionId, itemId, milestones, requiredSaveInFlight]);

  return (
    <div className="grid gap-3">
      {!isSingleTask ? (
        <nav
          className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/85 p-3"
          aria-label="Milestones"
          data-testid="lab-milestone-nav"
        >
          {milestones.map((milestone) => {
            const isActive = milestone.index === active;
            const state = progress[milestone.milestoneId] ?? ({ status: "not_passed" } as const);
            const regressed = regressedMilestoneIds.has(milestone.milestoneId);
            return (
              <button
                key={milestone.milestoneId}
                type="button"
                onClick={() => setActive(milestone.index)}
                aria-current={isActive ? "step" : undefined}
                data-testid="lab-milestone-tab"
                title={
                  regressed && state.status === "saved"
                    ? "Previously saved; current final code has regressed."
                    : undefined
                }
                className={
                  isActive
                    ? "flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-bold text-white"
                    : "flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-slate-300"
                }
              >
                {state.status === "saving" ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-label="Saving milestone progress"
                  />
                ) : state.status === "save_error" ? (
                  <AlertTriangle
                    className="h-4 w-4 text-amber-500"
                    aria-label="Milestone progress save failed"
                  />
                ) : state.status === "saved" && regressed ? (
                  <RotateCcw
                    className="h-4 w-4 text-amber-500"
                    aria-label="Milestone currently regressed"
                  />
                ) : state.status === "saved" ? (
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-500"
                    aria-label="Milestone progress saved"
                  />
                ) : (
                  <Circle
                    className={isActive ? "h-4 w-4" : "h-3.5 w-3.5 text-slate-300"}
                    aria-hidden="true"
                  />
                )}
                <span>
                  {milestone.index + 1}. {milestone.label}
                </span>
                {milestone.required ? null : (
                  <span className="text-[10px] font-bold uppercase text-slate-400">opt</span>
                )}
              </button>
            );
          })}
        </nav>
      ) : null}

      {activeView && progress[activeView.milestoneId]?.status === "save_error" ? (
        <div
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900"
          role="alert"
          data-testid="lab-milestone-save-error"
        >
          <span>
            {
              (
                progress[activeView.milestoneId] as Extract<
                  MilestoneProgressState,
                  { status: "save_error" }
                >
              ).message
            }
          </span>
          <button
            type="button"
            onClick={() => {
              const state = progress[activeView.milestoneId];
              if (state?.status === "save_error") {
                void saveMilestonePass(activeView, state.source);
              }
            }}
            className="rounded-md bg-amber-600 px-2 py-1 text-white hover:bg-amber-700"
          >
            Retry milestone save
          </button>
        </div>
      ) : null}

      {regressedMilestoneIds.size > 0 ? (
        <div
          className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-800"
          role="alert"
          data-testid="lab-regressed"
        >
          Your current final code no longer passes{" "}
          {[...regressedMilestoneIds]
            .map((id) => milestones.find((milestone) => milestone.milestoneId === id)?.label ?? id)
            .join(", ")}
          . Historical saved progress is retained; repair and re-run these milestones.
        </div>
      ) : null}

      {allRequiredSaved ? (
        completionState === "saved" ? (
          <div
            className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800"
            role="status"
            data-testid="lab-complete-banner"
          >
            🎉 Final validation passed — this lab version is complete.
          </div>
        ) : latestSourceRef.current.length === 0 ? (
          <div
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
            role="status"
            data-testid="lab-final-validation-required"
          >
            All required milestones have saved progress. Run Tests on your final code to validate
            and complete this lab.
          </div>
        ) : (
          <div
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700"
            data-testid="lab-completion-controls"
          >
            {completionState === "validating" ? (
              <span className="font-semibold">Validating final code…</span>
            ) : (
              <button
                type="button"
                onClick={() => void validateAndComplete()}
                disabled={requiredSaveInFlight}
                className="rounded-md bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {completionState === "error" ? "Retry completion" : "Validate & complete"}
              </button>
            )}
            {completionState === "error" || completionState === "stale" ? (
              <span className="font-semibold text-amber-800" role="alert">
                {completionMessage ??
                  "Final validation is temporarily unavailable. Retry completion."}
              </span>
            ) : null}
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
