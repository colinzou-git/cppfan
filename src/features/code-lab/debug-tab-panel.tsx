"use client";

import { useId, useState } from "react";
import type { CodeDebugAction, CodeDebugSnapshot, CodeDebugVariable } from "./code-debug-types";
import type { UseCodeBreakpoints } from "./use-code-breakpoints";
import type { UseCodeDebugger } from "./use-code-debugger";

/**
 * The Debug right-dock tab for the Code Lab (#442, redesigned #470). Real
 * GDB-backed when the debugger service is configured; otherwise Start returns a
 * friendly unconfigured state.
 *
 * Layout: a compact toolbar + quick breakpoint strip, then CALLSTACK and
 * VARIABLES side by side, then a vertically-resizable PROGRAM OUTPUT (program
 * stdout/stderr only). Technical debugger/compiler details live behind a small
 * DEBUG INFO popup, so learner-facing output is not crowded by service noise.
 * Each internal window can pop out to a larger temporary dialog.
 */

const STEP_ACTIONS: { action: CodeDebugAction; label: string }[] = [
  { action: "continue", label: "Continue" },
  { action: "stepOver", label: "Over" },
  { action: "stepInto", label: "Into" },
  { action: "stepOut", label: "Out" }
];

type ExpandedPanel = "callstack" | "variables" | "program-output" | null;

export function DebugTabPanel({
  breakpoints,
  debug
}: {
  breakpoints: UseCodeBreakpoints;
  debug: UseCodeDebugger;
}) {
  const [lineDraft, setLineDraft] = useState("");
  const [debugInfoOpen, setDebugInfoOpen] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);
  const debugInfoId = useId();

  const status = debug.snapshot?.status ?? "idle";
  const isActive = ["starting", "running", "paused", "compile_error", "runtime_error", "timeout"].includes(status);
  const paused = status === "paused" && !debug.isStale;
  const running = status === "running" || status === "starting";
  const explainable = ["paused", "exited", "compile_error", "runtime_error", "timeout"].includes(status);
  const hasSnapshot = Boolean(debug.snapshot && debug.snapshot.status !== "unconfigured");

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
          label={debug.snapshot ? "Restart" : "Start"}
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
          label="Explain"
          onClick={() => debug.explainCurrentStep()}
          disabled={!explainable || debug.explaining}
        />
        <button
          type="button"
          onClick={() => setDebugInfoOpen((open) => !open)}
          aria-expanded={debugInfoOpen}
          aria-controls={debugInfoId}
          data-testid="code-debug-info-button"
          className="ml-auto rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          DEBUG INFO
        </button>
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

      <BreakpointQuickAdd
        breakpoints={breakpoints}
        lineDraft={lineDraft}
        setLineDraft={setLineDraft}
        addLine={addLine}
      />

      {hasSnapshot ? (
        <SnapshotViews debug={debug} onExpand={setExpandedPanel} />
      ) : null}

      {debugInfoOpen ? (
        <DebugInfoPopup id={debugInfoId} snapshot={debug.snapshot} onClose={() => setDebugInfoOpen(false)} />
      ) : null}

      {expandedPanel ? (
        <ExpandedPanelModal panel={expandedPanel} debug={debug} onClose={() => setExpandedPanel(null)} />
      ) : null}
    </div>
  );
}

function BreakpointQuickAdd({
  breakpoints,
  lineDraft,
  setLineDraft,
  addLine
}: {
  breakpoints: UseCodeBreakpoints;
  lineDraft: string;
  setLineDraft: (value: string) => void;
  addLine: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="code-debug-breakpoints">
      <label className="flex items-center gap-1 text-xs text-slate-600">
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
          className="w-16 rounded-lg border border-slate-200 p-1 font-mono text-xs"
          data-testid="code-debug-line-input"
          placeholder="5"
        />
      </label>
      <button
        type="button"
        onClick={addLine}
        className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white"
        data-testid="code-debug-add-breakpoint"
      >
        + BP
      </button>
      {breakpoints.breakpoints.length === 0 ? (
        <span className="text-xs text-slate-400">No breakpoints yet.</span>
      ) : (
        breakpoints.breakpoints.map((bp) => (
          <span
            key={bp.id}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700"
          >
            {bp.line}
            <button
              type="button"
              onClick={() => breakpoints.removeBreakpoint(bp.line)}
              className="font-bold text-slate-400 hover:text-red-600"
              aria-label={`Remove breakpoint on line ${bp.line}`}
            >
              ×
            </button>
          </span>
        ))
      )}
    </div>
  );
}

function SnapshotViews({
  debug,
  onExpand
}: {
  debug: UseCodeDebugger;
  onExpand: (panel: ExpandedPanel) => void;
}) {
  const snapshot = debug.snapshot;
  if (!snapshot) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <InternalWindow title="CALLSTACK" onExpand={() => onExpand("callstack")} testId="code-debug-callstack">
          <CallStackContent snapshot={snapshot} />
        </InternalWindow>
        <InternalWindow title="VARIABLES" onExpand={() => onExpand("variables")} testId="code-debug-variables">
          <VariablesContent variables={snapshot.variables} />
        </InternalWindow>
      </div>
      <InternalWindow
        title="PROGRAM OUTPUT"
        onExpand={() => onExpand("program-output")}
        testId="code-debug-program-output"
      >
        <ProgramOutputPanel snapshot={snapshot} resizable />
      </InternalWindow>
    </div>
  );
}

function InternalWindow({
  title,
  onExpand,
  testId,
  children
}: {
  title: string;
  onExpand: () => void;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-lg border border-slate-200" data-testid={testId}>
      <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
        <button
          type="button"
          onClick={onExpand}
          aria-label={`Open ${title} in larger window`}
          data-testid={`${testId}-expand`}
          className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          ↗
        </button>
      </div>
      <div className="min-w-0 p-2">{children}</div>
    </section>
  );
}

