"use client";

import { Play, ListChecks, Sparkles, Bug, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CodeAction = "run" | "test" | "review" | "explain";

export function CodeRunControls({
  busy,
  onAction,
  hasError,
  runDisabled = false,
  terminalActive = false,
  terminalStarting = false,
  onStop
}: {
  busy: CodeAction | null;
  onAction: (action: CodeAction) => void;
  hasError: boolean;
  /** Phase 3.4 (#413): gate Run/Run Tests until required predictions are filled. */
  runDisabled?: boolean;
  /** True while an interactive Run session is compiling/running (#664). */
  terminalActive?: boolean;
  /** True while the start request is in flight (#664). */
  terminalStarting?: boolean;
  /** Stop the active interactive Run session (#664). */
  onStop?: () => void;
}) {
  const disabled = busy !== null;
  return (
    <div className="flex flex-wrap gap-2" data-testid="code-controls">
      {terminalActive ? (
        <Button
          type="button"
          size="sm"
          onClick={() => onStop?.()}
          className="bg-rose-600 text-white hover:bg-rose-700"
          data-testid="code-stop"
        >
          <Square className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Stop
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          onClick={() => onAction("run")}
          disabled={disabled || runDisabled || terminalStarting}
        >
          <Play className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {terminalStarting ? "Running…" : "Run"}
        </Button>
      )}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onAction("test")}
        // Disabled while an interactive Run holds the execution resources (#664).
        disabled={disabled || runDisabled || terminalActive}
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
