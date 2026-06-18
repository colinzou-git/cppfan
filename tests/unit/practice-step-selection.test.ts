import { describe, expect, it } from "vitest";
import { selectPracticeStep } from "@/features/recommendations/practice-step-selection";

describe("selectPracticeStep (#124)", () => {
  it("routes ordering or syntax evidence to Parsons-style reconstruction", () => {
    const selection = selectPracticeStep({ status: "learning", recentErrorTags: ["cpp.loop.order"] });
    expect(selection.preferredTypes[0]).toBe("parsons");
    expect(selection.evidenceLevel).toBe("reconstruction");
    expect(selection.reason).toMatch(/ordering|syntax/i);
  });

  it("routes weak or regressed skills to reconstruction practice", () => {
    const selection = selectPracticeStep({ status: "weak" });
    expect(selection.preferredTypes.slice(0, 2)).toEqual(["completion", "parsons"]);
    expect(selection.evidenceLevel).toBe("reconstruction");
  });

  it("lets strong learners move to lower-support practice", () => {
    const selection = selectPracticeStep({ status: "strong" });
    expect(selection.preferredTypes[0]).toBe("code_reading");
    expect(selection.evidenceLevel).toBe("independent_application");
  });
});
