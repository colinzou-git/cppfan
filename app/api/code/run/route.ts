import { NextResponse } from "next/server";
import { runCode } from "@/features/code-lab/code-lab-service";
import { recordCodeAttempt } from "@/features/code-lab/code-attempt-service";
import {
  parseBodyRecord,
  validateCodeRequest
} from "@/features/code-lab/code-lab-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid run request is required.", 400);

  const parsed = validateCodeRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const result = await runCode({
    itemId: parsed.itemId,
    source: parsed.source,
    stdin: parsed.stdin,
    expectedVersionId: parsed.contentVersionId,
    milestoneIndex: parsed.milestoneIndex
  });

  // Persistence is best-effort and must never block or fail the run response.
  // A refused (stale-definition) run never executed, so record nothing.
  if (!result.staleDefinition) {
    await recordCodeAttempt({ itemId: parsed.itemId, source: parsed.source, run: result }).catch(
      () => false
    );
  }

  return NextResponse.json({ result }, { headers: { "cache-control": "no-store" } });
}
