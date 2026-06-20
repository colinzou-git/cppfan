"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildAiChatStarterPrompt } from "./ai-chat-context";
import { DictationControl } from "./dictation-control";
import { listThreads, runTutor } from "./tutor-transport";
import { tutorUrl } from "./tutor-url";
import type { AiChatContext, AiChatMessageView, AiChatStreamEvent } from "./ai-chat-types";

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

export function TutorConversation({
  context,
  requestedConversation,
  fresh
}: {
  context: AiChatContext;
  requestedConversation?: string;
  fresh?: boolean;
}) {
  const [conversationId, setConversationId] = useState<string | null>(requestedConversation ?? null);
  const [messages, setMessages] = useState<AiChatMessageView[]>([]);
  const [draft, setDraft] = useState(() => buildAiChatStarterPrompt(context));
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState<{ text: string; id: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const threads = await listThreads(context);
        if (cancelled || fresh) return;
        const selected = requestedConversation
          ? threads.find((entry) => entry.id === requestedConversation)
          : threads.find((entry) => entry.sourceVersion === context.sourceVersion);
        if (selected) {
          setConversationId(selected.id);
          setMessages(selected.messages);
          setDraft("");
          if (selected.sourceVersion !== context.sourceVersion) {
            setNotice("This conversation used an older item version. Start a new chat to send current context.");
          }
        }
      } catch (error) {
        if (!cancelled) setNotice(error instanceof Error ? error.message : "Saved conversations are unavailable.");
      }
    })();
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [context, requestedConversation, fresh]);

  function patchAssistant(requestId: string, patch: Partial<AiChatMessageView>) {
    setMessages((current) => {
      const index = current.findIndex((entry) => entry.role === "assistant" && entry.requestId === requestId);
      if (index < 0) return [...current, { ...localEntry("assistant", requestId, ""), ...patch }];
      return current.map((entry, position) => position === index ? { ...entry, ...patch } : entry);
    });
  }

  async function send(text: string, requestId: string, appendUser: boolean) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setNotice(null);
    setRetry(null);
    if (appendUser) setMessages((current) => [...current, localEntry("user", requestId, text)]);
    setDraft("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await runTutor({
        context,
        message: text,
        requestId,
        conversationId,
        signal: controller.signal,
        onEvent(event: AiChatStreamEvent) {
          if (event.type === "meta") {
            setConversationId(event.conversationId);
            setMessages((current) => current.map((entry) => entry.requestId === requestId ? { ...entry, conversationId: event.conversationId } : entry));
          } else if (event.type === "delta") {
            setMessages((current) => {
              const found = current.find((entry) => entry.role === "assistant" && entry.requestId === requestId);
              const content = `${found?.content ?? ""}${event.text}`;
              if (found) {
                return current.map((entry) =>
                  entry.role === "assistant" && entry.requestId === requestId
                    ? { ...entry, content, status: "streaming" }
                    : entry
                );
              }
              return [...current, { ...localEntry("assistant", requestId, content), conversationId: conversationId ?? "", status: "streaming" }];
            });
          } else if (event.type === "done") {
            patchAssistant(requestId, { status: event.status });
          } else if (event.type === "error") {
            patchAssistant(requestId, { status: "failed" });
            setNotice(event.message);
            setRetry({ text, id: requestId });
          }
        }
      });
    } catch (error) {
      if (controller.signal.aborted) patchAssistant(requestId, { status: "stopped" });
      else {
        patchAssistant(requestId, { status: "failed" });
        setNotice(error instanceof Error ? error.message : "The response was interrupted.");
        setRetry({ text, id: requestId });
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (text) void send(text, crypto.randomUUID(), true);
  }

  const oldVersion = Boolean(notice?.includes("older item version"));

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-3 py-4 sm:px-6 sm:py-8">
      <header className="rounded-t-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-blue-700">AI Chat</p>
        <h1 className="text-2xl font-black text-slate-950">{context.title}</h1>
        <p className="mt-1 text-sm text-slate-600">Messages are saved to your account for this item. cppFan grading remains authoritative.</p>
        <nav className="mt-4 flex flex-wrap gap-2">
          <Link href={tutorUrl(context, { mode: "history" })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">Chat history</Link>
          <Link href={tutorUrl(context, { fresh: true })} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white">New chat</Link>
        </nav>
      </header>
      {notice ? <p role="status" className="border-x border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{notice}</p> : null}
      <section className="flex min-h-[65vh] flex-1 flex-col rounded-b-2xl border border-t-0 border-slate-200 bg-white shadow-sm">
        <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {!messages.length ? <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-950">The relevant item context is already in the editable prompt below. Review it before sending.</p> : null}
          {messages.map((entry) => (
            <article key={`${entry.role}-${entry.requestId}`} className={`max-w-[94%] rounded-xl p-4 text-sm ${entry.role === "user" ? "ml-auto bg-blue-700 text-white" : "bg-slate-100 text-slate-900"}`}>
              <p className="mb-1 text-xs font-black uppercase tracking-wide opacity-70">{entry.role === "user" ? "You" : "AI tutor"}</p>
              <p className="whitespace-pre-wrap break-words">{entry.content}</p>
              {entry.status !== "complete" ? <p className="mt-2 text-xs font-semibold opacity-70">{entry.status}</p> : null}
            </article>
          ))}
        </div>
        <form onSubmit={submit} className="border-t border-slate-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <label htmlFor="tutor-prompt" className="sr-only">AI Chat prompt</label>
          <textarea ref={textareaRef} id="tutor-prompt" value={draft} onChange={(event) => setDraft(event.target.value)} rows={7} disabled={oldVersion} className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100" />
          <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-start gap-2">
              <DictationControl textareaRef={textareaRef} value={draft} onChange={setDraft} disabled={oldVersion || busy} />
              {retry ? <input type="button" value="Retry" onClick={() => void send(retry.text, retry.id, false)} className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" /> : null}
            </div>
            {busy ? <input type="button" value="Stop" onClick={() => abortRef.current?.abort()} className="cursor-pointer rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white" /> : <input type="submit" value="Send" disabled={!draft.trim() || oldVersion} className="cursor-pointer rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300" />}
          </div>
          <p className="mt-2 text-xs text-slate-500">Sent prompts and responses appear in this item's Chat history.</p>
        </form>
      </section>
    </main>
  );
}
