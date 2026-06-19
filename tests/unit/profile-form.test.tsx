import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfileForm } from "@/features/profile/profile-form";

vi.mock("@/features/profile/profile-actions", () => ({
  saveProfileAction: vi.fn()
}));

describe("ProfileForm", () => {
  it("labels broad profile goals as learning interests, separate from dated goals", () => {
    render(<ProfileForm disabled mode="profile" nextPath="/dashboard" />);

    expect(screen.getByRole("heading", { name: "Learning interests" })).toBeVisible();
    expect(screen.getByText("Choose broad interests for recommendation ranking. These do not create dated Goals."))
      .toBeVisible();
    expect(screen.queryByRole("heading", { name: "Learning goals" })).not.toBeInTheDocument();
  });

  it("keeps baseline new learning and review preferences visibly separate", () => {
    render(<ProfileForm disabled mode="profile" nextPath="/dashboard" />);

    expect(screen.getByLabelText(/Baseline new skills per day/i)).toBeVisible();
    expect(screen.getByText("Learn Extra may exceed this baseline for one day without changing it.")).toBeVisible();
    expect(screen.getByLabelText(/Review minutes per day/i)).toBeVisible();
    expect(screen.getByText("This review expectation stays separate from new goal learning.")).toBeVisible();
  });
});
