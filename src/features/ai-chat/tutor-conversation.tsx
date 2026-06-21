"use client";

import { type FormEvent, Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildAiChatStarterPrompt } from "./ai-chat-context";
import { DictationControl } from "./dictation-control";
import { listThreads, runTutor } from "./tutor-transport";
import { tutorUrl } from "./tutor-url";
import type { AiChatContext, AiChatMessageView, AiChatStreamEvent } from "./ai-chat-types";

type TutorHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type TutorMessageBlock =
  | { type: "heading"; level: TutorHeadingLevel; text: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "code"; language: string | null; code: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "rule" }
  | { type: "table"; header: string[]; rows: string[][] };

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

function splitTableCells(line: string) {
  const trimmed = line.trim();
  const withoutLeadingPipe = trimmed.startsWith("|") ? trimmed.slice(1) : trimmed;
  const withoutTrailingPipe = withoutLeadingPipe.endsWith("|")
    ? withoutLeadingPipe.slice(0, -1)
    : withoutLeadingPipe;
  return withoutTrailingPipe.split("|").map((cell) => cell.trim());
}

function isTableRow(line: string) {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && splitTableCells(trimmed).length > 1;
}

function isTableSeparator(line: string) {
  if (!isTableRow(line)) return false;
  return splitTableCells(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isTableStart(lines: string[], index: number) {
  if (!isTableRow(lines[index]) || !isTableSeparator(lines[index + 1] ?? "")) return false;
  return splitTableCells(lines[index]).length === splitTableCells(lines[index + 1]).length;
}

function normalizeTableCells(cells: string[], expected: number) {
  const normalized = cells.slice(0, expected);
  while (normalized.length < expected) normalized.push("");
  return normalized;
}

function codeFenceMatch(line: string) {
  return line.trim().match(/^```\s*([A-Za-z0-9_+#.-]*)\s*$/);
}

function headingMatch(line: string) {
  return line.trim().match(/^(#{1,6})\s+(.+)$/);
}

function isRule(line: string) {
  return /^-{3,}$/.test(line.trim());
}

function listItemMatch(line: string) {
  return line.match(/^\s*(?:[-*+]\s+|\d+\.\s+)(.+)$/);
}

function isOrderedListItem(line: string) {
  return /^\s*\d+\.\s+/.test(line);
}

function parseTutorMessageBlocks(content: string): TutorMessageBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: TutorMessageBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", lines: paragraph });
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = codeFenceMatch(line);
    const heading = headingMatch(line);
    const listItem = listItemMatch(line);

    if (fence) {
      flushParagraph();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", language: fence[1] || null, code: codeLines.join("\n") });
    } else if (isTableStart(lines, index)) {
      flushParagraph();
      const header = splitTableCells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && isTableRow(lines[index])) {
        rows.push(normalizeTableCells(splitTableCells(lines[index]), header.length));
        index += 1;
      }
      index -= 1;
      blocks.push({ type: "table", header, rows });
    } else if (heading) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: Math.min(heading[1].length, 6) as TutorHeadingLevel,
        text: heading[2].trim()
      });
    } else if (isRule(line)) {
      flushParagraph();
      blocks.push({ type: "rule" });
    } else if (listItem) {
      flushParagraph();
      const ordered = isOrderedListItem(line);
      const items: string[] = [];
      while (index < lines.length) {
        const current = listItemMatch(lines[index]);
        if (!current || isOrderedListItem(lines[index]) !== ordered) break;
        items.push(current[1].trim());
        index += 1;
      }
      index -= 1;
      blocks.push({ type: "list", ordered, items });
    } else if (line.trim()) {
      paragraph.push(line);
    } else {
      flushParagraph();
    }
  }

  flushParagraph();
  return blocks;
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*)/g;
  let lastIndex = 0;
  let tokenIndex = 0;

  for (const match of text.matchAll(tokenPattern)) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${tokenIndex}`;
    if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[0.92em] text-slate-950">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(
        <strong key={key} className="font-black text-slate-950">
          {renderInlineMarkdown(token.slice(2, -2), `${key}-strong`)}
        </strong>
      );
    }
    lastIndex = match.index + token.length;
    tokenIndex += 1;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function TutorHeading({ level, text, blockIndex }: { level: TutorHeadingLevel; text: string; blockIndex: number }) {
  const className = level <= 2
    ? "text-lg font-black leading-7 text-slate-950"
    : "text-base font-black leading-6 text-slate-950";
  const children = renderInlineMarkdown(text, `heading-${blockIndex}`);

  switch (level) {
    case 1:
      return <h1 className={className}>{children}</h1>;
    case 2:
      return <h2 className={className}>{children}</h2>;
    case 3:
      return <h3 className={className}>{children}</h3>;
    case 4:
      return <h4 className={className}>{children}</h4>;
    case 5:
      return <h5 className={className}>{children}</h5>;
    case 6:
      return <h6 className={className}>{children}</h6>;
  }
}

function TutorParagraph({ lines, blockIndex }: { lines: string[]; blockIndex: number }) {
  return (
    <p className="whitespace-pre-wrap break-words leading-6">
      {lines.map((line, lineIndex) => (
        <Fragment key={`${blockIndex}-${lineIndex}`}>
          {lineIndex > 0 ? "\n" : null}
          {renderInlineMarkdown(line, `${blockIndex}-${lineIndex}`)}
        </Fragment>
      ))}
    </p>
  );
}

function TutorCodeBlock({ language, code }: { language: string | null; code: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-slate-950 shadow-sm">
      {language ? <div className="border-b border-slate-700 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-300">{language}</div> : null}
      <pre className="overflow-x-auto whitespace-pre p-3 text-sm leading-6 text-slate-50">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

function TutorList({ ordered, items, blockIndex }: { ordered: boolean; items: string[]; blockIndex: number }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`space-y-1 pl-5 leading-6 ${ordered ? "list-decimal" : "list-disc"}`}>
      {items.map((item, itemIndex) => (
        <li key={`list-${blockIndex}-${itemIndex}`}>{renderInlineMarkdown(item, `list-${blockIndex}-${itemIndex}`)}</li>
      ))}
    </Tag>
  );
}

function TutorMarkdownTable({ header, rows, blockIndex }: { header: string[]; rows: string[][]; blockIndex: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm text-slate-900">
        <thead className="bg-slate-50 text-slate-950">
          <tr>
            {header.map((cell, cellIndex) => (
              <th
                key={`h-${blockIndex}-${cellIndex}`}
                scope="col"
                className="border-b border-r border-slate-300 px-3 py-2 align-top font-black last:border-r-0"
              >
                {renderInlineMarkdown(cell, `h-${blockIndex}-${cellIndex}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`r-${blockIndex}-${rowIndex}`} className="odd:bg-white even:bg-slate-50/70">
              {row.map((cell, cellIndex) => (
                <td
                  key={`c-${blockIndex}-${rowIndex}-${cellIndex}`}
                  className="border-b border-r border-slate-200 px-3 py-2 align-top last:border-r-0 last:border-b-0"
                >
                  {renderInlineMarkdown(cell, `c-${blockIndex}-${rowIndex}-${cellIndex}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TutorMessageContent({ content }: { content: string }) {
  const blocks = parseTutorMessageBlocks(content);

  return (
    <div className="space-y-3">
      {blocks.map((block, blockIndex) => {
        switch (block.type) {
          case "heading":
            return <TutorHeading key={blockIndex} level={block.level} text={block.text} blockIndex={blockIndex} />;
          case "table":
            return <TutorMarkdownTable key={blockIndex} header={block.header} rows={block.rows} blockIndex={blockIndex} />;
          case "code":
            return <TutorCodeBlock key={blockIndex} language={block.language} code={block.code} />;
          case "list":
            return <TutorList key={blockIndex} ordered={block.ordered} items={block.items} blockIndex={blockIndex} />;
          case "rule":
            return <hr key={blockIndex} className="border-slate-300" />;
          case "paragraph":
            return <TutorParagraph key={blockIndex} lines={block.lines} blockIndex={blockIndex} />;
        }
      })}
    </div>
  );
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
              {entry.role === "assistant" ? <TutorMessageContent content={entry.content} /> : <p className="whitespace-pre-wrap break-words">{entry.content}</p>}
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
