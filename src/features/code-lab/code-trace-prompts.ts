import type { AiProviderMessage } from "@/features/ai-chat/ai-chat-policy";
import type { CodeTraceRequest } from "./code-trace-types";

/**
 * Prompt construction for the AI trace (#408). Kept separate so the exact model
 * instructions are unit-testable and never accidentally include hidden test I/O.
 */

export const TRACE_SYSTEM_PROMPT = [
  "You are cppFan's C++ tutor producing an APPROXIMATE educational execution trace for a beginner.",
  "This is NOT real runtime inspection or a debugger — be explicit that the trace is approximate.",
  "Focus only on the selected input/test case. Prefer compact steps over a long essay.",
  "Show only the variables that matter for understanding, not every variable.",
  "Use line hints only when the line mapping is reasonably clear.",
  "Never invent compiler or runtime output; use only what is provided.",
  "If the code does not compile, explain the compile blocker instead of pretending the program ran.",
  "If the code has undefined behavior, say the trace may be unreliable and explain why.",
  "Give hints before full solutions. Map the issue to related cppFan skills when possible.",
  'Respond ONLY with JSON: {"codeSummary": string, "inputSummary": string, "steps": [{"step": number, "lineHint": string, "variables": {"name":"value"}, "explanation": string}], "likelyIssue": string, "nextHint": string, "relatedSkills": string[], "confidence": "low"|"medium"|"high"}.'
].join(" ");

/**
 * Build the trace messages from item context and the learner's selection. Only
 * VISIBLE test data is ever passed in (the route guarantees this); this builder
 * additionally never reads any hidden source.
 */
export function buildTraceMessages(
  request: CodeTraceRequest,
  context: { prompt: string; skillTags: string[] }
): AiProviderMessage[] {
  const parts: string[] = [
    `Item prompt:\n${context.prompt || "(none)"}`,
    `Skill tags: ${context.skillTags.join(", ") || "(none)"}`,
    `Learner code:\n\`\`\`cpp\n${request.source}\n\`\`\``
  ];

  if (request.selectedTestName) {
    parts.push(`Selected visible test: ${request.selectedTestName}`);
  }
  if (request.selectedInput !== undefined) {
    parts.push(`Selected input (stdin):\n${request.selectedInput || "(empty)"}`);
  }
  if (request.selectedExpectedOutput !== undefined) {
    parts.push(`Expected output (visible):\n${request.selectedExpectedOutput}`);
  }
  if (request.selectedActualOutput !== undefined) {
    parts.push(`Actual output:\n${request.selectedActualOutput}`);
  }

  const run = request.lastRunResult;
  if (run) {
    parts.push(
      `Last run status: ${run.status}${run.simulated ? " (simulated runner)" : ""}` +
        (run.compileOutput ? `\nCompiler output:\n${truncate(run.compileOutput)}` : "")
    );
  }

  if (request.userQuestion) {
    parts.push(`Learner question:\n${request.userQuestion}`);
  }

  parts.push(
    "Produce the approximate trace as JSON. If the compiler output above indicates a compile error, do not fabricate runtime steps — return an empty steps array and explain the compile blocker in likelyIssue."
  );

  return [
    { role: "system", content: TRACE_SYSTEM_PROMPT },
    { role: "user", content: parts.join("\n\n") }
  ];
}

function truncate(value: string, max = 1_500): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}
