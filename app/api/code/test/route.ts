import { NextResponse } from "next/server";
import { runTests } from "@/features/code-lab/code-lab-service";
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
  if (!body) return apiError("invalid_request", "A valid test request is required.", 400);

  const parsed = validateCodeRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const result = await runTests({
    itemId: parsed.itemId,
    source: parsed.source,
    expectedVersionId: parsed.contentVersionId,
    milestoneIndex: parsed.milestoneIndex
  });

  // A refused test run (stale definition or unavailable item) never executed,
  // so record no attempt/mastery evidence (#614).
  if (!result.staleDefinition && !result.itemUnavailable) {
    await recordCodeAttempt({
      itemId: parsed.itemId,
      source: parsed.source,
      test: result,
      contentVersionId: parsed.contentVersionId,
      milestoneIndex: parsed.milestoneIndex
    }).catch(() => false);
  }

  return NextResponse.json({ result }, { headers: { "cache-control": "no-store" } });
}
