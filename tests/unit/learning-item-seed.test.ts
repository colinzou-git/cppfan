import { describe, expect, it } from "vitest";
import {
  getLearningItemById,
  learningItemChoices,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { skillSeed } from "@/features/skills/skill-seed";

const VALID_TYPES = new Set(["lesson", "concept_check", "multiple_choice", "code_reading", "bug_spotting"]);

describe("learning item seed integrity", () => {
  it("has unique, stable item ids", () => {
    const ids = learningItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses only supported item types", () => {
    for (const item of learningItems) {
      expect(VALID_TYPES.has(item.type)).toBe(true);
    }
  });

  it("maps every item to at least one skill", () => {
    for (const item of learningItems) {
      const mappings = learningItemSkills.filter((mapping) => mapping.learning_item_id === item.id);
      expect(mappings.length).toBeGreaterThan(0);
    }
  });

  it("references only existing skills in skill mappings", () => {
    const skillIds = new Set(skillSeed.map((skill) => skill.id));

    for (const mapping of learningItemSkills) {
      expect(skillIds.has(mapping.skill_id)).toBe(true);
    }
  });

  it("references only existing items in skill mappings", () => {
    const itemIds = new Set(learningItems.map((item) => item.id));

    for (const mapping of learningItemSkills) {
      expect(itemIds.has(mapping.learning_item_id)).toBe(true);
    }
  });

  it("gives every item exactly one primary skill mapping", () => {
    for (const item of learningItems) {
      const primaries = learningItemSkills.filter(
        (mapping) => mapping.learning_item_id === item.id && mapping.is_primary
      );
      expect(primaries.length).toBe(1);
    }
  });

  it("references only existing items in choices", () => {
    const itemIds = new Set(learningItems.map((item) => item.id));

    for (const choice of learningItemChoices) {
      expect(itemIds.has(choice.learning_item_id)).toBe(true);
    }
  });

  it("gives every multiple-choice item exactly one correct answer", () => {
    const multipleChoiceItems = learningItems.filter((item) => item.type === "multiple_choice");
    expect(multipleChoiceItems.length).toBeGreaterThan(0);

    for (const item of multipleChoiceItems) {
      const choices = learningItemChoices.filter((choice) => choice.learning_item_id === item.id);
      expect(choices.length).toBeGreaterThanOrEqual(2);

      const correct = choices.filter((choice) => choice.is_correct);
      expect(correct.length).toBe(1);
    }
  });

  it("never leaves a choice set with zero or multiple correct answers", () => {
    const itemIdsWithChoices = new Set(learningItemChoices.map((choice) => choice.learning_item_id));

    for (const itemId of itemIdsWithChoices) {
      const correct = learningItemChoices.filter(
        (choice) => choice.learning_item_id === itemId && choice.is_correct
      );
      expect(correct.length).toBe(1);
    }
  });
});

describe("getLearningItemById", () => {
  it("returns an item with skills and answer-key-free choices", () => {
    const result = getLearningItemById("cpp.structs_classes.syntax.mc_default_access");

    expect(result).not.toBeNull();
    expect(result?.item.type).toBe("multiple_choice");
    expect(result?.skills.length).toBeGreaterThan(0);
    expect(result?.choices.length).toBe(4);

    for (const choice of result?.choices ?? []) {
      expect("is_correct" in choice).toBe(false);
    }
  });

  it("returns null for an unknown item", () => {
    expect(getLearningItemById("does.not.exist")).toBeNull();
  });
});

describe("curriculum coverage", () => {
  const expectedSkillsWithContent = [
    // foundations (#66)
    "cpp.program_basics.structure",
    "cpp.program_basics.io",
    "cpp.values_types.variables",
    "cpp.values_types.conversions",
    "cpp.control_flow.conditionals",
    "cpp.control_flow.loops",
    "cpp.functions.basics",
    "cpp.functions.decomposition",
    // references/pointers/const (#67)
    "cpp.references.references",
    "cpp.references.pointers",
    "cpp.references.const_correctness",
    "cpp.references.parameter_passing",
    // templates (#70)
    "cpp.templates.function_templates",
    "cpp.templates.class_templates",
    "cpp.templates.concepts",
    "cpp.templates.ranges",
    // tooling (#71)
    "cpp.tooling.error_handling",
    "cpp.tooling.testing",
    "cpp.tooling.debugging",
    "cpp.tooling.build",
    // structs/classes module
    "cpp.structs_classes.syntax",
    "cpp.structs_classes.public_private",
    "cpp.structs_classes.const_methods_intro",
    "cpp.structs_classes.invariants_intro",
    // value semantics (#69)
    "cpp.value_semantics.copy",
    "cpp.value_semantics.move",
    "cpp.value_semantics.rule_of_zero_five",
    // constructors module (#16)
    "cpp.constructors.default_constructor",
    "cpp.constructors.parameterized_constructor",
    "cpp.constructors.member_initializer_list",
    "cpp.constructors.destructor_intro",
    // raii module (#36)
    "cpp.raii.resource_lifetime",
    "cpp.raii.destructor_cleanup",
    "cpp.raii.exception_safety_intro",
    "cpp.raii.ownership_boundary",
    // smart pointers module (#43, #45)
    "cpp.smart_pointers.unique_ptr",
    "cpp.smart_pointers.shared_ptr",
    "cpp.smart_pointers.weak_ptr",
    "cpp.smart_pointers.cyclic_reference",
    "cpp.smart_pointers.ownership_choice",
    "cpp.smart_pointers.ownership_transfer",
    // STL containers (#46)
    "cpp.stl.vector",
    "cpp.stl.string",
    "cpp.stl.map",
    "cpp.stl.set",
    "cpp.stl.algorithms",
    "cpp.stl.iterators",
    "cpp.stl.adapters",
    "cpp.stl.lambdas",
    // DSA (#48, #68)
    "dsa.complexity.big_o",
    "dsa.complexity.problem_solving",
    "dsa.arrays.indexing",
    "dsa.arrays.traversal",
    "dsa.arrays.two_pointers",
    "dsa.searching.binary_search",
    "dsa.sorting.comparator",
    "dsa.stacks.basic_stack",
    "dsa.hashing.lookup",
    "dsa.recursion.base_case",
    // trees/heaps/DSU (#74)
    "dsa.trees.traversal",
    "dsa.trees.heap",
    "dsa.trees.disjoint_set",
    // graphs (#75)
    "dsa.graphs.representation",
    "dsa.graphs.bfs",
    "dsa.graphs.dfs",
    "dsa.graphs.shortest_path",
    // algorithmic techniques (#76)
    "dsa.techniques.prefix_sums",
    "dsa.techniques.sliding_window",
    "dsa.techniques.greedy",
    "dsa.techniques.dynamic_programming",
    // string algorithms (#79)
    "dsa.strings.manipulation",
    "dsa.strings.searching",
    "dsa.strings.palindrome",
    "dsa.strings.parsing"
  ];

  it("has at least one learning item for every covered skill", () => {
    const skillsWithItems = new Set(learningItemSkills.map((mapping) => mapping.skill_id));
    for (const skillId of expectedSkillsWithContent) {
      expect(skillsWithItems.has(skillId)).toBe(true);
    }
  });

  it("gives each constructors and raii skill at least two items (per the agreed density)", () => {
    const denseSkills = expectedSkillsWithContent.filter(
      (id) =>
        id.startsWith("cpp.program_basics.") ||
        id.startsWith("cpp.values_types.") ||
        id.startsWith("cpp.control_flow.") ||
        id.startsWith("cpp.functions.") ||
        id.startsWith("cpp.references.") ||
        id.startsWith("cpp.value_semantics.") ||
        id.startsWith("cpp.templates.") ||
        id.startsWith("cpp.tooling.") ||
        id.startsWith("cpp.constructors.") ||
        id.startsWith("cpp.raii.") ||
        id.startsWith("cpp.smart_pointers.") ||
        id.startsWith("cpp.stl.") ||
        id.startsWith("dsa.")
    );
    for (const skillId of denseSkills) {
      const itemIds = new Set(
        learningItemSkills.filter((mapping) => mapping.skill_id === skillId).map((mapping) => mapping.learning_item_id)
      );
      expect(itemIds.size).toBeGreaterThanOrEqual(2);
    }
  });
});
