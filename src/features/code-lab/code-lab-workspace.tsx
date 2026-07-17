"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormattedContent } from "@/features/learning-items/formatted-content";
import type { CodeRunResult, CodeTestResult, LearningItemCodeLab } from "./code-lab-types";
import { CodeEditor } from "./code-editor";
import { CodeRunControls, type CodeAction } from "./code-run-controls";
import { CodeOutputPanel } from "./code-output-panel";
import { TestResultsPanel } from "./test-results-panel";
import { AiCodeReviewPanel } from "./ai-code-review-panel";
import { TraceControls } from "./trace-controls";
import { AiTracePanel } from "./ai-trace-panel";
import { BoundaryChecklistPanel } from "./boundary-checklist";
import { PredictionBeforeRun } from "./prediction-before-run";
import { SelfEvaluationPanel } from "./self-evaluation-panel";
import { submitSelfEvaluation } from "./self-evaluation-action";
import { AiEvaluationPanel } from "./ai-evaluation-panel";
import { submitFormalEvaluation } from "./formal-evaluation-action";
import { ErrorRemediationPanel } from "./error-remediation-panel";
import { ScaffoldRecommendationCard } from "@/features/recommendations/scaffold-recommendation-card";
import { ResizableColumns } from "./resizable-columns";
import { CodeLabChat } from "./code-lab-chat";
import { DebugTabPanel } from "./debug-tab-panel";
import { useCodeBreakpoints } from "./use-code-breakpoints";
import { useCodeDebugger } from "./use-code-debugger";
import { useCodeLabController } from "./use-code-lab-controller";

type DockTab = "output" | "tests" | "stdin" | "debug" | "ai";

/**
 * Full-page Code Lab workspace (#431). Option 1 layout: a problem panel on the
 * left, the editor centered at full height, and a tabbed output dock on the
 * right whose header carries the file title and run/test controls. On wide
 * screens the three columns are user-resizable (default 1/6 · 1/2 · 1/3); below
 * `xl` it falls back to a single scrolling column so iPhone/iPad stay usable.
 */
