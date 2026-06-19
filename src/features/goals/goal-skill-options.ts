import { getFirstLearningItemIdForSkill } from "@/features/learning-items/learning-item-seed";
import { skillSeed } from "@/features/skills/skill-seed";

export const goalSkillOptions = skillSeed
  .filter((skill) => skill.is_active && getFirstLearningItemIdForSkill(skill.id))
  .sort((a, b) => a.domain.localeCompare(b.domain) || a.order_index - b.order_index)
  .map((skill) => ({ id: skill.id, label: `${skill.domain.toUpperCase()} · ${skill.title}` }));
