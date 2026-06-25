import { NextResponse } from "next/server";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import { validateDebugStartRequest } from "@/features/code-lab/code-debug-request";
import { selectDebugger } from "@/features/code-lab/code-debugger-service";
import { unconfiguredSnapshot } from "@/features/code-lab/code-debugger-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid debug request is required.", 400);

  const parsed = validateDebugStartRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const selection = selectDebugger();
  if (selection.kind === "unconfigured") {
    return NextResponse.json(
      { result: unconfiguredSnapshot(parsed.breakpoints, selection.note) },
      { headers: NO_STORE }
    );
  }

  try {
    const result = await selection.adapter.start({
      itemId: parsed.itemId,
      source: parsed.source,
      stdin: parsed.stdin,
      breakpoints: parsed.breakpoints,
      watches: parsed.watches
    });
    return NextResponse.json({ result }, { headers: NO_STORE });
  } catch {
    return apiError("debugger_error", "The debugger service failed to start a session.", 502);
  }
}
