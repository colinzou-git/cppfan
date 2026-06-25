import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import {
  parseConsoleStream,
  parseErrorMessage,
  parseStackListFrames,
  parseStopRecord,
  parseVariables,
  recordClass
} from "./gdb-mi-parser.js";
import { OutputBuffer } from "./output-buffer.js";
import { DEBUG_LIMITS } from "./security.js";
import type { DebugSnapshot } from "./types.js";

/**
 * Drives one `g++ -g -O0` + `gdb --interpreter=mi2` session (#442).
 *
 * NOTE: this talks to a real gdb subprocess, so it cannot be unit-tested without
 * a toolchain — it is exercised on the OVH deploy (treat as unverified until
 * then, like device-only behavior). The MI command/response correlation and the
 * snapshot assembly use the pure, unit-tested gdb-mi-parser.
 */

const ACTION_TO_MI: Record<string, string> = {
  continue: "-exec-continue",
  stepOver: "-exec-next",
  stepInto: "-exec-step",
  stepOut: "-exec-finish"
};

type Pending = { resolve: (line: string) => void; reject: (error: Error) => void };

export class GdbSession {
  private workspace = "";
  private gdb: ChildProcessWithoutNullStreams | null = null;
  private token = 0;
  private readonly pending = new Map<number, Pending>();
  private stopWaiters: ((line: string) => void)[] = [];
  private readonly stdout = new OutputBuffer(DEBUG_LIMITS.maxOutputBytes);
  private readonly stderr = new OutputBuffer(DEBUG_LIMITS.maxOutputBytes);
  private lastStop: string | null = null;
  private exited = false;
  private exitCode: number | null = null;

  constructor(private readonly source: string) {}

  /** Compile, launch gdb, set breakpoints, and run to the first stop. */
  async start(breakpointLines: number[]): Promise<DebugSnapshot> {
    this.workspace = await mkdtemp(join(tmpdir(), "cppfan-dbg-"));
    const sourcePath = join(this.workspace, "main.cpp");
    const binPath = join(this.workspace, "main");
    await writeFile(sourcePath, this.source, "utf8");

    const compile = await this.compile(sourcePath, binPath);
    if (!compile.ok) {
      await this.dispose();
      return this.snapshotShell("compile_error", { compileOutput: compile.output, message: "Compilation failed." });
    }

    this.gdb = spawn("gdb", ["--quiet", "--interpreter=mi2", binPath], {
      cwd: this.workspace,
      // Minimal env for the debugged inferior (no app secrets like the API key).
      env: { PATH: process.env.PATH ?? "" } as unknown as NodeJS.ProcessEnv
    });
    this.wireGdb();

    for (const line of breakpointLines) {
      await this.command(`-break-insert main.cpp:${line}`);
    }
    await this.command("-exec-run --start").catch(() => undefined);
    const stop = await this.waitForStop();
    return this.buildSnapshot(stop);
  }

  async action(action: string, _watches: string[] = []): Promise<DebugSnapshot> {
    const mi = ACTION_TO_MI[action];
    if (!mi) return this.buildSnapshot(this.lastStop);
    if (this.exited) return this.snapshotShell("exited", { exitCode: this.exitCode });
    await this.command(mi).catch(() => undefined);
    const stop = await this.waitForStop();
    return this.buildSnapshot(stop);
  }

  async dispose(): Promise<void> {
    try {
      this.gdb?.kill("SIGKILL");
    } catch {
      // already gone
    }
    this.gdb = null;
    if (this.workspace) {
      await rm(this.workspace, { recursive: true, force: true }).catch(() => undefined);
      this.workspace = "";
    }
  }

