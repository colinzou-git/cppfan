import type { AiChatContext } from "@/features/ai-chat/ai-chat-types";

export type CodeLabChatContextArgs = {
  itemId: string;
  title: string;
  prompt: string;
  topic?: string;
  sourceVersion: string;
  /** The current editor source — attached as the learner draft so the tutor answers against on-screen code. */
  source: string;
};

/**
 * Build the AI chat context for a Code Lab question (#431). Kept pure and free of
 * React so the contract with the chat API (`lab_item` source, current code as
 * `learnerDraft`) is unit-testable against the server's own normalizer.
 */
export function buildCodeLabChatContext({
  itemId,
  title,
  prompt,
  topic,
  sourceVersion,
  source
}: CodeLabChatContextArgs): AiChatContext {
  return {
    schemaVersion: 1,
    sourceKind: "lab_item",
    sourceId: itemId,
    sourceVersion,
    title,
    prompt,
    topic,
    learnerDraft: source,
    assessmentState: "instructional",
    revealPolicy: "normal",
    metadata: { itemType: "code_lab" }
  };
}
