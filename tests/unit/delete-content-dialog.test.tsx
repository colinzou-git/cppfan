import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { deleteContent } = vi.hoisted(() => ({ deleteContent: vi.fn() }));
vi.mock("@/features/user-content/user-content-actions", () => ({ deleteContent }));

import { DeleteContentDialog } from "@/features/user-content/delete-content-dialog";

afterEach(() => vi.clearAllMocks());

describe("DeleteContentDialog (#487)", () => {
  it("opens to three explicit outcomes", () => {
    render(<DeleteContentDialog contentId="c1" onDeleted={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("button", { name: /archive instead/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /delete editable content/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /delete everything/i })).toBeTruthy();
  });

  it("archives without a second confirmation and calls onDeleted", async () => {
    deleteContent.mockResolvedValue({ status: "ok" });
    const onDeleted = vi.fn();
    render(<DeleteContentDialog contentId="c1" onDeleted={onDeleted} />);
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    fireEvent.click(screen.getByRole("button", { name: /archive instead/i }));
    await waitFor(() => expect(deleteContent).toHaveBeenCalledWith("c1", "archive"));
    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
  });

  it("requires a second confirmation before permanently deleting everything", async () => {
    deleteContent.mockResolvedValue({ status: "ok" });
    render(<DeleteContentDialog contentId="c1" onDeleted={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    // First click only reveals the warning; it must not delete yet.
    fireEvent.click(screen.getByRole("button", { name: /delete everything/i }));
    expect(deleteContent).not.toHaveBeenCalled();
    expect(screen.getByText(/irreversible/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /permanently delete everything/i }));
    await waitFor(() => expect(deleteContent).toHaveBeenCalledWith("c1", "delete_all"));
  });

  it("deletes editable content while keeping history", async () => {
    deleteContent.mockResolvedValue({ status: "ok" });
    render(<DeleteContentDialog contentId="c1" onDeleted={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete editable content/i }));
    await waitFor(() => expect(deleteContent).toHaveBeenCalledWith("c1", "delete_editable"));
  });
});
