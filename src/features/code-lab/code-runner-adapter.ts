import type { CodeRunResult } from "./code-lab-types";

/**
 * Runner adapter boundary (#407). The Code Lab never executes untrusted C++ in
 * the Next.js process; it delegates to a provider behind this interface so the
 * mock (tests/CI), Piston, and Judge0 are interchangeable.
 */

export type RunnerInput = {
  source: string;
  stdin: string;
  compilerFlags: string[];
  timeoutMs: number;
  memoryMb: number;
};

export interface CodeRunnerAdapter {
  readonly name: string;
  run(input: RunnerInput): Promise<CodeRunResult>;
}

/** Current public Piston C++ runtime. Piston /execute rejects wildcard versions. */
export const DEFAULT_PISTON_CPP_VERSION = "10.2.0";

/**
 * Deterministic offline runner for local dev, unit tests, and CI. It does not
 * compile C++ — it simulates output for the simple shapes the seed examples use
 * (printing string literals, echoing stdin) so the run/test flow is exercisable
 * without any network. Every result is flagged `simulated: true`.
 */
export class MockRunner implements CodeRunnerAdapter {
  readonly name = "mock";

  async run(input: RunnerInput): Promise<CodeRunResult> {
    const start = Date.now();
    const stdout = simulateStdout(input.source, input.stdin);
    return {
      status: "success",
      compileOutput: "",
      stdout,
      stderr: "",
      exitCode: 0,
      timedOut: false,
      durationMs: Date.now() - start,
      memoryKb: null,
      provider: this.name,
      simulated: true,
      note: "Simulated output from the deterministic mock runner — not a real compile/run."
    };
  }
}

/**
 * Extract the text a simple program would print. It models two beginner shapes
 * deterministically: programs that print only string literals/`endl`, and echo
 * programs that read input then print a variable. When a `cout` chain prints a
 * variable whose value the mock cannot know (and the program does not read
 * input), it yields empty stdout rather than fabricating a plausible-but-wrong
 * result.
 */
export function simulateStdout(source: string, stdin: string): string {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");

  const literals: string[] = [];
  let printsVariable = false;
  const coutPattern = /(?:std::)?cout\s*((?:<<\s*(?:"(?:[^"\\]|\\.)*"|[^;<]+))+);/g;
  let match: RegExpExecArray | null;
  while ((match = coutPattern.exec(withoutComments)) !== null) {
    for (const segment of splitInsertions(match[1])) {
      const literal = segment.match(/^"((?:[^"\\]|\\.)*)"$/);
      if (literal) {
        literals.push(decodeCppString(literal[1]));
      } else if (/^(?:std::)?endl$/.test(segment)) {
        literals.push("\n");
      } else if (segment.length > 0) {
        printsVariable = true;
      }
    }
  }

  const readsInput = /(?:std::)?cin\s*>>|getline\s*\(/.test(withoutComments);

  // Echo exercise: reads input and prints a variable. The printed value is the
  // input, so reproduce it with a single trailing newline.
  if (printsVariable && readsInput && stdin.length > 0) {
    return `${stdin.replace(/\n+$/, "")}\n`;
  }

  if (!printsVariable && literals.length > 0) {
    return literals.join("");
  }

  return literals.join("");
}

/** Split a `<< a << b << c` chain into its individual insertion operands. */
function splitInsertions(chain: string): string[] {
  return chain
    .split("<<")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function decodeCppString(raw: string): string {
  return raw.replace(/\\(.)/g, (_, char: string) => {
    switch (char) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      case "0":
        return "\0";
      case "\\":
        return "\\";
      case '"':
        return '"';
      default:
        return char;
    }
  });
}

type PistonRunStage = {
  stdout?: string;
  stderr?: string;
  output?: string;
  code?: number | null;
  signal?: string | null;
};

type PistonResponse = {
  compile?: PistonRunStage;
  run?: PistonRunStage;
  message?: string;
};

/**
 * Hosted runner backed by a Piston instance (https://github.com/engineerd/piston).
 * A self-hosted base URL and key are supported. Runner credentials stay
 * server-side. Prefer Judge0 for production cppFan Code Lab deployments.
 */
