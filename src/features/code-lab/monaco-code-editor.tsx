"use client";

import { Editor, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
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

export default function MonacoCodeEditor({ value, onChange, label, readOnly = false }: CodeEditorProps) {
  return (
    <Editor
      height="320px"
      defaultLanguage="cpp"
      language="cpp"
      theme="vs"
      value={value}
      onChange={(next) => onChange(next ?? "")}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        ariaLabel: label
      }}
    />
  );
}
