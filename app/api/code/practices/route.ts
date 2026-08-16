import { NextResponse } from "next/server";
import { CODE_LAB_LIMITS } from "@/features/code-lab/code-lab-types";
import {
  createCodePractice,
  deleteCodePractice,
  listCodePractices,
  updateCodePractice
} from "@/features/code-lab/code-practice-service";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import type { CodePracticeServiceStatus } from "@/features/code-lab/code-practice-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function statusResponse(status: Exclude<CodePracticeServiceStatus, "ok">) {
  if (status === "signed_out") return apiError("signed_out", "Sign in to save code practices.", 401);
  if (status === "not_found") return apiError("not_found", "The code practice was not found.", 404);
  if (status === "not_eligible") {
    return apiError("not_eligible", "Saved practices are available only for lesson Code Labs.", 400);
  }
  return apiError("unavailable", "Saved practices are temporarily unavailable.", 503);
}

function parseItemId(value: unknown): string | null {
  const itemId = typeof value === "string" ? value.trim() : "";
  return itemId.length > 0 && itemId.length <= 240 ? itemId : null;
}

function parsePracticeId(value: unknown): string | null {
  const id = typeof value === "string" ? value.trim() : "";
  return id.length > 0 && id.length <= 100 ? id : null;
}

function parseName(value: unknown): string | null {
  const name = typeof value === "string" ? value.trim() : "";
  return name.length > 0 && name.length <= 100 ? name : null;
}

function parseSource(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.length <= CODE_LAB_LIMITS.maxSourceChars ? value : null;
}

export async function GET(request: Request) {
  const itemId = parseItemId(new URL(request.url).searchParams.get("itemId"));
  if (!itemId) return apiError("invalid_item", "A valid item id is required.", 400);

  const result = await listCodePractices(itemId).catch(() => ({ status: "unavailable" as const }));
  if (result.status !== "ok") return statusResponse(result.status);
  return NextResponse.json({ practices: result.data }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid practice request is required.", 400);

  const itemId = parseItemId(body.itemId);
  const name = parseName(body.name);
  const source = parseSource(body.source);
  if (!itemId) return apiError("invalid_item", "A valid item id is required.", 400);
  if (!name) return apiError("invalid_name", "Practice name must be 1–100 characters.", 400);
  if (source === null) {
    return apiError(
      "invalid_source",
      `Code must be under ${CODE_LAB_LIMITS.maxSourceChars.toLocaleString()} characters.`,
      400
    );
  }

  const result = await createCodePractice({ itemId, name, source }).catch(() => ({
    status: "unavailable" as const
  }));
  if (result.status !== "ok") return statusResponse(result.status);
  return NextResponse.json({ practice: result.data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid practice request is required.", 400);

  const practiceId = parsePracticeId(body.practiceId);
  if (!practiceId) return apiError("invalid_practice", "A valid practice id is required.", 400);

  const hasName = Object.prototype.hasOwnProperty.call(body, "name");
  const hasSource = Object.prototype.hasOwnProperty.call(body, "source");
  if (!hasName && !hasSource) {
    return apiError("empty_update", "Provide a name or source to update.", 400);
  }

  const name = hasName ? parseName(body.name) : undefined;
  const source = hasSource ? parseSource(body.source) : undefined;
  if (hasName && !name) return apiError("invalid_name", "Practice name must be 1–100 characters.", 400);
  if (hasSource && source === null) {
    return apiError(
      "invalid_source",
      `Code must be under ${CODE_LAB_LIMITS.maxSourceChars.toLocaleString()} characters.`,
      400
    );
  }

  const result = await updateCodePractice({ practiceId, name, source: source ?? undefined }).catch(() => ({
    status: "unavailable" as const
  }));
  if (result.status !== "ok") return statusResponse(result.status);
  return NextResponse.json({ practice: result.data });
}

export async function DELETE(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid practice request is required.", 400);
  const practiceId = parsePracticeId(body.practiceId);
  if (!practiceId) return apiError("invalid_practice", "A valid practice id is required.", 400);

  const result = await deleteCodePractice(practiceId).catch(() => ({ status: "unavailable" as const }));
  if (result.status !== "ok") return statusResponse(result.status);
  return NextResponse.json({ deleted: true, id: result.data.id });
}
