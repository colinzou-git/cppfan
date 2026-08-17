"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SaveDraftResult } from "./user-content-actions";

type DraftIdentity = {
  contentId: string | null;
  revision: number | null;
};

export type DraftFlushResult =
  | { status: "ok"; contentId: string; revision: number; saved: boolean }
  | Exclude<SaveDraftResult, { status: "ok" }>;

type SaveAttempt<TSnapshot> = (
  snapshot: TSnapshot,
  identity: DraftIdentity
) => Promise<SaveDraftResult>;

type UseSerializedDraftPersistenceOptions<TSnapshot> = {
  initialSnapshot: TSnapshot;
  initialContentId?: string;
  initialRevision?: number;
  debounceMs?: number;
  saveDraft: SaveAttempt<TSnapshot>;
  onAutosaveStart?: () => void;
  onAutosaveResult?: (result: DraftFlushResult) => void;
};

type SaveAttemptOutcome = {
  result: SaveDraftResult;
  generation: number;
};

/**
 * Serializes the debounced autosave, manual-save, AI preflight, and publish
 * preflight paths used by My Content editors. A newer edit made during a save
 * is persisted by one follow-up request with the latest snapshot; callers join
 * the same in-flight request instead of issuing competing draft mutations.
 */
export function useSerializedDraftPersistence<TSnapshot>({
  initialSnapshot,
  initialContentId,
  initialRevision,
  debounceMs = 1500,
  saveDraft,
  onAutosaveStart,
  onAutosaveResult
}: UseSerializedDraftPersistenceOptions<TSnapshot>) {
  const snapshotRef = useRef(initialSnapshot);
  const generationRef = useRef(0);
  const savedGenerationRef = useRef(0);
  const contentIdRef = useRef<string | null>(initialContentId ?? null);
  const revisionRef = useRef<number | null>(initialRevision ?? null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<Promise<SaveAttemptOutcome> | null>(null);
  const saveDraftRef = useRef(saveDraft);
  const onAutosaveStartRef = useRef(onAutosaveStart);
  const onAutosaveResultRef = useRef(onAutosaveResult);
  const disposedRef = useRef(false);

  saveDraftRef.current = saveDraft;
  onAutosaveStartRef.current = onAutosaveStart;
  onAutosaveResultRef.current = onAutosaveResult;

  const cancelPendingAutosave = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flushDraft = useCallback(async (): Promise<DraftFlushResult> => {
    cancelPendingAutosave();
    let saved = false;

    for (;;) {
      const contentId = contentIdRef.current;
      const revision = revisionRef.current;
      if (contentId && revision !== null && generationRef.current <= savedGenerationRef.current) {
        return { status: "ok", contentId, revision, saved };
      }

      let pending = inFlightRef.current;
      if (!pending) {
        const generation = generationRef.current;
        const snapshot = snapshotRef.current;
        const identity = {
          contentId: contentIdRef.current,
          revision: revisionRef.current
        };
        pending = (async () => ({
          result: await saveDraftRef.current(snapshot, identity),
          generation
        }))();
        inFlightRef.current = pending;
      }

      let outcome: SaveAttemptOutcome;
      try {
        outcome = await pending;
      } finally {
        if (inFlightRef.current === pending) {
          inFlightRef.current = null;
        }
      }

      if (outcome.result.status !== "ok") {
        return outcome.result;
      }

      contentIdRef.current = outcome.result.contentId;
      revisionRef.current = outcome.result.revision;
      savedGenerationRef.current = Math.max(savedGenerationRef.current, outcome.generation);
      saved = true;

      // A newer edit may have scheduled another debounce while this request was
      // running. The loop immediately saves that latest snapshot, so the timer
      // would only create a redundant no-op flush.
      cancelPendingAutosave();
    }
  }, [cancelPendingAutosave]);

  const scheduleAutosave = useCallback(() => {
    cancelPendingAutosave();
    timerRef.current = setTimeout(async () => {
      timerRef.current = null;
      if (disposedRef.current) {
        return;
      }
      onAutosaveStartRef.current?.();
      const result = await flushDraft();
      if (!disposedRef.current) {
        onAutosaveResultRef.current?.(result);
      }
    }, debounceMs);
  }, [cancelPendingAutosave, debounceMs, flushDraft]);

  const markDirty = useCallback(
    (snapshot: TSnapshot) => {
      snapshotRef.current = snapshot;
      generationRef.current += 1;
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  const replaceSnapshot = useCallback((snapshot: TSnapshot) => {
    snapshotRef.current = snapshot;
  }, []);

  const isDirty = useCallback(() => generationRef.current > savedGenerationRef.current, []);

  const getIdentity = useCallback(
    (): DraftIdentity => ({
      contentId: contentIdRef.current,
      revision: revisionRef.current
    }),
    []
  );

  useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
      cancelPendingAutosave();
    };
  }, [cancelPendingAutosave]);

  return {
    cancelPendingAutosave,
    flushDraft,
    getIdentity,
    isDirty,
    markDirty,
    replaceSnapshot
  };
}
