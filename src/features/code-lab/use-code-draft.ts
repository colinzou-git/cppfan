"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadDraftRequest, loadPreviousDraftRequest, saveDraftRequest } from "./code-draft-client";
import { codeDraftStorageKey, codeDraftStorageKeyPrefix } from "./learning-definition-ref";

export type DraftStatus = "idle" | "saving" | "saved";

const DEBOUNCE_MS = 1000;

/**
 * localStorage key for an item's offline/signed-out draft (#431), scoped by
 * content version (#612). Re-exported for callers/tests.
 */
export function draftStorageKey(itemId: string, contentVersionId?: string | null): string {
  return codeDraftStorageKey(itemId, contentVersionId);
}

/** Find a draft saved under a DIFFERENT version of the same item in localStorage. */
function findLocalPreviousDraft(itemId: string, currentKey: string, starterCode: string): string | null {
  try {
    const prefix = codeDraftStorageKeyPrefix(itemId);
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || key === currentKey || !key.startsWith(prefix)) continue;
      const value = window.localStorage.getItem(key);
      if (value !== null && value.trim().length > 0 && value !== starterCode) {
        return value;
      }
    }
  } catch {
    // localStorage unavailable — no local previous draft.
  }
  return null;
}

/**
 * Autosave + resume for the Code Lab editor (#431), bound to the immutable
 * content version (#612). On mount it hydrates the source from the fastest
 * store keyed by (item, contentVersionId) — localStorage first, then the
 * cross-device Supabase draft — so opening a NEW published version starts from
 * its starter code and never silently restores code written for the OLD
 * definition. A prior-version draft (local or remote) is offered as an explicit
 * `copyPreviousVersionDraft()` instead. Every persistence path is best-effort.
 */
export function useCodeDraft({
  itemId,
  starterCode,
  source,
  setSource,
  contentVersionId
}: {
  itemId: string;
  starterCode: string;
  source: string;
  setSource: (value: string) => void;
  contentVersionId?: string | null;
}): { status: DraftStatus; hasPreviousVersionDraft: boolean; copyPreviousVersionDraft: () => void } {
  const [status, setStatus] = useState<DraftStatus>("idle");
  const [previousDraft, setPreviousDraft] = useState<string | null>(null);
  const hydratingRef = useRef(true);
  const sourceRef = useRef(source);
  sourceRef.current = source;
  const itemIdRef = useRef(itemId);
  itemIdRef.current = itemId;
  const versionRef = useRef(contentVersionId);
  versionRef.current = contentVersionId;

  useEffect(() => {
    let cancelled = false;
    hydratingRef.current = true;
    setPreviousDraft(null);
    const key = draftStorageKey(itemId, contentVersionId);

    // Track what we last set so a slower remote draft only replaces the editor
    // while the learner has not yet typed over the restored/starter value.
    let applied = starterCode;
    let hasOwnDraft = false;
    try {
      const local = window.localStorage.getItem(key);
      if (local !== null && local !== starterCode) {
        setSource(local);
        applied = local;
        hasOwnDraft = true;
      }
    } catch {
      // localStorage unavailable (private mode / quota) — fall through to remote.
    }

    // Offer a prior-version draft only when THIS version has no draft yet, so we
    // never nag once the learner is working against the current definition.
    if (!hasOwnDraft) {
      const local = findLocalPreviousDraft(itemId, key, starterCode);
      if (local !== null) setPreviousDraft(local);
    }

    void (async () => {
      const remote = await loadDraftRequest(itemId, contentVersionId);
      if (!cancelled && remote !== null && sourceRef.current === applied) {
        setSource(remote);
        applied = remote;
        hasOwnDraft = true;
      }
      // Look up a remote prior-version draft only if still needed.
      if (!cancelled && !hasOwnDraft) {
        const prev = await loadPreviousDraftRequest(itemId, contentVersionId);
        if (!cancelled && prev !== null) setPreviousDraft(prev);
      }
      if (!cancelled) hydratingRef.current = false;
    })();

    return () => {
      cancelled = true;
    };
  }, [itemId, starterCode, setSource, contentVersionId]);

  useEffect(() => {
    if (hydratingRef.current) return;
    setStatus("saving");
    const handle = setTimeout(() => {
      try {
        window.localStorage.setItem(draftStorageKey(itemId, contentVersionId), source);
      } catch {
        // Best-effort; remote save below is the durable path.
      }
      void saveDraftRequest(itemId, source, contentVersionId).finally(() => setStatus("saved"));
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [source, itemId, contentVersionId]);

  useEffect(() => {
    return () => {
      if (hydratingRef.current) return;
      try {
        window.localStorage.setItem(draftStorageKey(itemIdRef.current, versionRef.current), sourceRef.current);
      } catch {
        // ignore
      }
      void saveDraftRequest(itemIdRef.current, sourceRef.current, versionRef.current);
    };
  }, []);

  const copyPreviousVersionDraft = useCallback(() => {
    if (previousDraft !== null) {
      setSource(previousDraft);
      setPreviousDraft(null);
    }
  }, [previousDraft, setSource]);

  return { status, hasPreviousVersionDraft: previousDraft !== null, copyPreviousVersionDraft };
}
