import { describe, expect, it } from "vitest";
import { skillModules, skillPrerequisitesSeed, skillSeed } from "@/features/skills/skill-seed";
import { learningItemSkills } from "@/features/learning-items/learning-item-seed";

// Skill-map integrity + curriculum-coverage checks (#97).
//
// Coverage expectations are DERIVED from the active skill seed rather than a
// hand-maintained list, so a newly added active skill cannot silently ship
// without learning content. Exceptions must be declared explicitly below and
// are themselves validated (no stale entries).

// Active skills intentionally shipped without standalone learning content.
const CONTENT_FREE_SKILLS = new Set<string>([]);

// Skills intentionally covered by a single learning item (everything else
// follows the lesson + multiple-choice "two items per skill" convention).
const SINGLE_ITEM_SKILLS = new Set<string>(["cpp.structs_classes.const_methods_intro"]);

const activeSkills = skillSeed.filter((skill) => skill.is_active);
const activeSkillIds = new Set(activeSkills.map((skill) => skill.id));
const moduleIds = new Set(skillModules.map((module) => module.id));

const itemsPerSkill = new Map<string, Set<string>>();
for (const mapping of learningItemSkills) {
  const set = itemsPerSkill.get(mapping.skill_id) ?? new Set<string>();
  set.add(mapping.learning_item_id);
  itemsPerSkill.set(mapping.skill_id, set);
}

describe("skill module integrity", () => {
  it("has unique module ids", () => {
    const ids = skillModules.map((module) => module.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unambiguous module ordering (unique order_index)", () => {
    const orders = skillModules.map((module) => module.order_index);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("places every skill in a declared module", () => {
    const orphans = skillSeed.filter((skill) => !moduleIds.has(skill.module_id)).map((skill) => skill.id);
    expect(orphans, `skills referencing undeclared modules: ${orphans.join(", ")}`).toEqual([]);
  });
});

describe("skill prerequisite graph integrity", () => {
  it("has unique prerequisite edges", () => {
    const edges = skillPrerequisitesSeed.map((edge) => `${edge.skill_id}->${edge.prerequisite_skill_id}`);
    expect(new Set(edges).size).toBe(edges.length);
  });

  it("has no self-edges", () => {
    const selfEdges = skillPrerequisitesSeed
      .filter((edge) => edge.skill_id === edge.prerequisite_skill_id)
      .map((edge) => edge.skill_id);
    expect(selfEdges, `self-prerequisites: ${selfEdges.join(", ")}`).toEqual([]);
  });

  it("references only active skills on both ends of every edge", () => {
    const dangling: string[] = [];
    for (const edge of skillPrerequisitesSeed) {
      if (!activeSkillIds.has(edge.skill_id)) dangling.push(`${edge.skill_id} (skill_id)`);
      if (!activeSkillIds.has(edge.prerequisite_skill_id)) {
        dangling.push(`${edge.prerequisite_skill_id} (prerequisite of ${edge.skill_id})`);
      }
    }
    expect(dangling, `edges referencing missing/inactive skills: ${dangling.join(", ")}`).toEqual([]);
  });

  it("has no direct or indirect prerequisite cycles", () => {
    // Build adjacency: a skill depends on its prerequisites.
    const deps = new Map<string, string[]>();
    for (const edge of skillPrerequisitesSeed) {
      const list = deps.get(edge.skill_id) ?? [];
      list.push(edge.prerequisite_skill_id);
      deps.set(edge.skill_id, list);
    }

    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;
    const color = new Map<string, number>();
    const cyclePath: string[] = [];

    const visit = (node: string, stack: string[]): boolean => {
      color.set(node, GRAY);
      for (const next of deps.get(node) ?? []) {
        const c = color.get(next) ?? WHITE;
        if (c === GRAY) {
          cyclePath.push(...stack, node, next);
          return true;
        }
        if (c === WHITE && visit(next, [...stack, node])) {
          return true;
        }
      }
      color.set(node, BLACK);
      return false;
    };

    let cyclic = false;
    for (const node of deps.keys()) {
      if ((color.get(node) ?? WHITE) === WHITE && visit(node, [])) {
        cyclic = true;
        break;
      }
    }
    expect(cyclic, `prerequisite cycle detected: ${cyclePath.join(" -> ")}`).toBe(false);
  });
});

describe("curriculum coverage (derived from the active skill seed)", () => {
  it("gives every active skill at least one learning item (except declared content-free skills)", () => {
    const missing = activeSkills
      .filter((skill) => !CONTENT_FREE_SKILLS.has(skill.id) && !itemsPerSkill.has(skill.id))
      .map((skill) => skill.id);
    expect(missing, `active skills with no learning content: ${missing.join(", ")}`).toEqual([]);
  });

  it("gives every covered skill at least two items (except declared single-item skills)", () => {
    const thin = activeSkills
      .filter((skill) => itemsPerSkill.has(skill.id) && !SINGLE_ITEM_SKILLS.has(skill.id))
      .filter((skill) => (itemsPerSkill.get(skill.id)?.size ?? 0) < 2)
      .map((skill) => skill.id);
    expect(thin, `skills with fewer than two items: ${thin.join(", ")}`).toEqual([]);
  });

  it("keeps the content-free exception list honest (active and genuinely empty)", () => {
    for (const id of CONTENT_FREE_SKILLS) {
      expect(activeSkillIds.has(id), `content-free exception ${id} is not an active skill`).toBe(true);
      expect(itemsPerSkill.has(id), `content-free exception ${id} actually has items`).toBe(false);
    }
  });

  it("keeps the single-item exception list honest (active and truly single-item)", () => {
    for (const id of SINGLE_ITEM_SKILLS) {
      expect(activeSkillIds.has(id), `single-item exception ${id} is not an active skill`).toBe(true);
      expect(itemsPerSkill.get(id)?.size ?? 0, `single-item exception ${id} no longer has exactly one item`).toBe(1);
    }
  });
});
