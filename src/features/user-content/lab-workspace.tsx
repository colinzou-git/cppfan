"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { CodeLabWorkspace } from "@/features/code-lab/code-lab-workspace";
import type { CodeTestResult } from "@/features/code-lab/code-lab-types";
import { markUserLabComplete } from "@/features/labs/user-lab-progress";
import type { LabMilestoneView } from "./lab-code-lab";

/**
 * Lab workspace with a milestone navigator (#489). One shared codebase (the
 * CodeLabWorkspace is keyed by itemId, never remounted on milestone switch, so
 * the learner's code/draft persists across checkpoints). Run/Test grade the
 * ACTIVE milestone via its index. A milestone is marked passed for this session
 * when a Test run passes every case; the lab shows complete once every required
 * milestone has passed.
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
  const activeView = milestones[active] ?? milestones[0];
  const isSingleTask = milestones.length === 1 && milestones[0]?.label === "Task";

  const requiredRemaining = useMemo(
    () => milestones.filter((m) => m.required && !passed[m.index]).length,
    [milestones, passed]
  );
  const labComplete = milestones.length > 0 && requiredRemaining === 0;

  // Persist completion once, when every required milestone has passed, so the lab
  // records a durable completion + credits the learning loop (best-effort).
  const persistedRef = useRef(false);
  useEffect(() => {
    if (labComplete && !persistedRef.current) {
      persistedRef.current = true;
      void markUserLabComplete({ itemId }).catch(() => {});
    }
  }, [labComplete, itemId]);

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
                ) : isActive ? (
                  <Circle className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                )}
                <span>{m.index + 1}. {m.label}</span>
                {m.required ? null : <span className="text-[10px] font-bold uppercase text-slate-400">opt</span>}
              </button>
            );
          })}
        </nav>
      ) : null}

      {labComplete && !isSingleTask ? (
        <div
          className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800"
          role="status"
          data-testid="lab-complete-banner"
        >
          🎉 All required milestones passed — this lab is complete.
        </div>
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
