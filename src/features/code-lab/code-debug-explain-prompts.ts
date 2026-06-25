import type { AiProviderMessage } from "@/features/ai-chat/ai-chat-policy";
import type { CodeDebugExplainRequest } from "./code-debug-types";

/**
 * Prompt for the Debug tab's "Explain current step" (#442). Grounded strictly in
 * the supplied runtime snapshot — the model must not invent variables, output,
 * line numbers, or stack frames, and should prefer a next-step hint over a full
 * solution. Beginner-friendly and concise.
 */

const SYSTEM_PROMPT = [
  "You help a beginner understand the current paused state of their C++ program in a debugger.",
  "Explain ONLY from the runtime snapshot you are given: the current line, stop reason, variables,",
  "watch expressions, call stack, and any output. Do NOT invent variables, values, output, line",
  "numbers, or stack frames. If a value is unavailable, say so plainly.",
  "Prefer a concrete next-step hint (what to inspect or step into next) over revealing a full",
  "solution. Keep it short — a few sentences."
].join(" ");

function truncate(value: string, max = 1_500): string {
  if (!value) return "(none)";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function buildExplainMessages(
  request: CodeDebugExplainRequest,
  context: { prompt: string; skillTags: string[] }
): AiProviderMessage[] {
  const snapshot = request.snapshot;
  const variables = snapshot.variables.length
    ? snapshot.variables.map((v) => `- ${v.name} = ${v.value}${v.type ? ` (${v.type})` : ""}`).join("\n")
    : "(none)";
  const watches = snapshot.watches.length
    ? snapshot.watches.map((w) => `- ${w.expression}: ${w.value ?? w.status}`).join("\n")
    : "(none)";
  const stack = snapshot.stack.length
    ? snapshot.stack.map((f) => `- ${f.name}${f.line != null ? `:${f.line}` : ""}`).join("\n")
    : "(none)";

  const parts = [
    `Exercise prompt:\n${context.prompt || "(none)"}`,
    `Skill tags: ${context.skillTags.join(", ") || "(none)"}`,
    `Debugger status: ${snapshot.status}` + (snapshot.reason ? ` (reason: ${snapshot.reason})` : ""),
    `Current line: ${snapshot.line ?? "(unknown)"}`,
    `Variables:\n${variables}`,
    `Watches:\n${watches}`,
    `Call stack:\n${stack}`,
    `Program stdout:\n${truncate(snapshot.stdout)}`,
    `Program stderr:\n${truncate(snapshot.stderr)}`,
    `Compiler output:\n${truncate(snapshot.compileOutput)}`,
    `Source:\n\`\`\`cpp\n${request.source}\n\`\`\``
  ];
  if (request.userQuestion) parts.push(`Learner question:\n${request.userQuestion}`);

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: parts.join("\n\n") }
  ];
}
