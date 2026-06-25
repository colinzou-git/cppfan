"use client";

import { Editor, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";
import type { CodeEditorProps } from "./code-editor";

// Use the bundled monaco-editor instead of @monaco-editor/react's default CDN
// fetch, so the Code Lab editor loads with no network — important for CI,
// offline dev, and locked-down deployments. C++ highlighting is a main-thread
// Monarch tokenizer, so no language-service web worker is required; a no-op
// worker stub avoids spurious worker errors from the editor core.
if (typeof window !== "undefined") {
  const globalScope = self as unknown as {
    MonacoEnvironment?: { getWorker?: () => Worker };
  };
  if (!globalScope.MonacoEnvironment) {
    globalScope.MonacoEnvironment = {
      getWorker: () =>
        ({
          postMessage() {},
          terminate() {},
          addEventListener() {},
          removeEventListener() {}
        }) as unknown as Worker
    };
  }
  loader.config({ monaco });
}

function buildDebugDecorations(
  breakpoints: CodeEditorProps["breakpoints"],
  debugLine: CodeEditorProps["debugLine"]
): monaco.editor.IModelDeltaDecoration[] {
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  for (const bp of breakpoints ?? []) {
    decorations.push({
      range: new monaco.Range(bp.line, 1, bp.line, 1),
      options: {
        glyphMarginClassName:
          bp.enabled === false ? "cppfan-breakpoint-disabled-glyph" : "cppfan-breakpoint-glyph",
        glyphMarginHoverMessage: { value: `Breakpoint: line ${bp.line}` },
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    });
  }
  if (typeof debugLine === "number" && debugLine > 0) {
    decorations.push({
      range: new monaco.Range(debugLine, 1, debugLine, 1),
      options: {
        isWholeLine: true,
        className: "cppfan-debug-current-line",
        glyphMarginClassName: "cppfan-debug-current-line-glyph"
      }
    });
  }
  return decorations;
}

export default function MonacoCodeEditor({
  value,
  onChange,
  label,
  readOnly = false,
  height = "320px",
  breakpoints,
  debugLine,
  onToggleBreakpoint
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const applyingExternalValueRef = useRef(false);
  const decorationsRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
  // Read inside the (stable) onMount/onMouseDown closures without re-binding.
  const onToggleRef = useRef(onToggleBreakpoint);
  onToggleRef.current = onToggleBreakpoint;
  // The glyph margin (and its click-to-toggle) is only for the debugger surface;
  // the inline lesson editor passes no handler and is visually unchanged.
  const debuggerEnabled = onToggleBreakpoint != null;

  useEffect(() => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!editor || !model || model.getValue() === value) return;

    const selection = editor.getSelection();
    const scrollTop = editor.getScrollTop();
    const scrollLeft = editor.getScrollLeft();

    applyingExternalValueRef.current = true;
    editor.executeEdits("cppfan-external-value", [
      {
        range: model.getFullModelRange(),
        text: value
      }
    ]);
    if (selection) editor.setSelection(selection);
    editor.setScrollTop(scrollTop);
    editor.setScrollLeft(scrollLeft);
    applyingExternalValueRef.current = false;
  }, [value]);

  useEffect(() => {
    decorationsRef.current?.set(buildDebugDecorations(breakpoints, debugLine));
  }, [breakpoints, debugLine]);

  return (
    <Editor
      height={height}
      defaultLanguage="cpp"
      language="cpp"
      theme="vs"
      defaultValue={value}
      onChange={(next) => {
        if (!applyingExternalValueRef.current) onChange(next ?? "");
      }}
      onMount={(editor) => {
        editorRef.current = editor;
        // Expose the editor instance so end-to-end tests can drive edits through
        // Monaco's own API (setValue), which fires the same change handler a
        // keystroke would. Monaco keyboard automation drops/reorders characters
        // across browsers; this ref is deterministic. Harmless, non-sensitive.
        (window as unknown as { __cppfanCodeLabEditor?: unknown }).__cppfanCodeLabEditor = editor;

        decorationsRef.current = editor.createDecorationsCollection(
          buildDebugDecorations(breakpoints, debugLine)
        );
        // Tap/click the gutter glyph margin to toggle a breakpoint on that line.
        editor.onMouseDown((event) => {
          if (event.target.type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) return;
          const line = event.target.position?.lineNumber;
          if (line && onToggleRef.current) onToggleRef.current(line);
        });
      }}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        glyphMargin: debuggerEnabled,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        ariaLabel: label
      }}
    />
  );
}
