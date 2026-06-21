"use client";

import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedContent } from "@/features/learning-items/formatted-content";
import type {
  CodeRunResult,
  CodeTestResult,
  LearningItemCodeLab
} from "./code-lab-types";
import type { StructuredCodeFeedback } from "./code-feedback-types";
import { CodeEditor } from "./code-editor";
import { CodeRunControls, type CodeAction } from "./code-run-controls";
import { CodeOutputPanel } from "./code-output-panel";
import { TestResultsPanel } from "./test-results-panel";
import { AiCodeReviewPanel } from "./ai-code-review-panel";
import { TraceControls, type TraceSource } from "./trace-controls";
import { AiTracePanel } from "./ai-trace-panel";
import { BoundaryChecklistPanel } from "./boundary-checklist";
import { getBoundaryChecklistsForCodeLab } from "./boundary-checklist-service";
import type { CodeTraceResult } from "./code-trace-types";
import {
  reviewCodeRequest,
  runCodeRequest,
  runTestsRequest,
  traceCodeRequest
} from "./code-lab-client";

/**
 * Main Code Lab client component (#407). Composes the editor, run/test controls,
 * output, visible test results, and AI review. All execution and AI work happens
 * server-side via the route handlers; this component only orchestrates state.
 */
export function CodeLab({ itemId, config }: { itemId: string; config: LearningItemCodeLab }) {
  const [source, setSource] = useState(config.starterCode);
  const [stdin, setStdin] = useState(config.stdin ?? "");
  const [busy, setBusy] = useState<CodeAction | null>(null);
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
  const [testResult, setTestResult] = useState<CodeTestResult | null>(null);
  const [review, setReview] = useState<StructuredCodeFeedback | null>(null);
  const [trace, setTrace] = useState<CodeTraceResult | null>(null);
  const [tracePending, setTracePending] = useState(false);
  const [traceSource, setTraceSource] = useState<TraceSource>({ kind: "stdin" });
  const [error, setError] = useState<string | null>(null);
  const runResultRef = useRef<CodeRunResult | null>(null);
  const testResultRef = useRef<CodeTestResult | null>(null);

  const traceEnabled = config.traceEnabled !== false;
  const checklists = useMemo(() => getBoundaryChecklistsForCodeLab(config), [config]);
  const suggestChecklist =
    review?.nextAction === "try_boundary_case_checklist" ||
    trace?.feedback?.nextAction === "try_boundary_case_checklist";
  const hasRunError =
    runResult !== null &&
    runResult.status !== "success" &&
    runResult.status !== "runner_unconfigured";

  async function handleTrace() {
    setTracePending(true);
    setError(null);
    try {
      const result = await traceCodeRequest({
        itemId,
        source,
        selectedTestName: traceSource.kind === "visible-test" ? traceSource.name : undefined,
        selectedInput: traceSource.kind === "stdin" ? stdin : undefined,
        selectedActualOutput: runResultRef.current?.stdout,
        lastRunResult: runResultRef.current,
        lastTestResult: testResultRef.current
      });
      setTrace(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Try again.");
    } finally {
      setTracePending(false);
    }
  }

  async function handleAction(action: CodeAction) {
    setBusy(action);
    setError(null);
    try {
      if (action === "run") {
        setReview(null);
        const result = await runCodeRequest({ itemId, source, stdin });
        setRunResult(result);
        runResultRef.current = result;
      } else if (action === "test") {
        setReview(null);
        const result = await runTestsRequest({ itemId, source });
        setTestResult(result);
        testResultRef.current = result;
      } else {
        const result = await reviewCodeRequest({
          itemId,
          source,
          lastRunResult: runResultRef.current,
          lastTestResult: testResultRef.current,
          userQuestion:
            action === "explain"
              ? "Explain the compiler or runtime error in beginner-friendly terms."
              : undefined
        });
        setReview(result);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm" data-testid="code-lab">
      <CardHeader>
        <span className="w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
          Code Lab
        </span>
        <CardTitle className="mt-2 text-base">Write and run C++</CardTitle>
        {config.prompt ? (
          <div className="text-sm text-slate-700">
            <FormattedContent content={config.prompt} />
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3">
        <CodeEditor value={source} onChange={setSource} label="C++ source code" />

        {config.mode === "stdin" ? (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Standard input (stdin)
            </span>
            <textarea
              value={stdin}
              onChange={(event) => setStdin(event.target.value)}
              rows={2}
              className="rounded-lg border border-slate-200 p-2 font-mono text-xs"
              data-testid="code-stdin"
              placeholder="Input passed to the program"
            />
          </label>
        ) : null}

        <CodeRunControls busy={busy} onAction={handleAction} hasError={hasRunError} />

        {error ? (
          <p className="text-xs font-bold text-amber-700" role="alert">
            {error}
          </p>
        ) : null}

        {traceEnabled ? (
          <TraceControls
            visibleTests={config.visibleTests}
            selected={traceSource}
            onSelect={setTraceSource}
            onTrace={handleTrace}
            busy={tracePending}
            disabled={busy !== null || source.trim().length === 0}
          />
        ) : null}

        {checklists.length > 0 ? (
          <BoundaryChecklistPanel
            checklists={checklists}
            onUseSampleInput={config.mode === "stdin" ? setStdin : undefined}
            defaultExpanded={suggestChecklist}
          />
        ) : null}

        <CodeOutputPanel result={runResult} />
        <TestResultsPanel result={testResult} />
        <AiCodeReviewPanel review={review} pending={busy === "review" || busy === "explain"} />
        {traceEnabled ? <AiTracePanel trace={trace} pending={tracePending} /> : null}
      </CardContent>
    </Card>
  );
}
