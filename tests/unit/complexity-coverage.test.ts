import { describe, expect, it } from "vitest";
import {
  getLearningItemById,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { externalResources } from "@/features/resources/resource-catalog";
import { remediationRecsFromAttempts } from "@/features/remediation/remediation-recs";
import { skillModules, skillSeed } from "@/features/skills/skill-seed";

const REQUIRED_SKILLS = [
  "dsa.complexity.big_o",
  "dsa.complexity.growth_rates",
  "dsa.complexity.amortized",
  "dsa.complexity.constraints",
  "dsa.complexity.time_space_tradeoffs",
  "dsa.complexity.problem_framing",
  "dsa.complexity.test_examples",
  "dsa.complexity.bruteforce_then_optimize",
  "dsa.complexity.correctness_reasoning",
  "dsa.complexity.pattern_recognition",
  "dsa.complexity.container_selection",
  "dsa.complexity.recursion_choice"
];

const REQUIRED_ITEMS = [
  "dsa.complexity.growth_rates.mc_order",
  "dsa.complexity.constraints.mc_hidden_cost",
  "dsa.complexity.time_space_tradeoffs.mc_prefix",
  "dsa.complexity.problem_framing.mc_clarify",
  "dsa.complexity.test_examples.mc_why",
  "dsa.complexity.bruteforce_then_optimize.mc_step",
  "dsa.complexity.correctness_reasoning.mc_invariant",
  "dsa.complexity.pattern_recognition.mc_window",
  "dsa.complexity.container_selection.mc_membership",
  "dsa.complexity.recursion_choice.mc_backtracking"
];

const COVERAGE_RE =
  /\bO\(|complexity|cost|constraint|invariant|correctness|pattern|container|window|prefix|sort|scan|stack|queue|heap|hash|binary search|dynamic programming|greedy|BFS|DFS/i;

describe("DSA complexity/problem-solving completion coverage (#110)", () => {
  it("keeps the original #68 checklist represented as active skills and items", () => {
    const activeSkillIds = new Set(skillSeed.filter((skill) => skill.is_active).map((skill) => skill.id));

    for (const skillId of REQUIRED_SKILLS) {
      expect(activeSkillIds.has(skillId), `${skillId} should be active`).toBe(true);
      const itemCount = learningItemSkills.filter((mapping) => mapping.skill_id === skillId).length;
      expect(itemCount, `${skillId} should have learning items`).toBeGreaterThanOrEqual(2);
    }

    for (const itemId of REQUIRED_ITEMS) {
      expect(getLearningItemById(itemId), `${itemId} should exist`).not.toBeNull();
    }
  });

  it("covers every DSA module with at least one cost or pattern-selection item", () => {
    const itemsById = new Map(learningItems.map((item) => [item.id, item]));
    const skillById = new Map(skillSeed.map((skill) => [skill.id, skill]));

    for (const module of skillModules.filter((m) => m.id.startsWith("dsa.") && m.id !== "dsa.complexity")) {
      const matchingItems = learningItemSkills
        .filter((mapping) => skillById.get(mapping.skill_id)?.module_id === module.id)
        .map((mapping) => itemsById.get(mapping.learning_item_id))
        .filter((item): item is NonNullable<typeof item> => item !== undefined)
        .filter((item) => COVERAGE_RE.test(`${item.title} ${item.prompt} ${item.explanation}`));

      expect(
        matchingItems.map((item) => item.id),
        `${module.id} needs at least one cost or pattern-selection item`
      ).not.toEqual([]);
    }
  });

  it("keeps repeated complexity mistakes mapped to one reasoned follow-up", () => {
    const recs = remediationRecsFromAttempts([
      {
        learning_item_id: "dsa.complexity.big_o.mc_single_loop",
        selected_choice_id: "dsa.complexity.big_o.mc_single_loop.b"
      },
      {
        learning_item_id: "dsa.complexity.big_o.mc_single_loop",
        selected_choice_id: "dsa.complexity.big_o.mc_single_loop.c"
      },
      {
        learning_item_id: "dsa.complexity.big_o.mc_single_loop",
        selected_choice_id: "dsa.complexity.big_o.mc_single_loop.d"
      }
    ]);

    expect(recs).toHaveLength(1);
    expect(recs[0]).toMatchObject({
      tag: "dsa.complexity.loop_cost",
      itemId: "dsa.complexity.growth_rates.mc_order"
    });
    expect(recs[0].reason).toMatch(/single loop/i);
  });

  it("includes DSA resource links for practice, guidance, and reference", () => {
    const dsaIds = new Set(externalResources.filter((resource) => resource.tags.includes("dsa")).map((r) => r.id));

    expect(dsaIds.has("cses")).toBe(true);
    expect(dsaIds.has("usaco-guide")).toBe(true);
    expect(dsaIds.has("cp-algorithms")).toBe(true);
    expect(dsaIds.has("usaco-guide-prefix-sums")).toBe(true);
    expect(dsaIds.has("cp-algorithms-range-queries")).toBe(true);
  });
});
