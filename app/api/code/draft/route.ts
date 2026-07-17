import { NextResponse } from "next/server";
import { loadCodeDraft, loadPreviousVersionDraft, saveCodeDraft } from "@/features/code-lab/code-draft-service";
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

/** Bounded content-version id from the request, or null (native/legacy). */
function contentVersionParam(value: string | null): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= 100 ? value : null;
}

// Load the signed-in learner's saved draft for an item + content version (#612).
// `previous=1` returns the latest draft under a DIFFERENT version instead — the
// explicit "copy from previous version" source. Returns { source: null } when
// there is no draft, the learner is signed out, or the table/column is absent —
// the client then falls back to localStorage, so this never errors on those.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = validateDraftItemId(url.searchParams.get("itemId"));
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const contentVersionId = contentVersionParam(url.searchParams.get("contentVersionId"));
  const source =
    url.searchParams.get("previous") === "1"
      ? await loadPreviousVersionDraft(parsed.itemId, contentVersionId).catch(() => null)
      : await loadCodeDraft(parsed.itemId, contentVersionId).catch(() => null);
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

  const contentVersionId = contentVersionParam(typeof body.contentVersionId === "string" ? body.contentVersionId : null);
  const saved = await saveCodeDraft(parsed.itemId, parsed.source, contentVersionId).catch(() => false);
  return NextResponse.json({ saved }, { headers: { "cache-control": "no-store" } });
}
