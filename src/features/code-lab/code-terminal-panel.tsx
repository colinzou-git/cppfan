"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import type {
  CodeTerminalEvent,
  CodeTerminalStatus,
  TerminalAttemptSaveStatus
} from "./code-terminal-types";

/**
 * Combined interactive Terminal transcript + input composer (#664). Renders
 * compiler diagnostics, program stdout/stderr, learner input, and system notices
 * in one chronological, escaped, whitespace-preserving log. The composer appears
 * only while the program is running; Enter sends the text plus "\n" (empty lines
 * allowed for getline), Shift+Enter inserts a newline, and Send EOF closes stdin
 * without killing the process. All output is rendered as React text — never HTML.
 */

const STATUS_LABELS: Record<CodeTerminalStatus, string> = {
  idle: "Idle",
  compiling: "Compiling…",
  running: "Running",
  exited: "Exited",
  stopped: "Stopped",
  compile_error: "Compile error",
  runtime_error: "Runtime error",
  timeout: "Timed out",
  stale_definition: "Reload required",
  item_unavailable: "Unavailable",
  invalid_contract: "Invalid exercise",
  unconfigured: "Not configured",
  error: "Error"
};

// Per-stream styling. stdout keeps the default color; the copied plaintext is
// identical regardless of styling because each event is a plain text span.
const KIND_CLASS: Record<CodeTerminalEvent["kind"], string> = {
  stdout: "text-slate-100",
  compiler: "text-amber-300",
  stderr: "text-rose-300",
  system: "text-slate-400 italic",
  stdin: "text-sky-300"
};

export function CodeTerminalPanel({
  status,
  events,
  exitCode,
  durationMs,
  outputTruncated,
  message,
  isActive,
  isFinished,
  sending,
  inputError,
  attemptSaveStatus,
  attemptSaveError,
  onSend,
  onEof,
  onClearError,
  onRetryAttemptSave
}: {
  status: CodeTerminalStatus;
  events: CodeTerminalEvent[];
  exitCode: number | null;
  durationMs: number | null;
  outputTruncated: boolean;
  message: string | null;
  isActive: boolean;
  isFinished: boolean;
  sending: boolean;
  inputError: string | null;
  attemptSaveStatus: TerminalAttemptSaveStatus;
  attemptSaveError: string | null;
  onSend: (data: string) => Promise<boolean>;
  onEof: () => Promise<boolean>;
  onClearError: () => void;
  onRetryAttemptSave: () => Promise<void>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [autoFollow, setAutoFollow] = useState(true);
  const [draft, setDraft] = useState("");

  // Auto-follow new output only while the learner is already near the bottom, so
  // scrolling up to read history is never yanked back down.
  useEffect(() => {
    if (!autoFollow) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events, autoFollow]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoFollow(nearBottom);
  }

  function jumpToLatest() {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setAutoFollow(true);
  }

  async function submit() {
    // Enter sends the current text plus a newline; an empty composer sends "\n".
    const ok = await onSend(`${draft}\n`);
    if (ok) {
      setDraft("");
      inputRef.current?.focus();
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sending) void submit();
    }
  }

  const showComposer = status === "running";

  if (status === "unconfigured") {
    return (
      <div
        className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700"
        data-testid="code-terminal-unconfigured"
        role="status"
      >
        <p className="font-bold text-slate-800">Interactive terminal is not available</p>
        <p className="mt-1 text-slate-600">
          {message ?? "Interactive terminal service is not configured."}
        </p>
      </div>
    );
  }

  if (
    status === "stale_definition" ||
    status === "item_unavailable" ||
    status === "invalid_contract"
  ) {
    const guidance =
      status === "stale_definition"
        ? "Reload to use the current published definition."
        : status === "item_unavailable"
          ? "Return to the catalog or My Content, or reload if it was recently republished."
          : "The author must correct and republish this exercise before it can run.";
    return (
      <div
        className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
        data-testid={`code-terminal-${status.replace("_", "-")}`}
        role="alert"
      >
        <p className="font-bold">{STATUS_LABELS[status]}</p>
        <p className="mt-1">{message ?? guidance}</p>
        <p className="mt-1 text-amber-800">{guidance}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2" data-testid="code-terminal">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-100"
          data-testid="code-terminal-status"
        >
          {STATUS_LABELS[status]}
        </span>
        {isFinished && exitCode !== null ? (
          <span className="text-xs text-slate-500">exit code {exitCode}</span>
        ) : null}
        {isFinished && durationMs !== null ? (
          <span className="text-xs text-slate-500">{durationMs} ms</span>
        ) : null}
        {outputTruncated ? (
          <span className="text-xs font-bold text-amber-700">output truncated</span>
        ) : null}
      </div>

      {attemptSaveStatus === "saving" || attemptSaveStatus === "retrying" ? (
        <p
          className="text-xs font-semibold text-slate-600"
          data-testid="code-terminal-attempt-saving"
        >
          Saving run history…
        </p>
      ) : null}
      {attemptSaveStatus === "error" ? (
        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          role="alert"
          data-testid="code-terminal-attempt-error"
        >
          <span>{attemptSaveError ?? "This run finished, but its history was not saved."}</span>
          <button
            type="button"
            onClick={() => void onRetryAttemptSave()}
            className="rounded-md border border-amber-500 px-2 py-1 font-bold hover:bg-amber-100"
          >
            Retry saving run
          </button>
        </div>
      ) : null}

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
          className="h-64 min-h-[12rem] overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-xs leading-relaxed"
          data-testid="code-terminal-transcript"
        >
          {events.length === 0 ? (
            <span className="text-slate-500">
              Run your program to see compiler messages, output, and your input here.
            </span>
          ) : (
            <pre className="whitespace-pre-wrap break-words">
              {events.map((event) => (
                <span key={event.sequence} className={KIND_CLASS[event.kind]}>
                  {event.text}
                </span>
              ))}
            </pre>
          )}
        </div>
        {!autoFollow ? (
          <button
            type="button"
            onClick={jumpToLatest}
            className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-slate-700 px-2.5 py-1 text-xs font-bold text-white shadow hover:bg-slate-600"
            data-testid="code-terminal-jump"
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            Jump to latest
          </button>
        ) : null}
      </div>

      {showComposer ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="code-terminal-input" className="text-xs font-bold text-slate-600">
            Send input to the program
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="code-terminal-input"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              className="min-h-[2.5rem] flex-1 resize-y rounded-lg border border-slate-300 p-2 font-mono text-xs"
              placeholder="Type input, press Enter to send"
              data-testid="code-terminal-input"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => !sending && void submit()}
              disabled={sending}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              data-testid="code-terminal-send"
            >
              {sending ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={() => !sending && void onEof()}
              disabled={sending}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              data-testid="code-terminal-eof"
              title="Close standard input so a read-until-EOF loop can finish"
            >
              Send EOF
            </button>
          </div>
          {inputError ? (
            <div
              className="flex items-center gap-2 text-xs font-bold text-rose-700"
              role="alert"
              data-testid="code-terminal-input-error"
            >
              <span>{inputError}</span>
              <button
                type="button"
                onClick={() => {
                  onClearError();
                  void submit();
                }}
                className="rounded border border-rose-300 px-2 py-0.5 text-rose-700 hover:bg-rose-50"
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
      ) : isActive ? (
        <p className="text-xs text-slate-500">Starting…</p>
      ) : null}
    </div>
  );
}
