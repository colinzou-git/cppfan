import { describe, expect, it } from "vitest";
import { interviewDraftStorageKey } from "@/features/interview/interview-draft-storage";

describe("interview draft storage key", () => {
  it("namespaces by problem id", () => {
    expect(interviewDraftStorageKey("iv.sliding.longest-window-under-budget")).toBe(
      "cppfan:interview:draft:iv.sliding.longest-window-under-budget"
    );
  });

  it("is distinct per problem", () => {
    expect(interviewDraftStorageKey("a")).not.toBe(interviewDraftStorageKey("b"));
  });
});
