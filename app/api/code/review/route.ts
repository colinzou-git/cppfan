import { NextResponse } from "next/server";
import { reviewCode } from "@/features/code-lab/code-review-service";
import { recordCodeAttempt } from "@/features/code-lab/code-attempt-service";
import {
  parseBodyRecord,
  validateCodeRequest
} from "@/features/code-lab/code-lab-request";
import type { CodeRunResult, CodeTestResult } from "@/features/code-lab/code-lab-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_TIMEOUT_MS = Math.max(
  5_000,
  Math.min(60_000, Number(process.env.AI_REQUEST_TIMEOUT_MS) || 45_000)
);

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// The run/test summaries are AI context only — never used for grading or for
// recording correctness — so they are accepted as-is from the client.
function asObject<T>(value: unknown): T | undefined {
  return typeof value === "object" && value !== null ? (value as T) : undefined;
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid review request is required.", 400);

  const parsed = validateCodeRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REVIEW_TIMEOUT_MS);
  request.signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const result = await reviewCode(
      {
        itemId: parsed.itemId,
        source: parsed.source,
        lastRunResult: asObject<CodeRunResult>(body.lastRunResult) ?? null,
        lastTestResult: asObject<CodeTestResult>(body.lastTestResult) ?? null,
        userQuestion: parsed.userQuestion,
        contentVersionId: parsed.contentVersionId,
        milestoneIndex: parsed.milestoneIndex
      },
      controller.signal
    );

    await recordCodeAttempt({
      itemId: parsed.itemId,
      source: parsed.source,
      run: asObject<CodeRunResult>(body.lastRunResult) ?? null,
      test: asObject<CodeTestResult>(body.lastTestResult) ?? null,
      aiReviewRequested: true
    }).catch(() => false);

    return NextResponse.json({ result }, { headers: { "cache-control": "no-store" } });
  } catch {
    return apiError("review_unavailable", "AI review is temporarily unavailable.", 503);
  } finally {
    clearTimeout(timeout);
  }
}
