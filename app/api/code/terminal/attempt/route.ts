import { NextResponse } from "next/server";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import { validateTerminalAttemptRequest } from "@/features/code-lab/code-terminal-request";
import { selectTerminalProvider } from "@/features/code-lab/code-terminal-service";
import { recordTerminalAttempt } from "@/features/code-lab/code-attempt-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

/**
 * Records exactly one Terminal Run attempt when the session reaches a final state
 * (#664). The browser calls this once on the finished transition; polling never
 * records. Provider/simulated are derived server-side so a Terminal Run can never
 * forge non-simulated pass evidence.
 */
export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid attempt request is required.", 400);

  const parsed = validateTerminalAttemptRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const selection = selectTerminalProvider();
  const provider = selection.kind === "ready" ? selection.adapter.name : "none";
  const simulated = provider === "mock" || selection.kind === "unconfigured";

  const recorded = await recordTerminalAttempt({
    itemId: parsed.itemId,
    source: parsed.source,
    status: parsed.status,
    exitCode: parsed.exitCode,
    compileOutput: parsed.compileOutput,
    stdout: parsed.stdout,
    stderr: parsed.stderr,
    provider,
    simulated,
    contentVersionId: parsed.contentVersionId ?? null,
    milestoneIndex: parsed.milestoneIndex ?? null
  });

  return NextResponse.json({ result: { recorded } }, { headers: NO_STORE });
}
