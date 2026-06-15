// Pure, DB-independent completion grading so it can be unit-tested and reused on
// the server. The "answer" is the ordered list of expected blank texts; the
// learner submits their filled-in values. We return only structural feedback
// (how many blanks are correct), never the expected answers (#123).

export type CompletionGrade = { isCorrect: boolean; correctCount: number; total: number };

/** Normalize a blank value for comparison: trim and case-fold. */
export function normalizeBlank(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Grade submitted blank values against the expected answers, position by
 * position (trim + case-insensitive). Correct only when every blank is filled
 * and matches; correctCount is partial feedback.
 */
export function gradeCompletionAnswers(solution: string[], submitted: string[]): CompletionGrade {
  const total = solution.length;
  let correctCount = 0;
  for (let i = 0; i < total && i < submitted.length; i += 1) {
    if (normalizeBlank(submitted[i]) === normalizeBlank(solution[i])) {
      correctCount += 1;
    }
  }
  return { isCorrect: submitted.length === total && correctCount === total && total > 0, correctCount, total };
}

export type CompletionRpcOutcome =
  | { status: "graded"; isCorrect: boolean; correctCount: number; total: number }
  | { status: "unconfigured" } // no Supabase env: demo/seed mode
  | { status: "unavailable" } // configured, but the function is not migrated yet
  | { status: "error" }; // configured database failure

type RpcResult = {
  data: unknown;
  error: { code?: string | null; message?: string | null } | null;
};

const MISSING_OBJECT_CODES = new Set(["PGRST202", "PGRST205", "42883", "42P01"]);

/**
 * Classify a grade_completion_attempt RPC result. Mirrors the grade-choice/parsons
 * policy (#146): a missing function is a legitimate pre-migration state (seed
 * grading is OK); any other error must NOT silently fall back to the seed answers.
 */
export function classifyCompletionRpc(result: RpcResult): CompletionRpcOutcome {
  const { data, error } = result;

  if (error) {
    return MISSING_OBJECT_CODES.has(error.code ?? "") ? { status: "unavailable" } : { status: "error" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const typed = row as { is_correct?: unknown; correct_count?: unknown; total?: unknown } | null;
  if (
    !typed ||
    typeof typed.is_correct !== "boolean" ||
    typeof typed.correct_count !== "number" ||
    typeof typed.total !== "number"
  ) {
    return { status: "error" };
  }

  return { status: "graded", isCorrect: typed.is_correct, correctCount: typed.correct_count, total: typed.total };
}
