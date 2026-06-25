import { NextResponse } from "next/server";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import { validateDebugExplainRequest } from "@/features/code-lab/code-debug-request";
import { explainDebugStep } from "@/features/code-lab/code-debug-explain-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

const EXPLAIN_TIMEOUT_MS = Math.max(
  5_000,
  Math.min(60_000, Number(process.env.AI_REQUEST_TIMEOUT_MS) || 45_000)
);

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid explain request is required.", 400);

  const parsed = validateDebugExplainRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXPLAIN_TIMEOUT_MS);
  request.signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const result = await explainDebugStep(
      {
        itemId: parsed.itemId,
        source: parsed.source,
        snapshot: parsed.snapshot,
        userQuestion: parsed.userQuestion
      },
      controller.signal
    );
    return NextResponse.json({ result }, { headers: NO_STORE });
  } catch {
    return apiError("explain_unavailable", "AI explanation is temporarily unavailable.", 503);
  } finally {
    clearTimeout(timeout);
  }
}
