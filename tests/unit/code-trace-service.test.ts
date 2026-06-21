import { afterEach, describe, expect, it } from "vitest";
import { parseTraceResponse, traceCode } from "@/features/code-lab/code-trace-service";
import { CODE_TRACE_DISCLAIMER } from "@/features/code-lab/code-trace-types";
import type { CodeRunResult } from "@/features/code-lab/code-lab-types";

const originalProvider = process.env.AI_PROVIDER;
const originalEnabled = process.env.AI_CHAT_ENABLED;

afterEach(() => {
  if (originalProvider === undefined) delete process.env.AI_PROVIDER;
  else process.env.AI_PROVIDER = originalProvider;
  if (originalEnabled === undefined) delete process.env.AI_CHAT_ENABLED;
  else process.env.AI_CHAT_ENABLED = originalEnabled;
});

const compileError: CodeRunResult = {
  status: "compile_error",
  compileOutput: "main.cpp:1: error: expected ';'",
  stdout: "",
  stderr: "",
  exitCode: 1,
  timedOut: false,
  durationMs: 5,
  memoryKb: null,
  provider: "mock",
  simulated: true
};

describe("parseTraceResponse", () => {
  it("parses structured steps and always attaches the disclaimer", () => {
    const trace = parseTraceResponse(
      'Here: {"codeSummary":"Sums a vector","steps":[{"step":1,"lineHint":"line 6","variables":{"i":"0","sum":"0"},"explanation":"Loop starts"}],"confidence":"medium"}'
    );
    expect(trace.status).toBe("ok");
    expect(trace.steps).toHaveLength(1);
    expect(trace.steps[0].variables).toEqual({ i: "0", sum: "0" });
    expect(trace.confidence).toBe("medium");
    expect(trace.disclaimer).toBe(CODE_TRACE_DISCLAIMER);
  });

  it("treats prose as a code summary with no fabricated steps", () => {
    const trace = parseTraceResponse("Your loop never increments i.");
    expect(trace.status).toBe("ok");
    expect(trace.steps).toEqual([]);
    expect(trace.codeSummary).toContain("increments i");
  });

  it("reports unavailable for empty output", () => {
    expect(parseTraceResponse("   ").status).toBe("unavailable");
  });
});

describe("traceCode", () => {
  it("is unavailable when no AI provider is enabled", async () => {
    process.env.AI_PROVIDER = "groq";
    delete process.env.AI_CHAT_ENABLED;
    const trace = await traceCode(
      { itemId: "cpp.program_basics.io.lesson", language: "cpp", source: "int main(){}" },
      new AbortController().signal
    );
    expect(trace.status).toBe("unavailable");
    expect(trace.disclaimer).toBe(CODE_TRACE_DISCLAIMER);
  });

  it("explains a compile error as a blocker without fabricating runtime steps", async () => {
    process.env.AI_PROVIDER = "fake";
    const trace = await traceCode(
      {
        itemId: "cpp.program_basics.io.lesson",
        language: "cpp",
        source: "int main(){ ",
        lastRunResult: compileError
      },
      new AbortController().signal
    );
    expect(trace.status).toBe("ok");
    expect(trace.steps).toEqual([]);
    expect(trace.likelyIssue).toMatch(/compile/i);
  });

  it("returns a trace with the deterministic fake provider", async () => {
    process.env.AI_PROVIDER = "fake";
    const trace = await traceCode(
      { itemId: "cpp.program_basics.io.lesson", language: "cpp", source: "int main(){}" },
      new AbortController().signal
    );
    expect(trace.status).toBe("ok");
    expect(trace.disclaimer).toBe(CODE_TRACE_DISCLAIMER);
  });
});
