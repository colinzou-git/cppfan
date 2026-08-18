import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { load, loadPrev, save } = vi.hoisted(() => ({
  load: vi.fn(async () => null as string | null),
  loadPrev: vi.fn(async () => null as string | null),
  save: vi.fn(async () => true)
}));

vi.mock("@/features/code-lab/code-draft-client", () => ({
  loadDraftRequest: load,
  loadPreviousDraftRequest: loadPrev,
  saveDraftRequest: save
}));

import { draftStorageKey, useCodeDraft } from "@/features/code-lab/use-code-draft";

const ITEM = "cpp.values_types.variables.sample_code";

function Harness() {
  const [source, setSource] = useState("canonical-starter");
  const draft = useCodeDraft({
    itemId: ITEM,
    starterCode: "canonical-starter",
    source,
    setSource
  });

  return (
    <div>
      <span data-testid="source">{source}</span>
      <button type="button" onClick={() => setSource("ordinary-draft")}>
        edit ordinary draft
      </button>
      <button type="button" onClick={draft.suspendDraftPersistence}>
        suspend draft
      </button>
      <button type="button" onClick={() => setSource("named-practice")}>
        load practice
      </button>
      <button type="button" onClick={draft.restoreWorkingDraft}>
        restore draft
      </button>
      <button type="button" onClick={draft.adoptCurrentSourceAsWorkingDraft}>
        adopt current
      </button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  load.mockResolvedValue(null);
  loadPrev.mockResolvedValue(null);
  save.mockResolvedValue(true);
  window.localStorage.clear();
});

afterEach(cleanup);

describe("useCodeDraft named-practice isolation (#684)", () => {
  it("restores the ordinary draft and never persists practice source while suspended", async () => {
    const view = render(<Harness />);
    await waitFor(() => expect(load).toHaveBeenCalledWith(ITEM, undefined));

    fireEvent.click(screen.getByRole("button", { name: "edit ordinary draft" }));
    expect(screen.getByTestId("source").textContent).toBe("ordinary-draft");

    fireEvent.click(screen.getByRole("button", { name: "suspend draft" }));
    fireEvent.click(screen.getByRole("button", { name: "load practice" }));
    expect(screen.getByTestId("source").textContent).toBe("named-practice");

    fireEvent.click(screen.getByRole("button", { name: "restore draft" }));
    expect(screen.getByTestId("source").textContent).toBe("ordinary-draft");
    expect(window.localStorage.getItem(draftStorageKey(ITEM))).not.toBe("named-practice");
    expect(save.mock.calls.some(([, value]) => value === "named-practice")).toBe(false);

    // Re-enter a practice and unmount from practice mode. The cleanup path must
    // still persist the ordinary snapshot, not the visible practice source.
    fireEvent.click(screen.getByRole("button", { name: "suspend draft" }));
    fireEvent.click(screen.getByRole("button", { name: "load practice" }));
    view.unmount();

    expect(window.localStorage.getItem(draftStorageKey(ITEM))).toBe("ordinary-draft");
    expect(save.mock.calls.at(-1)?.[1]).toBe("ordinary-draft");
  });

  it("hydrates a delayed remote working draft behind an active practice without replacing it", async () => {
    let resolveRemote!: (value: string | null) => void;
    load.mockImplementationOnce(
      () => new Promise<string | null>((resolve) => {
        resolveRemote = resolve;
      })
    );

    render(<Harness />);
    await waitFor(() => expect(load).toHaveBeenCalledWith(ITEM, undefined));

    fireEvent.click(screen.getByRole("button", { name: "suspend draft" }));
    fireEvent.click(screen.getByRole("button", { name: "load practice" }));
    expect(screen.getByTestId("source").textContent).toBe("named-practice");

    await act(async () => {
      resolveRemote("remote-working-draft");
      await Promise.resolve();
    });

    // Remote hydration must update only the hidden ordinary draft while the
    // named practice remains the visible editor source.
    expect(screen.getByTestId("source").textContent).toBe("named-practice");
    fireEvent.click(screen.getByRole("button", { name: "restore draft" }));
    expect(screen.getByTestId("source").textContent).toBe("remote-working-draft");
    expect(save.mock.calls.some(([, value]) => value === "named-practice")).toBe(false);
  });

  it("only promotes practice source into the draft through the explicit adopt path", async () => {
    render(<Harness />);
    await waitFor(() => expect(load).toHaveBeenCalledWith(ITEM, undefined));

    fireEvent.click(screen.getByRole("button", { name: "edit ordinary draft" }));
    fireEvent.click(screen.getByRole("button", { name: "suspend draft" }));
    fireEvent.click(screen.getByRole("button", { name: "load practice" }));
    fireEvent.click(screen.getByRole("button", { name: "adopt current" }));

    await waitFor(() =>
      expect(window.localStorage.getItem(draftStorageKey(ITEM))).toBe("named-practice")
    );
    expect(save.mock.calls.some(([, value]) => value === "named-practice")).toBe(true);
  });
});