  private compile(sourcePath: string, binPath: string): Promise<{ ok: boolean; output: string }> {
    return new Promise((resolve) => {
      const cc = spawn(
        "g++",
        [sourcePath, "-std=c++20", "-Wall", "-Wextra", "-O0", "-g", "-o", binPath],
        { cwd: this.workspace }
      );
      let output = "";
      cc.stdout.on("data", (d) => (output += d.toString()));
      cc.stderr.on("data", (d) => (output += d.toString()));
      const timer = setTimeout(() => cc.kill("SIGKILL"), DEBUG_LIMITS.compileTimeoutMs);
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

  private wireGdb(): void {
    if (!this.gdb) return;
    const rl = createInterface({ input: this.gdb.stdout });
    rl.on("line", (line) => this.onGdbLine(line));
    this.gdb.on("exit", (code) => {
      this.exited = true;
      this.exitCode = code;
      const waiters = this.stopWaiters;
      this.stopWaiters = [];
      for (const w of waiters) w(this.lastStop ?? "*stopped,reason=\"exited\"");
    });
  }

  private onGdbLine(line: string): void {
    const cls = recordClass(line);
    const console = parseConsoleStream(line);
    if (console) this.stdout.append(console);

    if (cls === "stopped") {
      this.lastStop = line;
      const waiters = this.stopWaiters;
      this.stopWaiters = [];
      for (const w of waiters) w(line);
      return;
    }

    const tokenMatch = line.match(/^([0-9]+)([\^])/);
    if (tokenMatch) {
      const token = Number(tokenMatch[1]);
      const pending = this.pending.get(token);
      if (pending) {
        this.pending.delete(token);
        const error = parseErrorMessage(line);
        if (error) pending.reject(new Error(error));
        else pending.resolve(line);
      }
    }
  }

  private command(mi: string): Promise<string> {
    if (!this.gdb) return Promise.reject(new Error("gdb is not running"));
    const token = ++this.token;
    return new Promise<string>((resolve, reject) => {
      this.pending.set(token, { resolve, reject });
      this.gdb?.stdin.write(`${token}${mi}\n`);
    });
  }

  private waitForStop(): Promise<string | null> {
    if (this.exited) return Promise.resolve(this.lastStop);
    return new Promise<string | null>((resolve) => {
      const timer = setTimeout(() => resolve(this.lastStop), DEBUG_LIMITS.sessionWallMs);
      this.stopWaiters.push((line) => {
        clearTimeout(timer);
        resolve(line);
      });
    });
  }

  private async buildSnapshot(stopLine: string | null): Promise<DebugSnapshot> {
    if (this.exited) {
      return this.snapshotShell("exited", { exitCode: this.exitCode });
    }
    const stop = stopLine ? parseStopRecord(stopLine) : { reason: null, file: null, line: null, func: null };
    let frames: DebugSnapshot["stack"] = [];
    let variables: DebugSnapshot["variables"] = [];
    try {
      const stackLine = await this.command("-stack-list-frames");
      frames = parseStackListFrames(stackLine).map((f, i) => ({
        id: `frame-${i}`,
        name: f.func,
        file: f.file ?? undefined,
        line: f.line
      }));
      const varsLine = await this.command("-stack-list-variables --all-values");
      variables = parseVariables(varsLine).map((v) => ({ name: v.name, value: v.value }));
    } catch {
      // Leave frames/variables empty if gdb rejects the query in this state.
    }
    return {
      sessionId: null,
      status: "paused",
      reason: stop.reason ?? undefined,
      file: "main.cpp",
      line: stop.line,
      stdout: this.stdout.toString(),
      stderr: this.stderr.toString(),
      compileOutput: "",
      stack: frames,
      variables,
      watches: [],
      breakpoints: []
    };
  }

  private snapshotShell(status: DebugSnapshot["status"], extra: Partial<DebugSnapshot>): DebugSnapshot {
    return {
      sessionId: null,
      status,
      file: "main.cpp",
      line: null,
      stdout: this.stdout.toString(),
      stderr: this.stderr.toString(),
      compileOutput: "",
      stack: [],
      variables: [],
      watches: [],
      breakpoints: [],
      ...extra
    };
  }
}
