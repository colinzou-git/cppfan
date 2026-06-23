"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Send, Square, Plus } from "lucide-react";
import { listThreads, runTutor } from "@/features/ai-chat/tutor-transport";
import { TutorMessageContent } from "@/features/ai-chat/tutor-conversation";
import type { AiChatMessageView, AiChatStreamEvent } from "@/features/ai-chat/ai-chat-types";
import { buildCodeLabChatContext } from "./code-lab-chat-context";

/**
 * Compact, in-context chat for the full-page Code Lab AI tab (#431). It reuses
 * the shared tutor transport and markdown renderer rather than the full-page
 * TutorConversation, and attaches the *current* editor source as the learner
 * draft at send time — so questions are always answered against the code on
 * screen without re-running effects on every keystroke.
 */
export function CodeLabChat({
  itemId,
  title,
  prompt,
  topic,
  sourceVersion,
  source
}: {
  itemId: string;
  title: string;
  prompt: string;
  topic?: string;
  sourceVersion: string;
  source: string;
}) {
  const sourceRef = useRef(source);
  sourceRef.current = source;

  const [messages, setMessages] = useState<AiChatMessageView[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  function buildContext() {
    return buildCodeLabChatContext({ itemId, title, prompt, topic, sourceVersion, source: sourceRef.current });
  }

  // Load the most recent saved thread for this lab item once. listThreads keys
  // only on sourceKind + sourceId, so the live source is irrelevant here and the
  // effect never re-runs on edits. Stays silent when signed out / unavailable.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const threads = await listThreads(
          buildCodeLabChatContext({ itemId, title, prompt, topic, sourceVersion, source: sourceRef.current })
        );
        if (cancelled) return;
        const latest = threads[0];
        if (latest) {
          setConversationId(latest.id);
          setMessages(latest.messages);
        }
      } catch {
        // Saved history is best-effort; the chat is still usable for a new thread.
      }
    })();
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [itemId, sourceVersion, title, prompt, topic]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function patchAssistant(requestId: string, patch: Partial<AiChatMessageView>) {
    setMessages((current) => {
      const index = current.findIndex(
        (entry) => entry.role === "assistant" && entry.requestId === requestId
      );
      if (index < 0) return [...current, { ...localEntry("assistant", requestId, ""), ...patch }];
      return current.map((entry, position) => (position === index ? { ...entry, ...patch } : entry));
    });
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const requestId = crypto.randomUUID();
    setBusy(true);
    setNotice(null);
    setMessages((current) => [...current, localEntry("user", requestId, trimmed)]);
    setDraft("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await runTutor({
        context: buildContext(),
        message: trimmed,
        requestId,
        conversationId,
        signal: controller.signal,
        onEvent(event: AiChatStreamEvent) {
          if (event.type === "meta") {
            setConversationId(event.conversationId);
          } else if (event.type === "delta") {
            setMessages((current) => {
              const found = current.find(
                (entry) => entry.role === "assistant" && entry.requestId === requestId
              );
              const content = `${found?.content ?? ""}${event.text}`;
              if (found) {
                return current.map((entry) =>
                  entry.role === "assistant" && entry.requestId === requestId
                    ? { ...entry, content, status: "streaming" }
                    : entry
                );
              }
              return [...current, { ...localEntry("assistant", requestId, content), status: "streaming" }];
            });
          } else if (event.type === "done") {
            patchAssistant(requestId, { status: event.status });
          } else if (event.type === "error") {
            patchAssistant(requestId, { status: "failed" });
            setNotice(event.message);
          }
        }
      });
    } catch (error) {
      if (controller.signal.aborted) patchAssistant(requestId, { status: "stopped" });
      else {
        patchAssistant(requestId, { status: "failed" });
        setNotice(error instanceof Error ? error.message : "The tutor is unavailable. Try again.");
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(draft);
    }
  }

  function newChat() {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(null);
    setNotice(null);
  }

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white" data-testid="code-lab-chat">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Ask about your code</p>
        <button
          type="button"
          onClick={newChat}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New chat
        </button>
      </div>

      <div
        ref={listRef}
        className="flex max-h-80 min-h-[7rem] flex-col gap-2 overflow-y-auto p-3"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
            Ask anything about the code in the editor — why it fails, what a line does, or how to
            improve it. Your current code is sent with each question.
          </p>
        ) : null}
        {messages.map((entry) => (
          <article
            key={`${entry.role}-${entry.requestId}`}
            className={`max-w-[92%] rounded-xl px-3 py-2 text-sm ${
              entry.role === "user" ? "ml-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-900"
            }`}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide opacity-70">
              {entry.role === "user" ? "You" : "AI tutor"}
            </p>
            {entry.role === "assistant" ? (
              <TutorMessageContent content={entry.content} />
            ) : (
              <p className="whitespace-pre-wrap break-words">{entry.content}</p>
            )}
            {entry.status === "streaming" ? (
              <p className="mt-1 text-[10px] font-semibold opacity-70">…thinking</p>
            ) : null}
            {entry.status === "failed" || entry.status === "stopped" ? (
              <p className="mt-1 text-[10px] font-semibold opacity-70">{entry.status}</p>
            ) : null}
          </article>
        ))}
      </div>

      {notice ? (
        <p role="status" className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          {notice}
        </p>
      ) : null}

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-slate-200 p-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Ask a question about your code…"
          className="min-w-0 flex-1 resize-none rounded-lg border border-slate-200 p-2 text-sm"
          data-testid="code-lab-chat-input"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-3 py-2 text-sm font-bold text-slate-700"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={draft.trim().length === 0}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            data-testid="code-lab-chat-send"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Send
          </button>
        )}
      </form>
    </section>
  );
}

function localEntry(role: "user" | "assistant", requestId: string, content: string): AiChatMessageView {
  return {
    id: `${role}-${requestId}`,
    conversationId: "",
    requestId,
    role,
    content,
    status: role === "user" ? "complete" : "streaming",
    provider: null,
    model: null,
    createdAt: new Date().toISOString()
  };
}
