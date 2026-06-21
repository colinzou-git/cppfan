"use client";

import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CodeTestCase } from "./code-lab-types";

export type TraceSource =
  | { kind: "stdin" }
  | { kind: "visible-test"; name: string };

/**
 * Lets the learner pick what to trace (current stdin or a visible test case) and
 * trigger the AI trace. Disabled when there is no code or while busy.
 */
export function TraceControls({
  visibleTests,
  selected,
  onSelect,
  onTrace,
  busy,
  disabled
}: {
  visibleTests: CodeTestCase[];
  selected: TraceSource;
  onSelect: (source: TraceSource) => void;
  onTrace: () => void;
  busy: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="trace-controls">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
        Trace input
        <select
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-normal text-slate-800"
          value={selected.kind === "stdin" ? "stdin" : `test:${selected.name}`}
          onChange={(event) => {
            const value = event.target.value;
            onSelect(
              value === "stdin"
                ? { kind: "stdin" }
                : { kind: "visible-test", name: value.slice("test:".length) }
            );
          }}
          data-testid="trace-input-select"
        >
          <option value="stdin">Current stdin</option>
          {visibleTests.map((test) => (
            <option key={test.name} value={`test:${test.name}`}>
              {test.name}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={onTrace}
        disabled={disabled || busy}
        data-testid="trace-button"
      >
        <Activity className="mr-1.5 h-4 w-4" aria-hidden="true" />
        {busy ? "Tracing…" : "Trace with AI"}
      </Button>
    </div>
  );
}
