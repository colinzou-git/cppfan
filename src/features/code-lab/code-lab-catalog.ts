import type { LearningItemCodeLab } from "./code-lab-types";

/**
 * Code Lab metadata attached to existing learning items (#407). This is the
 * client-readable, opt-in payload that drives whether an item renders a Code
 * Lab. It must never contain hidden test inputs/expected outputs — those live
 * server-side in code-lab-hidden-tests.ts. Keeping config here (rather than as
 * new learning-item rows) keeps existing items and seed/DB parity unchanged.
 */
export const codeLabConfigs: Record<string, LearningItemCodeLab> = {
  "cpp.program_basics.structure.lesson": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt:
      "Make the program print exactly `Hello, cppFan!` followed by a newline, then return success from `main`.",
    starterCode: `#include <iostream>

int main() {
  std::cout << "Hello, cppFan!" << "\\n";
  return 0;
}
`,
    visibleTests: [
      {
        name: "Greets cppFan",
        expectedStdout: "Hello, cppFan!\n",
        matcher: "exact"
      }
    ],
    hiddenTestCount: 1,
    skillTags: ["cpp.program_basics.structure"],
    // Supplements the skill-mapped io_basics checklist to demonstrate explicit ids.
    boundaryChecklistIds: ["binary_search"]
  },
  "cpp.program_basics.io.lesson": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt:
      "Read one line of text from standard input and print it back unchanged, followed by a newline.",
    starterCode: `#include <iostream>
#include <string>

int main() {
  std::string line;
  std::getline(std::cin, line);
  std::cout << line << "\\n";
  return 0;
}
`,
    stdin: "ping",
    visibleTests: [
      {
        name: "Echoes a single word",
        stdin: "ping",
        expectedStdout: "ping\n",
        matcher: "exact"
      },
      {
        name: "Echoes another word (trimmed)",
        stdin: "pong",
        expectedStdout: "pong",
        matcher: "trimmed"
      }
    ],
    hiddenTestCount: 1,
    skillTags: ["cpp.program_basics.io"],
    // Demonstrates optional prediction-before-run (#413) without blocking Run.
    predictionMode: "optional"
  },
  "cpp.program_basics.statements_comments.lesson": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt:
      "Print two lines: first `line one`, then `line two`, each ending with a newline.",
    starterCode: `#include <iostream>

int main() {
  std::cout << "line one" << "\\n";
  std::cout << "line two" << "\\n";
  return 0;
}
`,
    visibleTests: [
      {
        name: "Prints both lines",
        expectedStdout: "line one\nline two\n",
        matcher: "exact"
      }
    ],
    skillTags: ["cpp.program_basics.statements_comments"]
  },
  "dsa.arrays.traversal.code_reading": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: "Print the numbers 1, 2, 3 — one per line — by traversing them in order.",
    starterCode: `#include <iostream>

int main() {
  std::cout << "1" << "\\n";
  std::cout << "2" << "\\n";
  std::cout << "3" << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Prints every element", expectedStdout: "1\n2\n3\n", matcher: "exact" },
      { name: "First and last element boundary", expectedStdout: "1\n2\n3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.traversal"]
  },
  // #416 debugging lane: code-capable items whose starter intentionally has the
  // bug the lesson teaches. On the real (Piston) runner the #412 classifier tags
  // the compiler/sanitizer output; the mock still lets the editor run.
  "cpp.tooling.debugging_method.code_first_diagnostic": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt:
      "This program does not compile. Read the FIRST diagnostic, fix the missing semicolon at its line, rebuild, and make it print `ok`.",
    starterCode: `#include <iostream>

int main() {
  std::cout << "ok" << "\\n"
  return 0;
}
`,
    visibleTests: [{ name: "Prints ok after the fix", expectedStdout: "ok\n", matcher: "exact" }],
    skillTags: ["cpp.tooling.debugging_method"]
  },
  "cpp.tooling.sanitizers.code_asan_report": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt:
      "AddressSanitizer reports a heap-buffer-overflow. Find the out-of-bounds index and fix it so the program prints the last element (3).",
    starterCode: `#include <iostream>
#include <vector>

int main() {
  std::vector<int> v = {1, 2, 3};
  std::cout << v[3] << "\\n"; // out of bounds — read the ASan report
  return 0;
}
`,
    visibleTests: [{ name: "Prints the last element", expectedStdout: "3\n", matcher: "exact" }],
    skillTags: ["cpp.tooling.sanitizers"]
  }
};

/**
 * Visible Code Lab config for an item, or null when the item is not code-capable.
 * Pure data — safe to import from client and server code.
 */
export function getCodeLabConfigForItem(itemId: string): LearningItemCodeLab | null {
  const config = codeLabConfigs[itemId];
  return config && config.enabled ? config : null;
}

export function isCodeLabItem(itemId: string): boolean {
  return getCodeLabConfigForItem(itemId) !== null;
}
