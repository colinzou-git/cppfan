/**
 * Shared types for the Code Lab interactive Terminal (#664). A terminal session
 * keeps a real child process alive on the execution service with writable stdin,
 * so the learner can answer later `std::cin` / `std::getline` reads live. The
 * browser client, the Next.js terminal routes, the adapters, and the OVH service
 * all speak these types. Distinct from the one-shot runner (CodeRunResult) and
 * the GDB debug session (CodeDebugSnapshot).
 */

export type CodeTerminalStatus =
  | "idle"
  | "compiling"
  | "running"
  | "exited"
  | "stopped"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "stale_definition"
  | "item_unavailable"
  | "invalid_contract"
  | "unconfigured"
  | "error";

export type CodeTerminalEventKind = "compiler" | "stdout" | "stderr" | "stdin" | "system";

export type CodeTerminalEvent = {
  sequence: number;
  kind: CodeTerminalEventKind;
  text: string;
  createdAt: string;
};

/** The single source of truth the Terminal panel renders at any moment. */
export type CodeTerminalSnapshot = {
  sessionId: string | null;
  /** Unguessable per-session capability required for poll/input/stop (#664). */
  sessionToken?: string;
  /** Stable app-issued idempotency identity for one executed Terminal run. */
  terminalAttemptId?: string;
  /** Server-derived adapter name; never contains service URLs or credentials. */
  provider?: string;
  status: CodeTerminalStatus;
  events: CodeTerminalEvent[];
  /** Cursor to send on the next poll (highest sequence emitted so far). */
  nextSequence: number;
  exitCode?: number | null;
  durationMs?: number | null;
  outputTruncated?: boolean;
  message?: string;
};

export type CodeTerminalStartRequest = {
  itemId: string;
  source: string;
  /** Input Args: initial stdin written once at launch; stdin stays open after. */
  stdin?: string;
  contentVersionId?: string;
  milestoneIndex?: number;
};

/** Trusted server-to-provider contract produced by the execution-plan resolver. */
export type CodeTerminalBackendStartRequest = {
  source: string;
  stdin: string;
  files: Array<{ name: string; content: string }>;
  compilerFlags: string[];
};

export type CodeTerminalPollRequest = {
  sessionId: string;
  sessionToken: string;
  after: number;
};

export type CodeTerminalInputRequest = {
  sessionId: string;
  sessionToken: string;
  /** The exact bytes to write (Enter sends the composer text plus "\n"). */
  data?: string;
  /** Close stdin without killing the process, so read-until-EOF loops finish. */
  eof?: boolean;
};

export type CodeTerminalStopRequest = {
  sessionId: string;
  sessionToken: string;
};

export type TerminalAttemptSaveStatus = "idle" | "saving" | "retrying" | "saved" | "error";

export type CodeTerminalAttemptRequest = {
  terminalAttemptId: string;
  sessionId: string;
  sessionToken: string;
  itemId: string;
  source: string;
  contentVersionId?: string;
  milestoneIndex?: number;
};

export type RecordTerminalAttemptResult =
  | { status: "recorded"; attemptId: string }
  | { status: "already_recorded"; attemptId: string }
  | { status: "not_final"; message: string }
  | { status: "signed_out"; message: string }
  | { status: "session_unavailable"; message: string }
  | { status: "retryable_error"; message: string }
  | { status: "permanent_error"; message: string };

export type CodeTerminalHealth = {
  status: "ok" | "unconfigured" | "error";
  provider?: string;
  message?: string;
};

/** Terminal-specific input caps mirrored on the service (security.ts). */
export const CODE_TERMINAL_LIMITS = {
  maxInputPayloadChars: 4_000,
  maxCumulativeInputChars: 64 * 1024
} as const;

const TERMINAL_ACTIVE: ReadonlySet<CodeTerminalStatus> = new Set<CodeTerminalStatus>([
  "compiling",
  "running"
]);

/** True while a session is compiling or running (Run shows Stop, Tests disabled). */
export function isTerminalActive(status: CodeTerminalStatus | null | undefined): boolean {
  return status !== null && status !== undefined && TERMINAL_ACTIVE.has(status);
}

/** True once a session reached a terminal state (transcript retained until next Run). */
export function isTerminalFinished(status: CodeTerminalStatus | null | undefined): boolean {
  return (
    status === "exited" ||
    status === "stopped" ||
    status === "compile_error" ||
    status === "runtime_error" ||
    status === "timeout" ||
    status === "stale_definition" ||
    status === "item_unavailable" ||
    status === "invalid_contract" ||
    status === "error"
  );
}
