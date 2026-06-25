import { skillSeed } from "../skills/skill-seed";
import type { Skill } from "../skills/skill-types";
import type { LearningItemWithDetails } from "./learning-item-types";

const HAND_AUTHORED_SKILL_SAMPLE_ITEM_IDS = new Set([
  "cpp.program_basics.structure.lesson",
  "cpp.program_basics.io.lesson",
  "cpp.program_basics.statements_comments.lesson"
]);

const activeSkillsByLongestId = [...skillSeed]
  .filter((skill) => skill.is_active)
  .sort((a, b) => b.id.length - a.id.length);

function cppStringLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function lineComment(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\*\//g, "* /");
}

export function getGeneratedLearningItemIdForSkill(skillId: string): string {
  return `${skillId}.sample_code`;
}

function getLegacyLessonItemIdForSkill(skillId: string): string {
  return `${skillId}.lesson`;
}

function isGeneratedSampleRouteForSkill(skill: Skill, itemId: string): boolean {
  if (itemId === getGeneratedLearningItemIdForSkill(skill.id)) return true;

  const legacyLessonId = getLegacyLessonItemIdForSkill(skill.id);
  return itemId === legacyLessonId && !HAND_AUTHORED_SKILL_SAMPLE_ITEM_IDS.has(legacyLessonId);
}

export function generateSkillSampleOutput(skill: Skill): string {
  return `Practice: ${skill.title}`;
}

export function generateSkillSampleCode(skill: Skill): string {
  const output = cppStringLiteral(generateSkillSampleOutput(skill));
  return `#include <iostream>

int main() {
  // Skill: ${lineComment(skill.title)}
  // Goal: ${lineComment(skill.learner_goal)}
  std::cout << "${output}" << "\\n";
  return 0;
}
`;
}

export function findSkillForLearningItemId(itemId: string): Skill | null {
  return (
    activeSkillsByLongestId.find(
      (skill) => isGeneratedSampleRouteForSkill(skill, itemId) || itemId.startsWith(`${skill.id}.`)
    ) ?? null
  );
}

export function isGeneratedCodeLabEligibleItemId(itemId: string): boolean {
  const skill = findSkillForLearningItemId(itemId);
  if (!skill) return false;

  const suffix = itemId.slice(skill.id.length + 1);
  // Multiple-choice pages should stay quiz-only. Other item shapes represent a
  // skill practice surface and can safely show the generated runnable sample.
  return suffix.length > 0 && !suffix.startsWith("mc");
}

export function getGeneratedItemLinksBySkill(existingLinks: Record<string, string>): Record<string, string> {
  const links = { ...existingLinks };
  for (const skill of activeSkillsByLongestId) {
    const existingLink = links[skill.id];
    if (!existingLink || !HAND_AUTHORED_SKILL_SAMPLE_ITEM_IDS.has(existingLink)) {
      links[skill.id] = getGeneratedLearningItemIdForSkill(skill.id);
    }
  }
  return links;
}

export function getGeneratedLearningItemById(itemId: string): LearningItemWithDetails | null {
  const skill = activeSkillsByLongestId.find((candidate) => isGeneratedSampleRouteForSkill(candidate, itemId));
  if (!skill) return null;

  const sampleCode = generateSkillSampleCode(skill);
  return {
    item: {
      id: itemId,
      type: "lesson",
      title: `${skill.title} sample code`,
      prompt: `Practice sample for **${skill.title}**.\n\nGoal: ${skill.learner_goal}\n\nSample code:\n\n\`\`\`cpp\n${sampleCode}\`\`\`\n\nUse the Code Lab below to run, edit, and experiment with this sample.`,
      explanation: `This generated preview lesson gives ${skill.title} a concrete runnable C++ sample so the skill map has a consistent sample-code and Code Lab entry point.`,
      difficulty: skill.level,
      estimated_minutes: 4,
      order_index: 900_000 + skill.order_index,
      is_active: true
    },
    skills: [{ learning_item_id: itemId, skill_id: skill.id, is_primary: true }],
    choices: []
  };
}
