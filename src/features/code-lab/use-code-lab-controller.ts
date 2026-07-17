"use client";

import { useMemo, useRef, useState } from "react";
import type {
  CodeRunResult,
  CodeTestResult,
  LearningItemCodeLab
} from "./code-lab-types";
import type { StructuredCodeFeedback } from "./code-feedback-types";
import type { CodeAction } from "./code-run-controls";
import type { TraceSource } from "./trace-controls";
import { getBoundaryChecklistsForCodeLab } from "./boundary-checklist-service";
import { getDefaultPredictionPrompts } from "./prediction-prompts";
import { hasRequiredPredictions, isPredictionEnabled, shouldRequirePredictionBeforeRun } from "./prediction-service";
import { comparePredictionsToRunResult } from "./prediction-comparison";
import type { CodePredictionComparison, CodePredictionSubmission } from "./prediction-types";
import { buildCodeRemediationRecommendation } from "./error-remediation-service";
import type { CodeRemediationRecommendation } from "./error-remediation-types";
import type { CodeTagClassification } from "./code-error-tags";
import { selectScaffoldLevel } from "@/features/recommendations/scaffold-selector";
import type { ScaffoldRecommendation } from "@/features/recommendations/scaffold-selector-types";
import type { CodeTraceResult } from "./code-trace-types";
import {
  reviewCodeRequest,
  runCodeRequest,
  runTestsRequest,
  traceCodeRequest
} from "./code-lab-client";
import { useCodeDraft } from "./use-code-draft";

export type CodeLabControllerArgs = {
  itemId: string;
  config: LearningItemCodeLab;
  /** Published version this tab loaded — sent with run/test so the server can
   * refuse a stale run after a user exercise is republished (#488). */
  contentVersionId?: string;
  /** Active milestone index for a user lab; run/test grade this checkpoint (#489). */
  milestoneIndex?: number;
  onResult?: (result: { run?: CodeRunResult | null; test?: CodeTestResult | null; source?: string }) => void;
};

/**
 * Shared Code Lab orchestration (#407). Holds all run/test/review/trace state and
 * the handlers that talk to the server-side route handlers, so the embedded
 * lesson view and the full-page workspace render the same behavior from one
 * source of truth instead of duplicating it.
 */
