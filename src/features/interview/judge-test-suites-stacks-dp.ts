import type { JudgeProblemTestCase } from "./judge-test-suites";

type SuiteData = Record<string, { version: number; cases: JudgeProblemTestCase[] }>;

export const STACK_AND_DP_CASES: SuiteData = {
  "iv.stack.steps-to-higher-load": {
    version: 1,
    cases: [
      {
        id: "sample.mixed",
        name: "sample: mixed readings",
        hidden: false,
        category: "sample",
        stdin: "5\n3 1 4 1 5\n",
        expectedStdout: "2 1 2 1 0\n"
      },
      {
        id: "sample.decreasing",
        name: "sample: strictly decreasing",
        hidden: false,
        category: "sample",
        stdin: "3\n5 4 3\n",
        expectedStdout: "0 0 0\n"
      },
      {
        id: "hidden.increasing",
        name: "strictly increasing",
        hidden: true,
        category: "boundary",
        stdin: "5\n1 2 3 4 5\n",
        expectedStdout: "1 1 1 1 0\n"
      },
      {
        id: "hidden.plateau",
        name: "equal readings are not higher",
        hidden: true,
        category: "adversarial",
        stdin: "6\n4 4 4 5 5 6\n",
        expectedStdout: "3 2 1 2 1 0\n"
      }
    ]
  },
  "iv.stack.min-stack-design": {
    version: 1,
    cases: [
      {
        id: "sample.lifecycle",
        name: "sample: push, min, and pop lifecycle",
        hidden: false,
        category: "sample",
        stdin: "9\npush 5\npush 2\nmin\npush 7\nmin\npop\nmin\npop\nmin\n",
        expectedStdout: "2\n2\n2\n5\n"
      },
      {
        id: "sample.top",
        name: "sample: top and minimum",
        hidden: false,
        category: "sample",
        stdin: "5\npush 9\npush 4\ntop\nmin\npop\n",
        expectedStdout: "4\n4\n"
      },
      {
        id: "hidden.duplicate_minima",
        name: "duplicate minima survive one pop",
        hidden: true,
        category: "adversarial",
        stdin: "8\npush 3\npush 1\npush 1\nmin\npop\nmin\npop\nmin\n",
        expectedStdout: "1\n1\n3\n"
      },
      {
        id: "hidden.negative",
        name: "negative values",
        hidden: true,
        category: "edge_case",
        stdin: "6\npush -2\npush -8\nmin\ntop\npop\nmin\n",
        expectedStdout: "-8\n-8\n-2\n"
      }
    ]
  },
  "iv.queue.window-peak-load": {
    version: 1,
    cases: [
      {
        id: "sample.standard",
        name: "sample: rolling peaks",
        hidden: false,
        category: "sample",
        stdin: "8 3\n1 3 -1 -3 5 3 6 7\n",
        expectedStdout: "3 3 5 5 6 7\n"
      },
      {
        id: "sample.decreasing",
        name: "sample: decreasing readings",
        hidden: false,
        category: "sample",
        stdin: "3 2\n4 2 1\n",
        expectedStdout: "4 2\n"
      },
      {
        id: "hidden.unit_window",
        name: "window size one",
        hidden: true,
        category: "boundary",
        stdin: "4 1\n8 -1 8 3\n",
        expectedStdout: "8 -1 8 3\n"
      },
      {
        id: "hidden.full_window",
        name: "one full-length window",
        hidden: true,
        category: "boundary",
        stdin: "5 5\n-4 -2 -9 -1 -7\n",
        expectedStdout: "-1\n"
      }
    ]
  },
  "iv.dp.ways-to-reach-step": {
    version: 1,
    cases: [
      {
        id: "sample.four",
        name: "sample: four steps",
        hidden: false,
        category: "sample",
        stdin: "4\n",
        expectedStdout: "5\n"
      },
      {
        id: "sample.one",
        name: "sample: one step",
        hidden: false,
        category: "sample",
        stdin: "1\n",
        expectedStdout: "1\n"
      },
      {
        id: "hidden.zero",
        name: "zero steps has the empty way",
        hidden: true,
        category: "edge_case",
        stdin: "0\n",
        expectedStdout: "1\n"
      },
      {
        id: "hidden.int64",
        name: "large answer requires 64-bit",
        hidden: true,
        category: "overflow_guard",
        stdin: "50\n",
        expectedStdout: "20365011074\n"
      }
    ]
  },
  "iv.dp.max-contiguous-flow": {
    version: 1,
    cases: [
      {
        id: "sample.mixed",
        name: "sample: mixed flow",
        hidden: false,
        category: "sample",
        stdin: "9\n-2 1 -3 4 -1 2 1 -5 4\n",
        expectedStdout: "6\n"
      },
      {
        id: "sample.all_negative",
        name: "sample: all negative",
        hidden: false,
        category: "sample",
        stdin: "3\n-3 -1 -2\n",
        expectedStdout: "-1\n"
      },
      {
        id: "hidden.single",
        name: "single reading",
        hidden: true,
        category: "edge_case",
        stdin: "1\n-7\n",
        expectedStdout: "-7\n"
      },
      {
        id: "hidden.int64_sum",
        name: "sum exceeds 32-bit",
        hidden: true,
        category: "overflow_guard",
        stdin: "3\n2000000000 2000000000 -1\n",
        expectedStdout: "4000000000\n"
      }
    ]
  },
  "iv.dp.fewest-coins": {
    version: 1,
    cases: [
      {
        id: "sample.possible",
        name: "sample: possible amount",
        hidden: false,
        category: "sample",
        stdin: "3 6\n1 3 4\n",
        expectedStdout: "2\n"
      },
      {
        id: "sample.impossible",
        name: "sample: impossible amount",
        hidden: false,
        category: "sample",
        stdin: "1 3\n2\n",
        expectedStdout: "-1\n"
      },
      {
        id: "hidden.zero_amount",
        name: "zero amount",
        hidden: true,
        category: "edge_case",
        stdin: "3 0\n2 5 9\n",
        expectedStdout: "0\n"
      },
      {
        id: "hidden.greedy_trap",
        name: "greedy largest-first is suboptimal",
        hidden: true,
        category: "adversarial",
        stdin: "3 12\n1 6 10\n",
        expectedStdout: "2\n"
      }
    ]
  },
  "iv.backtracking.subset-sum-count": {
    version: 1,
    cases: [
      {
        id: "sample.two_subsets",
        name: "sample: two matching subsets",
        hidden: false,
        category: "sample",
        stdin: "4 7\n2 3 5 7\n",
        expectedStdout: "2\n"
      },
      {
        id: "sample.direct_and_pair",
        name: "sample: direct value and pair",
        hidden: false,
        category: "sample",
        stdin: "3 3\n1 2 3\n",
        expectedStdout: "2\n"
      },
      {
        id: "hidden.empty_subset",
        name: "capacity zero counts the empty subset",
        hidden: true,
        category: "edge_case",
        stdin: "3 0\n4 5 6\n",
        expectedStdout: "1\n"
      },
      {
        id: "hidden.no_match",
        name: "no subset reaches capacity",
        hidden: true,
        category: "boundary",
        stdin: "4 2\n3 5 7 11\n",
        expectedStdout: "0\n"
      }
    ]
  }
};
