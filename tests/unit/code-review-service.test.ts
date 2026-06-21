import { afterEach, describe, expect, it } from "vitest";
import { buildReviewMessages, reviewCode } from "@/features/code-lab/code-review-service";
import { CODE_ERROR_TAGS } from "@/features/code-lab/code-error-tags";
import type { CodeTestResult } from "@/features/code-lab/code-lab-types";

const originalProvider = process.env.AI_PROVIDER;
const originalEnabled = process.env.AI_CHAT_ENABLED;

afterEach(() => {
  if (originalProvider === undefined) delete process.env.AI_PROVIDER;
  else process.env.AI_PROVIDER = originalProvider;
  if (originalEnabled === undefined) delete process.env.AI_CHAT_ENABLED;
  else process.env.AI_CHAT_ENABLED = originalEnabled;
});

const testResult: CodeTestResult = {
  status: "ok",
  passed: 1,
  total: 2,
  visible: [
    { name: "Greets cppFan", passed: false, expectedStdout: "Hi\n", actualStdout: "Bye\n", matcher: "exact", hidden: false }
  ],
  hiddenPassed: 0,
  hiddenTotal: 1,
  compileOutput: "",
  provider: "mock",
  simulated: true
};

describe("buildReviewMessages", () => {
  it("includes item prompt, skill tags, code, failed visible tests, and the allowed tag list", () => {
    const [system, user] = buildReviewMessages(
      { itemId: "cpp.program_basics.structure.lesson", source: "int main(){}", lastTestResult: testResult },
      { prompt: "Print Hello", skillTags: ["cpp.program_basics.structure"] }
    );
    expect(system.content).toContain(CODE_ERROR_TAGS[0]);
    expect(system.content).toMatch(/JSON/i);
    expect(user.content).toContain("Print Hello");
    expect(user.content).toContain("cpp.program_basics.structure");
    expect(user.content).toContain("int main(){}");
    expect(user.content).toContain("Greets cppFan");
    expect(user.content).toContain("0/1 hidden");
  });
});

describe("reviewCode availability", () => {
  it("is unavailable when no AI provider is enabled", async () => {
    process.env.AI_PROVIDER = "groq";
    delete process.env.AI_CHAT_ENABLED;
    const feedback = await reviewCode(
      { itemId: "cpp.program_basics.structure.lesson", source: "int main(){}" },
      new AbortController().signal
    );
    expect(feedback.status).toBe("unavailable");
    expect(feedback.evidenceStrength).toBe("weak_ai_inference");
  });

  it("returns structured weak-evidence feedback with the deterministic fake provider", async () => {
    process.env.AI_PROVIDER = "fake";
    const feedback = await reviewCode(
      { itemId: "cpp.program_basics.structure.lesson", source: "int main(){}" },
      new AbortController().signal
    );
    // The fake provider returns prose, so the parser yields a graceful fallback.
    expect(["ok", "invalid"]).toContain(feedback.status);
    expect(feedback.learnerMessage.length).toBeGreaterThan(0);
    expect(feedback.evidenceStrength).toBe("weak_ai_inference");
  });
});
