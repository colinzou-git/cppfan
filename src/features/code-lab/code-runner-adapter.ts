import type { CodeRunResult } from "./code-lab-types";

/**
 * Runner adapter boundary (#407). The Code Lab never executes untrusted C++ in
 * the Next.js process; it delegates to a provider behind this interface so the
 * mock (tests/CI) and a hosted provider (Piston) are interchangeable.
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
 * The public emkc.org endpoint requires no API key; a self-hosted base URL and
 * key are also supported. Runner credentials stay server-side.
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
