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

/**
 * A topic-aware demonstration body for a generated sample (#448). Chosen by skill
 * id so e.g. an STL skill shows a vector and a graph skill shows an adjacency
 * list. The block computes into local variables and MUST NOT print — the sample's
 * only output stays exactly `Practice: <title>\n`, so the generated Code Lab's
 * exact-stdout tests are unaffected. Returns { includes, body }.
 */
function skillSampleDemo(skillId: string): { includes: string[]; body: string[] } {
  if (skillId.startsWith("cpp.stl.") || skillId.startsWith("cpp.values_types.")) {
    return {
      includes: ["<vector>", "<numeric>"],
      body: [
        "std::vector<int> values{1, 2, 3, 4, 5};",
        "int total = std::accumulate(values.begin(), values.end(), 0);",
        "(void)total; // edit this sample to print or transform `values`"
      ]
    };
  }
  if (skillId.startsWith("cpp.control_flow.")) {
    return {
      includes: [],
      body: [
        "int sum = 0;",
        "for (int i = 1; i <= 5; ++i) sum += i;",
        "(void)sum; // edit this loop to explore the control-flow skill"
      ]
    };
  }
  if (
    skillId.startsWith("cpp.constructors.") ||
    skillId.startsWith("cpp.structs_classes.") ||
    skillId.startsWith("cpp.oop.")
  ) {
    return {
      includes: [],
      body: [
        "struct Point { int x; int y; Point(int x_, int y_) : x(x_), y(y_) {} };",
        "Point p{2, 3};",
        "(void)p; // edit this struct to explore constructors and members"
      ]
    };
  }
  if (skillId.startsWith("cpp.smart_pointers.") || skillId.startsWith("cpp.raii.")) {
    return {
      includes: ["<memory>"],
      body: [
        "auto owned = std::make_unique<int>(42);",
        "(void)owned; // unique_ptr frees automatically (RAII); edit to experiment"
      ]
    };
  }
  if (skillId.startsWith("dsa.graphs.")) {
    return {
      includes: ["<vector>"],
      body: [
        "// Adjacency list for a 3-node graph: 0-1, 1-2.",
        "std::vector<std::vector<int>> adj{{1}, {0, 2}, {1}};",
        "(void)adj; // edit to traverse the graph"
      ]
    };
  }
  if (skillId.startsWith("dsa.techniques.")) {
    return {
      includes: ["<vector>"],
      body: [
        "std::vector<int> a{3, 1, 4, 1, 5};",
        "std::vector<int> prefix(a.size() + 1, 0);",
        "for (size_t i = 0; i < a.size(); ++i) prefix[i + 1] = prefix[i] + a[i];",
        "(void)prefix; // edit to answer range queries with prefix sums"
      ]
    };
  }
  return { includes: [], body: ["// Edit this sample to practice the skill above."] };
}

export function generateSkillSampleCode(skill: Skill): string {
  const output = cppStringLiteral(generateSkillSampleOutput(skill));
  const demo = skillSampleDemo(skill.id);
  const includes = ["<iostream>", ...demo.includes].map((header) => `#include ${header}`).join("\n");
  const body = demo.body.map((line) => `  ${line}`).join("\n");
  return `${includes}

int main() {
  // Skill: ${lineComment(skill.title)}
  // Goal: ${lineComment(skill.learner_goal)}
${body}
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
