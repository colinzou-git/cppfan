import type { AiChatContext } from "./ai-chat-types";

export function tutorUrl(
  context: AiChatContext,
  options: { mode?: "conversation" | "history"; conversation?: string; fresh?: boolean } = {}
) {
  const params = new URLSearchParams({
    context: JSON.stringify(context),
    mode: options.mode ?? "conversation"
  });
  if (options.conversation) params.set("conversation", options.conversation);
  if (options.fresh) params.set("fresh", "1");
  return `/tutor?${params.toString()}`;
}
