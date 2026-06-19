import type { CppStandard, JudgeCompiler } from "./judge-contract";
import type { SessionMode } from "./session-machine";
import type { JudgeTaskKind } from "../../../services/interview-judge/protocol";

// Kept out of the "use server" module so client components can import types
// without pulling server-only hashing/persistence code.
export type SubmitJudgeAttemptInput = {
  problemId: string;
  source: string;
  mode: SessionMode;
  compiler?: JudgeCompiler;
  standard?: CppStandard;
  taskKind?: JudgeTaskKind;
  interviewSessionId?: string | null;
  sourceVersion?: number;
  assistanceUsed?: boolean;
  priorSolutionExposed?: boolean;
};

export type SubmitJudgeAttemptResult =
  | { status: "queued"; submissionId: string; visibleTestCount: number; hiddenTestCount: number }
  | { status: "duplicate"; submissionId: string }
  | { status: "unsupported_problem" }
  | { status: "signed_out" }
  | { status: "invalid"; reason: string }
  | { status: "error"; reason?: string };
