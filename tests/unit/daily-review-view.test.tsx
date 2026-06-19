import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailyReview } from "@/features/review/daily-review";
import type { DailyReviewView } from "@/features/review/daily-review-model";

function view(): DailyReviewView {
  return {
    state: "ready",
    authenticated: true,
    timezone: "America/Los_Angeles",
    items: [{
      cardId: "card-1",
      itemId: "item-1",
      skillId: "cpp.structs_classes.syntax",
      title: "Struct/class syntax",
      href: "/review?card=card-1",
      dueAt: "2026-06-19T16:00:00.000Z",
      overdue: false,
      reason: "Due today by FSRS",
      localPlanDate: "2026-06-19",
      timezone: "America/Los_Angeles"
    }]
  };
}

describe("DailyReview", () => {
  it("renders the review tile FSRS reason and local plan context", () => {
    render(<DailyReview view={view()} />);

    const item = screen.getByTestId("daily-review-item");
    expect(within(item).getByText("Struct/class syntax")).toBeVisible();
    expect(within(item).getByText("Due today by FSRS")).toBeVisible();
    expect(within(item).getByText("2026-06-19 - America/Los_Angeles")).toBeVisible();
    expect(within(item).getByRole("link")).toHaveAttribute("href", "/review?card=card-1");
  });

  it("renders a genuine empty-due state separately from configured failures", () => {
    render(<DailyReview view={{ ...view(), items: [] }} />);

    expect(screen.getByText("No FSRS reviews are due today.")).toBeVisible();
    expect(screen.queryByText(/temporarily unavailable/i)).not.toBeInTheDocument();
  });

  it("renders unavailable review scheduling without implying an empty FSRS queue", () => {
    render(<DailyReview view={{ ...view(), state: "unavailable", items: [] }} />);

    expect(screen.getByText(/Review scheduling is temporarily unavailable/i)).toBeVisible();
    expect(screen.queryByText("No FSRS reviews are due today.")).not.toBeInTheDocument();
  });
});
