"use client";

import { Play, ListChecks, Sparkles, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CodeAction = "run" | "test" | "review" | "explain";

export function CodeRunControls({
  busy,
  onAction,
  hasError,
  runDisabled = false
}: {
  busy: CodeAction | null;
  onAction: (action: CodeAction) => void;
  hasError: boolean;
  /** Phase 3.4 (#413): gate Run/Run Tests until required predictions are filled. */
  runDisabled?: boolean;
}) {
  const disabled = busy !== null;
  return (
    <div className="flex flex-wrap gap-2" data-testid="code-controls">
      <Button
        type="button"
        size="sm"
        onClick={() => onAction("run")}
        disabled={disabled || runDisabled}
      >
        <Play className="mr-1.5 h-4 w-4" aria-hidden="true" />
        {busy === "run" ? "Running…" : "Run"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onAction("test")}
        disabled={disabled || runDisabled}
      >
        <ListChecks className="mr-1.5 h-4 w-4" aria-hidden="true" />
        {busy === "test" ? "Testing…" : "Run Tests"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onAction("review")}
        disabled={disabled}
      >
        <Sparkles className="mr-1.5 h-4 w-4" aria-hidden="true" />
        {busy === "review" ? "Reviewing…" : "AI Review Code"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => onAction("explain")}
        disabled={disabled || !hasError}
        title={hasError ? undefined : "Run the code first to explain an error"}
      >
        <Bug className="mr-1.5 h-4 w-4" aria-hidden="true" />
        {busy === "explain" ? "Explaining…" : "Explain Error"}
      </Button>
    </div>
  );
}
