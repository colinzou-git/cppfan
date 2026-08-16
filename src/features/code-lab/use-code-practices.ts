"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPracticeRequest,
  deletePracticeRequest,
  loadPracticesRequest,
  updatePracticeRequest
} from "./code-practice-client";
import type { CodePractice, PracticeReferenceMode } from "./code-practice-types";

export type CodePracticeLoadState = "disabled" | "loading" | "ready" | "signed_out" | "error";
export type PendingPracticeSwitch = { kind: "practice"; practiceId: string } | { kind: "draft" };

export function nextPracticeName(practices: Pick<CodePractice, "name">[]): string {
  const names = new Set(practices.map((practice) => practice.name.trim().toLowerCase()));
  let index = 1;
  while (names.has(`practice ${index}`)) index += 1;
  return `Practice ${index}`;
}

export function practiceDisplaySource(input: {
  mode: PracticeReferenceMode;
  learnerSource: string;
  currentStandardSource: string;
  activePractice: CodePractice | null;
}): string {
  if (input.mode === "current_standard") return input.currentStandardSource;
  if (input.mode === "saved_standard") {
    return input.activePractice?.standardSourceCodeSnapshot ?? input.currentStandardSource;
  }
  return input.learnerSource;
}

function sortPractices(practices: CodePractice[]): CodePractice[] {
  return [...practices].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function useCodePractices({
  enabled,
  itemId,
  currentStandardSource,
  source,
  setSource,
  initialPracticeId
}: {
  enabled: boolean;
  itemId: string;
  currentStandardSource: string;
  source: string;
  setSource: (value: string) => void;
  initialPracticeId?: string;
}) {
  const [loadState, setLoadState] = useState<CodePracticeLoadState>(enabled ? "loading" : "disabled");
  const [practices, setPractices] = useState<CodePractice[]>([]);
  const [activePracticeId, setActivePracticeId] = useState<string | null>(null);
  const [baselineSource, setBaselineSource] = useState<string | null>(null);
  const [baselineName, setBaselineName] = useState<string | null>(null);
  const [referenceMode, setReferenceMode] = useState<PracticeReferenceMode>("learner");
  const [busy, setBusy] = useState<"create" | "save" | "rename" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingSwitch, setPendingSwitch] = useState<PendingPracticeSwitch | null>(null);

  const activePractice = useMemo(
    () => practices.find((practice) => practice.id === activePracticeId) ?? null,
    [practices, activePracticeId]
  );
  const practiceDirty = Boolean(activePractice && baselineSource !== null && source !== baselineSource);
  const historicalAvailable = Boolean(
    activePractice && activePractice.standardSourceCodeSnapshot !== currentStandardSource
  );
  const displaySource = practiceDisplaySource({
    mode: referenceMode,
    learnerSource: source,
    currentStandardSource,
    activePractice
  });
  const readOnlyReference = referenceMode !== "learner";

  const applyPractice = useCallback(
    (practice: CodePractice) => {
      setReferenceMode("learner");
      setActivePracticeId(practice.id);
      setBaselineSource(practice.sourceCode);
      setBaselineName(practice.name);
      setSource(practice.sourceCode);
      setError(null);
    },
    [setSource]
  );

  const detachPractice = useCallback(() => {
    setReferenceMode("learner");
    setActivePracticeId(null);
    setBaselineSource(null);
    setBaselineName(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoadState("disabled");
      setPractices([]);
      detachPractice();
      return;
    }

    let cancelled = false;
    setLoadState("loading");
    void loadPracticesRequest(itemId)
      .then((result) => {
        if (cancelled) return;
        if (result.status === "signed_out") {
          setLoadState("signed_out");
          setPractices([]);
          return;
        }
        const next = sortPractices(result.practices);
        setPractices(next);
        setLoadState("ready");
        if (initialPracticeId) {
          const selected = next.find((practice) => practice.id === initialPracticeId);
          if (selected) applyPractice(selected);
        }
      })
      .catch((caught) => {
        if (cancelled) return;
        setLoadState("error");
        setError(caught instanceof Error ? caught.message : "Saved practices are unavailable.");
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, itemId, initialPracticeId, applyPractice, detachPractice]);

  const createPractice = useCallback(
    async (name: string) => {
      setBusy("create");
      setError(null);
      try {
        const created = await createPracticeRequest({ itemId, name, source });
        setPractices((prev) => sortPractices([created, ...prev.filter((p) => p.id !== created.id)]));
        applyPractice(created);
        return true;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not save this practice.");
        return false;
      } finally {
        setBusy(null);
      }
    },
    [itemId, source, applyPractice]
  );

  const saveActive = useCallback(async () => {
    if (!activePractice) return true;
    setBusy("save");
    setError(null);
    try {
      const updated = await updatePracticeRequest({ practiceId: activePractice.id, source });
      setPractices((prev) => sortPractices(prev.map((p) => (p.id === updated.id ? updated : p))));
      setBaselineSource(updated.sourceCode);
      setBaselineName(updated.name);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this practice.");
      return false;
    } finally {
      setBusy(null);
    }
  }, [activePractice, source]);

  const renameActive = useCallback(
    async (name: string) => {
      if (!activePractice) return false;
      setBusy("rename");
      setError(null);
      try {
        const updated = await updatePracticeRequest({ practiceId: activePractice.id, name });
        setPractices((prev) => sortPractices(prev.map((p) => (p.id === updated.id ? updated : p))));
        setBaselineName(updated.name);
        return true;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not rename this practice.");
        return false;
      } finally {
        setBusy(null);
      }
    },
    [activePractice]
  );

  const deletePractice = useCallback(
    async (practiceId: string) => {
      setBusy("delete");
      setError(null);
      try {
        await deletePracticeRequest(practiceId);
        setPractices((prev) => prev.filter((p) => p.id !== practiceId));
        if (activePracticeId === practiceId) detachPractice();
        return true;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not delete this practice.");
        return false;
      } finally {
        setBusy(null);
      }
    },
    [activePracticeId, detachPractice]
  );

  const requestOpenPractice = useCallback(
    (practiceId: string) => {
      if (practiceId === activePracticeId) {
        setReferenceMode("learner");
        return;
      }
      if (practiceDirty) {
        setPendingSwitch({ kind: "practice", practiceId });
        return;
      }
      const practice = practices.find((candidate) => candidate.id === practiceId);
      if (practice) applyPractice(practice);
    },
    [activePracticeId, practiceDirty, practices, applyPractice]
  );

  const requestWorkingDraft = useCallback(() => {
    if (!activePractice) return;
    if (practiceDirty) {
      setPendingSwitch({ kind: "draft" });
      return;
    }
    detachPractice();
  }, [activePractice, practiceDirty, detachPractice]);

  const finishPendingSwitch = useCallback(() => {
    const pending = pendingSwitch;
    setPendingSwitch(null);
    if (!pending) return;
    if (pending.kind === "draft") {
      detachPractice();
      return;
    }
    const practice = practices.find((candidate) => candidate.id === pending.practiceId);
    if (practice) applyPractice(practice);
  }, [pendingSwitch, practices, applyPractice, detachPractice]);

  const resolvePendingSwitch = useCallback(
    async (choice: "save" | "discard" | "cancel") => {
      if (choice === "cancel") {
        setPendingSwitch(null);
        return;
      }
      if (choice === "save") {
        const saved = await saveActive();
        if (!saved) return;
      }
      finishPendingSwitch();
    },
    [saveActive, finishPendingSwitch]
  );

  const chooseReferenceMode = useCallback(
    (mode: PracticeReferenceMode) => {
      if (mode === "saved_standard" && !historicalAvailable) return;
      setReferenceMode(mode);
    },
    [historicalAvailable]
  );

  return {
    loadState,
    practices,
    activePractice,
    activePracticeId,
    baselineName,
    practiceDirty,
    historicalAvailable,
    referenceMode,
    chooseReferenceMode,
    displaySource,
    readOnlyReference,
    busy,
    error,
    pendingSwitch,
    suggestedName: nextPracticeName(practices),
    createPractice,
    saveActive,
    renameActive,
    deletePractice,
    requestOpenPractice,
    requestWorkingDraft,
    resolvePendingSwitch
  };
}

export type CodePracticeController = ReturnType<typeof useCodePractices>;
