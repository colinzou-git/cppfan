import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { restoreVersionAsDraft } = vi.hoisted(() => ({ restoreVersionAsDraft: vi.fn() }));
vi.mock("@/features/user-content/user-content-actions", () => ({ restoreVersionAsDraft }));

import { VersionHistory } from "@/features/user-content/version-history";
import type { ContentVersionSummary } from "@/features/user-content/user-content-queries";

const versions: ContentVersionSummary[] = [
  { versionNumber: 3, versionState: "draft", createdAt: "2026-07-14T02:00:00Z", publishedAt: null },
  { versionNumber: 2, versionState: "published", createdAt: "2026-07-14T01:00:00Z", publishedAt: "2026-07-14T01:05:00Z" },
  { versionNumber: 1, versionState: "superseded", createdAt: "2026-07-14T00:00:00Z", publishedAt: "2026-07-14T00:05:00Z" }
];

afterEach(() => vi.clearAllMocks());

describe("VersionHistory (#487)", () => {
  it("renders nothing without a content id or versions", () => {
    const { container: a } = render(<VersionHistory contentId={undefined} versions={versions} currentRevision={1} onRestored={vi.fn()} />);
    expect(a.textContent).toBe("");
    const { container: b } = render(<VersionHistory contentId="c1" versions={[]} currentRevision={1} onRestored={vi.fn()} />);
    expect(b.textContent).toBe("");
  });

  it("lists versions newest-first with their state", () => {
    render(<VersionHistory contentId="c1" versions={versions} currentRevision={3} onRestored={vi.fn()} />);
    expect(screen.getByText(/v3/)).toBeTruthy();
    expect(screen.getByText(/Published/)).toBeTruthy();
    expect(screen.getByText(/Superseded/)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /restore as new draft/i })).toHaveLength(3);
  });

  it("restores a chosen version and notifies the parent on success", async () => {
    restoreVersionAsDraft.mockResolvedValue({ status: "ok", contentId: "c1", revision: 4 });
    const onRestored = vi.fn();
    render(<VersionHistory contentId="c1" versions={versions} currentRevision={3} onRestored={onRestored} />);
    fireEvent.click(screen.getAllByRole("button", { name: /restore as new draft/i })[1]); // v2
    await waitFor(() =>
      expect(restoreVersionAsDraft).toHaveBeenCalledWith({ contentId: "c1", versionNumber: 2, expectedRevision: 3 })
    );
    await waitFor(() => expect(onRestored).toHaveBeenCalled());
  });

  it("surfaces a conflict without notifying the parent", async () => {
    restoreVersionAsDraft.mockResolvedValue({ status: "conflict" });
    const onRestored = vi.fn();
    render(<VersionHistory contentId="c1" versions={versions} currentRevision={3} onRestored={onRestored} />);
    fireEvent.click(screen.getAllByRole("button", { name: /restore as new draft/i })[0]);
    expect(await screen.findByText(/changed elsewhere/i)).toBeTruthy();
    expect(onRestored).not.toHaveBeenCalled();
  });
});
