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
      return {
        ok: false,
        code: "invalid_breakpoint",
        message: "Breakpoint lines must be positive integers."
      };
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

/**
 * Interactive Terminal limits (#664). A terminal session keeps a real child
 * process alive with writable stdin, so it needs its own caps for initial and
 * live input in addition to the shared compile/output/session bounds. Idle here
 * means "the browser stopped polling" — a program quietly waiting on stdin is
 * never killed for being quiet, only for exceeding a hard wall/idle/resource cap.
 */
export const TERMINAL_LIMITS = {
  compileTimeoutMs: 10_000,
  sessionWallMs: 10 * 60_000,
  idleTimeoutMs: 3 * 60_000,
  /** How long a finished session's bounded transcript stays pollable. */
  retainAfterExitMs: 5 * 60_000,
  memoryBytes: 256 * 1024 * 1024,
  maxProcesses: 64,
  maxOutputBytes: 128 * 1024,
  maxEvents: 5_000,
  maxSourceChars: 20_000,
  maxFiles: 16,
  maxFileChars: 20_000,
  maxTotalFileChars: 64 * 1024,
  maxInitialStdinChars: 10_000,
  maxInputPayloadChars: 4_000,
  maxCumulativeInputChars: 64 * 1024
} as const;

// Allow tab (\t), newline (\n), carriage return (\r); reject other C0/DEL controls.
const DISALLOWED_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function hasDisallowedControl(text: string): boolean {
  return DISALLOWED_CONTROL.test(text);
}

export type TerminalStartValidation =
  | {
      ok: true;
      source: string;
      stdin: string;
      files: Array<{ name: string; content: string }>;
      compilerFlags: string[];
    }
  | { ok: false; code: string; message: string };

const ALLOWED_COMPILER_FLAGS = new Set([
  "-std=c++17",
  "-std=c++20",
  "-Wall",
  "-Wextra",
  "-Wpedantic",
  "-pedantic",
  "-O0",
  "-O1",
  "-O2",
  "-O3",
  "-Os",
  "-g",
  "-g0",
  "-g1",
  "-g2",
  "-g3"
]);

/** Validate a terminal start payload against the sandbox limits before compiling. */
export function validateTerminalStart(payload: {
  source?: unknown;
  stdin?: unknown;
  files?: unknown;
  compilerFlags?: unknown;
}): TerminalStartValidation {
  const source = typeof payload.source === "string" ? payload.source : "";
  if (!source.trim()) {
    return { ok: false, code: "empty_source", message: "Source is required." };
  }
  if (source.length > TERMINAL_LIMITS.maxSourceChars) {
    return { ok: false, code: "source_too_large", message: "Source exceeds the size limit." };
  }
  const stdin = typeof payload.stdin === "string" ? payload.stdin : "";
  if (stdin.length > TERMINAL_LIMITS.maxInitialStdinChars) {
    return { ok: false, code: "stdin_too_large", message: "Input Args exceeds the size limit." };
  }
  if (hasDisallowedControl(stdin)) {
    return {
      ok: false,
      code: "invalid_stdin",
      message: "Input Args contains disallowed control characters."
    };
  }

  if (!Array.isArray(payload.files)) {
    return { ok: false, code: "invalid_file", message: "Fixture files must be an array." };
  }
  if (payload.files.length > TERMINAL_LIMITS.maxFiles) {
    return { ok: false, code: "invalid_file", message: "Too many fixture files." };
  }
  const files: Array<{ name: string; content: string }> = [];
  const names = new Set<string>();
  let totalFileChars = 0;
  for (const raw of payload.files) {
    const file = raw as { name?: unknown; content?: unknown };
    if (typeof file?.name !== "string" || typeof file.content !== "string") {
      return {
        ok: false,
        code: "invalid_file",
        message: "Each fixture needs a filename and string content."
      };
    }
    const name = file.name;
    const segments = name.split("/");
    if (
      !name ||
      name.startsWith("/") ||
      name.includes("\\") ||
      /^[A-Za-z]:/.test(name) ||
      segments.some((segment) => !segment || segment === "." || segment === "..")
    ) {
      return {
        ok: false,
        code: "invalid_file",
        message: `Fixture filename "${name}" must be a safe relative path.`
      };
    }
    if (names.has(name)) {
      return { ok: false, code: "invalid_file", message: `Duplicate fixture filename "${name}".` };
    }
    if (file.content.length > TERMINAL_LIMITS.maxFileChars) {
      return {
        ok: false,
        code: "invalid_file",
        message: `Fixture "${name}" exceeds the per-file size limit.`
      };
    }
    totalFileChars += file.content.length;
    if (totalFileChars > TERMINAL_LIMITS.maxTotalFileChars) {
      return {
        ok: false,
        code: "invalid_file",
        message: "Fixture files exceed the total size limit."
      };
    }
    names.add(name);
    files.push({ name, content: file.content });
  }

  if (!Array.isArray(payload.compilerFlags) || payload.compilerFlags.length === 0) {
    return { ok: false, code: "invalid_compiler_flag", message: "Compiler flags are required." };
  }
  const compilerFlags: string[] = [];
  let standardCount = 0;
  for (const flag of payload.compilerFlags) {
    if (typeof flag !== "string" || !ALLOWED_COMPILER_FLAGS.has(flag)) {
      return {
        ok: false,
        code: "invalid_compiler_flag",
        message: `Compiler flag "${typeof flag === "string" ? flag : ""}" is not allowed.`
      };
    }
    if (flag.startsWith("-std=")) standardCount += 1;
    compilerFlags.push(flag);
  }
  if (standardCount > 1) {
    return {
      ok: false,
      code: "invalid_compiler_flag",
      message: "Only one C++ standard flag is allowed."
    };
  }
  return { ok: true, source, stdin, files, compilerFlags };
}

export type TerminalInputValidation =
  | { ok: true; data: string; eof: boolean }
  | { ok: false; code: string; message: string };

/**
 * Validate a live-input write. `eof` alone (with empty data) is allowed; an empty
 * data line is allowed (required for getline); the per-write cap and the
 * cumulative cap protect the child process.
 */
export function validateTerminalInput(
  payload: { data?: unknown; eof?: unknown },
  cumulativeSoFar: number
): TerminalInputValidation {
  const eof = payload.eof === true;
  const data = typeof payload.data === "string" ? payload.data : "";
  if (!eof && typeof payload.data !== "string") {
    return { ok: false, code: "invalid_input", message: "Input data must be a string." };
  }
  if (data.length > TERMINAL_LIMITS.maxInputPayloadChars) {
    return { ok: false, code: "input_too_large", message: "Input line exceeds the size limit." };
  }
  if (hasDisallowedControl(data)) {
    return {
      ok: false,
      code: "invalid_input",
      message: "Input contains disallowed control characters."
    };
  }
  if (cumulativeSoFar + data.length > TERMINAL_LIMITS.maxCumulativeInputChars) {
    return {
      ok: false,
      code: "input_limit_reached",
      message: "Cumulative input exceeds the session limit."
    };
  }
  return { ok: true, data, eof };
}

/** Reject a watch expression that could call functions / cause side effects. */
export function isSafeWatchExpression(expression: string): boolean {
  // No call syntax, assignment, statement separators, or preprocessor — watches
  // should be read-only evaluations of variables/arithmetic.
  if (expression.length === 0 || expression.length > DEBUG_LIMITS.maxWatchChars) return false;
  return !/[();={}#]|->\s*\w+\s*\(/.test(expression);
}
