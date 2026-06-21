import { describe, expect, it } from "vitest";
import {
  MockRunner,
  interpretPistonResponse,
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
