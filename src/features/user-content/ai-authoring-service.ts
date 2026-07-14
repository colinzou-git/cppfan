/*
 * AI authoring service (#487): the provider-agnostic core of the authoring
 * endpoint. Given the current draft, the author's instruction, and a completion
 * function, it builds the provider messages, parses the structured proposal, and
 * normalizes the outcome. The fake provider returns a deterministic proposal so
 * local dev and e2e work without a real model. No auth/quota here — the route
 * owns those — which keeps this unit-testable.
 */

import type { AiProviderMessage } from "@/features/ai-chat/ai-chat-policy";
import { buildAuthoringMessages, type AuthoringAttachmentRef } from "./ai-authoring-policy";
import { parseAuthoringProposal, type AuthoringProposal } from "./ai-authoring-proposal";
import type { LessonPayload } from "./user-content-types";

export type AuthoringServiceResult =
  | { status: "ok"; proposal: AuthoringProposal }
  | { status: "invalid"; message: string }
  | { status: "provider_error" };

export type GenerateAuthoringInput = {
  payload: LessonPayload;
  instruction: string;
  attachments: AuthoringAttachmentRef[];
  providerKind: string;
  complete: (messages: AiProviderMessage[]) => Promise<string>;
};

function fakeAuthoringProposal(instruction: string): AuthoringProposal {
  return {
    summary: "Draft suggestion (fake provider for local testing).",
    operations: [
      { id: "op-0", type: "append_section", section: "summary", value: `Suggested from your request: ${instruction.slice(0, 200)}` }
    ]
  };
}

export async function generateAuthoringProposal(input: GenerateAuthoringInput): Promise<AuthoringServiceResult> {
  const instruction = String(input?.instruction ?? "").trim();
  if (instruction.length === 0) {
    return { status: "invalid", message: "an authoring instruction is required" };
  }
  if (input.providerKind === "fake") {
    return { status: "ok", proposal: fakeAuthoringProposal(instruction) };
  }

  const messages = buildAuthoringMessages({
    instruction,
    payload: input.payload,
    authorAttachments: input.attachments
  });

  let text: string;
  try {
    text = await input.complete(messages);
  } catch {
    return { status: "provider_error" };
  }

  const parsed = parseAuthoringProposal(text);
  if (!parsed.ok) {
    return { status: "invalid", message: "the assistant did not return a usable proposal" };
  }
  return { status: "ok", proposal: parsed.value };
}
