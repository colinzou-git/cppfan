"use client";

import { FlaskConical } from "lucide-react";
import { CodeLab } from "@/features/code-lab/code-lab";
import type { CodeRunResult, CodeTestResult } from "@/features/code-lab/code-lab-types";
import type { CapstoneMilestone } from "./capstone-tracks";
import { getMilestoneExecutionLabel, milestoneToCodeLabConfig } from "./milestone-code-lab-adapter";

/**
 * Renders a capstone milestone's in-app Code Lab (#418) plus its execution-mode
 * label and a pointer to Codespaces for larger work. The milestone's existing
 * reflection box and Mark-complete controls stay in the parent view; this only
 * adds the runnable lab and lifts run/test results so completion can be gated.
 */
export function CodeLabMilestone({
  milestone,
  onResult
}: {
  milestone: CapstoneMilestone;
  onResult?: (result: { run?: CodeRunResult | null; test?: CodeTestResult | null }) => void;
}) {
  const config = milestoneToCodeLabConfig(milestone);
  if (!config) return null;

  return (
    <div className="flex flex-col gap-2" data-testid="code-lab-milestone">
      <p className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
        <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
        {getMilestoneExecutionLabel(milestone)}
      </p>
      <CodeLab itemId={milestone.id} config={config} onResult={onResult} />
      <p className="text-xs text-slate-500">
        Working on a larger, multi-file version? Continue this project in Codespaces — the in-app Code
        Lab covers the single-file milestone task.
      </p>
    </div>
  );
}
