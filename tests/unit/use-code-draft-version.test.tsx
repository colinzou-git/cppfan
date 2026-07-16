import { useState } from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The hook's remote calls are mocked; localStorage (jsdom) drives the version
// keying we care about here (#612).
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

import { useCodeDraft, draftStorageKey } from "@/features/code-lab/use-code-draft";

function Harness({ itemId, starterCode, contentVersionId }: { itemId: string; starterCode: string; contentVersionId?: string | null }) {
  const [source, setSource] = useState(starterCode);
  const draft = useCodeDraft({ itemId, starterCode, source, setSource, contentVersionId });
  return (
    <div>
      <span data-testid="source">{source}</span>
      <span data-testid="hasprev">{String(draft.hasPreviousVersionDraft)}</span>
      <button onClick={draft.copyPreviousVersionDraft}>copy</button>
    </div>
  );
}

const ITEM = "user.item.00000000-0000-0000-0000-000000000042";

beforeEach(() => {
  vi.clearAllMocks();
  load.mockResolvedValue(null);
  loadPrev.mockResolvedValue(null);
  save.mockResolvedValue(true);
  window.localStorage.clear();
});

afterEach(cleanup);

describe("useCodeDraft version binding (#612)", () => {
  it("opening a new version does NOT silently load the old version's code", async () => {
    window.localStorage.setItem(draftStorageKey(ITEM, "v1"), "old v1 code");

    render(<Harness itemId={ITEM} starterCode="starter" contentVersionId="v2" />);

    // v2 starts from its starter, never the v1 draft.
    expect(screen.getByTestId("source").textContent).toBe("starter");
    // But the v1 draft is offered as an explicit copy.
    await waitFor(() => expect(screen.getByTestId("hasprev").textContent).toBe("true"));
  });

  it("explicit copy imports the previous version's code", async () => {
    window.localStorage.setItem(draftStorageKey(ITEM, "v1"), "old v1 code");
    render(<Harness itemId={ITEM} starterCode="starter" contentVersionId="v2" />);
    await waitFor(() => expect(screen.getByTestId("hasprev").textContent).toBe("true"));

    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    expect(screen.getByTestId("source").textContent).toBe("old v1 code");
  });

  it("resumes THIS version's own draft and offers no previous-version copy", async () => {
    window.localStorage.setItem(draftStorageKey(ITEM, "v2"), "my v2 work");
    render(<Harness itemId={ITEM} starterCode="starter" contentVersionId="v2" />);

    expect(screen.getByTestId("source").textContent).toBe("my v2 work");
    await waitFor(() => expect(load).toHaveBeenCalledWith(ITEM, "v2"));
    expect(screen.getByTestId("hasprev").textContent).toBe("false");
  });

  it("keeps a legacy unversioned draft recoverable as a copy, not silently attached", async () => {
    // A pre-#612 draft under the unversioned key.
    window.localStorage.setItem(draftStorageKey(ITEM), "legacy code");
    render(<Harness itemId={ITEM} starterCode="starter" contentVersionId="v1" />);

    expect(screen.getByTestId("source").textContent).toBe("starter");
    await waitFor(() => expect(screen.getByTestId("hasprev").textContent).toBe("true"));
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    expect(screen.getByTestId("source").textContent).toBe("legacy code");
  });
});
