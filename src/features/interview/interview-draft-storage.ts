/**
 * localStorage key for an interview problem's code draft (#431). The signed-in
 * session store already persists the draft cross-device; this fallback resumes
 * the draft for signed-out / offline learners and adds type-time resilience.
 */
export function interviewDraftStorageKey(problemId: string): string {
  return `cppfan:interview:draft:${problemId}`;
}
