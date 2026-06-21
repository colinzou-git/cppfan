import type { CodeLabLanguage } from "./code-lab-types";

/**
 * Compiler/runtime defaults for the Code Lab (#407). These are read both when
 * building a run request and by the runner adapter; keep them framework-free.
 */

export const DEFAULT_CPP_STANDARD = "c++20";

export const DEFAULT_COMPILER_FLAGS = [
  "-std=c++20",
  "-Wall",
  "-Wextra",
  "-Wpedantic",
  "-O0"
] as const;

export const DEFAULT_STARTER_CODE = `#include <iostream>

int main() {
  std::cout << "Hello, cppFan!" << "\\n";
  return 0;
}
`;

export function runnerTimeoutMs(): number {
  return clamp(Number(process.env.CODE_RUNNER_TIMEOUT_MS) || 5_000, 1_000, 20_000);
}

export function runnerMemoryMb(): number {
  return clamp(Number(process.env.CODE_RUNNER_MEMORY_MB) || 128, 16, 512);
}

export function resolveLanguage(language: string | undefined): CodeLabLanguage {
  // Phase 1 supports C++ only; anything else is normalised to cpp so the runner
  // and AI prompt stay consistent.
  return language === "cpp" ? "cpp" : "cpp";
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}
