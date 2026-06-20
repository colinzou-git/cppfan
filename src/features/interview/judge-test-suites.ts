// Server-side judge fixtures for selected interview problems (#178). Keep this
// module out of client components: raw stdin/expected values are worker-only,
// while JudgeWorkerTest metadata is safe to enqueue.
import { createHash } from "node:crypto";
import { DEFAULT_JUDGE_LIMITS } from "./judge-contract";
import type { JudgeWorkerTest } from "../../../services/interview-judge/protocol";
import type { JudgeFixture } from "../../../services/interview-judge/worker-runner";

export type JudgeProblemTestCase = {
  id: string;
  name: string;
  hidden: boolean;
  category: string;
  stdin: string;
  expectedStdout: string;
};

export type JudgeProblemSuite = {
  problemId: string;
  version: number;
  visibleTests: JudgeWorkerTest[];
  hiddenTests: JudgeWorkerTest[];
  fixtures: JudgeFixture[];
};

const CASES: Record<string, { version: number; cases: JudgeProblemTestCase[] }> = {
  "iv.prefix.balance-returns-to-zero": {
    version: 1,
    cases: [
      {
        id: "sample.return_twice",
        name: "sample: returns twice",
        hidden: false,
        category: "sample",
        stdin: "4\n1 -1 2 -2\n",
        expectedStdout: "2\n"
      },
      {
        id: "sample.single_return",
        name: "sample: single return",
        hidden: false,
        category: "sample",
        stdin: "4\n5 -2 -3 4\n",
        expectedStdout: "1\n"
      },
      {
        id: "hidden.all_zero",
        name: "all zero deltas",
        hidden: true,
        category: "edge_case",
        stdin: "3\n0 0 0\n",
        expectedStdout: "3\n"
      },
      {
        id: "hidden.int64_accumulator",
        name: "64-bit accumulator",
        hidden: true,
        category: "overflow_guard",
        stdin: "3\n10000000000 -10000000000 7\n",
        expectedStdout: "1\n"
      }
    ]
  },
  "iv.bsearch.insert-position": {
    version: 1,
    cases: [
      {
        id: "sample.middle",
        name: "sample: middle insertion",
        hidden: false,
        category: "sample",
        stdin: "4\n1 3 5 7\n4\n",
        expectedStdout: "2\n"
      },
      {
        id: "sample.end",
        name: "sample: insert at end",
        hidden: false,
        category: "sample",
        stdin: "4\n1 3 5 7\n8\n",
        expectedStdout: "4\n"
      },
      {
        id: "hidden.duplicates_first",
        name: "duplicates return first index",
        hidden: true,
        category: "duplicates",
        stdin: "3\n2 2 2\n2\n",
        expectedStdout: "0\n"
      },
      {
        id: "hidden.empty_array",
        name: "empty array insertion",
        hidden: true,
        category: "edge_case",
        stdin: "0\n\n42\n",
        expectedStdout: "0\n"
      }
    ]
  },
  "iv.bsearch.rotated-min": {
    version: 1,
    cases: [
      {
        id: "sample.rotated",
        name: "sample: rotated array",
        hidden: false,
        category: "sample",
        stdin: "7\n4 5 6 7 0 1 2\n",
        expectedStdout: "0\n"
      },
      {
        id: "sample.unrotated",
        name: "sample: already sorted",
        hidden: false,
        category: "sample",
        stdin: "4\n11 13 15 17\n",
        expectedStdout: "11\n"
      },
      {
        id: "hidden.single",
        name: "single element",
        hidden: true,
        category: "edge_case",
        stdin: "1\n-9\n",
        expectedStdout: "-9\n"
      },
      {
        id: "hidden.last_pivot",
        name: "pivot at final element",
        hidden: true,
        category: "boundary",
        stdin: "5\n2 3 4 5 1\n",
        expectedStdout: "1\n"
      }
    ]
  },
  "iv.bsearch.peak-index": {
    version: 1,
    cases: [
      {
        id: "sample.interior",
        name: "sample: interior peak",
        hidden: false,
        category: "sample",
        stdin: "3\n1 3 2\n",
        expectedStdout: "1\n"
      },
      {
        id: "sample.right_peak",
        name: "sample: peak before descending tail",
        hidden: false,
        category: "sample",
        stdin: "4\n1 2 3 1\n",
        expectedStdout: "2\n"
      },
      {
        id: "hidden.single",
        name: "single element is a peak",
        hidden: true,
        category: "edge_case",
        stdin: "1\n42\n",
        expectedStdout: "0\n"
      },
      {
        id: "hidden.increasing",
        name: "strictly increasing ends at a peak",
        hidden: true,
        category: "boundary",
        stdin: "5\n1 2 3 4 5\n",
        expectedStdout: "4\n"
      },
      {
        id: "hidden.decreasing",
        name: "strictly decreasing starts at a peak",
        hidden: true,
        category: "boundary",
        stdin: "5\n9 7 5 3 1\n",
        expectedStdout: "0\n"
      }
    ]
  },
  "iv.bsearch.min-rate-before-deadline": {
    version: 1,
    cases: [
      {
        id: "sample.multiple_queues",
        name: "sample: multiple queues",
        hidden: false,
        category: "sample",
        stdin: "3 6\n4 5 9\n",
        expectedStdout: "4\n"
      },
      {
        id: "sample.single_queue",
        name: "sample: single queue",
        hidden: false,
        category: "sample",
        stdin: "1 2\n10\n",
        expectedStdout: "5\n"
      },
      {
        id: "hidden.deadline_equals_count",
        name: "deadline equals queue count",
        hidden: true,
        category: "boundary",
        stdin: "4 4\n3 8 2 6\n",
        expectedStdout: "8\n"
      },
      {
        id: "hidden.int64_hours",
        name: "large values require 64-bit hour sum",
        hidden: true,
        category: "overflow_guard",
        stdin: "3 3000000000\n1000000000 1000000000 1000000000\n",
        expectedStdout: "1\n"
      }
    ]
  },
  "iv.bsearch.balance-link-load": {
    version: 1,
    cases: [
      {
        id: "sample.three_links",
        name: "sample: split across three links",
        hidden: false,
        category: "sample",
        stdin: "6 3\n2 3 1 2 4 3\n",
        expectedStdout: "6\n"
      },
      {
        id: "sample.one_per_link",
        name: "sample: one item per link",
        hidden: false,
        category: "sample",
        stdin: "3 3\n5 5 5\n",
        expectedStdout: "5\n"
      },
      {
        id: "hidden.single_link",
        name: "one link receives the total",
        hidden: true,
        category: "boundary",
        stdin: "4 1\n2 7 1 8\n",
        expectedStdout: "18\n"
      },
      {
        id: "hidden.large_sum",
        name: "total exceeds 32-bit",
        hidden: true,
        category: "overflow_guard",
        stdin: "3 2\n2000000000 2000000000 2000000000\n",
        expectedStdout: "4000000000\n"
      },
      {
        id: "hidden.zeros",
        name: "zero demands preserve contiguous partition semantics",
        hidden: true,
        category: "adversarial",
        stdin: "5 3\n0 0 9 0 0\n",
        expectedStdout: "9\n"
      }
    ]
  },
  "iv.stack.balanced-delimiters": {
    version: 1,
    cases: [
      {
        id: "sample.balanced",
        name: "sample: balanced delimiters",
        hidden: false,
        category: "sample",
        stdin: "()[]{}\n",
        expectedStdout: "true\n"
      },
      {
        id: "sample.wrong_nesting",
        name: "sample: wrong nesting",
        hidden: false,
        category: "sample",
        stdin: "([)]\n",
        expectedStdout: "false\n"
      },
      {
        id: "hidden.empty",
        name: "empty string",
        hidden: true,
        category: "edge_case",
        stdin: "\n",
        expectedStdout: "true\n"
      },
      {
        id: "hidden.lone_closer",
        name: "lone closer",
        hidden: true,
        category: "edge_case",
        stdin: ")\n",
        expectedStdout: "false\n"
      }
    ]
  }
};

function fixtureHash(test: JudgeProblemTestCase): string {
  return createHash("sha256").update(`${test.stdin}\0${test.expectedStdout}`).digest("hex");
}

function toWorkerTest(test: JudgeProblemTestCase): JudgeWorkerTest {
  return {
    id: test.id,
    name: test.name,
    hidden: test.hidden,
    category: test.category,
    fixtureHash: fixtureHash(test)
  };
}

function toFixture(test: JudgeProblemTestCase): JudgeFixture {
  return {
    testId: test.id,
    stdin: test.stdin,
    expectedStdout: test.expectedStdout
  };
}

export function getJudgeProblemSuite(problemId: string): JudgeProblemSuite | null {
  const suite = CASES[problemId];
  if (!suite || suite.cases.length > DEFAULT_JUDGE_LIMITS.maxTests) {
    return null;
  }
  return {
    problemId,
    version: suite.version,
    visibleTests: suite.cases.filter((test) => !test.hidden).map(toWorkerTest),
    hiddenTests: suite.cases.filter((test) => test.hidden).map(toWorkerTest),
    fixtures: suite.cases.map(toFixture)
  };
}

export function judgeSupportedProblemIds(): string[] {
  return Object.keys(CASES).sort();
}
