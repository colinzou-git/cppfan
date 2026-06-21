import type { AiProviderMessage } from "@/features/ai-chat/ai-chat-policy";
import {
  AiProviderError,
  completeAiResponse,
  isAiChatEnabled
} from "@/features/ai-chat/ai-chat-provider";
import type { CodeReviewRequest } from "./code-lab-types";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { buildStructuredCodeReviewPrompt } from "./code-feedback-prompts";
import { parseStructuredCodeFeedback } from "./code-feedback-parser";
import {
  CODE_FEEDBACK_SCHEMA_VERSION,
  type StructuredCodeFeedback
} from "./code-feedback-types";

/**
 * Build structured AI review of a learner's C++ submission (#407, structured in
 * #410). Server-only: reads item config, learner code, and run/test summaries,
 * then asks the provider for hint-first, JSON-structured feedback. Hidden test
 * inputs/outputs are never included (only aggregate pass/fail counts). Returns
 * StructuredCodeFeedback — advisory weak evidence that never overrides the
 * deterministic compile/test outcome.
 */

const UNAVAILABLE_MESSAGE =
  "AI review is not available right now. You can still run your code and the visible tests.";

function unavailableFeedback(): StructuredCodeFeedback {
  return {
    schemaVersion: CODE_FEEDBACK_SCHEMA_VERSION,
    status: "unavailable",
    summary: "",
    errorTags: [],
    relatedSkills: [],
    confidence: "low",
    learnerMessage: UNAVAILABLE_MESSAGE,
    evidenceStrength: "weak_ai_inference"
  };
}

export function buildReviewMessages(
  request: CodeReviewRequest,
  context: { prompt: string; skillTags: string[] }
): AiProviderMessage[] {
  const parts: string[] = [
    `Item prompt:\n${context.prompt}`,
    `Skill tags: ${context.skillTags.join(", ") || "(none)"}`,
    `Learner code:\n\`\`\`cpp\n${request.source}\n\`\`\``
  ];

  const run = request.lastRunResult;
  if (run) {
    parts.push(
      `Last run: status=${run.status}` +
        (run.simulated ? " (simulated runner)" : "") +
        `\nCompiler output:\n${truncate(run.compileOutput)}` +
        `\nProgram stdout:\n${truncate(run.stdout)}` +
        `\nProgram stderr:\n${truncate(run.stderr)}`
    );
  }

  const tests = request.lastTestResult;
  let hasFailingTests = false;
  if (tests) {
    const failedVisible = tests.visible
      .filter((test) => !test.passed)
      .map(
        (test) =>
          `- ${test.name}: expected ${JSON.stringify(test.expectedStdout ?? "")}, got ${JSON.stringify(
            test.actualStdout ?? ""
          )}`
      );
    hasFailingTests = failedVisible.length > 0 || tests.passed < tests.total;
    parts.push(
      `Tests: ${tests.passed}/${tests.total} passed (${tests.hiddenPassed}/${tests.hiddenTotal} hidden).` +
        (failedVisible.length > 0
          ? `\nFailed visible tests:\n${failedVisible.join("\n")}`
          : "\nNo failing visible tests reported.")
    );
  }

  if (request.userQuestion) {
    parts.push(`Learner question:\n${request.userQuestion}`);
  }

  return [
    { role: "system", content: buildStructuredCodeReviewPrompt({ hasFailingTests }) },
    { role: "user", content: parts.join("\n\n") }
  ];
}

export async function reviewCode(
  request: CodeReviewRequest,
  signal: AbortSignal
): Promise<StructuredCodeFeedback> {
  if (!isAiChatEnabled()) {
    return unavailableFeedback();
  }

  const config = getCodeLabConfigForItem(request.itemId);
  const messages = buildReviewMessages(request, {
    prompt: config?.prompt ?? "",
    skillTags: config?.skillTags ?? []
  });

  try {
    const raw = await completeAiResponse({ messages, signal });
    return parseStructuredCodeFeedback(raw);
  } catch (error) {
    if (error instanceof AiProviderError) {
      return unavailableFeedback();
    }
    throw error;
  }
}

function truncate(value: string, max = 2_000): string {
  if (!value) return "(none)";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}
