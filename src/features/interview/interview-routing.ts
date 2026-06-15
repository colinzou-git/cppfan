// Content-level routing for a study-plan task (#180 / #174). Pure and
// deterministic: turns the planner's next task (session type + pattern) into a
// concrete thing to do — a worked example for a conceptual gap, an implementation
// drill for the C++ implementation pattern, an independent timed problem for a
// timing/transfer gap, a mock pack for a mock gap, or a concise resource for a
// quality gap. Reads only the static catalogs; never touches FSRS or user data.
import { getInterviewProblemsByGroup } from "./problem-catalog";
import { getPracticeMockPacks } from "./mock-packs";
import type { PlanTask } from "./interview-plan";

export type RouteTargetKind =
  | "worked_example"
  | "timed_problem"
  | "implementation_practice"
  | "mock_pack"
  | "quality_resource";

export type RouteTarget = {
  kind: RouteTargetKind;
  /** What to do, in learner-friendly words. */
  title: string;
  detail: string;
  /** Internal page to act on. */
  href: string;
  /** Optional external worked-example / reference for a conceptual gap. */
  externalUrl?: string;
};

/**
 * Route a plan task to concrete content. Deterministic for identical inputs.
 * Mocks and quality gaps have no pattern; pattern gaps resolve to a representative
 * catalog problem (or, for the C++ implementation pattern, to implementation
 * drills) so the learner always has a specific next action.
 */
export function routePlanTask(task: PlanTask): RouteTarget {
  if (task.sessionType === "mock_interview") {
    const pack = getPracticeMockPacks()[0] ?? null;
    return {
      kind: "mock_pack",
      title: pack ? `Run the mock pack: ${pack.title}` : "Run a full timed mock",
      detail: "A complete timed mock builds the consistency and mock-session evidence readiness needs.",
      href: "/interview/mocks"
    };
  }

  if (task.sessionType === "remediation" && task.pattern === null) {
    return {
      kind: "quality_resource",
      title: "Sharpen testing, complexity, and communication",
      detail: "Skim a concise reference, then narrate your tests and complexity aloud on the next problem.",
      href: "/resources"
    };
  }

  const pattern = task.pattern;

  if (pattern === "cpp_implementation") {
    return {
      kind: "implementation_practice",
      title: "Drill C++ implementation",
      detail: "Work focused implementation exercises so the coding step becomes automatic.",
      href: "/exercises"
    };
  }

  if (pattern && task.sessionType === "remediation") {
    const problem = getInterviewProblemsByGroup(pattern)[0] ?? null;
    const link = problem?.externalLinks[0];
    return {
      kind: "worked_example",
      title: problem ? `Review the pattern with: ${problem.title}` : "Review the pattern with a worked example",
      detail: "Re-derive the core idea from a worked example before drilling a guided problem.",
      href: "/interview",
      ...(link ? { externalUrl: link.url } : {})
    };
  }

  if (pattern) {
    const problem = getInterviewProblemsByGroup(pattern)[0] ?? null;
    return {
      kind: "timed_problem",
      title: problem ? `Solve under time: ${problem.title}` : "Solve a fresh problem under time",
      detail:
        task.sessionType === "maintenance"
          ? "A short, timed rep keeps this strong pattern warm."
          : "An independent, unhinted solve on this pattern is the strongest readiness signal.",
      href: "/interview/session"
    };
  }

  return {
    kind: "timed_problem",
    title: "Solve a fresh problem under time",
    detail: "Work an unseen problem independently and log the outcome.",
    href: "/interview/session"
  };
}
