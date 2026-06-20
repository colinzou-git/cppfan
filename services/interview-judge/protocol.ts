import type {
  JudgeLimits,
  JudgeResult,
  JudgeSubmission,
  JudgeCompiler,
  CppStandard
} from "@/features/interview/judge-contract";

export type JudgeTaskKind = "compile_only" | "compile_and_run";

export type JudgeWorkerTest = {
  id: string;
  name: string;
  hidden: boolean;
  category: string;
  /** Hash of the server-held input/expected pair; never the raw values. */
  fixtureHash: string;
};

export type JudgeWorkerRequest = {
  submission: JudgeSubmission;
  taskKind: JudgeTaskKind;
  tests: JudgeWorkerTest[];
  limits: JudgeLimits;
};

export type JudgeQueueState = "queued" | "running" | "completed" | "canceled";

export type JudgeQueueRecord = {
  submissionId: string;
  ownerId: string;
  request: JudgeWorkerRequest;
  state: JudgeQueueState;
  enqueuedAtMs: number;
  updatedAtMs: number;
  result: JudgeResult | null;
};

export type JudgeWorkerCapabilities = {
  compilers: JudgeCompiler[];
  standards: CppStandard[];
  taskKinds: JudgeTaskKind[];
};
