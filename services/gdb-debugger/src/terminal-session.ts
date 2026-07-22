import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TerminalEventBuffer } from "./terminal-event-buffer.js";
import { TERMINAL_LIMITS } from "./security.js";
import type { TerminalSnapshot, TerminalStatus } from "./types.js";

/**
 * Drives one interactive terminal session (#664): compile the learner source,
 * spawn the binary directly (never through a shell) with piped stdin/stdout/
 * stderr, stream an ordered transcript, and keep stdin open so later
 * `std::cin` / `std::getline` reads can be answered live. This is the normal
 * Run path — it does not run under gdb and does not use the one-shot Judge0
 * submission API.
 *
 * NOTE: it spawns a real g++ + child process, so it is exercised by the service
 * integration tests (which need a C++ toolchain) rather than pure unit tests. The
 * transcript ordering/cursoring uses the pure, unit-tested TerminalEventBuffer.
 */

type PublicSnapshot = Omit<TerminalSnapshot, "sessionId" | "sessionToken">;

const COMPILE_FLAGS = ["-std=c++20", "-Wall", "-Wextra", "-O0", "-o"];

export class TerminalSession {
  private workspace = "";
  private child: ChildProcess | null = null;
  private readonly buffer = new TerminalEventBuffer(
    TERMINAL_LIMITS.maxOutputBytes,
    TERMINAL_LIMITS.maxEvents
  );
  private status: TerminalStatus = "idle";
  private exitCode: number | null = null;
  private startedAtMs = 0;
  private endedAtMs: number | null = null;
  private endReason: "stop" | "timeout" | null = null;
  private stdinClosed = false;
  private cumulativeInput = 0;
  private wallTimer: ReturnType<typeof setTimeout> | null = null;
  private workspaceCleared = false;

  constructor(
    private readonly source: string,
    private readonly initialStdin: string,
    /** Unguessable per-session capability the server checks on every follow-up. */
    readonly token: string
  ) {}

  /** Compile, then either report a compile error or spawn the running binary. */
  async start(): Promise<void> {
    this.status = "compiling";
    this.startedAtMs = Date.now();
    this.workspace = await mkdtemp(join(tmpdir(), "cppfan-term-"));
    const sourcePath = join(this.workspace, "main.cpp");
    const binPath = join(this.workspace, "main");
    await writeFile(sourcePath, this.source, "utf8");

    const compile = await this.compile(sourcePath, binPath);
    if (compile.output.trim()) this.buffer.append("compiler", compile.output);
    if (!compile.ok) {
      this.status = "compile_error";
      this.endedAtMs = Date.now();
      this.buffer.append("system", "\nCompilation failed. No program was started.");
      await this.clearWorkspace();
      return;
    }

    try {
      this.child = spawn(binPath, [], {
        cwd: this.workspace,
        // New process group so Stop/reap can kill the whole tree, not just the
        // immediate child. Minimal env — never leak the service API key.
        detached: true,
        env: { PATH: process.env.PATH ?? "" } as unknown as NodeJS.ProcessEnv,
        stdio: ["pipe", "pipe", "pipe"]
      });
    } catch (error) {
      this.status = "error";
      this.endedAtMs = Date.now();
      this.buffer.append("system", `\nFailed to start program: ${(error as Error).message}`);
      await this.clearWorkspace();
      return;
    }

    this.status = "running";
    this.wireChild();

    // Send Input Args exactly once, then keep stdin open for live input.
    if (this.initialStdin) {
      this.child.stdin?.write(this.initialStdin);
      this.buffer.append("stdin", this.initialStdin);
      this.cumulativeInput += this.initialStdin.length;
    }

    this.wallTimer = setTimeout(() => {
      this.endReason = "timeout";
      this.killProcessGroup();
    }, TERMINAL_LIMITS.sessionWallMs);
  }

  /** Write one live-input payload, or close stdin on EOF. */
  writeInput(data: string, eof: boolean): { ok: true } | { ok: false; code: string; message: string } {
    if (this.status !== "running" || !this.child) {
      return { ok: false, code: "not_running", message: "The session is not running." };
    }
    if (this.stdinClosed) {
      return { ok: false, code: "stdin_closed", message: "Standard input is already closed." };
    }
    if (eof) {
      this.stdinClosed = true;
      this.child.stdin?.end();
      this.buffer.append("system", "\n[EOF sent]\n");
      return { ok: true };
    }
    if (data) {
      this.child.stdin?.write(data);
      this.buffer.append("stdin", data);
      this.cumulativeInput += data.length;
    } else {
      // An empty line is still a real getline read — write nothing but echo it.
      this.buffer.append("stdin", "");
    }
    return { ok: true };
  }

