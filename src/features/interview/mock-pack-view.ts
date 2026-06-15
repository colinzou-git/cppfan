// Pure view model for the mock-packs UI (#182/#174): the practice mock packs with
// their problem titles resolved from the #176 catalog and pattern labels. The
// reserved calibration pool is excluded (ordinary practice cannot select it).
// DB-independent and unit-testable.
import { getPracticeMockPacks, type MockPackCategory } from "./mock-packs";
import { getInterviewProblem } from "./problem-catalog";
import { GROUP_LABELS } from "./interview-catalog-view";

export type MockPackView = {
  id: string;
  title: string;
  category: MockPackCategory;
  durationMinutes: number;
  followUpCount: number;
  patternLabels: string[];
  problems: { id: string; title: string }[];
};

export function buildMockPackView(): MockPackView[] {
  const labels = GROUP_LABELS as Record<string, string>;
  return getPracticeMockPacks().map((pack) => ({
    id: pack.id,
    title: pack.title,
    category: pack.category,
    durationMinutes: pack.durationMinutes,
    followUpCount: pack.followUpIds.length,
    patternLabels: pack.patternCoverage.map((p) => labels[p] ?? p),
    problems: pack.problemIds.map((id) => {
      const problem = getInterviewProblem(id);
      return { id, title: problem?.title ?? id };
    })
  }));
}
