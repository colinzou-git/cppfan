"use client";

import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedContent } from "@/features/learning-items/formatted-content";
import type { CodeRunResult, CodeTestResult, LearningItemCodeLab } from "./code-lab-types";
import { CodeEditor } from "./code-editor";
import { CodeRunControls, type CodeAction } from "./code-run-controls";
import { CodeTerminalPanel } from "./code-terminal-panel";
import { TestResultsPanel } from "./test-results-panel";
import { AiCodeReviewPanel } from "./ai-code-review-panel";
import { TraceControls } from "./trace-controls";
import { AiTracePanel } from "./ai-trace-panel";
import { BoundaryChecklistPanel } from "./boundary-checklist";
import { PredictionBeforeRun } from "./prediction-before-run";
import { ErrorRemediationPanel } from "./error-remediation-panel";
import { ScaffoldRecommendationCard } from "@/features/recommendations/scaffold-recommendation-card";
import { useCodeLabController } from "./use-code-lab-controller";
import { useCodeTerminal } from "./use-code-terminal";

/**
 * Embedded Code Lab client component (#407). Composes the editor, run/test
 * controls, output, visible test results, and AI review next to a lesson. All
 * execution and AI work happens server-side via the route handlers; the shared
 * controller hook holds the state. The full-page workspace at /lab/[itemId]
 * reuses the same controller with a wider, resizable layout (#431).
 */
export function CodeLab({
  itemId,
  config,
  onResult
}: {
  itemId: string;
  config: LearningItemCodeLab;
  /** Phase 3.9 (#418): notify a host (e.g. a capstone milestone) of run/test results. */
  onResult?: (result: { run?: CodeRunResult | null; test?: CodeTestResult | null }) => void;
}) {
  const c = useCodeLabController({ itemId, config, onResult });
  // Run drives the same interactive Terminal session as the full-page workspace
  // (#664); Run Tests stays one-shot on the controller.
  const terminal = useCodeTerminal({ itemId, source: c.source, stdin: c.stdin });
  const hasExecutionInput = config.mode === "stdin" || config.mode === "function";
  const inputLabel = config.mode === "function" ? "Arguments" : "Input Args";
  const terminalRefused =
    terminal.status === "stale_definition" || terminal.status === "item_unavailable";

  function onAction(action: CodeAction) {
    if (action === "run") {
      void terminal.start();
      return;
    }
    c.handleAction(action);
  }

  return (
    <Card
      id="code-lab"
      className="scroll-mt-24 border-slate-200 bg-white shadow-sm"
      data-testid="code-lab"
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
            Code Lab
          </span>
          <Link
            href={`/lab/${encodeURIComponent(itemId)}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
            data-testid="code-lab-open-full"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            Full screen
          </Link>
        </div>
        <CardTitle className="mt-2 text-base">Write and run C++</CardTitle>
        {config.prompt ? (
          <div className="text-sm text-slate-700">
            <FormattedContent content={config.prompt} />
          </div>
        ) : null}
      </CardHeader>
      {/* On xl+, editor/input/actions on the left and output/tests/AI feedback on
          the right; one vertical column on mobile/iPad. min-w-0 keeps Monaco and
          long output from overflowing the card. */}
      <CardContent className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.85fr)] xl:items-start">
        <section className="grid min-w-0 gap-3">
          <CodeEditor value={c.source} onChange={c.setSource} label="C++ source code" />

          {hasExecutionInput ? (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                {inputLabel}
              </span>
              {config.mode === "function" ? (
                <span className="text-xs text-slate-500">
                  Enter arguments using this exercise&apos;s serialized function-test format for{" "}
                  <code>{config.functionSignature}</code>. Vectors use a count followed by their
                  elements.
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Written to standard input when the program starts. This is not{" "}
                  <code className="font-mono">main(argc, argv)</code> command-line input. Standard
                  input stays open, so you can answer later reads in the Terminal.
                </span>
              )}
              <textarea
                value={c.stdin}
                onChange={(event) => c.setStdin(event.target.value)}
                rows={2}
                className="rounded-lg border border-slate-200 p-2 font-mono text-xs"
                data-testid="code-stdin"
                placeholder="Input written to the program when it starts"
              />
            </label>
          ) : null}

          {c.predictionEnabled ? (
            <PredictionBeforeRun
              prompts={c.predictionPrompts}
              values={c.predictions}
              onChange={c.setPrediction}
              comparisons={c.comparisons}
              required={c.requireBeforeRun}
              missingRequired={c.missingRequired}
            />
          ) : null}

          <CodeRunControls
            busy={c.busy}
            onAction={onAction}
            hasError={c.hasRunError}
            runDisabled={c.missingRequired || terminalRefused}
            terminalActive={terminal.isActive}
            terminalStarting={terminal.starting}
            onStop={terminal.stop}
          />

          {terminal.isStale ? (
            <div
              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
              role="alert"
              data-testid="code-terminal-stale"
            >
              The running program uses an older version of your code. Stop it before running the
              changed code.
            </div>
          ) : null}

          {c.error ? (
            <p className="text-xs font-bold text-amber-700" role="alert">
              {c.error}
            </p>
          ) : null}

          {c.traceEnabled ? (
            <TraceControls
              visibleTests={config.visibleTests}
              selected={c.traceSource}
              onSelect={c.setTraceSource}
              onTrace={c.handleTrace}
              busy={c.tracePending}
              disabled={c.busy !== null || c.source.trim().length === 0}
            />
          ) : null}

          {c.checklists.length > 0 ? (
            <BoundaryChecklistPanel
              checklists={c.checklists}
              onUseSampleInput={config.mode === "stdin" ? c.setStdin : undefined}
              defaultExpanded={c.suggestChecklist}
            />
          ) : null}
        </section>

        <aside className="grid min-w-0 gap-3 xl:max-h-[calc(100vh-12rem)] xl:overflow-auto xl:pr-1">
          <div
            className="rounded-xl border border-slate-200 bg-white p-3"
            data-testid="code-lab-terminal-column"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Terminal
            </p>
            <CodeTerminalPanel
              status={terminal.status}
              events={terminal.events}
              exitCode={terminal.exitCode}
              durationMs={terminal.durationMs}
              outputTruncated={terminal.outputTruncated}
              message={terminal.message}
              isActive={terminal.isActive}
              isFinished={terminal.isFinished}
              sending={terminal.sending}
              inputError={terminal.inputError}
              attemptSaveStatus={terminal.attemptSaveStatus}
              attemptSaveError={terminal.attemptSaveError}
              onSend={terminal.sendInput}
              onEof={terminal.sendEof}
              onClearError={terminal.clearInputError}
              onRetryAttemptSave={terminal.retryAttemptSave}
            />
          </div>
          <TestResultsPanel result={c.testResult} />
          <ErrorRemediationPanel
            recommendation={c.remediation}
            onAction={c.handleRemediationAction}
          />
          {/* Avoid competing cards: show the scaffold suggestion only when there is
              no error-pattern remediation to act on. */}
          {c.remediation ? null : <ScaffoldRecommendationCard recommendation={c.scaffold} />}
          <AiCodeReviewPanel
            review={c.review}
            pending={c.busy === "review" || c.busy === "explain"}
          />
          {c.traceEnabled ? <AiTracePanel trace={c.trace} pending={c.tracePending} /> : null}
        </aside>
      </CardContent>
    </Card>
  );
}
