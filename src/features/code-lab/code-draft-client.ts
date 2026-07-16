/**
 * Browser fetch wrappers for the Code Lab draft API (#431), content-version
 * aware (#612). All are best-effort and resolve quietly on failure so
 * autosave/resume never interrupts editing: load returns null when there is no
 * draft (or the learner is signed out), and save returns false rather than
 * throwing.
 */

function draftQuery(itemId: string, contentVersionId?: string | null): string {
  const params = new URLSearchParams({ itemId });
  if (contentVersionId) params.set("contentVersionId", contentVersionId);
  return params.toString();
}

export async function loadDraftRequest(itemId: string, contentVersionId?: string | null): Promise<string | null> {
  try {
    const response = await fetch(`/api/code/draft?${draftQuery(itemId, contentVersionId)}`, {
      cache: "no-store"
    });
    if (!response.ok) return null;
    const data = (await response.json().catch(() => ({}))) as { source?: string | null };
    return typeof data.source === "string" ? data.source : null;
  } catch {
    return null;
  }
}

/**
 * The learner's most recent draft for this item saved under a DIFFERENT content
 * version — the source for an explicit "copy from previous version" (#612).
 */
export async function loadPreviousDraftRequest(itemId: string, contentVersionId?: string | null): Promise<string | null> {
  try {
    const response = await fetch(`/api/code/draft?${draftQuery(itemId, contentVersionId)}&previous=1`, {
      cache: "no-store"
    });
    if (!response.ok) return null;
    const data = (await response.json().catch(() => ({}))) as { source?: string | null };
    return typeof data.source === "string" ? data.source : null;
  } catch {
    return null;
  }
}

export async function saveDraftRequest(itemId: string, source: string, contentVersionId?: string | null): Promise<boolean> {
  try {
    const response = await fetch("/api/code/draft", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, source, contentVersionId: contentVersionId ?? null })
    });
    if (!response.ok) return false;
    const data = (await response.json().catch(() => ({}))) as { saved?: boolean };
    return data.saved === true;
  } catch {
    return false;
  }
}
