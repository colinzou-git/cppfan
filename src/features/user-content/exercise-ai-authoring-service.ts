/*
 * AI authoring service + prompt builder for user-created exercises (#488).
 * Mirrors the lesson authoring service/policy: it turns the current exercise
 * draft + the author's instruction into provider messages asking for a
 * STRUCTURED JSON proposal (never prose that overwrites the editor), and
 * normalizes the outcome. The fake provider returns a deterministic proposal so
 * local dev/e2e work without a real model. No auth/quota here — the route owns
 * those.
 */

import type { AiProviderMessage } from "@/features/ai-chat/ai-chat-policy";
import { parseExerciseAuthoringProposal, type ExerciseAuthoringProposal } from "./exercise-ai-authoring";
import type { ExercisePayload } from "./exercise-content-types";

const MAX_INSTRUCTION_CHARS = 4000;
const MAX_CONTEXT_FIELD_CHARS = 6000;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function systemPrompt(): string {
  return [
    "You are cppFan's exercise-authoring assistant for C++, data structures, and algorithms.",
    "Help the author draft and improve a single private coding exercise.",
    "If the request is vague or missing information, ask ONE concise clarifying question instead of guessing.",
    "You must NEVER overwrite the author's work directly. Instead, respond with a single JSON object describing proposed changes the author can accept or reject.",
    "Return ONLY that JSON object inside a ```json code fence, with this exact shape:",
    '{ "summary": string, "operations": Operation[] }',
    "Each Operation is one of:",
    '- { "type": "replace_field", "field": "title"|"prompt"|"starterCode"|"sampleCode"|"referenceSolution"|"solutionExplanation"|"functionSignature"|"stdinFormat"|"stdoutFormat"|"complexityTarget", "value": string }',
    '- { "type": "set_difficulty", "value": "beginner"|"intermediate"|"advanced" }',
    '- { "type": "set_tags", "value": string[] }',
    '- { "type": "add_test", "name": string, "input": string, "expectedOutput": string, "hidden": boolean }',
    "For a stdin_program exercise, tests use stdin input and expected stdout. For a function exercise, keep tests consistent with the declared signature.",
    "Write technically correct C++. Never claim your tests or reference solution have been validated — cppFan compiles and checks them separately after the author accepts.",
    "Base your work only on the exercise draft provided here."
  ].join("\n");
}

function contextMessage(payload: ExercisePayload): string {
  const fields: string[] = [
    `Mode: ${payload.mode}`,
    `Evaluation: ${payload.evaluationMode}`,
    `Title: ${payload.title}`,
    payload.difficulty ? `Difficulty: ${payload.difficulty}` : "Difficulty: (unset)",
    `Prompt:\n${truncate(payload.prompt, MAX_CONTEXT_FIELD_CHARS)}`
  ];
  if (payload.mode === "function" && payload.functionSignature) {
    fields.push(`Function signature: ${payload.functionSignature}`);
  }
  if (payload.stdinFormat) {
    fields.push(`Input format: ${payload.stdinFormat}`);
  }
  if (payload.stdoutFormat) {
    fields.push(`Output format: ${payload.stdoutFormat}`);
  }
  if (payload.starterCode) {
    fields.push(`Starter code:\n${truncate(payload.starterCode, MAX_CONTEXT_FIELD_CHARS)}`);
  }
  if (payload.referenceSolution) {
    fields.push("A reference solution is present.");
  }
  if (payload.tags?.length) {
    fields.push(`Tags: ${payload.tags.join(", ")}`);
  }
  fields.push(`Existing tests: ${(payload.tests ?? []).length}`);
  return fields.join("\n\n");
}

/** Build the provider messages for one exercise authoring request. */
export function buildExerciseAuthoringMessages(request: { instruction: string; payload: ExercisePayload }): AiProviderMessage[] {
  const instruction = truncate(String(request?.instruction ?? "").trim(), MAX_INSTRUCTION_CHARS);
  return [
    { role: "system", content: systemPrompt() },
    { role: "user", content: `Current exercise draft:\n\n${contextMessage(request.payload)}` },
    { role: "user", content: `Author request:\n${instruction}` }
  ];
}

export type ExerciseAuthoringServiceResult =
  | { status: "ok"; proposal: ExerciseAuthoringProposal }
  | { status: "invalid"; message: string }
  | { status: "provider_error" };

export type GenerateExerciseAuthoringInput = {
  payload: ExercisePayload;
  instruction: string;
  providerKind: string;
  complete: (messages: AiProviderMessage[]) => Promise<string>;
};

function fakeProposal(instruction: string): ExerciseAuthoringProposal {
  return {
    summary: "Draft suggestion (fake provider for local testing).",
    operations: [
      { id: "op-0", type: "replace_field", field: "prompt", value: `Refined from your request: ${instruction.slice(0, 200)}` },
      { id: "op-1", type: "add_test", name: "Sample test", input: "1\n", expectedOutput: "1\n", hidden: false }
    ]
  };
}

export async function generateExerciseAuthoringProposal(
  input: GenerateExerciseAuthoringInput
): Promise<ExerciseAuthoringServiceResult> {
  const instruction = String(input?.instruction ?? "").trim();
  if (instruction.length === 0) {
    return { status: "invalid", message: "an authoring instruction is required" };
  }
  if (input.providerKind === "fake") {
    return { status: "ok", proposal: fakeProposal(instruction) };
  }

  const messages = buildExerciseAuthoringMessages({ instruction, payload: input.payload });
  let text: string;
  try {
    text = await input.complete(messages);
  } catch {
    return { status: "provider_error" };
  }

  const parsed = parseExerciseAuthoringProposal(text);
  if (!parsed.ok) {
    return { status: "invalid", message: "the assistant did not return a usable proposal" };
  }
  return { status: "ok", proposal: parsed.value };
}
