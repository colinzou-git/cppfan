import {
  AiProviderError,
  completeAiResponse,
  isAiChatEnabled
} from "@/features/ai-chat/ai-chat-provider";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { buildExplainMessages } from "./code-debug-explain-prompts";
import type { CodeDebugExplainRequest, CodeDebugExplainResult } from "./code-debug-types";

/**
 * AI explanation of the current paused debugger state (#442). Server-only and
 * only ever invoked when the learner clicks "Explain current step" — never
 * automatically. Degrades to a graceful "unavailable" result when AI is off (the
 * normal CI configuration), so the Debug tab never breaks.
 */

const UNAVAILABLE_MESSAGE =
  "AI explanations are not available right now. Inspect the variables, call stack, and output above, then step to see what changes.";

export async function explainDebugStep(
  request: CodeDebugExplainRequest,
  signal: AbortSignal
): Promise<CodeDebugExplainResult> {
  const config = getCodeLabConfigForItem(request.itemId);
  const relatedSkills = config?.skillTags ?? [];

  if (!isAiChatEnabled()) {
    return { status: "unavailable", explanation: UNAVAILABLE_MESSAGE, relatedSkills };
  }

  const messages = buildExplainMessages(request, {
    prompt: config?.prompt ?? "",
    skillTags: relatedSkills
  });

  try {
    const explanation = await completeAiResponse({ messages, signal });
    const trimmed = explanation.trim();
    if (!trimmed) {
      return { status: "unavailable", explanation: UNAVAILABLE_MESSAGE, relatedSkills };
    }
    return { status: "ok", explanation: trimmed, relatedSkills };
  } catch (error) {
    if (error instanceof AiProviderError) {
      return { status: "unavailable", explanation: UNAVAILABLE_MESSAGE, relatedSkills };
    }
    throw error;
  }
}
