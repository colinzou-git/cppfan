import { FlaskConical } from "lucide-react";
import type { CapstoneMilestone } from "./capstone-tracks";
import { getMilestoneExecutionLabel, milestoneToCodeLabConfig } from "./milestone-code-lab-adapter";

const PREVIEW_LINES = 6;

/**
 * Read-only starter-code preview for an in-app capstone milestone (#431).
 * Replaces the inline editor on the /labs list: editing, running, and testing now
 * happen on the full-screen /lab page (reached via the milestone's Code button),
 * which keeps the list compact and gives the editor the whole screen.
 */
export function MilestoneCodePreview({ milestone }: { milestone: CapstoneMilestone }) {
  const config = milestoneToCodeLabConfig(milestone);
  if (!config) return null;

  const lines = config.starterCode.split("\n");
  const preview = lines.slice(0, PREVIEW_LINES).join("\n");
  const truncated = lines.length > PREVIEW_LINES;

  return (
    <div className="flex flex-col gap-1" data-testid="milestone-code-preview">
      <p className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
        <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
        {getMilestoneExecutionLabel(milestone)}
      </p>
      <pre
        className="max-h-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-600"
        aria-label="Starter code preview"
      >
        {preview}
        {truncated ? "\n…" : ""}
      </pre>
      <p className="text-xs text-slate-500">
        Open <span className="font-semibold">Code</span> to write, run, and test this milestone full
        screen. Your code autosaves and resumes on any device.
      </p>
    </div>
  );
}
