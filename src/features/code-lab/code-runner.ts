import type { CodeRunResult } from "./code-lab-types";
import { runnerMemoryMb, runnerTimeoutMs } from "./code-lab-defaults";
import {
  DEFAULT_PISTON_CPP_VERSION,
  Judge0Runner,
  MockRunner,
  PistonRunner,
  type CodeRunnerAdapter,
  type RunnerInput
} from "./code-runner-adapter";

/**
 * Server-only runner selection (#407). Chooses a provider from env and never
 * exposes runner credentials to the client. Local dev, tests, CI, and unconfigured
 * production deployments default to the deterministic mock so they stay offline;
 * real compile/run is enabled explicitly with CODE_RUNNER_PROVIDER=judge0.
 */

export type RunnerSelection =
  | { kind: "ready"; adapter: CodeRunnerAdapter }
  | { kind: "unconfigured"; note: string };

function defaultRunnerProvider(): string {
  const configuredProvider = process.env.CODE_RUNNER_PROVIDER?.trim().toLowerCase();
  if (configuredProvider) return configuredProvider;

  return "mock";
}

export function selectRunner(): RunnerSelection {
  const provider = defaultRunnerProvider();

  if (provider === "mock") {
    return { kind: "ready", adapter: new MockRunner() };
  }

  if (provider === "piston") {
    const baseUrl = process.env.CODE_RUNNER_BASE_URL?.trim() || "https://emkc.org/api/v2/piston";
    const cppVersion = process.env.CODE_RUNNER_CPP_VERSION?.trim() || DEFAULT_PISTON_CPP_VERSION;
    return {
      kind: "ready",
      adapter: new PistonRunner(baseUrl, process.env.CODE_RUNNER_API_KEY?.trim(), cppVersion)
    };
  }

  if (provider === "judge0") {
    const baseUrl = process.env.CODE_RUNNER_BASE_URL?.trim();
    const languageIdRaw = process.env.CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID?.trim();
    const languageId = Number(languageIdRaw);

    if (!baseUrl) {
      return {
        kind: "unconfigured",
        note: "The Judge0 runner is selected but CODE_RUNNER_BASE_URL is not set."
      };
    }

    if (!Number.isInteger(languageId) || languageId <= 0) {
      return {
        kind: "unconfigured",
        note: "The Judge0 runner is selected but CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID is not a valid number."
      };
    }

    return {
      kind: "ready",
      adapter: new Judge0Runner({
        baseUrl,
        apiKey: process.env.CODE_RUNNER_API_KEY?.trim(),
        languageId,
        compilerOptionsEnabled:
          process.env.CODE_RUNNER_JUDGE0_ENABLE_COMPILER_OPTIONS?.trim().toLowerCase() === "true"
      })
    };
  }

  return {
    kind: "unconfigured",
    note: `Unknown code runner provider "${provider}". Set CODE_RUNNER_PROVIDER to mock, piston, or judge0.`
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
