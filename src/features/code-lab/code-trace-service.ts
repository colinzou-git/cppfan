import {
  AiProviderError,
  completeAiResponse,
  isAiChatEnabled
} from "@/features/ai-chat/ai-chat-provider";
import type { CodeTraceRequest, CodeTraceResult, CodeTraceStep } from "./code-trace-types";
import { CODE_TRACE_DISCLAIMER } from "./code-trace-types";
import { resolveCodeLabItem, CODE_LAB_STALE_NOTE } from "./code-lab-item-resolver";
import { buildTraceMessages } from "./code-trace-prompts";
import { normalizeCodeErrorTags } from "./code-feedback-parser";
import {
  CODE_FEEDBACK_NEXT_ACTIONS,
  CODE_FEEDBACK_SCHEMA_VERSION,
  type CodeFeedbackNextAction
} from "./code-feedback-types";

/**
 * Server-only orchestration for the AI trace (#408). Reads item config, builds
 * the prompt from VISIBLE context only, calls the provider, and parses a strict
 * trace shape. Compile errors never become fabricated runtime steps; the
 * disclaimer is always attached to a successful trace.
 */

const UNAVAILABLE_MESSAGE =
  "AI trace is not available right now. Run and test your code — those results are the source of truth.";

function compileErrorTrace(request: CodeTraceRequest): CodeTraceResult | null {
  const run = request.lastRunResult;
  if (run && run.status === "compile_error") {
    return {
      status: "ok",
      codeSummary: "The program could not be compiled, so it never ran.",
      inputSummary: request.selectedInput,
      steps: [],
      likelyIssue:
        "Your code did not compile, so there is no runtime execution to trace. Fix the compiler error first.",
      nextHint: "Read the compiler output below and address the first error it reports.",
      confidence: "high",
      disclaimer: CODE_TRACE_DISCLAIMER
    };
  }
  return null;
}

export async function traceCode(
  request: CodeTraceRequest,
  signal: AbortSignal
): Promise<CodeTraceResult> {
  if (!isAiChatEnabled()) {
    return {
      status: "unavailable",
      steps: [],
      confidence: "low",
      disclaimer: CODE_TRACE_DISCLAIMER,
      message: UNAVAILABLE_MESSAGE
    };
  }

  // A compile error is explained as a blocker without asking the model to invent
  // runtime steps.
  const compileTrace = compileErrorTrace(request);
  if (compileTrace) return compileTrace;

  // One shared resolver: native or any user-created executable kind, at the
  // active milestone, refused when the loaded version is stale (#611).
  const resolved = await resolveCodeLabItem({
    itemId: request.itemId,
    expectedContentVersionId: request.contentVersionId,
    milestoneIndex: request.milestoneIndex
  });
  if (resolved.status === "stale_definition") {
    return {
      status: "unavailable",
      steps: [],
      confidence: "low",
      disclaimer: CODE_TRACE_DISCLAIMER,
      message: CODE_LAB_STALE_NOTE,
      staleDefinition: true
    };
  }
  const item = resolved.status === "ok" ? resolved.item : null;
  const messages = buildTraceMessages(request, {
    prompt: item?.prompt ?? "",
    skillTags: item?.skillTags ?? []
  });

  try {
    const raw = await completeAiResponse({ messages, signal });
    return parseTraceResponse(raw);
  } catch (error) {
    if (error instanceof AiProviderError) {
      return {
        status: "unavailable",
        steps: [],
        confidence: "low",
        disclaimer: CODE_TRACE_DISCLAIMER,
        message: UNAVAILABLE_MESSAGE
      };
    }
    throw error;
  }
}

export function parseTraceResponse(raw: string): CodeTraceResult {
  const parsed = extractJson(raw);
  if (!parsed) {
    const text = raw.trim();
    if (!text) {
      return {
        status: "unavailable",
        steps: [],
        confidence: "low",
        disclaimer: CODE_TRACE_DISCLAIMER,
        message: UNAVAILABLE_MESSAGE
      };
    }
    // Non-JSON prose (e.g. the fake provider): present it as the code summary so
    // the learner still gets a readable, clearly-labelled explanation.
    return {
      status: "ok",
      codeSummary: text,
      steps: [],
      confidence: "low",
      disclaimer: CODE_TRACE_DISCLAIMER
    };
  }

  const codeSummary = asString(parsed.codeSummary) || undefined;
  const likelyIssue = asString(parsed.likelyIssue) || undefined;
  const relatedSkills = asStringArray(parsed.relatedSkills);
  const confidence = asConfidence(parsed.confidence);

  return {
    status: "ok",
    codeSummary,
    inputSummary: asString(parsed.inputSummary) || undefined,
    steps: parseSteps(parsed.steps),
    likelyIssue,
    nextHint: asString(parsed.nextHint) || undefined,
    relatedSkills,
    confidence,
    disclaimer: CODE_TRACE_DISCLAIMER,
    feedback: {
      schemaVersion: CODE_FEEDBACK_SCHEMA_VERSION,
      status: "ok",
      summary: codeSummary ?? "",
      likelyIssue,
      errorTags: normalizeCodeErrorTags(parsed.errorTags),
      relatedSkills: relatedSkills ?? [],
      nextAction: clampNextAction(parsed.nextAction),
      confidence,
      learnerMessage: codeSummary || likelyIssue || CODE_TRACE_DISCLAIMER,
      evidenceStrength: "weak_ai_inference"
    }
  };
}

function clampNextAction(value: unknown): CodeFeedbackNextAction | undefined {
  return CODE_FEEDBACK_NEXT_ACTIONS.includes(value as CodeFeedbackNextAction)
    ? (value as CodeFeedbackNextAction)
    : undefined;
}

function parseSteps(value: unknown): CodeTraceStep[] {
  if (!Array.isArray(value)) return [];
  const steps: CodeTraceStep[] = [];
  value.forEach((entry, index) => {
    if (typeof entry !== "object" || entry === null) return;
    const record = entry as Record<string, unknown>;
    const explanation = asString(record.explanation);
    if (!explanation) return;
    steps.push({
      step: typeof record.step === "number" ? record.step : index + 1,
      lineHint: asString(record.lineHint) || undefined,
      variables: asStringRecord(record.variables),
      explanation
    });
  });
  return steps;
}

function extractJson(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const list = value.filter((entry): entry is string => typeof entry === "string");
  return list.length > 0 ? list : undefined;
}

function asStringRecord(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") out[key] = entry;
    else if (typeof entry === "number" || typeof entry === "boolean") out[key] = String(entry);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function asConfidence(value: unknown): "low" | "medium" | "high" {
  return value === "high" || value === "medium" || value === "low" ? value : "low";
}
