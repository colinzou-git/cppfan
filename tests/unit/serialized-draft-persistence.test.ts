import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSerializedDraftPersistence } from "@/features/user-content/use-serialized-draft-persistence";

function ok(contentId: string, revision: number) {
  return {
    status: "ok" as const,
    contentId,
    draftVersionId: `draft-${revision}`,
    revision,
    savedAt: new Date(0).toISOString()
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useSerializedDraftPersistence", () => {
  it("cancels the pending debounce when a manual flush starts", async () => {
    vi.useFakeTimers();
    const saveDraft = vi.fn().mockResolvedValue(ok("c1", 2));
    const { result } = renderHook(() =>
      useSerializedDraftPersistence({
        initialSnapshot: { title: "old" },
        initialContentId: "c1",
        initialRevision: 1,
        saveDraft
      })
    );

    act(() => result.current.markDirty({ title: "new" }));
    act(() => vi.advanceTimersByTime(1000));
    await act(async () => {
      await result.current.flushDraft();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(saveDraft).toHaveBeenCalledTimes(1);
    expect(saveDraft).toHaveBeenCalledWith({ title: "new" }, { contentId: "c1", revision: 1 });
  });

  it("never overlaps saves and performs one follow-up with the newest edit", async () => {
    const first = deferred<ReturnType<typeof ok>>();
    const saveDraft = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValueOnce(ok("c1", 3));
    const { result } = renderHook(() =>
      useSerializedDraftPersistence({
        initialSnapshot: { title: "old" },
        initialContentId: "c1",
        initialRevision: 1,
        saveDraft
      })
    );

    act(() => result.current.markDirty({ title: "first" }));
    let flush!: ReturnType<typeof result.current.flushDraft>;
    act(() => {
      flush = result.current.flushDraft();
    });
    await waitFor(() => expect(saveDraft).toHaveBeenCalledTimes(1));

    act(() => result.current.markDirty({ title: "latest" }));
    expect(saveDraft).toHaveBeenCalledTimes(1);

    await act(async () => {
      first.resolve(ok("c1", 2));
      await flush;
    });

    expect(saveDraft).toHaveBeenCalledTimes(2);
    expect(saveDraft.mock.calls[1]).toEqual([
      { title: "latest" },
      { contentId: "c1", revision: 2 }
    ]);
  });

  it("lets concurrent callers join the same in-flight save", async () => {
    const pending = deferred<ReturnType<typeof ok>>();
    const saveDraft = vi.fn().mockReturnValue(pending.promise);
    const { result } = renderHook(() =>
      useSerializedDraftPersistence({
        initialSnapshot: { title: "old" },
        initialContentId: "c1",
        initialRevision: 1,
        saveDraft
      })
    );

    act(() => result.current.markDirty({ title: "new" }));
    let first!: ReturnType<typeof result.current.flushDraft>;
    let second!: ReturnType<typeof result.current.flushDraft>;
    act(() => {
      first = result.current.flushDraft();
      second = result.current.flushDraft();
    });
    await waitFor(() => expect(saveDraft).toHaveBeenCalledTimes(1));

    await act(async () => {
      pending.resolve(ok("c1", 2));
      await expect(Promise.all([first, second])).resolves.toEqual([
        { status: "ok", contentId: "c1", revision: 2, saved: true },
        { status: "ok", contentId: "c1", revision: 2, saved: true }
      ]);
    });
  });
});
