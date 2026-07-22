import { NextResponse } from "next/server";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import { validateTerminalStartRequest } from "@/features/code-lab/code-terminal-request";
import { selectTerminalProvider } from "@/features/code-lab/code-terminal-service";
import { unconfiguredTerminalSnapshot } from "@/features/code-lab/code-terminal-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid terminal request is required.", 400);

  const parsed = validateTerminalStartRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const selection = selectTerminalProvider();
  if (selection.kind === "unconfigured") {
    return NextResponse.json(
      { result: unconfiguredTerminalSnapshot(selection.note) },
      { headers: NO_STORE }
    );
  }

  try {
    const result = await selection.adapter.start({
      itemId: parsed.itemId,
      source: parsed.source,
      stdin: parsed.stdin,
      contentVersionId: parsed.contentVersionId,
      milestoneIndex: parsed.milestoneIndex
    });
    return NextResponse.json({ result }, { headers: NO_STORE });
  } catch {
    return apiError("terminal_error", "The terminal service failed to start a session.", 502);
  }
}
