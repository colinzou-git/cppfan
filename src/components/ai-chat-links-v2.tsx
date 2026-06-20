import Link from "next/link";
import type { AiChatContext } from "@/features/ai-chat/ai-chat-types";

function tutorHref(context: AiChatContext, mode: "conversation" | "history") {
  const params = new URLSearchParams({ mode, context: JSON.stringify(context) });
  return `/tutor?${params.toString()}`;
}

const controlClass = "inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

export function AiChatLinks({ context }: { context: AiChatContext }) {
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="ai-chat-controls">
      <Link href={tutorHref(context, "conversation")} target="_blank" rel="noopener noreferrer" className={controlClass}>AI Chat</Link>
      <Link href={tutorHref(context, "history")} target="_blank" rel="noopener noreferrer" className={controlClass}>Chat history</Link>
    </div>
  );
}
