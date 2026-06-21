import { describe, expect, it } from "vitest";
import {
  explainScaffoldRecommendation,
  formatScaffoldReasonForUser,
  SCAFFOLD_LEVEL_LABELS
} from "@/features/recommendations/scaffold-reasons";
import type { ScaffoldRecommendation, ScaffoldSelectionInput } from "@/features/recommendations/scaffold-selector-types";

const rec: ScaffoldRecommendation = {
  skillId: "s1",
  level: "code_lab",
  reason: "Recommended because you completed the scaffold and are ready to write code.",
  priority: "medium"
};

describe("scaffold reasons", () => {
  it("returns the human-readable reason", () => {
    expect(explainScaffoldRecommendation(rec)).toMatch(/ready to write code/i);
  });

  it("prefixes the level label for the user", () => {
    const input: ScaffoldSelectionInput = { skillId: "s1", masteryStatus: "learning", availableItems: [] };
    const text = formatScaffoldReasonForUser(input, rec);
    expect(text).toContain(SCAFFOLD_LEVEL_LABELS.code_lab);
    expect(text).toMatch(/ready to write code/i);
  });
});
