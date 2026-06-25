import { NextResponse } from "next/server";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import { validateDebugStopRequest } from "@/features/code-lab/code-debug-request";
import { selectDebugger } from "@/features/code-lab/code-debugger-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid debug request is required.", 400);

  const parsed = validateDebugStopRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const selection = selectDebugger();
  if (selection.kind === "unconfigured") {
    // Nothing to stop when no debugger ran; report success so the UI resets.
    return NextResponse.json({ result: { ok: true } }, { headers: NO_STORE });
  }

  try {
    const result = await selection.adapter.stop({ sessionId: parsed.sessionId });
    return NextResponse.json({ result }, { headers: NO_STORE });
  } catch {
    return apiError("debugger_error", "The debugger service failed to stop the session.", 502);
  }
}
