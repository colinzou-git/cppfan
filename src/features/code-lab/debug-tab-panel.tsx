"use client";

import { useState } from "react";
import type { CodeDebugAction } from "./code-debug-types";
import type { UseCodeBreakpoints } from "./use-code-breakpoints";
import type { UseCodeDebugger } from "./use-code-debugger";

/**
 * The Debug right-dock tab for the Code Lab (#442). Real GDB-backed when the
 * debugger service is configured; otherwise Start returns a friendly unconfigured
 * state. This slice owns the toolbar, the breakpoints panel (with an
 * iPhone/iPad-friendly add-by-line-number control), and read-only views of the
 * paused snapshot. The Monaco gutter decorations and the AI "Explain current
 * step" panel land in later slices.
 */

const STEP_ACTIONS: { action: CodeDebugAction; label: string }[] = [
  { action: "continue", label: "Continue" },
  { action: "stepOver", label: "Step Over" },
  { action: "stepInto", label: "Step Into" },
  { action: "stepOut", label: "Step Out" }
];

export function DebugTabPanel({
  breakpoints,
  debug
}: {
  breakpoints: UseCodeBreakpoints;
  debug: UseCodeDebugger;
}) {
  const [lineDraft, setLineDraft] = useState("");
  const status = debug.snapshot?.status ?? "idle";
  const isActive = ["starting", "running", "paused", "compile_error", "runtime_error", "timeout"].includes(status);
  const paused = status === "paused" && !debug.isStale;
  const running = status === "running" || status === "starting";
  const explainable = ["paused", "exited", "compile_error", "runtime_error", "timeout"].includes(status);

  function addLine() {
    const line = Number.parseInt(lineDraft, 10);
    if (Number.isInteger(line) && line > 0) {
      breakpoints.addBreakpoint(line);
      setLineDraft("");
    }
  }

  return (
    <div className="flex flex-col gap-3" data-testid="code-debug">
      <div className="flex flex-wrap gap-1.5" role="toolbar" aria-label="Debugger controls">
        <DebugButton
          testId="code-debug-start"
          label={debug.snapshot ? "Restart" : "Start Debugging"}
          onClick={debug.snapshot ? debug.restartDebugging : debug.startDebugging}
          disabled={debug.busy || running}
        />
        {STEP_ACTIONS.map((step) => (
          <DebugButton
            key={step.action}
            testId={`code-debug-${step.action}`}
            label={step.label}
            onClick={() => debug.sendAction(step.action)}
            disabled={!paused || debug.busy}
          />
        ))}
        <DebugButton
          testId="code-debug-pause"
          label="Pause"
          onClick={() => debug.sendAction("pause")}
          disabled={!running || debug.busy}
        />
        <DebugButton
          testId="code-debug-stop"
          label="Stop"
          onClick={debug.stopDebugging}
          disabled={!isActive || debug.busy}
        />
        <DebugButton
          testId="code-debug-explain"
          label="Explain current step"
          onClick={() => debug.explainCurrentStep()}
          disabled={!explainable || debug.explaining}
        />
      </div>

      <p className="text-xs text-slate-600" data-testid="code-debug-status" aria-live="polite">
        <span className="font-bold uppercase tracking-wide text-slate-500">Status:</span> {status}
        {debug.isStale ? " · code changed — restart to debug the new code" : ""}
        {debug.snapshot?.message ? ` · ${debug.snapshot.message}` : ""}
      </p>
      {debug.error ? (
        <p className="text-xs font-bold text-amber-700" role="alert">
          {debug.error}
        </p>
      ) : null}

      {debug.explaining || debug.explanation ? (
        <section
          className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-2"
          data-testid="code-debug-explanation"
        >
          <h3 className="text-xs font-bold uppercase tracking-wide text-indigo-700">Explain current step</h3>
          <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700">
            {debug.explaining ? "Explaining…" : debug.explanation?.explanation}
          </p>
        </section>
      ) : null}

      <section className="flex flex-col gap-1.5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Breakpoints</h3>
        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-0.5 text-xs text-slate-600">
            Line
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={lineDraft}
              onChange={(event) => setLineDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addLine();
              }}
              className="w-24 rounded-lg border border-slate-200 p-1.5 font-mono text-xs"
              data-testid="code-debug-line-input"
              placeholder="e.g. 5"
            />
          </label>
          <button
            type="button"
            onClick={addLine}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white"
            data-testid="code-debug-add-breakpoint"
          >
            Add breakpoint
          </button>
        </div>
        <ul className="flex flex-col gap-1" data-testid="code-debug-breakpoints">
          {breakpoints.breakpoints.length === 0 ? (
            <li className="text-xs text-slate-500">No breakpoints yet.</li>
          ) : (
            breakpoints.breakpoints.map((bp) => (
              <li
                key={bp.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 text-xs"
              >
                <span className="font-mono text-slate-700">Line {bp.line}</span>
                <button
                  type="button"
                  onClick={() => breakpoints.removeBreakpoint(bp.line)}
                  className="font-bold text-slate-400 hover:text-red-600"
                  aria-label={`Remove breakpoint on line ${bp.line}`}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      {debug.snapshot && debug.snapshot.status !== "unconfigured" ? (
        <SnapshotViews debug={debug} />
      ) : null}
    </div>
  );
}

function SnapshotViews({ debug }: { debug: UseCodeDebugger }) {
  const snapshot = debug.snapshot;
  if (!snapshot) return null;
  return (
    <>
      <DebugSection title="Variables" empty="No variables in scope.">
        {snapshot.variables.map((v) => (
          <li key={v.name} className="font-mono text-xs text-slate-700">
            {v.name} = {v.value}
          </li>
        ))}
      </DebugSection>
      <DebugSection title="Call stack" empty="Not paused.">
        {snapshot.stack.map((frame) => (
          <li key={frame.id} className="font-mono text-xs text-slate-700">
            {frame.name}
            {frame.line != null ? `:${frame.line}` : ""}
          </li>
        ))}
      </DebugSection>
      {snapshot.stdout || snapshot.stderr || snapshot.compileOutput ? (
        <section className="flex flex-col gap-1">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Output</h3>
          <pre className="overflow-auto rounded-lg bg-slate-900 p-2 font-mono text-xs text-slate-100">
            {snapshot.compileOutput}
            {snapshot.stdout}
            {snapshot.stderr}
          </pre>
        </section>
      ) : null}
    </>
  );
}

function DebugSection({
  title,
  empty,
  children
}: {
  title: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <ul className="flex flex-col gap-0.5">
        {children.length > 0 ? children : <li className="text-xs text-slate-500">{empty}</li>}
      </ul>
    </section>
  );
}

function DebugButton({
  testId,
  label,
  onClick,
  disabled
}: {
  testId: string;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}
