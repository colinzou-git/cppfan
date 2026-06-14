// Pure, DB-independent Parsons grading so it can be unit-tested and reused on the
// server. The "answer" is the ordered list of non-distractor block ids; the
// learner submits their chosen order. We return only structural feedback
// (how many blocks are correctly placed), never the full solution (#123).

export type ParsonsGrade = { isCorrect: boolean; correctCount: number; total: number };

/**
 * Grade a submitted block order against the correct solution order. A submission
 * is correct only when it has exactly the solution length and every position
 * matches. correctCount is partial feedback (correctly-placed blocks).
 */
export function gradeParsonsOrder(solution: string[], submitted: string[]): ParsonsGrade {
  const total = solution.length;
  let correctCount = 0;
  for (let i = 0; i < total && i < submitted.length; i += 1) {
    if (submitted[i] === solution[i]) {
      correctCount += 1;
    }
  }
  return { isCorrect: submitted.length === total && correctCount === total && total > 0, correctCount, total };
}

export type ParsonsRpcOutcome =
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
 * Classify a grade_parsons_attempt RPC result. Mirrors the grade-choice policy
 * (#146): a missing function is a legitimate pre-migration state (seed grading
 * is OK); any other error must NOT silently fall back to the seed solution.
 */
export function classifyParsonsRpc(result: RpcResult): ParsonsRpcOutcome {
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
