import { afterEach, describe, expect, it, vi } from "vitest";
import { selectRunner } from "@/features/code-lab/code-runner";
import {
  DEFAULT_PISTON_CPP_VERSION,
  interpretJudge0Response,
  interpretPistonResponse,
  Judge0Runner,
  MockRunner,
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

  it("ignores commented output and never fabricates unknown variable values", () => {
    const source = `int main(){ int x = 41 + 1; /* std::cout << "trap"; */ std::cout << x; }`;
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

describe("Code Lab runner selection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps local and CI defaults on the mock runner", () => {
    vi.stubEnv("CODE_RUNNER_PROVIDER", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "true");

    const selection = selectRunner();

    expect(selection.kind).toBe("ready");
    if (selection.kind !== "ready") throw new Error("Expected a ready runner selection.");
    expect(selection.adapter.name).toBe("mock");
  });

  it("honors an explicit mock provider override", () => {
    vi.stubEnv("CODE_RUNNER_PROVIDER", "mock");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "");

    const selection = selectRunner();

    expect(selection.kind).toBe("ready");
    if (selection.kind !== "ready") throw new Error("Expected a ready runner selection.");
    expect(selection.adapter.name).toBe("mock");
  });

  it("reports Judge0 as unconfigured without a base URL", () => {
    vi.stubEnv("CODE_RUNNER_PROVIDER", "judge0");
    vi.stubEnv("CODE_RUNNER_BASE_URL", "");
    vi.stubEnv("CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID", "54");

    const selection = selectRunner();

    expect(selection.kind).toBe("unconfigured");
    if (selection.kind !== "unconfigured") throw new Error("Expected unconfigured runner.");
    expect(selection.note).toContain("CODE_RUNNER_BASE_URL");
  });

  it("reports Judge0 as unconfigured without a valid C++ language id", () => {
    vi.stubEnv("CODE_RUNNER_PROVIDER", "judge0");
    vi.stubEnv("CODE_RUNNER_BASE_URL", "http://judge0.example");
    vi.stubEnv("CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID", "not-a-number");

    const selection = selectRunner();

    expect(selection.kind).toBe("unconfigured");
    if (selection.kind !== "unconfigured") throw new Error("Expected unconfigured runner.");
    expect(selection.note).toContain("CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID");
  });

  it("selects Judge0 when required env vars are present", () => {
    vi.stubEnv("CODE_RUNNER_PROVIDER", "judge0");
    vi.stubEnv("CODE_RUNNER_BASE_URL", "http://judge0.example");
    vi.stubEnv("CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID", "54");

    const selection = selectRunner();

    expect(selection.kind).toBe("ready");
    if (selection.kind !== "ready") throw new Error("Expected a ready runner selection.");
    expect(selection.adapter.name).toBe("judge0");
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

describe("Judge0Runner", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits base64-encoded C++ source to Judge0 with server-side auth header", async () => {
    const fetchMock = vi.fn(
      async (_url: Parameters<typeof fetch>[0], _init?: Parameters<typeof fetch>[1]) =>
        new Response(
          JSON.stringify({
            stdout: Buffer.from("5\n", "utf8").toString("base64"),
            time: "0.004",
            memory: 1024,
            stderr: null,
            compile_output: null,
            status: { id: 3, description: "Accepted" }
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
    );
    vi.stubGlobal("fetch", fetchMock);

    const source = `int main(){ return 0; }`;
    const stdin = "2 3";
    const result = await new Judge0Runner({
      baseUrl: "http://judge0.example",
      apiKey: "secret",
      languageId: 54
    }).run({
      source,
      stdin,
      compilerFlags: ["-std=c++20"],
      timeoutMs: 5000,
      memoryMb: 128
    });

    expect(result.status).toBe("success");
    expect(result.provider).toBe("judge0");
    expect(result.stdout).toBe("5\n");
    expect(result.memoryKb).toBe(1024);
    expect(result.durationMs).toBe(4);

    const firstCall = fetchMock.mock.calls[0];
    if (!firstCall) throw new Error("Expected Judge0Runner to call fetch.");
    expect(String(firstCall[0])).toBe("http://judge0.example/submissions?base64_encoded=true&wait=true");
    const init = firstCall[1];
    if (!init) throw new Error("Expected Judge0Runner to pass fetch options.");
    expect((init.headers as Record<string, string>)["X-Auth-Token"]).toBe("secret");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.language_id).toBe(54);
    expect(body.source_code).toBe(Buffer.from(source, "utf8").toString("base64"));
    expect(body.stdin).toBe(Buffer.from(stdin, "utf8").toString("base64"));
    expect(body.memory_limit).toBe(128 * 1024);
    expect(body).not.toHaveProperty("compiler_options");
  });
});

describe("Judge0 line-wrapped base64 decoding", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("decodes a long compile_output that Judge0 wraps every 60 chars", async () => {
    // Judge0 encodes output with Ruby's Base64.encode64, which inserts a
    // newline every 60 characters and a trailing newline (MIME-style).
    const compileError =
      "main.cpp: In function 'int main()':\n" +
      "main.cpp:7:1: error: 'adfad' does not name a type\n" +
      "    7 | adfad\n      | ^~~~~\n";
    const wrappedBase64 = `${(Buffer.from(compileError, "utf8").toString("base64").match(/.{1,60}/g) ?? []).join("\n")}\n`;
    expect(wrappedBase64).toContain("\n");

    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            stdout: null,
            stderr: null,
            compile_output: wrappedBase64,
            status: { id: 6, description: "Compilation Error" }
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new Judge0Runner({ baseUrl: "http://judge0.example", languageId: 54 }).run({
      source: `int main(){ return 0; }\nadfad`,
      stdin: "",
      compilerFlags: [],
      timeoutMs: 5000,
      memoryMb: 128
    });

    expect(result.status).toBe("compile_error");
    expect(result.compileOutput).toBe(compileError);
    expect(result.compileOutput).not.toContain("bWFpbi5jcHA");
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

  it("reports a compile error from compiler output even when stderr is missing", () => {
    const result = interpretPistonResponse(
      { compile: { code: 1, output: "compiler failed" }, run: { code: 1 } },
      "piston",
      12
    );
    expect(result.status).toBe("compile_error");
    expect(result.compileOutput).toBe("compiler failed");
  });

  it("preserves runtime output diagnostics when stderr is blank", () => {
    const result = interpretPistonResponse(
      { compile: { code: 0 }, run: { code: 1, stderr: "", output: "runtime failed" } },
      "piston",
      9
    );
    expect(result.status).toBe("runtime_error");
    expect(result.stderr).toBe("runtime failed");
  });

  it("reports a runner error when the run stage is missing", () => {
    const result = interpretPistonResponse({ compile: { code: 0 } }, "piston", 9);
    expect(result.status).toBe("runner_error");
    expect(result.note).toBe("The code runner returned no execution result.");
  });

  it("maps SIGKILL to a timeout", () => {
    const result = interpretPistonResponse({ run: { code: null, signal: "SIGKILL", stdout: "" } }, "piston", 9);
    expect(result.status).toBe("timeout");
    expect(result.timedOut).toBe(true);
  });

  it("reports success with stdout for a clean run", () => {
    const result = interpretPistonResponse({ compile: { code: 0 }, run: { code: 0, stdout: "ok\n" } }, "piston", 7);
    expect(result.status).toBe("success");
    expect(result.stdout).toBe("ok\n");
    expect(result.simulated).toBe(false);
  });
});

describe("Judge0 response interpretation", () => {
  it("maps Accepted to success", () => {
    const result = interpretJudge0Response(
      { stdout: "ok\n", time: "0.007", memory: 2048, status: { id: 3, description: "Accepted" } },
      "judge0",
      50
    );
    expect(result.status).toBe("success");
    expect(result.stdout).toBe("ok\n");
    expect(result.durationMs).toBe(7);
    expect(result.memoryKb).toBe(2048);
  });

  it("maps Compilation Error to compile_error", () => {
    const result = interpretJudge0Response(
      { compile_output: "main.cpp:1: error: expected ';'", status: { id: 6, description: "Compilation Error" } },
      "judge0",
      50
    );
    expect(result.status).toBe("compile_error");
    expect(result.compileOutput).toContain("expected ';'");
  });

  it("maps Time Limit Exceeded to timeout", () => {
    const result = interpretJudge0Response({ status: { id: 5, description: "Time Limit Exceeded" } }, "judge0", 50);
    expect(result.status).toBe("timeout");
    expect(result.timedOut).toBe(true);
  });

  it("maps runtime statuses to runtime_error", () => {
    const result = interpretJudge0Response(
      { stderr: "runtime failed", status: { id: 11, description: "Runtime Error" } },
      "judge0",
      50
    );
    expect(result.status).toBe("runtime_error");
    expect(result.stderr).toContain("runtime failed");
  });

  it("maps Internal Error to runner_error", () => {
    const result = interpretJudge0Response(
      { message: "Judge0 worker internal error", status: { id: 13, description: "Internal Error" } },
      "judge0",
      50
    );
    expect(result.status).toBe("runner_error");
    expect(result.note).toContain("internal error");
  });
});
