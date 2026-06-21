import type { CodeRunResult } from "./code-lab-types";
import { runnerMemoryMb, runnerTimeoutMs } from "./code-lab-defaults";
import {
  MockRunner,
  PistonRunner,
  type CodeRunnerAdapter,
  type RunnerInput
} from "./code-runner-adapter";

/**
 * Server-only runner selection (#407). Chooses a provider from env and never
 * exposes runner credentials to the client. Defaults to the deterministic mock
 * so local dev and CI run without any external dependency or key.
 */

export type RunnerSelection =
  | { kind: "ready"; adapter: CodeRunnerAdapter }
  | { kind: "unconfigured"; note: string };

export function selectRunner(): RunnerSelection {
  const provider = (process.env.CODE_RUNNER_PROVIDER ?? "mock").trim().toLowerCase();

  if (provider === "mock") {
    return { kind: "ready", adapter: new MockRunner() };
  }

  if (provider === "piston") {
    const baseUrl = process.env.CODE_RUNNER_BASE_URL?.trim() || "https://emkc.org/api/v2/piston";
    return { kind: "ready", adapter: new PistonRunner(baseUrl, process.env.CODE_RUNNER_API_KEY?.trim()) };
  }

  if (provider === "judge0") {
    // Judge0 is intentionally not wired in Phase 1: it needs a base URL/key the
    // operator must supply. Surface a clear unconfigured state instead of
    // silently falling back so misconfiguration is visible.
    return {
      kind: "unconfigured",
      note: "The judge0 runner is selected but not configured for this deployment."
    };
  }

  return {
    kind: "unconfigured",
    note: `Unknown code runner provider "${provider}". Set CODE_RUNNER_PROVIDER to mock or piston.`
  };
}

export async function executeRun(input: RunnerInput): Promise<CodeRunResult> {
  const selection = selectRunner();
  if (selection.kind === "unconfigured") {
    return {
      status: "runner_unconfigured",
      compileOutput: "",
      stdout: "",
      stderr: "",
      exitCode: null,
      timedOut: false,
      durationMs: null,
      memoryKb: null,
      provider: "none",
      simulated: false,
      note: selection.note
    };
  }
  return selection.adapter.run(input);
}

export function buildRunnerInput({
  source,
  stdin,
  compilerFlags
}: {
  source: string;
  stdin: string;
  compilerFlags: string[];
}): RunnerInput {
  return {
    source,
    stdin,
    compilerFlags,
    timeoutMs: runnerTimeoutMs(),
    memoryMb: runnerMemoryMb()
  };
}
