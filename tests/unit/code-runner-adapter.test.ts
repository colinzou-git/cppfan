import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PISTON_CPP_VERSION,
  MockRunner,
  interpretPistonResponse,
  PistonRunner,
  simulateStdout
} from "@/features/code-lab/code-runner-adapter";

describe("Code Lab mock runner", () => {
  it("prints string literals from a cout chain", () => {
    const source = `#include <iostream>\nint main(){ std::cout << "Hello, cppFan!" << "\\n"; return 0; }`;
    expect(simulateStdout(source, "")).toBe("Hello, cppFan!\n");
  });

  it("echoes stdin when the program reads input and prints a variable", () => {
    const source = `#include <iostream>\n#include <string>\nint main(){ std::string s; std::getline(std::cin, s); std::cout << s << "\\n"; }`;
    expect(simulateStdout(source, "ping")).toBe("ping\n");
  });

  it("ignores commented-out output and never fabricates unknown variable values", () => {
    const source = `int main(){ int x = 41 + 1; /* std::cout << "trap"; */ std::cout << x; }`;
    // x is a computed variable with no input — the mock yields no output rather
    // than guessing a number.
    expect(simulateStdout(source, "")).toBe("");
  });

  it("flags every mock result as simulated", async () => {
    const result = await new MockRunner().run({
      source: `int main(){ std::cout << "hi"; }`,
      stdin: "",
      compilerFlags: [],
      timeoutMs: 5000,
      memoryMb: 128
    });
    expect(result.simulated).toBe(true);
    expect(result.provider).toBe("mock");
    expect(result.stdout).toBe("hi");
  });
});

describe("PistonRunner", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends an exact C++ runtime version instead of a wildcard", async () => {
    const fetchMock = vi.fn(
      async (_url: Parameters<typeof fetch>[0], _init?: Parameters<typeof fetch>[1]) =>
        new Response(
          JSON.stringify({
            compile: { stderr: "", code: 0 },
            run: { stdout: "Hello\n", stderr: "", code: 0 }
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new PistonRunner("https://runner.example/api").run({
      source: `int main(){ std::cout << "Hello"; }`,
      stdin: "",
      compilerFlags: [],
      timeoutMs: 5000,
      memoryMb: 128
    });

    expect(result.status).toBe("success");
    expect(result.simulated).toBe(false);

    const firstCall = fetchMock.mock.calls[0];
    if (!firstCall) throw new Error("Expected PistonRunner to call fetch.");

    const requestInit = firstCall[1];
    if (!requestInit) throw new Error("Expected PistonRunner to pass fetch options.");

    const body = JSON.parse(String(requestInit.body)) as { language: string; version: string };
    expect(body.language).toBe("c++");
    expect(body.version).toBe(DEFAULT_PISTON_CPP_VERSION);
    expect(body.version).not.toBe("*");
  });
});

describe("Piston response interpretation", () => {
  it("reports a compile error from a non-zero compile stage", () => {
    const result = interpretPistonResponse(
      { compile: { code: 1, stderr: "main.cpp:1: error: expected ';'" }, run: {} },
      "piston",
      12
    );
    expect(result.status).toBe("compile_error");
    expect(result.compileOutput).toContain("expected ';'");
    expect(result.stdout).toBe("");
  });

  it("reports a compile error from compiler output even when stderr is empty", () => {
    const result = interpretPistonResponse(
      { compile: { code: 1, output: "compiler failed" }, run: { code: 1 } },
      "piston",
      12
    );
    expect(result.status).toBe("compile_error");
    expect(result.compileOutput).toBe("compiler failed");
  });

  it("maps SIGKILL to a timeout", () => {
    const result = interpretPistonResponse(
      { run: { code: null, signal: "SIGKILL", stdout: "" } },
      "piston",
      9
    );
    expect(result.status).toBe("timeout");
    expect(result.timedOut).toBe(true);
  });

  it("reports success with stdout for a clean run", () => {
    const result = interpretPistonResponse(
      { compile: { code: 0 }, run: { code: 0, stdout: "ok\n" } },
      "piston",
      7
    );
    expect(result.status).toBe("success");
    expect(result.stdout).toBe("ok\n");
    expect(result.simulated).toBe(false);
  });
});
