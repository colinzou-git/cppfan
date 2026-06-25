/**
 * Resource and input limits for the GDB debugger service (#442). User C++ runs in
 * an isolated, network-less sandbox; these caps bound how much it can compile,
 * run, and emit. Pure validation so it is unit-tested without spawning anything.
 */

export const DEBUG_LIMITS = {
  compileTimeoutMs: 10_000,
  sessionWallMs: 5 * 60_000,
  idleTimeoutMs: 2 * 60_000,
  memoryBytes: 256 * 1024 * 1024,
  maxProcesses: 64,
  maxOutputBytes: 64 * 1024,
  maxSourceChars: 20_000,
  maxStdinChars: 10_000,
  maxBreakpoints: 20,
  maxWatches: 20,
  maxWatchChars: 120,
  maxSteps: 500
} as const;

export type StartValidation =
  | { ok: true; source: string; stdin: string; breakpointLines: number[]; watches: string[] }
  | { ok: false; code: string; message: string };

/** Validate a start payload against the sandbox limits before touching gdb. */
export function validateStartPayload(payload: {
  source?: unknown;
  stdin?: unknown;
  breakpoints?: unknown;
  watches?: unknown;
}): StartValidation {
  const source = typeof payload.source === "string" ? payload.source : "";
  if (!source.trim()) {
    return { ok: false, code: "empty_source", message: "Source is required." };
  }
  if (source.length > DEBUG_LIMITS.maxSourceChars) {
    return { ok: false, code: "source_too_large", message: "Source exceeds the size limit." };
  }

  const stdin = typeof payload.stdin === "string" ? payload.stdin : "";
  if (stdin.length > DEBUG_LIMITS.maxStdinChars) {
    return { ok: false, code: "stdin_too_large", message: "Input exceeds the size limit." };
  }

  const breakpointLines: number[] = [];
  const breakpoints = Array.isArray(payload.breakpoints) ? payload.breakpoints : [];
  if (breakpoints.length > DEBUG_LIMITS.maxBreakpoints) {
    return { ok: false, code: "too_many_breakpoints", message: "Too many breakpoints." };
  }
  for (const bp of breakpoints) {
    const line = Number((bp as { line?: unknown })?.line);
    if (!Number.isInteger(line) || line <= 0) {
      return { ok: false, code: "invalid_breakpoint", message: "Breakpoint lines must be positive integers." };
    }
    breakpointLines.push(line);
  }

  const watches: string[] = [];
  const rawWatches = Array.isArray(payload.watches) ? payload.watches : [];
  if (rawWatches.length > DEBUG_LIMITS.maxWatches) {
    return { ok: false, code: "too_many_watches", message: "Too many watch expressions." };
  }
  for (const watch of rawWatches) {
    if (typeof watch !== "string") {
      return { ok: false, code: "invalid_watch", message: "Watch expressions must be strings." };
    }
    const expr = watch.trim();
    if (!expr) continue;
    if (expr.length > DEBUG_LIMITS.maxWatchChars) {
      return { ok: false, code: "watch_too_long", message: "Watch expression is too long." };
    }
    watches.push(expr);
  }

  return { ok: true, source, stdin, breakpointLines, watches };
}

/** Reject a watch expression that could call functions / cause side effects. */
export function isSafeWatchExpression(expression: string): boolean {
  // No call syntax, assignment, statement separators, or preprocessor — watches
  // should be read-only evaluations of variables/arithmetic.
  if (expression.length === 0 || expression.length > DEBUG_LIMITS.maxWatchChars) return false;
  return !/[();={}#]|->\s*\w+\s*\(/.test(expression);
}
