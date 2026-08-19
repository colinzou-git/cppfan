import { revalidatePath } from "next/cache";

export function learnerSurfacePaths(goalId?: string): string[] {
  return [
    "/dashboard",
    "/goals",
    ...(goalId ? [`/goals/${encodeURIComponent(goalId)}`] : []),
    "/review"
  ];
}

/** Revalidate every personalized surface that can display learning progress. */
export function revalidateLearnerSurfaces(goalId?: string): void {
  for (const path of learnerSurfacePaths(goalId)) {
    revalidatePath(path);
  }
  // Lesson completion does not know which active goals reference the lesson.
  // Invalidate every goal-detail page so Daily New cannot retain stale evidence.
  revalidatePath("/goals/[goalId]", "page");
}