  /** Cumulative live+initial input written, so the route can enforce the cap. */
  get cumulativeInputChars(): number {
    return this.cumulativeInput;
  }

  /** Manual, idempotent stop: kill the process group; workspace cleared on exit. */
  stop(): void {
    if (this.endedAtMs !== null) return;
    this.endReason = "stop";
    this.killProcessGroup();
  }

  snapshot(after: number): PublicSnapshot {
    const events = this.buffer.since(after);
    return {
      status: this.status,
      events,
      nextSequence: this.buffer.lastSequence,
      exitCode: this.endedAtMs !== null ? this.exitCode : undefined,
      durationMs: this.startedAtMs ? (this.endedAtMs ?? Date.now()) - this.startedAtMs : null,
      outputTruncated: this.buffer.truncated
    };
  }

  get isFinished(): boolean {
    return this.endedAtMs !== null;
  }

  /** When the process reached a terminal state, for retain-after-exit reaping. */
  get finishedAtMs(): number | null {
    return this.endedAtMs;
  }

  /** Idempotent teardown for Stop-and-remove and the reaper. */
  async dispose(): Promise<void> {
    if (this.wallTimer) {
      clearTimeout(this.wallTimer);
      this.wallTimer = null;
    }
    this.killProcessGroup();
    this.child = null;
    await this.clearWorkspace();
  }

  private wireChild(): void {
    const child = this.child;
    if (!child) return;
    child.stdout?.on("data", (chunk: Buffer) => this.buffer.append("stdout", chunk.toString("utf8")));
    child.stderr?.on("data", (chunk: Buffer) => this.buffer.append("stderr", chunk.toString("utf8")));
    child.stdin?.on("error", () => undefined); // ignore EPIPE if the child exits mid-write
    child.on("error", (error) => {
      if (this.endedAtMs !== null) return;
      this.endedAtMs = Date.now();
      this.status = "error";
      this.buffer.append("system", `\nProgram error: ${error.message}`);
      void this.finalize();
    });
    child.on("exit", (code, signal) => this.onExit(code, signal));
  }

  private onExit(code: number | null, signal: NodeJS.Signals | null): void {
    if (this.endedAtMs !== null) return;
    this.endedAtMs = Date.now();
    this.exitCode = code;
    if (this.endReason === "stop") {
      this.status = "stopped";
      this.buffer.append("system", "\n[Program stopped by you]");
    } else if (this.endReason === "timeout") {
      this.status = "timeout";
      this.buffer.append("system", "\n[Program stopped: exceeded the time limit]");
    } else if (signal) {
      this.status = "runtime_error";
      this.buffer.append("system", `\n[Program terminated by signal ${signal}]`);
    } else {
      this.status = "exited";
      this.buffer.append("system", `\n[Program exited with code ${code ?? 0}]`);
    }
    void this.finalize();
  }

  private async finalize(): Promise<void> {
    if (this.wallTimer) {
      clearTimeout(this.wallTimer);
      this.wallTimer = null;
    }
    await this.clearWorkspace();
  }

  private killProcessGroup(): void {
    const pid = this.child?.pid;
    if (!pid) return;
    try {
      // Negative pid targets the whole process group created by detached:true.
      process.kill(-pid, "SIGKILL");
    } catch {
      try {
        this.child?.kill("SIGKILL");
      } catch {
        // already gone
      }
    }
  }

  private async clearWorkspace(): Promise<void> {
    if (this.workspaceCleared || !this.workspace) return;
    this.workspaceCleared = true;
    const dir = this.workspace;
    this.workspace = "";
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }

  private compile(sourcePath: string, binPath: string): Promise<{ ok: boolean; output: string }> {
    return new Promise((resolve) => {
      const cc = spawn("g++", [sourcePath, ...COMPILE_FLAGS, binPath], { cwd: this.workspace });
      let output = "";
      cc.stdout.on("data", (d) => (output += d.toString()));
      cc.stderr.on("data", (d) => (output += d.toString()));
      const timer = setTimeout(() => cc.kill("SIGKILL"), TERMINAL_LIMITS.compileTimeoutMs);
      cc.on("close", (code) => {
        clearTimeout(timer);
        resolve({ ok: code === 0, output });
      });
      cc.on("error", (error) => {
        clearTimeout(timer);
        resolve({ ok: false, output: `${output}\n${error.message}` });
      });
    });
  }
}
