export type DiagnosticActionResult =
  | { status: "ok"; attemptId: string }
  | { status: "signed_out" | "error" }
  | { status: "retake_not_ready"; nextAllowedAtMs: number };
