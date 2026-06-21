import type { SkillStatus } from "./mastery-types";
import { coveredContexts } from "./context-coverage";
import type {
  ContextCoverageRequirement,
  MasteryEvidenceContext,
  SkillContextCoverage
} from "./context-coverage-types";

/**
 * Cross-context mastery rules (#417). Deterministic. The only status change made
 * here is preventing a premature `mastered`: a skill marked mastered from too few
 * contexts is held at `strong` until multi-context evidence exists. Nothing is
 * downgraded below `strong`, so existing statuses never become confusing hard
 * locks, and missing evidence is explained rather than blocked forever.
 */

/** Coding-domain skills are "code-capable": mastery needs independent code work. */
export function isCodeCapableSkill(skillId: string): boolean {
  return skillId.startsWith("cpp.") || skillId.startsWith("dsa.");
}

export function getContextCoverageRequirement(skillId: string): ContextCoverageRequirement {
  const codeCapable = isCodeCapableSkill(skillId);
  return {
    skillIdPattern: codeCapable ? "cpp.*|dsa.*" : undefined,
    requiredForStrong: [],
    // Mastered needs delayed review plus, for code-capable skills, real code
    // practice (Code Lab) or a project milestone.
    requiredForMastered: codeCapable
      ? ["delayed_review", "code_lab"]
      : ["delayed_review"]
  };
}

const MIN_CONTEXTS_FOR_STRONG = 2;
const MIN_CONTEXTS_FOR_MASTERED = 3;

export function satisfiesStrongCoverage(coverage: SkillContextCoverage): boolean {
  return coveredContexts(coverage).length >= MIN_CONTEXTS_FOR_STRONG;
}

export function satisfiesMasteredCoverage(coverage: SkillContextCoverage): boolean {
  const covered = new Set<MasteryEvidenceContext>(coveredContexts(coverage));
  if (covered.size < MIN_CONTEXTS_FOR_MASTERED) return false;
  if (!covered.has("delayed_review")) return false;
  if (isCodeCapableSkill(coverage.skillId)) {
    return covered.has("code_lab") || covered.has("project_milestone");
  }
  return true;
}

/**
 * Hold a premature `mastered` at `strong` until multi-context evidence exists.
 * Only `mastered` is adjusted; every other status passes through unchanged.
 */
export function adjustMasteryForContextCoverage(input: {
  skillId: string;
  currentStatus: SkillStatus;
  coverage: SkillContextCoverage;
}): SkillStatus {
  if (input.currentStatus === "mastered" && !satisfiesMasteredCoverage(input.coverage)) {
    return "strong";
  }
  return input.currentStatus;
}
