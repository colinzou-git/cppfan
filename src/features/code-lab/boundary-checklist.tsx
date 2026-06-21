"use client";

import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import type { BoundaryChecklist } from "./boundary-checklist-types";
import {
  createInitialBoundaryChecklistState,
  getBoundaryChecklistProgress,
  toggleBoundaryChecklistItem
} from "./boundary-checklist-state";

/**
 * Collapsible boundary-case checklist (#411). Strategy hints only — never
 * grading criteria — and it never blocks Run/Test. Checked state is local to the
 * mounted Code Lab. When an item has sample input, a button drops it into stdin.
 */
export function BoundaryChecklistPanel({
  checklists,
  onUseSampleInput,
  defaultExpanded = false
}: {
  checklists: BoundaryChecklist[];
  onUseSampleInput?: (input: string) => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [state, setState] = useState(() => createInitialBoundaryChecklistState(checklists));

  // Auto-expand when a later suggestion (e.g. AI feedback nextAction) flips
  // defaultExpanded to true, without collapsing or resetting checked state.
  useEffect(() => {
    if (defaultExpanded) setExpanded(true);
  }, [defaultExpanded]);

  if (checklists.length === 0) return null;
  const progress = getBoundaryChecklistProgress(state);

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white"
      data-testid="boundary-checklist"
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 p-3 text-left"
        data-testid="boundary-checklist-toggle"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <ListChecks className="h-4 w-4 text-slate-500" aria-hidden="true" />
          Boundary cases to test
        </span>
        <span className="text-xs text-slate-500">
          {progress.checked}/{progress.total} · {expanded ? "hide" : "show"}
        </span>
      </button>

      {expanded ? (
        <div className="flex flex-col gap-3 px-3 pb-3">
          <p className="text-xs text-slate-500">
            These are strategy hints to test your code — not grading criteria.
          </p>
          {checklists.map((checklist) => (
            <div key={checklist.id} className="flex flex-col gap-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {checklist.title}
              </p>
              <ul className="flex flex-col gap-1.5">
                {checklist.items.map((item) => (
                  <li key={item.id} className="flex flex-col gap-1">
                    <label className="flex items-start gap-2 text-sm text-slate-800">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4"
                        checked={state[checklist.id]?.[item.id] ?? false}
                        onChange={() =>
                          setState((prev) => toggleBoundaryChecklistItem(prev, checklist.id, item.id))
                        }
                        data-testid="boundary-checklist-item"
                      />
                      <span>
                        <span className="font-medium">{item.label}</span>
                        {item.explanation ? (
                          <span className="block text-xs text-slate-500">{item.explanation}</span>
                        ) : null}
                      </span>
                    </label>
                    {item.sampleInput !== undefined && onUseSampleInput ? (
                      <button
                        type="button"
                        onClick={() => onUseSampleInput(item.sampleInput ?? "")}
                        className="ml-6 w-fit rounded border border-slate-300 px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        data-testid="boundary-checklist-use-input"
                      >
                        Use as stdin
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
