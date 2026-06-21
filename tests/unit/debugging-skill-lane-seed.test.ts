import { describe, expect, it } from "vitest";
import { learningItems, learningItemSkills } from "@/features/learning-items/learning-item-seed";
import { skillSeed } from "@/features/skills/skill-seed";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import { classifyCompilerDiagnostics } from "@/features/code-lab/compiler-diagnostic-classifier";
import { classifyRuntimeError } from "@/features/code-lab/runtime-error-classifier";

// #416: a focused debugging/tooling lane. Reuses existing stable tooling skills
// rather than introducing duplicates; this test pins the lane's shape and its
// connection to the #412 deterministic classifier.

const DEBUGGING_SKILLS = [
  "cpp.tooling.debugging",
  "cpp.tooling.debugging_method",
  "cpp.tooling.sanitizers",
  "cpp.tooling.warnings",
  "cpp.tooling.testing"
];

const CODE_LAB_DEBUGGING_ITEMS = [
  "cpp.tooling.debugging_method.code_first_diagnostic",
  "cpp.tooling.sanitizers.code_asan_report"
];

describe("debugging skill lane", () => {
  it("uses existing stable tooling skills", () => {
    const ids = new Set(skillSeed.map((skill) => skill.id));
    for (const skillId of DEBUGGING_SKILLS) {
      expect(ids.has(skillId), `missing skill ${skillId}`).toBe(true);
    }
  });

  it("has at least 8 debugging items mapped to the lane", () => {
    const laneSkills = new Set(DEBUGGING_SKILLS);
    const laneItemIds = new Set(
      learningItemSkills
        .filter((map) => laneSkills.has(map.skill_id))
        .map((map) => map.learning_item_id)
    );
    expect(laneItemIds.size).toBeGreaterThanOrEqual(8);
    // Every mapped id resolves to a real seed item.
    const seedIds = new Set(learningItems.map((item) => item.id));
    for (const id of laneItemIds) {
      expect(seedIds.has(id), `mapped item ${id} missing from seed`).toBe(true);
    }
  });

  it("makes at least 2 debugging items code-capable", () => {
    const codeCapable = CODE_LAB_DEBUGGING_ITEMS.filter((id) => getCodeLabConfigForItem(id));
    expect(codeCapable.length).toBeGreaterThanOrEqual(2);
  });

  it("connects compiler/sanitizer output to #412 error tags", () => {
    // The first-diagnostic item's starter triggers this compiler error.
    expect(
      classifyCompilerDiagnostics("parser.cpp:4:3: error: expected ';' before 'return'").map((c) => c.tag)
    ).toContain("cpp.compile.syntax");
    // The ASan item's starter triggers this runtime report.
    expect(
      classifyRuntimeError({
        stderr: "==1==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x..."
      }).map((c) => c.tag)
    ).toContain("cpp.vector.out_of_bounds");
  });
});
