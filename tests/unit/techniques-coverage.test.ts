import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getLearningItemById,
  learningItemChoices,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const REQUIRED_SKILLS = [
  "dsa.techniques.prefix_sums",
  "dsa.techniques.range_structures",
  "dsa.techniques.greedy",
  "dsa.techniques.greedy_proof",
  "dsa.techniques.dynamic_programming",
  "dsa.techniques.dp_design",
  "dsa.techniques.prefix_2d",
  "dsa.techniques.interval_scheduling",
  "dsa.techniques.dp_forms"
];

const REQUIRED_ITEMS = [
  "dsa.techniques.prefix_sums.code_diff_trace",
  "dsa.techniques.prefix_sums.mc_prefix_suffix",
  "dsa.techniques.range_structures.code_fenwick_trace",
  "dsa.techniques.range_structures.mc_sparse_table",
  "dsa.techniques.range_structures.code_segment_trace",
  "dsa.techniques.greedy_proof.mc_counterexample",
  "dsa.techniques.dp_design.worked_climbing_stairs",
  "dsa.techniques.dp_design.code_memo_tab_trace",
  "dsa.techniques.prefix_2d.code_difference_trace",
  "dsa.techniques.interval_scheduling.code_trace",
  "dsa.techniques.dp_forms.code_knapsack_trace",
  "dsa.techniques.dp_forms.code_subsequence_trace"
];

const REQUIRED_RESOURCES = [
  "cp-algorithms-range-queries",
  "cp-algorithms-fenwick-tree",
  "cp-algorithms-sparse-table",
  "usaco-guide-prefix-sums",
  "usaco-guide-dynamic-programming",
  "cses-dynamic-programming",
  "cses-range-queries",
  "cses-sorting-searching"
];

describe("prefix/range-query/greedy/DP completion coverage (#116)", () => {
  it("keeps the original #76 progression represented as active skills and items", () => {
    const activeSkillIds = new Set(skillSeed.filter((skill) => skill.is_active).map((skill) => skill.id));

    for (const skillId of REQUIRED_SKILLS) {
      expect(activeSkillIds.has(skillId), `${skillId} should be active`).toBe(true);
      const itemCount = learningItemSkills.filter((mapping) => mapping.skill_id === skillId).length;
      expect(itemCount, `${skillId} should have multiple learning items`).toBeGreaterThanOrEqual(2);
    }

    for (const itemId of REQUIRED_ITEMS) {
      expect(getLearningItemById(itemId), `${itemId} should exist`).not.toBeNull();
    }
  });

  it("states range-query operation requirements and complexity tradeoffs", () => {
    const diff = learningItems.find((item) => item.id === "dsa.techniques.prefix_sums.code_diff_trace");
    const prefix2d = learningItems.find((item) => item.id === "dsa.techniques.prefix_2d.code_difference_trace");
    const fenwick = learningItems.find((item) => item.id === "dsa.techniques.range_structures.code_fenwick_trace");
    const segment = learningItems.find((item) => item.id === "dsa.techniques.range_structures.code_segment_trace");

    expect(diff?.explanation).toMatch(/O\(1\).*O\(n\)/);
    expect(prefix2d?.explanation).toMatch(/O\(1\).*O\(rows\*cols\)/);
    expect(fenwick?.explanation).toMatch(/O\(log n\).*O\(n\) space/);
    expect(segment?.explanation).toMatch(/dynamic range minima|O\(log n\).*O\(n\)/);

    const sparseChoices = learningItemChoices.filter(
      (choice) => choice.learning_item_id === "dsa.techniques.range_structures.mc_sparse_table"
    );
    expect(sparseChoices.filter((choice) => choice.is_correct).map((choice) => choice.content)).toEqual([
      "A sparse table for immutable idempotent queries"
    ]);
  });

  it("includes greedy proofs, interval scheduling, and explicit counterexamples", () => {
    const greedy = learningItems.find((item) => item.id === "dsa.techniques.greedy_proof.lesson");
    const counterexample = learningItems.find((item) => item.id === "dsa.techniques.greedy_proof.mc_counterexample");
    const intervalTrace = learningItems.find((item) => item.id === "dsa.techniques.interval_scheduling.code_trace");

    expect(greedy?.prompt).toMatch(/exchange argument/i);
    expect(counterexample?.explanation).toMatch(/B\+C.*100/);
    expect(intervalTrace?.explanation).toMatch(/\[2,3\].*\[3,5\].*\[5,7\]/);
  });

  it("requires DP items to name state, transition, base case, and order before optimization", () => {
    for (const id of [
      "dsa.techniques.dp_design.lesson",
      "dsa.techniques.dp_design.worked_climbing_stairs",
      "dsa.techniques.dp_forms.code_knapsack_trace",
      "dsa.techniques.dp_forms.code_subsequence_trace"
    ]) {
      const item = getLearningItemById(id)?.item;
      const text = `${item?.prompt ?? ""} ${item?.explanation ?? ""}`;
      expect(text, id).toMatch(/state/i);
      expect(text, id).toMatch(/transition/i);
      expect(text, id).toMatch(/base/i);
      expect(text, id).toMatch(/order|fill/i);
    }

    expect(getLearningItemById("dsa.techniques.dp_design.worked_climbing_stairs")?.item.explanation).toMatch(
      /before optimizing space|then.*safe/i
    );
  });

  it("registers introductory resources and compile-checked examples", () => {
    const resourceIds = new Set(
      externalResources.filter((resource) => resource.tags.includes("dsa")).map((resource) => resource.id)
    );
    for (const id of REQUIRED_RESOURCES) {
      expect(resourceIds.has(id), `${id} should be registered`).toBe(true);
    }

    for (const id of [
      "difference-array-range-updates",
      "two-dimensional-prefix-difference",
      "fenwick-range-sums",
      "interval-scheduling-trace",
      "knapsack-reconstruction",
      "lcs-subsequence-trace"
    ]) {
      expect(existsSync(join(process.cwd(), "curriculum-examples", id, "example.cpp")), id).toBe(true);
    }
  });
});
