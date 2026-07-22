import { NextResponse } from "next/server";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import { validateTerminalStopRequest } from "@/features/code-lab/code-terminal-request";
import { selectTerminalProvider } from "@/features/code-lab/code-terminal-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid stop request is required.", 400);

  const parsed = validateTerminalStopRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const selection = selectTerminalProvider();
  if (selection.kind === "unconfigured") {
    // Nothing to stop when unconfigured; report success so the UI resets.
    return NextResponse.json({ result: { ok: true } }, { headers: NO_STORE });
  }

  try {
    const result = await selection.adapter.stop({
      sessionId: parsed.sessionId,
      sessionToken: parsed.sessionToken
    });
    return NextResponse.json({ result }, { headers: NO_STORE });
  } catch {
    // Best-effort: the UI resets regardless, and the server reaper is authoritative.
    return NextResponse.json({ result: { ok: true } }, { headers: NO_STORE });
  }
}
