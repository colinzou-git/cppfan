import { coveredContexts } from "./context-coverage";
import {
  getContextCoverageRequirement,
  isCodeCapableSkill,
  satisfiesMasteredCoverage
} from "./context-coverage-rules";
import type { MasteryEvidenceContext, SkillContextCoverage } from "./context-coverage-types";

/**
 * Human-readable coverage explanations (#417). Tells the learner what evidence is
 * still missing so a held-back status is transparent, never an opaque block.
 */

const CONTEXT_LABELS: Record<MasteryEvidenceContext, string> = {
  recognition: "recognition (quizzes)",
  code_reading: "code reading",
  bug_spotting: "bug spotting",
  completion: "completion exercises",
  parsons: "Parsons puzzles",
  code_lab: "independent Code Lab practice",
  project_milestone: "a project milestone",
  delayed_review: "delayed review"
};

export function explainMissingCoverage(coverage: SkillContextCoverage): string[] {
  if (satisfiesMasteredCoverage(coverage)) return [];
  const covered = new Set(coveredContexts(coverage));
  const missing: string[] = [];

  if (!covered.has("delayed_review")) {
    missing.push(`Complete a ${CONTEXT_LABELS.delayed_review} after a delay to confirm retention.`);
  }
  if (isCodeCapableSkill(coverage.skillId) && !covered.has("code_lab") && !covered.has("project_milestone")) {
    missing.push(`Show ${CONTEXT_LABELS.code_lab} (or ${CONTEXT_LABELS.project_milestone}).`);
  }
  if (covered.size < 3) {
    missing.push("Practice this skill in at least one more context (e.g. bug spotting or a scaffolded reconstruction).");
  }
  return missing;
}

export function explainContextCoverageStatus(coverage: SkillContextCoverage): string {
  const covered = coveredContexts(coverage);
  if (satisfiesMasteredCoverage(coverage)) {
    return "Strong evidence across multiple contexts.";
  }
  const requirement = getContextCoverageRequirement(coverage.skillId);
  void requirement;
  if (covered.length === 0) {
    return "No practice evidence yet for this skill.";
  }
  const labels = covered.map((context) => CONTEXT_LABELS[context]).join(", ");
  return `Evidence so far: ${labels}. More contexts are needed before mastery.`;
}
