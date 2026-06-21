import { afterEach, describe, expect, it } from "vitest";
import {
  buildReviewMessages,
  parseReviewResponse,
  reviewCode
} from "@/features/code-lab/code-review-service";
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
  it("includes item prompt, skill tags, code, and failed visible tests", () => {
    const [, user] = buildReviewMessages(
      { itemId: "cpp.program_basics.structure.lesson", source: "int main(){}", lastTestResult: testResult },
      { prompt: "Print Hello", skillTags: ["cpp.program_basics.structure"] }
    );
    expect(user.content).toContain("Print Hello");
    expect(user.content).toContain("cpp.program_basics.structure");
    expect(user.content).toContain("int main(){}");
    expect(user.content).toContain("Greets cppFan");
    expect(user.content).toContain("0/1 hidden");
  });
});

describe("parseReviewResponse", () => {
  it("parses a structured JSON review", () => {
    const review = parseReviewResponse(
      'Sure: {"summary":"Close!","likelyIssue":"Missing newline","nextHint":"Add \\n","relatedSkills":["io"]}'
    );
    expect(review.status).toBe("ok");
    expect(review.likelyIssue).toBe("Missing newline");
    expect(review.relatedSkills).toEqual(["io"]);
  });

  it("falls back to prose as the summary", () => {
    const review = parseReviewResponse("Try printing a newline at the end.");
    expect(review.status).toBe("ok");
    expect(review.summary).toContain("newline");
  });

  it("reports unavailable for empty output", () => {
    expect(parseReviewResponse("   ").status).toBe("unavailable");
  });
});

describe("reviewCode availability", () => {
  it("is unavailable when no AI provider is enabled", async () => {
    process.env.AI_PROVIDER = "groq";
    delete process.env.AI_CHAT_ENABLED;
    const review = await reviewCode(
      { itemId: "cpp.program_basics.structure.lesson", source: "int main(){}" },
      new AbortController().signal
    );
    expect(review.status).toBe("unavailable");
  });

  it("returns feedback with the deterministic fake provider", async () => {
    process.env.AI_PROVIDER = "fake";
    const review = await reviewCode(
      { itemId: "cpp.program_basics.structure.lesson", source: "int main(){}" },
      new AbortController().signal
    );
    expect(review.status).toBe("ok");
    expect(review.message.length).toBeGreaterThan(0);
  });
});
