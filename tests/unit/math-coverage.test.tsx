import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import {
  getLearningItemById,
  learningItemChoices,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { LearningItemView } from "@/features/learning-items/learning-item-view";
import { bitTraceFixtures, coordinateDiagramFixtures } from "@/features/learning-items/math-fixtures";
import { capstoneProjects, capstoneTracks } from "@/features/labs/capstone-tracks";
import { projectLabs } from "@/features/labs/project-labs";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const REQUIRED_SKILLS = [
  "dsa.math.bit_manipulation",
  "dsa.math.bitmask_techniques",
  "dsa.math.number_theory",
  "dsa.math.sieve",
  "dsa.math.modular_arithmetic",
  "dsa.math.combinatorics",
  "dsa.math.counting_principle",
  "dsa.math.pascal_binomial",
  "dsa.math.inclusion_exclusion",
  "dsa.math.generate_combinations",
  "dsa.math.geometry",
  "dsa.math.vectors_dot_cross",
  "dsa.math.segment_intersection",
  "dsa.math.geometry_area",
  "dsa.math.geometry_precision",
  "dsa.math.convex_hull"
];

const REQUIRED_ITEMS = [
  "dsa.math.bit_manipulation.code_bit_row_trace",
  "dsa.math.number_theory.lesson",
  "dsa.math.sieve.lesson",
  "dsa.math.modular_arithmetic.lesson",
  "dsa.math.counting_principle.lesson",
  "dsa.math.generate_combinations.lesson",
  "dsa.math.vectors_dot_cross.code_coordinate_trace",
  "dsa.math.segment_intersection.lesson",
  "dsa.math.geometry_area.lesson",
  "dsa.math.geometry_precision.lesson",
  "dsa.math.convex_hull.lesson"
];

const REQUIRED_RESOURCES = [
  "cses-mathematics",
  "cses-geometry",
  "cp-algorithms-bit-manipulation",
  "cp-algorithms-submasks",
  "cp-algorithms-euclid",
  "cp-algorithms-sieve",
  "cp-algorithms-binary-exp",
  "cp-algorithms-binomial-coefficients",
  "cp-algorithms-inclusion-exclusion",
  "cp-algorithms-basic-geometry",
  "cp-algorithms-segment-intersection",
  "cp-algorithms-convex-hull",
  "usaco-guide-bitmask-dp",
  "usaco-guide-combinatorics",
  "usaco-guide-geometry-primitives"
];

describe("math technique completion coverage (#122)", () => {
  it("keeps the original #83 math scope represented as active skills and learning items", () => {
    const activeSkillIds = new Set(skillSeed.filter((skill) => skill.is_active).map((skill) => skill.id));

    for (const skillId of REQUIRED_SKILLS) {
      expect(activeSkillIds.has(skillId), `${skillId} should be active`).toBe(true);
      const itemCount = learningItemSkills.filter((mapping) => mapping.skill_id === skillId).length;
      expect(itemCount, `${skillId} should have lesson and quiz/trace coverage`).toBeGreaterThanOrEqual(2);
    }

    for (const itemId of REQUIRED_ITEMS) {
      expect(getLearningItemById(itemId), `${itemId} should exist`).not.toBeNull();
    }
  });

  it("uses typed bit-row and coordinate fixtures with text equivalents", () => {
    expect(bitTraceFixtures.testBit.textDescription).toMatch(/44 is 00101100/i);
    expect(coordinateDiagramFixtures.orientation.textDescription).toMatch(/Point A is at \(0,0\)/);

    const bitTrace = learningItems.find((item) => item.id === "dsa.math.bit_manipulation.code_bit_row_trace");
    const coordinateTrace = learningItems.find(
      (item) => item.id === "dsa.math.vectors_dot_cross.code_coordinate_trace"
    );

    expect(bitTrace?.prompt).toContain("Text equivalent:");
    expect(bitTrace?.prompt).toContain(bitTraceFixtures.testBit.textDescription);
    expect(bitTrace?.explanation).toMatch(/O\(1\).*1ULL << i/i);

    expect(coordinateTrace?.prompt).toContain("Coordinate diagram:");
    expect(coordinateTrace?.prompt).toContain(coordinateDiagramFixtures.orientation.textDescription);
    expect(coordinateTrace?.explanation).toMatch(/O\(1\).*64-bit intermediates/i);
  });

  it("renders math visualizations through the learning item view", () => {
    const bitTrace = getLearningItemById("dsa.math.bit_manipulation.code_bit_row_trace");
    expect(bitTrace).not.toBeNull();

    render(<LearningItemView data={bitTrace!} />);

    expect(screen.getByTestId("math-bit-visualization")).toBeTruthy();
    expect(screen.getByLabelText(/44 is 00101100/i)).toBeTruthy();
  });

  it("keeps algorithm assumptions, complexity, overflow, and precision cautions explicit", () => {
    const numberTheory = getLearningItemById("dsa.math.number_theory.lesson")?.item;
    const modular = getLearningItemById("dsa.math.modular_arithmetic.lesson")?.item;
    const geometryPrecision = getLearningItemById("dsa.math.geometry_precision.lesson")?.item;
    const convexHull = getLearningItemById("dsa.math.convex_hull.lesson")?.item;

    expect(numberTheory?.prompt).toMatch(/gcd|O\(log|min|%/i);
    expect(modular?.prompt).toMatch(/negative|overflow|binary exponentiation|inverse/i);
    expect(geometryPrecision?.prompt).toMatch(/64-bit|squared distances|epsilon|floating-point/i);
    expect(convexHull?.prompt).toMatch(/enclosing|sort|O\(n log n\)|collinear/i);

    const choices = learningItemChoices.filter(
      (choice) => choice.learning_item_id === "dsa.math.generate_combinations.mc_unique"
    );
    expect(choices.filter((choice) => choice.is_correct).map((choice) => choice.content)).toEqual([
      "Recursing from an advancing start index (i + 1), so earlier elements are not revisited"
    ]);
  });

  it("registers math resources, project lab, capstone path, and exercise package", () => {
    const resourceIds = new Set(
      externalResources.filter((resource) => resource.tags.includes("dsa")).map((resource) => resource.id)
    );
    for (const id of REQUIRED_RESOURCES) {
      expect(resourceIds.has(id), `${id} should be registered`).toBe(true);
    }

    const lab = projectLabs.find((entry) => entry.id === "math-technique-playground");
    expect(lab?.focus).toEqual(["bitmasks", "number theory", "combinatorics", "geometry"]);
    expect(capstoneTracks.find((track) => track.id === "dsa_math")?.projectIds).toContain(
      "math-technique-playground"
    );

    const project = capstoneProjects.find((entry) => entry.id === "math-technique-playground");
    expect(project?.milestones.some((milestone) => milestone.exerciseId === "math-combination-generator")).toBe(true);
    expect(project?.milestones.some((milestone) => milestone.practicedSkillIds.includes("dsa.math.convex_hull"))).toBe(
      true
    );

    const exercise = exerciseCatalog.find((entry) => entry.id === "math-combination-generator");
    expect(exercise?.projectLab).toBe("math-technique-playground");
    expect(exercise?.skillIds).toEqual([
      "dsa.math.counting_principle",
      "dsa.math.generate_combinations",
      "dsa.math.bitmask_techniques"
    ]);
    expect(existsSync(join(process.cwd(), "exercises", "math-combination-generator", "tests", "tests.cpp"))).toBe(
      true
    );

    const tests = readFileSync(
      join(process.cwd(), "exercises", "math-combination-generator", "tests", "tests.cpp"),
      "utf8"
    );
    expect(tests).toMatch(/test_generates_lexicographic_combinations/);
    expect(tests).toMatch(/test_subset_from_mask_decodes_flags/);
  });
});
