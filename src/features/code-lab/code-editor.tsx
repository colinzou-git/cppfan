"use client";

import dynamic from "next/dynamic";
import { useId } from "react";

export type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  readOnly?: boolean;
};

// Monaco is loaded client-only: it touches `window`/`navigator` and must not be
// pulled into the server render. The loading state shows a textarea so the lab
// is editable while the editor chunk loads and on very constrained devices.
const MonacoCodeEditor = dynamic(() => import("./monaco-code-editor"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[320px] place-items-center bg-slate-50 text-sm text-slate-500">
      Loading editor…
    </div>
  )
});

export function CodeEditor({ value, onChange, label, readOnly = false }: CodeEditorProps) {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-1">
      <label id={labelId} className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </label>
      <div
        className="overflow-hidden rounded-xl border border-slate-200"
        role="group"
        aria-labelledby={labelId}
        data-testid="code-editor"
      >
        <MonacoCodeEditor value={value} onChange={onChange} label={label} readOnly={readOnly} />
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
