import type { AiProviderMessage } from "@/features/ai-chat/ai-chat-policy";
import {
  AiProviderError,
  completeAiResponse,
  isAiChatEnabled
} from "@/features/ai-chat/ai-chat-provider";
import type { CodeReviewRequest, CodeReviewResult } from "./code-lab-types";
import { getCodeLabConfigForItem } from "./code-lab-catalog";

/**
 * Build the AI review of a learner's C++ submission (#407). Server-only: it
 * reads the item config, the learner code, and run/test summaries, then asks the
 * provider for short, hint-first feedback. Hidden test inputs/outputs are never
 * included. Distinguishes provider output/test output from inference and never
 * fabricates results.
 */

const UNAVAILABLE_MESSAGE =
  "AI review is not available right now. You can still run your code and the visible tests.";

const REVIEW_SYSTEM = [
  "You are cppFan's C++ tutor reviewing a beginner's code submission.",
  "Give short, encouraging, hint-first feedback — do not paste a full corrected solution unless explicitly asked.",
  "Use only the supplied code, prompt, skill tags, and compiler/runtime/test summaries.",
  "Clearly separate observed compiler/test output from your own inference; never invent test results or hidden tests.",
  "Respond ONLY with a JSON object: {\"summary\": string, \"likelyIssue\": string, \"nextHint\": string, \"relatedSkills\": string[]}.",
  "Keep each field to one or two sentences."
].join(" ");

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
  if (tests) {
    const failedVisible = tests.visible
      .filter((test) => !test.passed)
      .map(
        (test) =>
          `- ${test.name}: expected ${JSON.stringify(test.expectedStdout ?? "")}, got ${JSON.stringify(
            test.actualStdout ?? ""
          )}`
      );
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
    { role: "system", content: REVIEW_SYSTEM },
    { role: "user", content: parts.join("\n\n") }
  ];
}

export function parseReviewResponse(raw: string): CodeReviewResult {
  const parsed = extractJson(raw);
  if (parsed) {
    const summary = asString(parsed.summary);
    return {
      status: "ok",
      summary,
      likelyIssue: asString(parsed.likelyIssue) || undefined,
      nextHint: asString(parsed.nextHint) || undefined,
      relatedSkills: asStringArray(parsed.relatedSkills),
      message: summary || "Review ready."
    };
  }

  const text = raw.trim();
  if (!text) {
    return { status: "unavailable", message: UNAVAILABLE_MESSAGE };
  }
  // Provider returned prose rather than JSON (e.g. the fake provider). Treat the
  // whole response as the summary so the learner still gets readable feedback.
  return { status: "ok", summary: text, message: text };
}

export async function reviewCode(
  request: CodeReviewRequest,
  signal: AbortSignal
): Promise<CodeReviewResult> {
  if (!isAiChatEnabled()) {
    return { status: "unavailable", message: UNAVAILABLE_MESSAGE };
  }

  const config = getCodeLabConfigForItem(request.itemId);
  const messages = buildReviewMessages(request, {
    prompt: config?.prompt ?? "",
    skillTags: config?.skillTags ?? []
  });

  try {
    const raw = await completeAiResponse({ messages, signal });
    return parseReviewResponse(raw);
  } catch (error) {
    if (error instanceof AiProviderError) {
      return { status: "unavailable", message: UNAVAILABLE_MESSAGE };
    }
    throw error;
  }
}

function truncate(value: string, max = 2_000): string {
  if (!value) return "(none)";
  return value.length > max ? `${value.slice(0, max)}…` : value;
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
