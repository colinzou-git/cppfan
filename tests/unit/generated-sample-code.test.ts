import { describe, expect, it } from "vitest";
import {
  generateSkillSampleCode,
  generateSkillSampleOutput
} from "@/features/learning-items/generated-skill-learning-items";
import { skillSeed } from "@/features/skills/skill-seed";
import type { Skill } from "@/features/skills/skill-types";

function skill(id: string): Skill {
  const found = skillSeed.find((s) => s.id === id);
  if (!found) throw new Error(`missing skill ${id}`);
  return found;
}

function firstSkillWithPrefix(prefix: string): Skill {
  const found = skillSeed.find((s) => s.is_active && s.id.startsWith(prefix));
  if (!found) throw new Error(`no active skill with prefix ${prefix}`);
  return found;
}

describe("topic-aware generated sample code (#448)", () => {
  it("keeps exactly one print line and the exact Practice stdout", () => {
    for (const prefix of ["cpp.stl.", "cpp.control_flow.", "dsa.graphs.", "dsa.techniques.", "cpp.smart_pointers."]) {
      const s = firstSkillWithPrefix(prefix);
      const code = generateSkillSampleCode(s);
      const prints = code.match(/std::cout/g) ?? [];
      expect(prints.length, prefix).toBe(1);
      expect(code, prefix).toContain(`"Practice: ${generateSkillSampleOutput(s).replace("Practice: ", "")}`);
      expect(code, prefix).toContain(`// Skill: ${s.title}`);
    }
  });

  it("uses a topic-aware body for STL and graph skills", () => {
    const stl = generateSkillSampleCode(firstSkillWithPrefix("cpp.stl."));
    expect(stl).toContain("#include <vector>");
    expect(stl).toContain("std::vector");

    const graph = generateSkillSampleCode(firstSkillWithPrefix("dsa.graphs."));
    expect(graph).toContain("Adjacency list");
  });

  it("falls back to a generic body for an unmapped skill family", () => {
    const code = generateSkillSampleCode(skill(skillSeed[0].id));
    expect(code).toContain('std::cout << "Practice:');
    expect(code.match(/std::cout/g)?.length).toBe(1);
  });
});
