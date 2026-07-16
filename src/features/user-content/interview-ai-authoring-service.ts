/*
 * AI authoring service + prompt builder for user-created interview problems
 * (#490). Mirrors the exercise/lab authoring services: it turns the current
 * problem draft + the author's instruction into provider messages asking for a
 * STRUCTURED JSON proposal (never prose that overwrites the editor), and
 * normalizes the outcome. The fake provider returns a deterministic proposal so
 * local dev/e2e work without a real model. No auth/quota here — the route owns
 * those.
 */

import type { AiProviderMessage } from "@/features/ai-chat/ai-chat-policy";
import { parseInterviewAuthoringProposal, type InterviewAuthoringProposal } from "./interview-ai-authoring";
import type { InterviewProblemPayload } from "./interview-content-types";

const MAX_INSTRUCTION_CHARS = 4000;
const MAX_CONTEXT_FIELD_CHARS = 6000;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function systemPrompt(): string {
  return [
    "You are cppFan's interview-problem-authoring assistant for C++, data structures, and algorithms.",
    "Help the author draft and improve a single private interview problem (one editable main.cpp).",
    "You may generate a full package from a short idea: a clear statement, constraints, target complexity, a hint ladder, visible examples, tests, and a reference solution.",
    "If the request is vague, ask ONE concise clarifying question instead of guessing.",
    "You must NEVER overwrite the author's work directly. Instead, respond with a single JSON object describing proposed changes the author can accept or reject.",
    "Return ONLY that JSON object inside a ```json code fence, with this exact shape:",
    '{ "summary": string, "operations": Operation[] }',
    "Each Operation is one of:",
    '- { "type": "replace_field", "field": "title"|"statement"|"starterCode"|"referenceSolution"|"solutionExplanation"|"constraints"|"targetComplexity"|"aiRubric", "value": string }',
    '- { "type": "set_difficulty", "value": "easy"|"medium"|"hard" }',
    '- { "type": "set_evaluation_mode", "value": "judge"|"judge_plus_ai"|"ai_evaluation"|"self_evaluation" }',
    '- { "type": "set_tags", "value": string[] }',
    '- { "type": "set_pattern_tags", "value": string[] }',
    '- { "type": "add_hint", "value": string }',
    '- { "type": "add_example", "input": string, "output": string, "note": string }',
    '- { "type": "add_test", "name": string, "input": string, "expectedOutput": string, "hidden": boolean }',
    "Write original problems — never copy third-party interview questions. Tests use stdin input and expected stdout.",
    "Write technically correct C++. Never claim your tests or reference solution have been validated — cppFan compiles and checks them separately after the author accepts.",
    "Base your work only on the problem draft provided here."
  ].join("\n");
}

function contextMessage(payload: InterviewProblemPayload): string {
  const fields: string[] = [
    `Evaluation: ${payload.evaluationMode}`,
    `Title: ${payload.title}`,
    payload.difficulty ? `Difficulty: ${payload.difficulty}` : "Difficulty: (unset)",
    payload.group ? `Group: ${payload.group}` : "Group: (unset)",
    `Statement:\n${truncate(payload.statement, MAX_CONTEXT_FIELD_CHARS)}`
  ];
  if (payload.constraints) fields.push(`Constraints: ${payload.constraints}`);
  if (payload.targetComplexity) fields.push(`Target complexity: ${payload.targetComplexity}`);
  if (payload.patternTags?.length) fields.push(`Pattern tags: ${payload.patternTags.join(", ")}`);
  if (payload.starterCode) fields.push(`Starter code:\n${truncate(payload.starterCode, MAX_CONTEXT_FIELD_CHARS)}`);
  if (payload.referenceSolution) fields.push("A reference solution is present.");
  fields.push(`Hints: ${(payload.hintLadder ?? []).length}`);
  fields.push(`Visible examples: ${(payload.visibleExamples ?? []).length}`);
  fields.push(`Tests: ${(payload.tests ?? []).length}`);
  return fields.join("\n\n");
}

/** Build the provider messages for one interview authoring request. */
export function buildInterviewAuthoringMessages(request: { instruction: string; payload: InterviewProblemPayload }): AiProviderMessage[] {
  const instruction = truncate(String(request?.instruction ?? "").trim(), MAX_INSTRUCTION_CHARS);
  return [
    { role: "system", content: systemPrompt() },
    { role: "user", content: `Current interview problem draft:\n\n${contextMessage(request.payload)}` },
    { role: "user", content: `Author request:\n${instruction}` }
  ];
}

export type InterviewAuthoringServiceResult =
  | { status: "ok"; proposal: InterviewAuthoringProposal }
  | { status: "invalid"; message: string }
  | { status: "provider_error" };

export type GenerateInterviewAuthoringInput = {
  payload: InterviewProblemPayload;
  instruction: string;
  providerKind: string;
  complete: (messages: AiProviderMessage[]) => Promise<string>;
};

function fakeProposal(instruction: string): InterviewAuthoringProposal {
  return {
    summary: "Draft suggestion (fake provider for local testing).",
    operations: [
      { id: "op-0", type: "replace_field", field: "statement", value: `Refined from your request: ${instruction.slice(0, 200)}` },
      { id: "op-1", type: "add_hint", value: "Consider the time/space trade-off first." },
      { id: "op-2", type: "add_test", name: "Sample test", input: "1\n", expectedOutput: "0\n", hidden: false }
    ]
  };
}

export async function generateInterviewAuthoringProposal(
  input: GenerateInterviewAuthoringInput
): Promise<InterviewAuthoringServiceResult> {
  const instruction = String(input?.instruction ?? "").trim();
  if (instruction.length === 0) {
    return { status: "invalid", message: "an authoring instruction is required" };
  }
  if (input.providerKind === "fake") {
    return { status: "ok", proposal: fakeProposal(instruction) };
  }

  const messages = buildInterviewAuthoringMessages({ instruction, payload: input.payload });
  let text: string;
  try {
    text = await input.complete(messages);
  } catch {
    return { status: "provider_error" };
  }

  const parsed = parseInterviewAuthoringProposal(text);
  if (!parsed.ok) {
    return { status: "invalid", message: "the assistant did not return a usable proposal" };
  }
  return { status: "ok", proposal: parsed.value };
}
