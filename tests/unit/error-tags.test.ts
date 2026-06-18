import { describe, expect, it } from "vitest";
import { getLearningItemById, learningItemChoices } from "@/features/learning-items/learning-item-seed";
import {
  ERROR_TAGS,
  OBSERVE_THRESHOLD,
  choiceErrorTags,
  getErrorTagForChoice,
  isInstructionalTag,
  observedPatterns,
  remediationReason,
  type InstructionalTag
} from "@/features/remediation/error-tags";

const choiceById = new Map(learningItemChoices.map((c) => [c.id, c]));

describe("wrong-answer error-tag catalog + mapping (#126)", () => {
  it("maps only to tags that exist in the catalog", () => {
    for (const entry of choiceErrorTags) {
      expect(isInstructionalTag(entry.instructional_tag)).toBe(true);
    }
  });

  it("tags only real distractor choices (existing and is_correct === false)", () => {
    for (const entry of choiceErrorTags) {
      const choice = choiceById.get(entry.choice_id);
      expect(choice, `missing choice ${entry.choice_id}`).toBeDefined();
      expect(choice?.is_correct ?? false).toBe(false);
    }
  });

  it("covers at least three distinct modules", () => {
    // Module = first two dotted segments of the item id (e.g. cpp.references).
    const modules = new Set(
      choiceErrorTags.map((e) => e.choice_id.split(".").slice(0, 2).join("."))
    );
    expect(modules.size).toBeGreaterThanOrEqual(3);
  });

  it("points every tag at an existing contrasting follow-up item", () => {
    for (const [tag, info] of Object.entries(ERROR_TAGS)) {
      expect(info.followUpItemId, `${tag} follow-up`).not.toBe("");
      expect(getLearningItemById(info.followUpItemId), `${tag} follow-up item`).not.toBeNull();
    }
  });

  it("resolves a tag for a mapped distractor and null otherwise", () => {
    expect(getErrorTagForChoice("cpp.references.references.mc_init.b")).toBe("cpp.references.copy_vs_alias");
    expect(getErrorTagForChoice("cpp.references.references.mc_init.a")).toBeNull();
    expect(getErrorTagForChoice("does.not.exist")).toBeNull();
  });
});

describe("deterministic pattern detection (#126)", () => {
  it("observes a tag only at or above the threshold", () => {
    const tag: InstructionalTag = "dsa.complexity.loop_cost";
    expect(observedPatterns({ [tag]: OBSERVE_THRESHOLD - 1 })).toEqual([]);
    expect(observedPatterns({ [tag]: OBSERVE_THRESHOLD })).toEqual([tag]);
  });

  it("returns each observed tag once, in stable catalog order", () => {
    const hits = {
      "dsa.complexity.loop_cost": 5,
      "cpp.references.copy_vs_alias": 3
    } as Partial<Record<InstructionalTag, number>>;
    const observed = observedPatterns(hits);
    expect(new Set(observed).size).toBe(observed.length);
    expect(observed).toEqual(Object.keys(ERROR_TAGS).filter((t) => t in hits));
  });

  it("gives a learner-friendly reason naming the misconception", () => {
    const reason = remediationReason("cpp.references.copy_vs_alias");
    expect(reason).toMatch(/aliases/i);
    expect(reason).toMatch(/recommended because/i);
  });
});
