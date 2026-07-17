import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { PersonalMockComposer, type MockComposerCandidate } from "@/features/interview/personal-mock-composer";

const candidates: MockComposerCandidate[] = [
  { problemId: "native-1", source: "native", title: "Native One" },
  { problemId: "user.item.a", source: "user", title: "Custom A", contentVersionId: "v2" }
];

afterEach(() => vi.clearAllMocks());

describe("PersonalMockComposer (#613)", () => {
  it("requires a name + at least one selection before saving", () => {
    render(<PersonalMockComposer candidates={candidates} onSave={vi.fn(async () => true)} />);
    // Nothing selected / no title → save disabled.
    expect(screen.getByRole("button", { name: /save pack/i })).toBeDisabled();
  });

  it("saves the selected problems with source + content version, then refreshes", async () => {
    const onSave = vi.fn(async () => true);
    render(<PersonalMockComposer candidates={candidates} onSave={onSave} />);

    fireEvent.change(screen.getByPlaceholderText(/graphs \+ dp/i), { target: { value: "My pack" } });
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[0]); // native-1
    fireEvent.click(boxes[1]); // user.item.a (custom, v2)

    fireEvent.click(screen.getByRole("button", { name: /save pack \(2\)/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith("My pack", [
        { problemId: "native-1", source: "native", contentVersionId: null },
        { problemId: "user.item.a", source: "user", contentVersionId: "v2" }
      ])
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(await screen.findByText(/^saved\.$/i)).toBeTruthy();
  });

  it("surfaces a sign-in message when the save is rejected and does not refresh", async () => {
    const onSave = vi.fn(async () => false);
    render(<PersonalMockComposer candidates={candidates} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText(/graphs \+ dp/i), { target: { value: "X" } });
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: /save pack/i }));
    expect(await screen.findByText(/sign in to keep your packs/i)).toBeTruthy();
    expect(refresh).not.toHaveBeenCalled();
  });
});
