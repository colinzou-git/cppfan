import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublishChoiceDialog } from "@/features/user-content/publish-choice-dialog";

afterEach(() => vi.clearAllMocks());

describe("PublishChoiceDialog (#487)", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <PublishChoiceDialog open={false} busy={false} onChoose={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container.textContent).toBe("");
  });

  it("offers the three substantial-edit choices and reports the picked mode", () => {
    const onChoose = vi.fn();
    render(<PublishChoiceDialog open busy={false} onChoose={onChoose} onCancel={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /continue schedule/i }));
    fireEvent.click(screen.getByRole("button", { name: /publish as a new version/i }));
    fireEvent.click(screen.getByRole("button", { name: /reset review cards/i }));

    expect(onChoose.mock.calls.map((c) => c[0])).toEqual(["continue", "new_version", "reset"]);
  });

  it("cancels without choosing", () => {
    const onChoose = vi.fn();
    const onCancel = vi.fn();
    render(<PublishChoiceDialog open busy={false} onChoose={onChoose} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
    expect(onChoose).not.toHaveBeenCalled();
  });
});