export function CodeLabWorkspace({
  itemId,
  title,
  config,
  sourceVersion = "1",
  contentVersionId,
  milestoneIndex,
  onResult,
  backHref,
  backLabel
}: {
  itemId: string;
  title: string;
  config: LearningItemCodeLab;
  /** Item version (updated_at) so saved chat threads invalidate when the item changes. */
  sourceVersion?: string;
  /** Published version id for a user exercise; run/test refuse a stale tab (#488). */
  contentVersionId?: string;
  /** Active milestone index for a user lab; run/test grade this checkpoint (#489). */
  milestoneIndex?: number;
  /** Notified after each run/test — a lab wrapper uses this to track milestone completion (#489). */
  onResult?: (result: { run?: CodeRunResult | null; test?: CodeTestResult | null; source?: string }) => void;
  /** Back-link target; defaults to the lesson page. Project labs pass /labs (#439). */
  backHref?: string;
  /** Back-link label; defaults to "Back to lesson". Project labs pass "Back to project labs". */
  backLabel?: string;
}) {
  const c = useCodeLabController({ itemId, config, contentVersionId, milestoneIndex, onResult });
  const breakpointState = useCodeBreakpoints(itemId);
  const debug = useCodeDebugger({
    itemId,
    source: c.source,
    stdin: c.stdin,
    breakpoints: breakpointState.breakpoints,
    contentVersionId,
    milestoneIndex
  });
  const [tab, setTab] = useState<DockTab>("output");
  const [aiFullscreen, setAiFullscreen] = useState(false);
  const isWide = useIsWide();

  // Close the fullscreen AI reading mode with Escape (#466).
  useEffect(() => {
    if (!aiFullscreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAiFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiFullscreen]);
  const resolvedBackHref = backHref ?? `/learn/${encodeURIComponent(itemId)}`;
  const resolvedBackLabel = backLabel ?? "Back to lesson";

  function onAction(action: CodeAction) {
    if (action === "run") setTab("output");
    else if (action === "test") setTab("tests");
    else setTab("ai");
    c.handleAction(action);
  }

  const staleDefinition = Boolean(c.runResult?.staleDefinition || c.testResult?.staleDefinition);

  const controls = (
    <div className="flex flex-col gap-2">
      <CodeRunControls
        busy={c.busy}
        onAction={onAction}
        hasError={c.hasRunError}
        runDisabled={c.missingRequired || c.itemUnavailable}
      />
      {c.hasPreviousVersionDraft ? (
        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
          data-testid="code-lab-previous-draft"
        >
          <span>You have code saved from an earlier version of this item.</span>
          <button
            type="button"
            onClick={c.copyPreviousVersionDraft}
            className="rounded-md border border-slate-400 px-2 py-1 font-bold text-slate-800 hover:bg-slate-100"
          >
            Copy code from previous version
          </button>
        </div>
      ) : null}
      {c.itemUnavailable ? (
        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800"
          role="alert"
          data-testid="code-lab-item-unavailable"
        >
          <span>This exercise is no longer available. Return to the catalog or reload if it was recently republished.</span>
          <Link href={resolvedBackHref} className="rounded-md bg-rose-600 px-2 py-1 text-white hover:bg-rose-700">
            {resolvedBackLabel}
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md border border-rose-400 px-2 py-1 text-rose-800 hover:bg-rose-100"
          >
            Reload
          </button>
        </div>
      ) : null}
      {staleDefinition ? (
        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
          role="alert"
          data-testid="code-lab-stale-definition"
        >
          <span>This exercise was republished. Reload to run against the current version.</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-amber-600 px-2 py-1 text-white hover:bg-amber-700"
          >
            Reload
          </button>
        </div>
      ) : null}
      {c.error ? (
        <p className="text-xs font-bold text-amber-700" role="alert">
          {c.error}
        </p>
      ) : null}
    </div>
  );

  const problemPanel = (
    <div className="flex flex-col gap-4 p-4">
      <Link
        href={resolvedBackHref}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {resolvedBackLabel}
      </Link>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Problem</p>
        <h1 className="mt-1 text-base font-bold text-slate-900">{title}</h1>
      </div>
      {config.prompt ? (
        <div className="text-sm text-slate-700">
          <FormattedContent content={config.prompt} />
        </div>
      ) : null}
      {config.skillTags && config.skillTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {config.skillTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {config.evaluationMode === "self_evaluation" ? (
        // The AUTHORITATIVE completion action for a self-evaluated item (#609),
        // distinct from the optional AI help/review below.
        <SelfEvaluationPanel
          onSubmit={(rating, reflection) => submitSelfEvaluation({ itemId, contentVersionId, rating, reflection })}
        />
      ) : null}
      {config.evaluationMode === "ai_evaluation" ||
      config.evaluationMode === "automated_plus_ai" ||
      config.evaluationMode === "judge_plus_ai" ? (
        <AiEvaluationPanel
          mode={config.evaluationMode}
          onSubmit={() =>
            submitFormalEvaluation({ itemId, contentVersionId, source: c.source, mode: config.evaluationMode as "ai_evaluation" })
          }
        />
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
      {c.checklists.length > 0 ? (
        <BoundaryChecklistPanel
          checklists={c.checklists}
          onUseSampleInput={config.mode === "stdin" ? c.setStdin : undefined}
          defaultExpanded={c.suggestChecklist}
        />
      ) : null}
    </div>
  );

  const stdinField =
    config.mode === "stdin" ? (
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Standard input (stdin)
        </span>
        <textarea
          value={c.stdin}
          onChange={(event) => c.setStdin(event.target.value)}
          rows={4}
          className="rounded-lg border border-slate-200 p-2 font-mono text-xs"
          data-testid="code-stdin"
          placeholder="Input passed to the program"
        />
      </label>
    ) : (
      <p className="text-sm text-slate-500">This exercise does not read standard input.</p>
    );

  const aiPanel = (
    <div className="flex flex-col gap-3">
      <CodeLabChat
        itemId={itemId}
        title={title}
        prompt={config.prompt ?? title}
        topic={config.skillTags && config.skillTags.length > 0 ? config.skillTags.join(", ") : undefined}
        sourceVersion={sourceVersion}
        source={c.source}
        fullscreen={aiFullscreen}
      />
      <ErrorRemediationPanel recommendation={c.remediation} onAction={c.handleRemediationAction} />
      {c.remediation ? null : <ScaffoldRecommendationCard recommendation={c.scaffold} />}
      <AiCodeReviewPanel review={c.review} pending={c.busy === "review" || c.busy === "explain"} />
      {c.traceEnabled ? (
        <>
          <TraceControls
            visibleTests={config.visibleTests}
            selected={c.traceSource}
            onSelect={c.setTraceSource}
            onTrace={c.handleTrace}
            busy={c.tracePending}
            disabled={c.busy !== null || c.source.trim().length === 0}
          />
          <AiTracePanel trace={c.trace} pending={c.tracePending} />
        </>
      ) : null}
    </div>
  );

  const tabs: { id: DockTab; label: string }[] = [
    { id: "output", label: "Output" },
    { id: "tests", label: "Tests" },
    ...(config.mode === "stdin" ? [{ id: "stdin" as const, label: "Input" }] : []),
    { id: "debug", label: "Debug" },
    { id: "ai", label: "AI" }
  ];

  const rightDock = (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-b border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-slate-800">main.cpp</span>
          <span className="text-xs text-slate-400">C++20 · Judge0</span>
        </div>
        {controls}
      </div>
      <div className="flex gap-1 border-b border-slate-200 px-2 pt-2" role="tablist" aria-label="Code Lab output">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-3 py-1.5 text-xs font-bold ${
              tab === t.id
                ? "border-b-2 border-blue-600 text-blue-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
            data-testid={`code-lab-tab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3" role="tabpanel">
        {tab === "output" ? (
          c.runResult ? (
            <CodeOutputPanel result={c.runResult} />
          ) : (
            <p className="text-sm text-slate-500">Run your program to see compiler and program output here.</p>
          )
        ) : null}
        {tab === "tests" ? (
          c.testResult ? (
            <TestResultsPanel result={c.testResult} />
          ) : (
            <p className="text-sm text-slate-500">Run the tests to see which cases pass.</p>
          )
        ) : null}
        {tab === "stdin" ? stdinField : null}
        {tab === "debug" ? <DebugTabPanel breakpoints={breakpointState} debug={debug} /> : null}
        {tab === "ai" ? (
          // One mounted AI panel (and one CodeLabChat): the wrapper toggles to a
          // fixed fullscreen reading mode in place, so chat draft/messages survive
          // open/close (#466).
          <div
            className={
              aiFullscreen
                ? "fixed inset-0 z-50 flex flex-col bg-white"
                : "flex min-h-0 flex-1 flex-col"
            }
            role={aiFullscreen ? "dialog" : undefined}
            aria-modal={aiFullscreen ? true : undefined}
            aria-label={aiFullscreen ? "Fullscreen AI tab" : undefined}
            data-testid={aiFullscreen ? "code-lab-ai-fullscreen" : "code-lab-ai-panel"}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
              <span className="text-sm font-bold text-slate-800">AI tutor</span>
              {aiFullscreen ? (
                <button
                  type="button"
                  onClick={() => setAiFullscreen(false)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  data-testid="code-lab-ai-fullscreen-close"
                >
                  Exit full screen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAiFullscreen(true)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  data-testid="code-lab-ai-fullscreen-toggle"
                >
                  Full screen
                </button>
              )}
            </div>
            <div className={aiFullscreen ? "min-h-0 flex-1 overflow-auto p-4" : "min-h-0 flex-1 overflow-auto"}>
              <div
                className={
                  aiFullscreen
                    ? "mx-auto flex min-h-full w-full max-w-5xl flex-col gap-3"
                    : "flex min-h-0 flex-col gap-3"
                }
              >
                {aiPanel}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  if (!isWide) {
    // Stacked single column for iPad/iPhone: problem, editor, controls, then the
    // output dock — no horizontal resizing on narrow screens.
    return (
      <div className="flex flex-col gap-4" data-testid="code-lab-workspace">
        {problemPanel}
        <div className="flex flex-col gap-1 px-4">
          <CodeEditor
            value={c.source}
            onChange={c.setSource}
            label="C++ source code"
            breakpoints={breakpointState.breakpoints}
            debugLine={debug.snapshot?.line ?? null}
            onToggleBreakpoint={breakpointState.toggleBreakpoint}
          />
          <DraftStatusLine status={c.draftStatus} />
        </div>
        <div className="px-4">{controls}</div>
        <div className="border-t border-slate-200">{rightDock}</div>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-3rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white"
      data-testid="code-lab-workspace"
    >
      <ResizableColumns
        storageKey="cppfan:code-lab:columns"
        left={<div className="h-full border-r border-slate-200 bg-slate-50/60">{problemPanel}</div>}
        center={
          <div className="flex h-full flex-col gap-1 bg-slate-100 p-3">
            <CodeEditor
              value={c.source}
              onChange={c.setSource}
              label="C++ source code"
              fill
              breakpoints={breakpointState.breakpoints}
              debugLine={debug.snapshot?.line ?? null}
              onToggleBreakpoint={breakpointState.toggleBreakpoint}
            />
            <DraftStatusLine status={c.draftStatus} />
          </div>
        }
        right={<div className="h-full border-l border-slate-200">{rightDock}</div>}
      />
    </div>
  );
}

function DraftStatusLine({ status }: { status: "idle" | "saving" | "saved" }) {
  const label = status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Autosaves as you type";
  return (
    <p className="text-right text-[11px] text-slate-500" data-testid="code-lab-draft-status" aria-live="polite">
      {label}
    </p>
  );
}

/** Track the `xl` (≥1280px) breakpoint client-side without a hydration mismatch. */
function useIsWide(): boolean {
  const [isWide, setIsWide] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isWide;
}
