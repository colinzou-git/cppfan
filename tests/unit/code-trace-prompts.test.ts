import { describe, expect, it } from "vitest";
import { buildTraceMessages, TRACE_SYSTEM_PROMPT } from "@/features/code-lab/code-trace-prompts";
import type { CodeTraceRequest } from "@/features/code-lab/code-trace-types";

const base: CodeTraceRequest = {
  itemId: "cpp.program_basics.io.lesson",
  language: "cpp",
  source: "int main(){ return 0; }",
  selectedTestName: "Echoes a single word",
  selectedInput: "ping",
  selectedExpectedOutput: "ping\n",
  selectedActualOutput: "pong\n"
};

describe("buildTraceMessages", () => {
  it("includes item context, code, selected input, expected and actual output, and skill tags", () => {
    const [system, user] = buildTraceMessages(base, {
      prompt: "Echo the input",
      skillTags: ["cpp.program_basics.io"]
    });
    expect(system.content).toBe(TRACE_SYSTEM_PROMPT);
    expect(user.content).toContain("Echo the input");
    expect(user.content).toContain("cpp.program_basics.io");
    expect(user.content).toContain("int main(){ return 0; }");
    expect(user.content).toContain("ping");
    expect(user.content).toContain("pong");
    expect(user.content).toContain("Echoes a single word");
  });

  it("instructs the model to be explicit that the trace is approximate and not a debugger", () => {
    expect(TRACE_SYSTEM_PROMPT).toMatch(/approximate/i);
    expect(TRACE_SYSTEM_PROMPT).toMatch(/not real runtime inspection|not a debugger|NOT a debugger/i);
  });

  it("only carries the visible data it is given (no hidden fields invented)", () => {
    const [, user] = buildTraceMessages(
      { itemId: "x", language: "cpp", source: "int main(){}" },
      { prompt: "p", skillTags: [] }
    );
    expect(user.content).not.toContain("Expected output (visible)");
    expect(user.content).not.toContain("Selected visible test");
  });
});
