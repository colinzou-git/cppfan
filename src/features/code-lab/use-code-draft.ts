"use client";

import { useEffect, useRef, useState } from "react";
import { loadDraftRequest, saveDraftRequest } from "./code-draft-client";

export type DraftStatus = "idle" | "saving" | "saved";

const DEBOUNCE_MS = 1000;

/** localStorage key for an item's offline/signed-out draft fallback. */
export function draftStorageKey(itemId: string): string {
  return `cppfan:code-lab:draft:${itemId}`;
}

/**
 * Autosave + resume for the Code Lab editor (#431). On mount it hydrates the
 * source from the fastest available store — localStorage first (instant,
 * offline, signed-out), then the cross-device Supabase draft, which wins only if
 * the learner has not started editing. Edits debounce-save to both stores, and
 * the latest source is flushed on unmount so navigating away mid-debounce never
 * loses work. Every persistence path is best-effort and silent.
 */
export function useCodeDraft({
  itemId,
  starterCode,
  source,
  setSource
}: {
  itemId: string;
  starterCode: string;
  source: string;
  setSource: (value: string) => void;
}): { status: DraftStatus } {
  const [status, setStatus] = useState<DraftStatus>("idle");
  const hydratingRef = useRef(true);
  const sourceRef = useRef(source);
  sourceRef.current = source;
  const itemIdRef = useRef(itemId);
  itemIdRef.current = itemId;

  useEffect(() => {
    let cancelled = false;
    hydratingRef.current = true;
    const key = draftStorageKey(itemId);

    // Track what we last set so a slower remote draft only replaces the editor
    // while the learner has not yet typed over the restored/starter value.
    let applied = starterCode;
    try {
      const local = window.localStorage.getItem(key);
      if (local !== null && local !== starterCode) {
        setSource(local);
        applied = local;
      }
    } catch {
      // localStorage unavailable (private mode / quota) — fall through to remote.
    }

    void (async () => {
      const remote = await loadDraftRequest(itemId);
      if (!cancelled && remote !== null && sourceRef.current === applied) {
        setSource(remote);
      }
      if (!cancelled) hydratingRef.current = false;
    })();

    return () => {
      cancelled = true;
    };
  }, [itemId, starterCode, setSource]);

  useEffect(() => {
    if (hydratingRef.current) return;
    setStatus("saving");
    const handle = setTimeout(() => {
      try {
        window.localStorage.setItem(draftStorageKey(itemId), source);
      } catch {
        // Best-effort; remote save below is the durable path.
      }
      void saveDraftRequest(itemId, source).finally(() => setStatus("saved"));
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [source, itemId]);

  useEffect(() => {
    return () => {
      if (hydratingRef.current) return;
      try {
        window.localStorage.setItem(draftStorageKey(itemIdRef.current), sourceRef.current);
      } catch {
        // ignore
      }
      void saveDraftRequest(itemIdRef.current, sourceRef.current);
    };
  }, []);

  return { status };
}
