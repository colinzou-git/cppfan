import type { Skill, SkillMapPreviewData, SkillModule, SkillPrerequisite } from "./skill-types";

export const skillModules: SkillModule[] = [
  { id: "cpp.structs_classes", title: "Structs and classes", description: "Members and access control.", order_index: 10 },
  { id: "cpp.constructors", title: "Constructors", description: "Object initialization and lifetime.", order_index: 20 },
  { id: "cpp.raii", title: "RAII", description: "Resource ownership and cleanup.", order_index: 30 },
  { id: "cpp.smart_pointers", title: "Smart pointers", description: "Modern ownership helpers.", order_index: 40 }
];

export const skillSeed: Skill[] = [];
export const skillPrerequisitesSeed: SkillPrerequisite[] = [];

export function getSeedSkillMapPreview(): SkillMapPreviewData {
  return { modules: skillModules, skills: skillSeed, prerequisites: skillPrerequisitesSeed, source: "seed" };
}

export function getSkillsForModule(moduleId: string, skills = skillSeed) {
  return skills.filter((skill) => skill.module_id === moduleId && skill.is_active).sort((a, b) => a.order_index - b.order_index);
}
