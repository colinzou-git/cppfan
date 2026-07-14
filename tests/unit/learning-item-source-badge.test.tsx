import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LearningItemView } from "@/features/learning-items/learning-item-view";
import type { LearningItem, LearningItemWithDetails } from "@/features/learning-items/learning-item-types";

function data(id: string): LearningItemWithDetails {
  const item: LearningItem = {
    id,
    type: "lesson",
    title: "A user lesson",
    prompt: "Some content.",
    explanation: "",
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 1,
    is_active: true
  };
  return { item, skills: [], choices: [] };
}

describe("learner-page source badge (#487)", () => {
  it("shows the User-Created badge on an owner-scoped user item", () => {
    render(<LearningItemView data={data("user.item.11111111-1111-1111-1111-111111111111")} />);
    expect(screen.getByText("User-Created")).toBeTruthy();
  });

  it("does not badge a native item as user-created", () => {
    render(<LearningItemView data={data("cpp.program_basics.structure.mc_hello")} />);
    expect(screen.queryByText("User-Created")).toBeNull();
  });
});
