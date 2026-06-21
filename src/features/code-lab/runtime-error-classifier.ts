import type { CodeTagClassification } from "./code-error-tags";

/**
 * Deterministic runtime-error classifier (#412). Maps sanitizer output and
 * crash signals to stable tags. Conservative: a bare segfault yields only a
 * low-confidence out-of-bounds guess, and a timeout yields no stable tag (there
 * is no dedicated infinite-loop tag in the #410 vocabulary yet). Never throws.
 */
export function classifyRuntimeError(input: {
  stderr?: string;
  exitCode?: number | null;
  timedOut?: boolean;
}): CodeTagClassification[] {
  const stderr = input.stderr ?? "";
  const out: CodeTagClassification[] = [];

  if (
    /AddressSanitizer:\s*(?:heap|stack|global)-buffer-overflow/i.test(stderr) ||
    /runtime error:\s*index\s+\d+\s+out of bounds/i.test(stderr) ||
    /runtime error:.*out of bounds/i.test(stderr)
  ) {
    out.push({
      tag: "cpp.vector.out_of_bounds",
      source: "runtime",
      confidence: "high",
      message: "An out-of-bounds access was detected at runtime."
    });
    return out;
  }

  // Timeout: no stable algorithmic/infinite-loop tag exists yet, so emit nothing
  // rather than guess. (Surfaced to the learner as a timeout elsewhere.)
  if (input.timedOut) {
    return out;
  }

  if (
    /Segmentation fault/i.test(stderr) ||
    input.exitCode === 139 ||
    /SIGSEGV/i.test(stderr)
  ) {
    out.push({
      tag: "cpp.vector.out_of_bounds",
      source: "runtime",
      confidence: "low",
      message: "The program crashed — a likely cause is an out-of-bounds or invalid memory access."
    });
  }

  return out;
}