export class PistonRunner implements CodeRunnerAdapter {
  readonly name = "piston";

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey?: string,
    private readonly cppVersion: string = DEFAULT_PISTON_CPP_VERSION
  ) {}

  async run(input: RunnerInput): Promise<CodeRunResult> {
    const start = Date.now();
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (this.apiKey) headers.authorization = `Bearer ${this.apiKey}`;

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/execute`, {
        method: "POST",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(input.timeoutMs + 10_000),
        body: JSON.stringify({
          language: "c++",
          version: this.cppVersion,
          files: [{ name: "main.cpp", content: input.source }],
          stdin: input.stdin,
          compile_timeout: 10_000,
          run_timeout: input.timeoutMs,
          run_memory_limit: input.memoryMb * 1024 * 1024
        })
      });
    } catch {
      return runnerError(this.name, "The code runner did not respond. Try again shortly.", start);
    }

    if (!response.ok) {
      const detail = await readShortResponseBody(response);
      const statusDetail = detail ? `HTTP ${response.status}: ${detail}` : `HTTP ${response.status}`;
      return runnerError(
        this.name,
        response.status === 429
          ? `The code runner is busy (${statusDetail}). Try again in a moment.`
          : `The code runner rejected this submission (${statusDetail}).`,
        start
      );
    }

    let payload: PistonResponse;
    try {
      payload = (await response.json()) as PistonResponse;
    } catch {
      return runnerError(this.name, "The code runner returned an unreadable response.", start);
    }

    return interpretPistonResponse(payload, this.name, Date.now() - start);
  }
}

type Judge0Status = {
  id: number;
  description: string;
};

type Judge0Response = {
  stdout?: string | null;
  time?: string | number | null;
  memory?: number | null;
  stderr?: string | null;
  token?: string;
  compile_output?: string | null;
  message?: string | null;
  status?: Judge0Status | null;
};

export type Judge0RunnerOptions = {
  baseUrl: string;
  apiKey?: string;
  languageId: number;
  compilerOptionsEnabled?: boolean;
};

/**
 * Production C++ runner backed by a Judge0 CE/Extra CE instance. The browser
 * never calls Judge0 directly; credentials are attached only on this server-side
 * adapter path.
 */
export class Judge0Runner implements CodeRunnerAdapter {
  readonly name = "judge0";

  constructor(private readonly options: Judge0RunnerOptions) {}

  async run(input: RunnerInput): Promise<CodeRunResult> {
    const start = Date.now();
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (this.options.apiKey) headers["X-Auth-Token"] = this.options.apiKey;

    const timeoutSeconds = Math.max(1, Math.ceil(input.timeoutMs / 1000));
    const body: Record<string, unknown> = {
      language_id: this.options.languageId,
      source_code: input.source,
      stdin: input.stdin,
      cpu_time_limit: timeoutSeconds,
      wall_time_limit: timeoutSeconds + 3,
      memory_limit: input.memoryMb * 1024
    };

    if (this.options.compilerOptionsEnabled && input.compilerFlags.length > 0) {
      body.compiler_options = input.compilerFlags.join(" ");
    }

    let response: Response;
    try {
      response = await fetch(
        `${this.options.baseUrl.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(input.timeoutMs + 10_000),
          body: JSON.stringify(body)
        }
      );
    } catch {
      return runnerError(this.name, "The Judge0 runner did not respond. Try again shortly.", start);
    }

    if (!response.ok) {
      const detail = await readShortResponseBody(response);
      const statusDetail = detail ? `HTTP ${response.status}: ${detail}` : `HTTP ${response.status}`;
      return runnerError(this.name, `The Judge0 runner rejected this submission (${statusDetail}).`, start);
    }

    let payload: Judge0Response;
    try {
      payload = (await response.json()) as Judge0Response;
    } catch {
      return runnerError(this.name, "The Judge0 runner returned an unreadable response.", start);
    }

    if (isJudge0Pending(payload)) {
      if (!payload.token) {
        return runnerError(
          this.name,
          "Judge0 accepted the submission but did not return a token to poll for the final result.",
          start
        );
      }
      return this.pollSubmission(payload.token, headers, input.timeoutMs, start);
    }

    return interpretJudge0Response(payload, this.name, Date.now() - start);
  }

  private async pollSubmission(
    token: string,
    headers: Record<string, string>,
    timeoutMs: number,
    start: number
  ): Promise<CodeRunResult> {
    const baseUrl = this.options.baseUrl.replace(/\/$/, "");
    const deadline = Date.now() + timeoutMs + 10_000;
    let lastPayload: Judge0Response | null = null;

    for (let attempt = 0; attempt < 24 && Date.now() < deadline; attempt += 1) {
      await sleep(Math.min(600, 150 + attempt * 50));

      let response: Response;
      try {
        response = await fetch(`${baseUrl}/submissions/${encodeURIComponent(token)}?base64_encoded=false`, {
          method: "GET",
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(Math.max(1000, deadline - Date.now()))
        });
      } catch {
        return runnerError(this.name, "The Judge0 runner did not respond while polling the result.", start);
      }

      if (!response.ok) {
        const detail = await readShortResponseBody(response);
        const statusDetail = detail ? `HTTP ${response.status}: ${detail}` : `HTTP ${response.status}`;
        return runnerError(this.name, `The Judge0 runner rejected result polling (${statusDetail}).`, start);
      }

      try {
        lastPayload = (await response.json()) as Judge0Response;
      } catch {
        return runnerError(this.name, "The Judge0 runner returned an unreadable polling response.", start);
      }

      if (!isJudge0Pending(lastPayload)) {
        return interpretJudge0Response(lastPayload, this.name, Date.now() - start);
      }
    }

    return runnerError(
      this.name,
      `Judge0 did not finish before the polling timeout (last status: ${lastPayload?.status?.description ?? "unknown"}).`,
      start
    );
  }
}

