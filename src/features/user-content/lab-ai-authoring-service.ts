/*
 * AI authoring service + prompt builder for user-created labs (#489). Mirrors
 * the exercise authoring service: it turns the current lab draft + the author's
 * instruction into provider messages asking for a STRUCTURED JSON proposal
 * (never prose that overwrites the editor), and normalizes the outcome. The fake
 * provider returns a deterministic proposal so local dev/e2e work without a real
 * model. No auth/quota here — the route owns those.
 */

import type { AiProviderMessage } from "@/features/ai-chat/ai-chat-policy";
import { parseLabAuthoringProposal, type LabAuthoringProposal } from "./lab-ai-authoring";
import type { LabPayload } from "./lab-content-types";

const MAX_INSTRUCTION_CHARS = 4000;
const MAX_CONTEXT_FIELD_CHARS = 6000;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function systemPrompt(): string {
  return [
    "You are cppFan's project-lab-authoring assistant for C++, data structures, and algorithms.",
    "Help the author draft and improve a single private project lab (one editable main.cpp; single-task or ordered milestones).",
    "If the request is vague or missing information, ask ONE concise clarifying question instead of guessing.",
    "You must NEVER overwrite the author's work directly. Instead, respond with a single JSON object describing proposed changes the author can accept or reject.",
    "Return ONLY that JSON object inside a ```json code fence, with this exact shape:",
    '{ "summary": string, "operations": Operation[] }',
    "Each Operation is one of:",
    '- { "type": "replace_field", "field": "title"|"summary"|"taskDescription"|"starterCode"|"referenceSolution"|"solutionExplanation", "value": string }',
    '- { "type": "set_difficulty", "value": "beginner"|"intermediate"|"advanced" }',
    '- { "type": "set_tags", "value": string[] }',
    '- { "type": "set_mode", "value": "single_task"|"milestones" }',
    '- { "type": "add_milestone", "title": string, "instructions": string, "required": boolean }',
    '- { "type": "add_completion_test", "name": string, "input": string, "expectedOutput": string, "hidden": boolean }',
    "Milestones are ordered checkpoints over ONE shared codebase; do not propose separate files. Tests use stdin input and expected stdout.",
    "Write technically correct C++. Never claim your tests or reference solution have been validated — cppFan compiles and checks them separately after the author accepts.",
    "Base your work only on the lab draft provided here."
  ].join("\n");
}

function contextMessage(payload: LabPayload): string {
  const fields: string[] = [
    `Structure: ${payload.mode}`,
    `Evaluation: ${payload.evaluationMode}`,
    `Title: ${payload.title}`,
    payload.difficulty ? `Difficulty: ${payload.difficulty}` : "Difficulty: (unset)",
    `Summary:\n${truncate(payload.summary, MAX_CONTEXT_FIELD_CHARS)}`,
    `Task:\n${truncate(payload.taskDescription, MAX_CONTEXT_FIELD_CHARS)}`
  ];
  if (payload.starterCode) {
    fields.push(`Starter code:\n${truncate(payload.starterCode, MAX_CONTEXT_FIELD_CHARS)}`);
  }
  if (payload.referenceSolution) {
    fields.push("A reference solution is present.");
  }
  if (payload.tags?.length) {
    fields.push(`Tags: ${payload.tags.join(", ")}`);
  }
  if (payload.mode === "milestones") {
    fields.push(`Milestones: ${(payload.milestones ?? []).map((m) => m.title).join(" -> ") || "(none yet)"}`);
  } else {
    fields.push(`Completion tests: ${(payload.completion?.tests ?? []).length}`);
  }
  return fields.join("\n\n");
}

/** Build the provider messages for one lab authoring request. */
export function buildLabAuthoringMessages(request: { instruction: string; payload: LabPayload }): AiProviderMessage[] {
  const instruction = truncate(String(request?.instruction ?? "").trim(), MAX_INSTRUCTION_CHARS);
  return [
    { role: "system", content: systemPrompt() },
    { role: "user", content: `Current lab draft:\n\n${contextMessage(request.payload)}` },
    { role: "user", content: `Author request:\n${instruction}` }
  ];
}

export type LabAuthoringServiceResult =
  | { status: "ok"; proposal: LabAuthoringProposal }
  | { status: "invalid"; message: string }
  | { status: "provider_error" };

export type GenerateLabAuthoringInput = {
  payload: LabPayload;
  instruction: string;
  providerKind: string;
  complete: (messages: AiProviderMessage[]) => Promise<string>;
};

function fakeProposal(instruction: string): LabAuthoringProposal {
  return {
    summary: "Draft suggestion (fake provider for local testing).",
    operations: [
      { id: "op-0", type: "replace_field", field: "taskDescription", value: `Refined from your request: ${instruction.slice(0, 200)}` },
      { id: "op-1", type: "add_milestone", title: "Parse the input", instructions: "Read and validate the input.", required: true }
    ]
  };
}

export async function generateLabAuthoringProposal(input: GenerateLabAuthoringInput): Promise<LabAuthoringServiceResult> {
  const instruction = String(input?.instruction ?? "").trim();
  if (instruction.length === 0) {
    return { status: "invalid", message: "an authoring instruction is required" };
  }
  if (input.providerKind === "fake") {
    return { status: "ok", proposal: fakeProposal(instruction) };
  }

  const messages = buildLabAuthoringMessages({ instruction, payload: input.payload });
  let text: string;
  try {
    text = await input.complete(messages);
  } catch {
    return { status: "provider_error" };
  }

  const parsed = parseLabAuthoringProposal(text);
  if (!parsed.ok) {
    return { status: "invalid", message: "the assistant did not return a usable proposal" };
  }
  return { status: "ok", proposal: parsed.value };
}
