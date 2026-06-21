import type { CodeTestCase } from "./code-lab-types";

/**
 * Hidden test cases for code-lab items (#407), keyed by learning-item id. This
 * module is imported only by server route/service code (code-lab-service), never
 * by a client component, so hidden inputs and expected outputs are never shipped
 * to the browser. The public catalog exposes only `hiddenTestCount`; results are
 * summarised without leaking I/O.
 */
const hiddenTests: Record<string, CodeTestCase[]> = {
  "cpp.program_basics.structure.lesson": [
    {
      name: "hidden:exact-greeting",
      expectedStdout: "Hello, cppFan!",
      matcher: "trimmed"
    }
  ],
  "cpp.program_basics.io.lesson": [
    {
      name: "hidden:echo-phrase",
      stdin: "keep it secret",
      expectedStdout: "keep it secret",
      matcher: "trimmed"
    }
  ]
};

export function getHiddenTestsForItem(itemId: string): CodeTestCase[] {
  return hiddenTests[itemId] ?? [];
}
