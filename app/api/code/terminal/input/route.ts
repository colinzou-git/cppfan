import { NextResponse } from "next/server";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import { validateTerminalInputRequest } from "@/features/code-lab/code-terminal-request";
import { selectTerminalProvider } from "@/features/code-lab/code-terminal-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid input request is required.", 400);

  const parsed = validateTerminalInputRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const selection = selectTerminalProvider();
  if (selection.kind === "unconfigured") {
    return apiError("unconfigured", "Interactive terminal service is not configured.", 409);
  }

  try {
    const result = await selection.adapter.input({
      sessionId: parsed.sessionId,
      sessionToken: parsed.sessionToken,
      data: parsed.data,
      eof: parsed.eof
    });
    if (!result.ok) {
      return apiError("input_rejected", "Input could not be delivered to the program.", 409);
    }
    return NextResponse.json({ result }, { headers: NO_STORE });
  } catch {
    return apiError("terminal_error", "The terminal service failed to accept input.", 502);
  }
}
