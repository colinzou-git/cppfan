/**
 * Browser fetch wrappers for the Code Lab draft API (#431). Both are best-effort
 * and resolve quietly on failure so autosave/resume never interrupts editing:
 * loadDraftRequest returns null when there is no draft (or the learner is signed
 * out), and saveDraftRequest returns false rather than throwing.
 */

export async function loadDraftRequest(itemId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/code/draft?itemId=${encodeURIComponent(itemId)}`, {
      cache: "no-store"
    });
    if (!response.ok) return null;
    const data = (await response.json().catch(() => ({}))) as { source?: string | null };
    return typeof data.source === "string" ? data.source : null;
  } catch {
    return null;
  }
}

export async function saveDraftRequest(itemId: string, source: string): Promise<boolean> {
  try {
    const response = await fetch("/api/code/draft", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, source })
    });
    if (!response.ok) return false;
    const data = (await response.json().catch(() => ({}))) as { saved?: boolean };
    return data.saved === true;
  } catch {
    return false;
  }
}
