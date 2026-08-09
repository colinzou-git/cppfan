import { NextResponse } from "next/server";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import { validateTerminalAttemptRequest } from "@/features/code-lab/code-terminal-request";
import { selectTerminalProvider } from "@/features/code-lab/code-terminal-service";
import { recordTerminalAttemptAuthoritative } from "@/features/code-lab/code-attempt-service";
import {
  isTerminalFinished,
  type CodeTerminalEvent,
  type CodeTerminalSnapshot
} from "@/features/code-lab/code-terminal-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

/**
 * Re-reads and persists one authoritative final Terminal snapshot. The browser
 * supplies only the session capability and immutable attempt context.
 */
export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid attempt request is required.", 400);

  const parsed = validateTerminalAttemptRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const selection = selectTerminalProvider();
  if (selection.kind === "unconfigured") {
    return NextResponse.json(
      { result: { status: "session_unavailable", message: selection.note } },
      { status: 503, headers: NO_STORE }
    );
  }

  let snapshot: CodeTerminalSnapshot;
  try {
    snapshot = await selection.adapter.poll({
      sessionId: parsed.sessionId,
      sessionToken: parsed.sessionToken,
      after: 0
    });
  } catch {
    return NextResponse.json(
      {
        result: {
          status: "retryable_error",
          message: "The final Terminal result is temporarily unavailable."
        }
      },
      { status: 503, headers: NO_STORE }
    );
  }

  if (!isTerminalFinished(snapshot.status)) {
    return NextResponse.json(
      {
        result: {
          status: "not_final",
          message: "The Terminal session has not finished yet."
        }
      },
      { status: 409, headers: NO_STORE }
    );
  }
  if (
    snapshot.status === "stale_definition" ||
    snapshot.status === "item_unavailable" ||
    snapshot.status === "invalid_contract"
  ) {
    return NextResponse.json(
      {
        result: {
          status: "session_unavailable",
          message: "This Terminal request did not execute and has no run history to save."
        }
      },
      { status: 409, headers: NO_STORE }
    );
  }

  const result = await recordTerminalAttemptAuthoritative({
    terminalAttemptId: parsed.terminalAttemptId,
    itemId: parsed.itemId,
    source: parsed.source,
    status: snapshot.status,
    exitCode: snapshot.exitCode ?? null,
    compileOutput: joinEvents(snapshot.events, "compiler"),
    stdout: joinEvents(snapshot.events, "stdout"),
    stderr: joinEvents(snapshot.events, "stderr"),
    provider: selection.adapter.name,
    simulated: selection.adapter.name === "mock",
    contentVersionId: parsed.contentVersionId ?? null,
    milestoneIndex: parsed.milestoneIndex ?? null
  });

  const httpStatus =
    result.status === "retryable_error" ? 503 : result.status === "signed_out" ? 401 : 200;
  return NextResponse.json({ result }, { status: httpStatus, headers: NO_STORE });
}

const MAX_PERSISTED_STREAM_CHARS = 20_000;

export function joinEvents(events: CodeTerminalEvent[], kind: CodeTerminalEvent["kind"]): string {
  return [...events]
    .sort((a, b) => a.sequence - b.sequence)
    .filter((event) => event.kind === kind)
    .map((event) => event.text)
    .join("")
    .slice(0, MAX_PERSISTED_STREAM_CHARS);
}
