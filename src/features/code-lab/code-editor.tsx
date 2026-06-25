"use client";

import dynamic from "next/dynamic";
import { useId } from "react";
import type { CodeBreakpoint } from "./code-debug-types";

export type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  readOnly?: boolean;
  /** Editor height. Defaults to a fixed 320px; the full-page workspace overrides it. */
  height?: string;
  /** Debugger breakpoints to render in the gutter (#442). */
  breakpoints?: CodeBreakpoint[];
  /** The line the debugger is currently paused on, highlighted in the editor (#442). */
  debugLine?: number | null;
  /** Toggle a breakpoint when the gutter glyph margin is clicked/tapped (#442). */
  onToggleBreakpoint?: (line: number) => void;
};

// Monaco is loaded client-only: it touches `window`/`navigator` and must not be
// pulled into the server render. The loading state shows a textarea so the lab
// is editable while the editor chunk loads and on very constrained devices.
const MonacoCodeEditor = dynamic(() => import("./monaco-code-editor"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[320px] place-items-center bg-slate-50 text-sm text-slate-500">
      Loading editor…
    </div>
  )
});

export function CodeEditor({
  value,
  onChange,
  label,
  readOnly = false,
  fill = false,
  breakpoints,
  debugLine,
  onToggleBreakpoint
}: CodeEditorProps & { fill?: boolean }) {
  const labelId = useId();
  // `fill` makes the editor expand to the height of a flex parent (the full-page
  // workspace center column); the embedded lesson keeps the fixed 320px default.
  const height = fill ? "100%" : "320px";

  return (
    <div className={`flex min-w-0 flex-col gap-1${fill ? " h-full" : ""}`}>
      <label id={labelId} className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </label>
      <div
        className={`overflow-hidden rounded-xl border border-slate-200${fill ? " min-h-0 flex-1" : ""}`}
        role="group"
        aria-labelledby={labelId}
        data-testid="code-editor"
      >
        <MonacoCodeEditor
          value={value}
          onChange={onChange}
          label={label}
          readOnly={readOnly}
          height={height}
          breakpoints={breakpoints}
          debugLine={debugLine}
          onToggleBreakpoint={onToggleBreakpoint}
        />
        {/* Accessible value mirror for assistive tech: Monaco's own input is the
            primary editing surface; this hidden control keeps a labelled copy of
            the source available to screen readers. */}
        <textarea
          aria-label={`${label} (plain text)`}
          className="sr-only"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          data-testid="code-editor-fallback"
        />
      </div>
    </div>
  );
}