function firstNonEmptyText(...values: Array<string | undefined>): string {
  return values.find((value) => value && value.length > 0) ?? "";
}

export function interpretPistonResponse(
  payload: PistonResponse,
  provider: string,
  durationMs: number
): CodeRunResult {
  const compileOutput = firstNonEmptyText(payload.compile?.stderr, payload.compile?.output);
  const compileFailed = (payload.compile?.code ?? 0) !== 0;

  if (compileFailed) {
    return {
      status: "compile_error",
      compileOutput,
      stdout: "",
      stderr: "",
      exitCode: payload.compile?.code ?? null,
      timedOut: false,
      durationMs,
      memoryKb: null,
      provider,
      simulated: false
    };
  }

  if (!payload.run) {
    return runnerErrorFromDuration(
      provider,
      payload.message
        ? `The code runner returned: ${payload.message}`
        : "The code runner returned no execution result.",
      durationMs
    );
  }

  const run = payload.run;
  const signal = run.signal ?? null;
  const timedOut = signal === "SIGKILL" || signal === "SIGXCPU";
  const exitCode = run.code ?? null;
  const status = timedOut
    ? "timeout"
    : exitCode !== null && exitCode !== 0
      ? "runtime_error"
      : "success";

  return {
    status,
    compileOutput,
    stdout: run.stdout ?? "",
    stderr: firstNonEmptyText(run.stderr, run.output),
    exitCode,
    timedOut,
    durationMs,
    memoryKb: null,
    provider,
    simulated: false,
    note: timedOut ? "Execution exceeded the time limit." : undefined
  };
}

export function interpretJudge0Response(
  payload: Judge0Response,
  provider: string,
  durationMs: number
): CodeRunResult {
  const statusId = payload.status?.id;
  const statusDescription = payload.status?.description ?? "Unknown";
  const compileOutput = payload.compile_output ?? "";
  const stdout = payload.stdout ?? "";
  const stderr = payload.stderr ?? "";
  const memoryKb = typeof payload.memory === "number" ? payload.memory : null;
  const measuredDurationMs = judge0TimeToMs(payload.time, durationMs);
  const message = payload.message ?? undefined;

  if (statusId === 3) {
    return {
      status: "success",
      compileOutput,
      stdout,
      stderr,
      exitCode: 0,
      timedOut: false,
      durationMs: measuredDurationMs,
      memoryKb,
      provider,
      simulated: false
    };
  }

  if (statusId === 6) {
    return {
      status: "compile_error",
      compileOutput: firstNonEmptyText(compileOutput, message, "Compilation failed."),
      stdout: "",
      stderr,
      exitCode: null,
      timedOut: false,
      durationMs: measuredDurationMs,
      memoryKb,
      provider,
      simulated: false,
      note: statusDescription
    };
  }

  if (statusId === 5) {
    return {
      status: "timeout",
      compileOutput,
      stdout,
      stderr,
      exitCode: null,
      timedOut: true,
      durationMs: measuredDurationMs,
      memoryKb,
      provider,
      simulated: false,
      note: "Execution exceeded the time limit."
    };
  }

  if (statusId !== undefined && statusId >= 7 && statusId <= 12) {
    return {
      status: "runtime_error",
      compileOutput,
      stdout,
      stderr: firstNonEmptyText(stderr, message, statusDescription),
      exitCode: null,
      timedOut: false,
      durationMs: measuredDurationMs,
      memoryKb,
      provider,
      simulated: false,
      note: statusDescription
    };
  }

  return {
    status: "runner_error",
    compileOutput,
    stdout,
    stderr,
    exitCode: null,
    timedOut: false,
    durationMs: measuredDurationMs,
    memoryKb,
    provider,
    simulated: false,
    note: firstNonEmptyText(message, `Judge0 returned status ${statusId ?? "unknown"}: ${statusDescription}`)
  };
}

function isJudge0Pending(payload: Judge0Response): boolean {
  const statusId = payload.status?.id;
  return statusId === 1 || statusId === 2 || Boolean(payload.token && !payload.status);
}

function judge0TimeToMs(time: Judge0Response["time"], fallbackMs: number): number {
  if (time === null || time === undefined || time === "") return fallbackMs;
  const seconds = Number(time);
  if (!Number.isFinite(seconds)) return fallbackMs;
  return Math.max(0, Math.round(seconds * 1000));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readShortResponseBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.replace(/\s+/g, " ").trim().slice(0, 300);
  } catch {
    return "";
  }
}

function runnerError(provider: string, note: string, start: number): CodeRunResult {
  return runnerErrorFromDuration(provider, note, Date.now() - start);
}

function runnerErrorFromDuration(provider: string, note: string, durationMs: number): CodeRunResult {
  return {
    status: "runner_error",
    compileOutput: "",
    stdout: "",
    stderr: "",
    exitCode: null,
    timedOut: false,
    durationMs,
    memoryKb: null,
    provider,
    simulated: false,
    note
  };
}
