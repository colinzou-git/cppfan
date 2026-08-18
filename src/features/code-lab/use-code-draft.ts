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
 * content version (#612). On mount it hydrates source from the fastest store
 * keyed by (item, contentVersionId) — localStorage first, then the cross-device
 * Supabase draft.
 *
 * Named practices (#674/#684) temporarily reuse the same live editor source but
 * are a different persistence concept. `suspendDraftPersistence()` snapshots the
 * ordinary working draft and prevents practice source from leaking into
 * localStorage/code_lab_drafts. `restoreWorkingDraft()` rehydrates that ordinary
 * draft when leaving practice mode. `adoptCurrentSourceAsWorkingDraft()` is the
 * explicit exception used when deleting an active practice and intentionally
 * keeping its editor source as the new working draft.
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
}): {
  status: DraftStatus;
  hasPreviousVersionDraft: boolean;
  copyPreviousVersionDraft: () => void;
  suspendDraftPersistence: () => void;
  restoreWorkingDraft: () => void;
  adoptCurrentSourceAsWorkingDraft: () => void;
} {
  const [status, setStatus] = useState<DraftStatus>("idle");
  const [previousDraft, setPreviousDraft] = useState<string | null>(null);
  const hydratingRef = useRef(true);
  const persistenceSuspendedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceRef = useRef(source);
  const workingDraftSourceRef = useRef(source);
  sourceRef.current = source;
  // The visible editor may contain a named practice while persistence is
  // suspended. Only ordinary draft mode may advance the draft snapshot.
  if (!persistenceSuspendedRef.current) workingDraftSourceRef.current = source;

  const itemIdRef = useRef(itemId);
  itemIdRef.current = itemId;
  const versionRef = useRef(contentVersionId);
  versionRef.current = contentVersionId;

  const clearPendingSave = useCallback(() => {
    if (saveTimerRef.current !== null) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const persistDraftNow = useCallback(
    (value: string, targetItemId = itemIdRef.current, targetVersion = versionRef.current) => {
      try {
        window.localStorage.setItem(draftStorageKey(targetItemId, targetVersion), value);
      } catch {
        // Best-effort; remote save below is the durable path when signed in.
      }
      return saveDraftRequest(targetItemId, value, targetVersion);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    hydratingRef.current = true;
    setPreviousDraft(null);
    const key = draftStorageKey(itemId, contentVersionId);

    // Track the ordinary draft separately from the visible editor. A practice
    // may become visible before the slower remote draft request resolves.
    let applied = starterCode;
    workingDraftSourceRef.current = starterCode;
    let hasOwnDraft = false;
    try {
      const local = window.localStorage.getItem(key);
      if (local !== null && local !== starterCode) {
        workingDraftSourceRef.current = local;
        if (!persistenceSuspendedRef.current) setSource(local);
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
      // Use the hidden draft snapshot for the anti-clobber check. If a practice
      // is visible, sourceRef intentionally differs from `applied`; that alone
      // must not prevent ordinary draft hydration from completing in the
      // background.
      const ordinaryDraftUntouched = workingDraftSourceRef.current === applied;
      if (!cancelled && remote !== null && ordinaryDraftUntouched) {
        workingDraftSourceRef.current = remote;
        if (!persistenceSuspendedRef.current) setSource(remote);
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
    if (hydratingRef.current || persistenceSuspendedRef.current) return;
    workingDraftSourceRef.current = source;
    setStatus("saving");
    clearPendingSave();
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      if (persistenceSuspendedRef.current) return;
      void persistDraftNow(source).finally(() => {
        if (!persistenceSuspendedRef.current) setStatus("saved");
      });
    }, DEBOUNCE_MS);
    return clearPendingSave;
  }, [source, itemId, contentVersionId, clearPendingSave, persistDraftNow]);

  useEffect(() => {
    return () => {
      clearPendingSave();
      if (hydratingRef.current) return;
      // A named practice may be the live editor source at unmount. Persist only
      // the last ordinary draft snapshot.
      void persistDraftNow(
        workingDraftSourceRef.current,
        itemIdRef.current,
        versionRef.current
      );
    };
  }, [clearPendingSave, persistDraftNow]);

  const suspendDraftPersistence = useCallback(() => {
    if (persistenceSuspendedRef.current) return;
    workingDraftSourceRef.current = sourceRef.current;
    persistenceSuspendedRef.current = true;
    clearPendingSave();
    // Flush the latest ordinary draft at the boundary before practice editing.
    // Do not expose this as a practice save/status transition.
    if (!hydratingRef.current) void persistDraftNow(workingDraftSourceRef.current);
  }, [clearPendingSave, persistDraftNow]);

  const restoreWorkingDraft = useCallback(() => {
    clearPendingSave();
    persistenceSuspendedRef.current = false;
    setSource(workingDraftSourceRef.current);
  }, [clearPendingSave, setSource]);

  const adoptCurrentSourceAsWorkingDraft = useCallback(() => {
    clearPendingSave();
    workingDraftSourceRef.current = sourceRef.current;
    persistenceSuspendedRef.current = false;
    setStatus("saving");
    void persistDraftNow(workingDraftSourceRef.current).finally(() => setStatus("saved"));
  }, [clearPendingSave, persistDraftNow]);

  const copyPreviousVersionDraft = useCallback(() => {
    if (previousDraft !== null) {
      workingDraftSourceRef.current = previousDraft;
      // If a practice is active, update only the hidden ordinary draft. Do not
      // replace the visible practice source.
      if (!persistenceSuspendedRef.current) setSource(previousDraft);
      setPreviousDraft(null);
    }
  }, [previousDraft, setSource]);

  return {
    status,
    hasPreviousVersionDraft: previousDraft !== null,
    copyPreviousVersionDraft,
    suspendDraftPersistence,
    restoreWorkingDraft,
    adoptCurrentSourceAsWorkingDraft
  };
}