export function useCodeLabController({ itemId, config, contentVersionId, milestoneIndex, onResult }: CodeLabControllerArgs) {
  const [source, setSource] = useState(config.starterCode);
  // Autosave/resume: hydrates source from the saved draft on mount and persists
  // edits (cross-device when signed in, localStorage otherwise). #431
  const {
    status: draftStatus,
    hasPreviousVersionDraft,
    copyPreviousVersionDraft
  } = useCodeDraft({
    itemId,
    starterCode: config.starterCode,
    source,
    setSource,
    contentVersionId
  });
  const [stdin, setStdin] = useState(config.stdin ?? "");
  const [busy, setBusy] = useState<CodeAction | null>(null);
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
  const [testResult, setTestResult] = useState<CodeTestResult | null>(null);
  const [review, setReview] = useState<StructuredCodeFeedback | null>(null);
  const [trace, setTrace] = useState<CodeTraceResult | null>(null);
  const [tracePending, setTracePending] = useState(false);
  const [traceSource, setTraceSource] = useState<TraceSource>({ kind: "stdin" });
  const [error, setError] = useState<string | null>(null);
  // Latched once Run or Test reports the item is gone, so both tabs agree and the
  // actions can be disabled after the first definitive unavailable response (#614).
  const [itemUnavailable, setItemUnavailable] = useState(false);
  const runResultRef = useRef<CodeRunResult | null>(null);
  const testResultRef = useRef<CodeTestResult | null>(null);

  const traceEnabled = config.traceEnabled !== false;
  const predictionEnabled = isPredictionEnabled(config);
  const predictionPrompts = useMemo(
    () => (predictionEnabled ? getDefaultPredictionPrompts(config) : []),
    [predictionEnabled, config]
  );
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [comparisons, setComparisons] = useState<CodePredictionComparison[] | null>(null);
  const submissions = useMemo<CodePredictionSubmission[]>(
    () =>
      Object.entries(predictions)
        .filter(([, value]) => value.trim().length > 0)
        .map(([promptId, value]) => ({ promptId, value, createdAt: "" })),
    [predictions]
  );
  const requireBeforeRun = shouldRequirePredictionBeforeRun(config);
  const missingRequired =
    requireBeforeRun && !hasRequiredPredictions({ prompts: predictionPrompts, submissions });

  const checklists = useMemo(() => getBoundaryChecklistsForCodeLab(config), [config]);
  const [recentClassifications, setRecentClassifications] = useState<CodeTagClassification[]>([]);
  const [remediation, setRemediation] = useState<CodeRemediationRecommendation | null>(null);
  const [scaffold, setScaffold] = useState<ScaffoldRecommendation | null>(null);

  function updateScaffold(latest: CodeTagClassification[], correctness: number | undefined) {
    setScaffold(
      selectScaffoldLevel({
        skillId: config.skillTags?.[0] ?? "",
        masteryStatus: "learning",
        recentCorrectness: correctness,
        recentCodeErrorTags: latest.map((c) => c.tag),
        // The client only knows about the current code-capable item; richer
        // availability is resolved server-side on the dashboard.
        availableItems: [
          { id: itemId, type: "code_lab", skillIds: config.skillTags ?? [], hasCodeLab: true }
        ]
      })
    );
  }
  const suggestChecklist =
    review?.nextAction === "try_boundary_case_checklist" ||
    trace?.feedback?.nextAction === "try_boundary_case_checklist" ||
    remediation?.action === "use_boundary_checklist";

  function applyClassifications(latest: CodeTagClassification[]) {
    const next = [...recentClassifications, ...latest].slice(-20);
    setRecentClassifications(next);
    setRemediation(
      buildCodeRemediationRecommendation({
        itemId,
        skillIds: config.skillTags ?? [],
        classifications: latest,
        recentClassifications: next,
        boundaryChecklists: checklists
      })
    );
  }

  function handleRemediationAction(rec: CodeRemediationRecommendation) {
    if (rec.action === "trace_with_ai" && traceEnabled) {
      void handleTrace();
    }
    // Other actions (checklist/completion/parsons/review/retry) surface their
    // target inline; the checklist auto-expands via suggestChecklist.
  }
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
        lastTestResult: testResultRef.current,
        contentVersionId,
        milestoneIndex
      });
      setTrace(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Try again.");
    } finally {
      setTracePending(false);
    }
  }

  function updatePredictionComparisons() {
    if (!predictionEnabled) return;
    setComparisons(
      comparePredictionsToRunResult({
        prompts: predictionPrompts,
        submissions,
        runResult: runResultRef.current ?? undefined,
        testResult: testResultRef.current ?? undefined
      })
    );
  }

  async function handleAction(action: CodeAction) {
    if ((action === "run" || action === "test") && (missingRequired || itemUnavailable)) return;
    setBusy(action);
    setError(null);
    try {
      if (action === "run") {
        setReview(null);
        const result = await runCodeRequest({ itemId, source, stdin, contentVersionId, milestoneIndex });
        setRunResult(result);
        runResultRef.current = result;
        // An unavailable item never executed: show the message but record no
        // mastery/scaffold/remediation evidence and don't signal completion (#614).
        if (result.itemUnavailable) {
          setItemUnavailable(true);
        } else {
          updatePredictionComparisons();
          applyClassifications(result.classifications ?? []);
          updateScaffold(result.classifications ?? [], undefined);
          onResult?.({ run: result, test: testResultRef.current, source });
        }
      } else if (action === "test") {
        setReview(null);
        const result = await runTestsRequest({ itemId, source, contentVersionId, milestoneIndex });
        setTestResult(result);
        testResultRef.current = result;
        if (result.itemUnavailable) {
          setItemUnavailable(true);
        } else {
          updatePredictionComparisons();
          applyClassifications(result.classifications ?? []);
          updateScaffold(
            result.classifications ?? [],
            result.total > 0 ? result.passed / result.total : undefined
          );
          onResult?.({ run: runResultRef.current, test: result, source });
        }
      } else {
        const result = await reviewCodeRequest({
          itemId,
          source,
          lastRunResult: runResultRef.current,
          lastTestResult: testResultRef.current,
          userQuestion:
            action === "explain"
              ? "Explain the compiler or runtime error in beginner-friendly terms."
              : undefined,
          contentVersionId,
          milestoneIndex
        });
        setReview(result);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Try again.");
    } finally {
      setBusy(null);
    }
  }

  function setPrediction(promptId: string, value: string) {
    setPredictions((prev) => ({ ...prev, [promptId]: value }));
  }

  return {
    source,
    setSource,
    draftStatus,
    hasPreviousVersionDraft,
    copyPreviousVersionDraft,
    stdin,
    setStdin,
    busy,
    runResult,
    testResult,
    review,
    trace,
    tracePending,
    traceSource,
    setTraceSource,
    error,
    traceEnabled,
    predictionEnabled,
    predictionPrompts,
    predictions,
    setPrediction,
    comparisons,
    requireBeforeRun,
    missingRequired,
    itemUnavailable,
    checklists,
    remediation,
    scaffold,
    suggestChecklist,
    hasRunError,
    handleTrace,
    handleAction,
    handleRemediationAction
  };
}

export type CodeLabController = ReturnType<typeof useCodeLabController>;
