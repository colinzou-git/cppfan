import { NextResponse } from "next/server";
import { traceCode } from "@/features/code-lab/code-trace-service";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import { recordCodeAttempt } from "@/features/code-lab/code-attempt-service";
import {
  parseBodyRecord,
  validateCodeRequest
} from "@/features/code-lab/code-lab-request";
import type { CodeRunResult, CodeTestResult } from "@/features/code-lab/code-lab-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRACE_TIMEOUT_MS = Math.max(
  5_000,
  Math.min(60_000, Number(process.env.AI_REQUEST_TIMEOUT_MS) || 45_000)
);

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function asObject<T>(value: unknown): T | undefined {
  return typeof value === "object" && value !== null ? (value as T) : undefined;
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid trace request is required.", 400);

  const parsed = validateCodeRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const config = getCodeLabConfigForItem(parsed.itemId);
  // Resolve the selected test against VISIBLE tests only and read its expected
  // output server-side, so a hidden test name/expected output can never be
  // smuggled into the AI prompt or the response.
  const selectedTestName =
    typeof body.selectedTestName === "string" ? body.selectedTestName : undefined;
  const visibleTest = selectedTestName
    ? config?.visibleTests.find((test) => test.name === selectedTestName)
    : undefined;

  const selectedInput = visibleTest
    ? (visibleTest.stdin ?? "")
    : typeof body.selectedInput === "string"
      ? body.selectedInput
      : parsed.stdin;
  const selectedActualOutput =
    typeof body.selectedActualOutput === "string" ? body.selectedActualOutput : undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRACE_TIMEOUT_MS);
  request.signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const result = await traceCode(
      {
        itemId: parsed.itemId,
        language: "cpp",
        source: parsed.source,
        selectedInput,
        selectedTestName: visibleTest?.name,
        selectedExpectedOutput: visibleTest?.expectedStdout,
        selectedActualOutput,
        lastRunResult: asObject<CodeRunResult>(body.lastRunResult) ?? null,
        lastTestResult: asObject<CodeTestResult>(body.lastTestResult) ?? null,
        userQuestion: parsed.userQuestion
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
    return apiError("trace_unavailable", "AI trace is temporarily unavailable.", 503);
  } finally {
    clearTimeout(timeout);
  }
}
