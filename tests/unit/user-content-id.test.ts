import { describe, expect, it } from "vitest";
import {
  contentIdFromUserItemId,
  contentIdFromUserSkillId,
  isUserContentId,
  isUserLearningItemId,
  isUserSkillId,
  reviewCardIdFromUserItemId,
  userLearningItemId,
  userReviewItemId,
  userSkillId
} from "@/features/user-content/user-content-id";

const CONTENT = "11111111-2222-3333-4444-555555555555";
const REVIEW = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("user-content projected ids (#487)", () => {
  it("builds stable namespaced ids from a content uuid", () => {
    expect(userSkillId(CONTENT)).toBe(`user.skill.${CONTENT}`);
    expect(userLearningItemId(CONTENT)).toBe(`user.item.${CONTENT}`);
    expect(userReviewItemId(CONTENT, REVIEW)).toBe(`user.item.${CONTENT}.review.${REVIEW}`);
  });

  it("classifies ids by namespace", () => {
    expect(isUserSkillId(userSkillId(CONTENT))).toBe(true);
    expect(isUserSkillId(userLearningItemId(CONTENT))).toBe(false);
    expect(isUserLearningItemId(userReviewItemId(CONTENT, REVIEW))).toBe(true);
    expect(isUserContentId("cpp.program_basics.io")).toBe(false);
    expect(isUserContentId(userSkillId(CONTENT))).toBe(true);
  });

  it("recovers the content uuid from skill and item ids", () => {
    expect(contentIdFromUserSkillId(userSkillId(CONTENT))).toBe(CONTENT);
    expect(contentIdFromUserItemId(userLearningItemId(CONTENT))).toBe(CONTENT);
    expect(contentIdFromUserItemId(userReviewItemId(CONTENT, REVIEW))).toBe(CONTENT);
    expect(contentIdFromUserSkillId("cpp.x.y")).toBeNull();
    expect(contentIdFromUserItemId("dsa.x.y")).toBeNull();
  });

  it("recovers the review-card uuid only from review item ids", () => {
    expect(reviewCardIdFromUserItemId(userReviewItemId(CONTENT, REVIEW))).toBe(REVIEW);
    expect(reviewCardIdFromUserItemId(userLearningItemId(CONTENT))).toBeNull();
    expect(reviewCardIdFromUserItemId("native.item")).toBeNull();
  });
});
