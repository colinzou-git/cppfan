import { describe, expect, it } from "vitest";
import {
  getEligibleReviewItems,
  isReviewEligibleItem,
  isReviewEligibleType
} from "@/features/learning-items/learning-item-seed";

// #142: review cards must come from real practice evidence, and lessons (which
// are explanatory, not retrieval) must never be enrolled. These pure checks back
// the evidence-boundary enrollment that replaced the page-visit bulk creation.

describe("review eligibility (#142)", () => {
  it("treats retrieval-practice types as eligible and lessons as not", () => {
    expect(isReviewEligibleType("multiple_choice")).toBe(true);
    expect(isReviewEligibleType("concept_check")).toBe(true);
    expect(isReviewEligibleType("code_reading")).toBe(true);
    expect(isReviewEligibleType("bug_spotting")).toBe(true);
    expect(isReviewEligibleType("lesson")).toBe(false);
  });

  it("never lists a lesson among eligible review items", () => {
    const eligible = getEligibleReviewItems();
    expect(eligible.length).toBeGreaterThan(0);
    expect(eligible.every((entry) => entry.item.type !== "lesson")).toBe(true);
    expect(eligible.every((entry) => isReviewEligibleType(entry.item.type))).toBe(true);
    // Every eligible entry has a primary skill (required to seed a card).
    expect(eligible.every((entry) => typeof entry.skillId === "string" && entry.skillId.length > 0)).toBe(true);
  });

  it("isReviewEligibleItem accepts a real practice item and rejects unknown ids", () => {
    const sample = getEligibleReviewItems()[0];
    expect(isReviewEligibleItem(sample.item.id)).toBe(true);
    expect(isReviewEligibleItem("does.not.exist")).toBe(false);
  });

  it("excludes lessons from the eligible set even though they are active content", () => {
    // The eligible set is strictly smaller than all active items because lessons
    // (lesson + multiple_choice pairs) are filtered out.
    const eligibleIds = new Set(getEligibleReviewItems().map((entry) => entry.item.id));
    expect([...eligibleIds].some((id) => id.endsWith(".lesson"))).toBe(false);
  });
});