function CallStackContent({ snapshot }: { snapshot: CodeDebugSnapshot }) {
  if (snapshot.stack.length === 0) {
    return <p className="text-xs text-slate-500">Not paused.</p>;
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {snapshot.stack.map((frame, index) => (
        <li
          key={frame.id}
          className={`font-mono text-xs ${index === 0 ? "font-bold text-slate-900" : "text-slate-600"}`}
        >
          {frame.name}
          {frame.file ? ` (${frame.file}${frame.line != null ? `:${frame.line}` : ""})` : frame.line != null ? `:${frame.line}` : ""}
        </li>
      ))}
    </ul>
  );
}

/** Parse an array/vector-like value string into child rows, e.g. "{1, 2, 3}". */
export function parseArrayChildren(value: string): CodeDebugVariable[] | null {
  const trimmed = value.trim();
  // Already in "[0] = 1, [1] = 2" form.
  const indexed = [...trimmed.matchAll(/\[(\d+)\]\s*=\s*([^,]+?)(?:,|$)/g)];
  if (indexed.length > 0) {
    return indexed.map((m) => ({ name: `[${m[1]}]`, value: m[2].trim() }));
  }
  // "{1, 2, 3}" form.
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const inner = trimmed.slice(1, -1).trim();
    if (inner === "") return null;
    return inner.split(",").map((part, i) => ({ name: `[${i}]`, value: part.trim() }));
  }
  return null;
}

function VariablesContent({ variables }: { variables: CodeDebugVariable[] }) {
  if (variables.length === 0) {
    return <p className="text-xs text-slate-500">No variables in scope.</p>;
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {variables.map((variable) => (
        <VariableRow key={variable.name} variable={variable} />
      ))}
    </ul>
  );
}

function VariableRow({ variable }: { variable: CodeDebugVariable }) {
  const children = variable.children ?? parseArrayChildren(variable.value) ?? undefined;
  const [open, setOpen] = useState(false);

  if (!children || children.length === 0) {
    return (
      <li className="font-mono text-xs text-slate-700" data-testid="code-debug-variable">
        {variable.name} = {variable.value}
      </li>
    );
  }
  return (
    <li className="font-mono text-xs text-slate-700" data-testid="code-debug-variable">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1 text-left hover:text-slate-900"
        data-testid="code-debug-variable-toggle"
      >
        <span className="text-slate-400">{open ? "▾" : "▸"}</span>
        {variable.name} = {variable.value}
      </button>
      {open ? (
        <ul className="ml-4 flex flex-col gap-0.5 border-l border-slate-100 pl-2">
          {children.map((child) => (
            <li key={child.name} className="text-slate-600" data-testid="code-debug-variable-child">
              {child.name} = {child.value}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function ProgramOutputPanel({ snapshot, resizable }: { snapshot: CodeDebugSnapshot; resizable?: boolean }) {
  const empty = !snapshot.stdout && !snapshot.stderr;
  return (
    <div data-testid="code-debug-program-output-body">
      {empty ? (
        <p className="text-xs text-slate-500">No program output yet.</p>
      ) : (
        <pre
          className={`min-h-[4rem] overflow-auto rounded-lg bg-slate-900 p-2 font-mono text-xs text-slate-100 ${
            resizable ? "max-h-96 resize-y" : "max-h-full"
          }`}
        >
          {snapshot.stdout}
          {snapshot.stderr ? <span className="text-rose-300">{snapshot.stderr}</span> : null}
        </pre>
      )}
    </div>
  );
}

function DebugInfoPopup({
  id,
  snapshot,
  onClose
}: {
  id: string;
  snapshot: CodeDebugSnapshot | null;
  onClose: () => void;
}) {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Debug info"
      data-testid="code-debug-info-popup"
      className="rounded-lg border border-slate-300 bg-white p-3 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Debug info</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close debug info"
          className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>
      </div>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <InfoRow label="Status" value={snapshot?.status ?? "idle"} />
        <InfoRow label="Reason" value={snapshot?.reason} />
        <InfoRow label="Line" value={snapshot?.line != null ? String(snapshot.line) : undefined} />
        <InfoRow label="Exit code" value={snapshot?.exitCode != null ? String(snapshot.exitCode) : undefined} />
        <InfoRow label="Message" value={snapshot?.message} />
      </dl>
      {snapshot?.compileOutput ? (
        <pre
          className="mt-2 max-h-48 overflow-auto rounded-lg bg-slate-900 p-2 font-mono text-xs text-slate-100"
          data-testid="code-debug-info-compile-output"
        >
          {snapshot.compileOutput}
        </pre>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <>
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="font-mono text-slate-700">{value}</dd>
    </>
  );
}

function ExpandedPanelModal({
  panel,
  debug,
  onClose
}: {
  panel: Exclude<ExpandedPanel, null>;
  debug: UseCodeDebugger;
  onClose: () => void;
}) {
  const snapshot = debug.snapshot;
  const titles = {
    callstack: "CALLSTACK",
    variables: "VARIABLES",
    "program-output": "PROGRAM OUTPUT"
  } as const;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${titles[panel]} (larger view)`}
      data-testid="code-debug-expanded"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">{titles[panel]}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${titles[panel]}`}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          {snapshot && panel === "callstack" ? <CallStackContent snapshot={snapshot} /> : null}
          {snapshot && panel === "variables" ? <VariablesContent variables={snapshot.variables} /> : null}
          {snapshot && panel === "program-output" ? <ProgramOutputPanel snapshot={snapshot} /> : null}
        </div>
      </div>
    </div>
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
