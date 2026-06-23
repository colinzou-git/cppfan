import { NextResponse } from "next/server";
import { loadCodeDraft, saveCodeDraft } from "@/features/code-lab/code-draft-service";
import {
  parseBodyRecord,
  validateDraftItemId,
  validateDraftRequest
} from "@/features/code-lab/code-lab-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// Load the signed-in learner's saved draft for an item. Returns { source: null }
// when there is no draft, the learner is signed out, or the table is absent —
// the client then falls back to localStorage, so this never errors on those.
export async function GET(request: Request) {
  const itemId = new URL(request.url).searchParams.get("itemId");
  const parsed = validateDraftItemId(itemId);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const source = await loadCodeDraft(parsed.itemId).catch(() => null);
  return NextResponse.json({ source }, { headers: { "cache-control": "no-store" } });
}

// Upsert the learner's draft. Persistence is best-effort: a signed-out learner or
// missing table yields { saved: false } rather than an error, so autosave is
// silent and never interrupts editing.
export async function PUT(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid draft request is required.", 400);

  const parsed = validateDraftRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const saved = await saveCodeDraft(parsed.itemId, parsed.source).catch(() => false);
  return NextResponse.json({ saved }, { headers: { "cache-control": "no-store" } });
}
