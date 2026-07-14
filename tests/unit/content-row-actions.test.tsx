import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { refresh, actions } = vi.hoisted(() => ({
  refresh: vi.fn(),
  actions: {
    publishContent: vi.fn(),
    archiveContent: vi.fn(),
    restoreContent: vi.fn(),
    exportContent: vi.fn()
  }
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/features/user-content/user-content-actions", () => actions);

import { ContentRowActions } from "@/features/user-content/content-row-actions";

afterEach(() => {
  vi.clearAllMocks();
});

describe("ContentRowActions (#487)", () => {
  it("offers Publish/Archive/Export/Preview for a draft and refreshes after publishing", async () => {
    actions.publishContent.mockResolvedValue({ status: "ok" });
    render(<ContentRowActions contentId="c1" status="draft" revision={3} />);

    expect(screen.getByRole("link", { name: /preview/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /archive/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /restore/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    await waitFor(() => expect(actions.publishContent).toHaveBeenCalledWith({ contentId: "c1", expectedRevision: 3 }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("offers Restore (not Publish/Archive) for an archived item", () => {
    render(<ContentRowActions contentId="c2" status="archived" revision={1} />);
    expect(screen.getByRole("button", { name: /restore/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /publish/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /archive/i })).toBeNull();
  });

  it("surfaces an error message when an action fails", async () => {
    actions.archiveContent.mockResolvedValue({ status: "error" });
    render(<ContentRowActions contentId="c3" status="published" revision={2} />);
    fireEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(await screen.findByText(/something went wrong/i)).toBeTruthy();
    expect(refresh).not.toHaveBeenCalled();
  });
});
