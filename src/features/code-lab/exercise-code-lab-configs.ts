import type { LearningItemCodeLab } from "./code-lab-types";

/**
 * Exercise-level Code Lab configs (#440), keyed by write-code EXERCISE id. Each
 * write-code exercise is an atomic test-backed task, so it gets its own Code Lab
 * at /lab/<exerciseId> (distinct from the related project lab). The current Code
 * Lab runner executes one source string, so these are single-file stdin/stdout
 * harnesses that preserve the spirit of the original header-based exercises.
 * Pure data, client-readable — never put hidden test I/O here. `skillTags`
 * includes each exercise's skillIds so attempt evidence maps to the right skills.
 */
export const EXERCISE_CODE_LAB_CONFIGS: Record<string, LearningItemCodeLab> = {
  "dsa-two-sum-sorted": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Implement two-sum for a sorted array.

Requirements:
1. Read n, then n sorted integers, then target.
2. Print the 0-based indices of two values that sum to target.
3. If no pair exists, print -1 -1.
4. Use the two-pointer technique (O(n), no nested loops).

Input format:
- First line: n
- Second line: n sorted integers
- Third line: target

Output format:
- Two indices separated by a space, then a newline.

Expected solution outline:
- low = 0, high = n - 1.
- Move low right when the sum is too small, high left when too large.
- Stop when low >= high.

AI evaluation rubric:
- O(n) two-pointer logic, no nested loops.
- Handles no-solution and negative numbers.`,
    stdin: "5\n1 2 4 6 9\n10\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

pair<int, int> twoSumSorted(const vector<int>& nums, int target) {
  // TODO: implement two-pointer search
  return {-1, -1};
}

int main() {
  int n;
  cin >> n;
  vector<int> nums(n);
  for (int i = 0; i < n; ++i) cin >> nums[i];
  int target;
  cin >> target;
  auto [i, j] = twoSumSorted(nums, target);
  cout << i << " " << j << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Finds middle pair", stdin: "5\n1 2 4 6 9\n10\n", expectedStdout: "2 3\n", matcher: "exact" },
      { name: "Reports no solution", stdin: "3\n1 2 3\n100\n", expectedStdout: "-1 -1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.two_pointers", "dsa.complexity.big_o"]
  },
  "raii-scoped-array": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a scoped (RAII) integer array harness.

Requirements:
1. Read n, then n integers.
2. Store them in a heap buffer owned by a ScopedArray that frees in its destructor.
3. Print "size=<n> sum=<total>".

Input format:
- First line: n
- Second line: n integers

Output format:
- One line: size=<n> sum=<total>

Expected solution outline:
- ScopedArray acquires the buffer in its constructor and releases it in its destructor.
- No manual delete[] in main; ownership is RAII.

AI evaluation rubric:
- Resource freed exactly once via the destructor (RAII).
- No leaks or double-free; clear ownership boundary.`,
    stdin: "3\n1 2 3\n",
    starterCode: `#include <iostream>

class ScopedArray {
  // TODO: own an int buffer; free it in the destructor (RAII).
public:
  explicit ScopedArray(int /*n*/) {}
  int& operator[](int /*i*/) { static int x; return x; }
  ~ScopedArray() {}
};

int main() {
  int n;
  std::cin >> n;
  ScopedArray arr(n);
  long long sum = 0;
  for (int i = 0; i < n; ++i) {
    int v;
    std::cin >> v;
    arr[i] = v;
    sum += v;
  }
  std::cout << "size=" << n << " sum=" << sum << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Sums three values", stdin: "3\n1 2 3\n", expectedStdout: "size=3 sum=6\n", matcher: "exact" },
      { name: "Empty array", stdin: "0\n", expectedStdout: "size=0 sum=0\n", matcher: "exact" }
    ],
    skillTags: ["cpp.raii.resource_lifetime", "cpp.raii.destructor_cleanup", "cpp.value_semantics.move"]
  },
  "stl-text-stats": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Compute text statistics.

Requirements:
1. Read all whitespace-separated words from stdin.
2. Count words and tally frequencies (case-sensitive) in a std::map.
3. Print "words=<count> top=<word>" where top is the most frequent word
   (ties broken by smallest word in map/lexicographic order).

Output format:
- One line: words=<count> top=<word>

Expected solution outline:
- Read words with >> into a map<string,int>.
- Track total count and the max-frequency word deterministically.

AI evaluation rubric:
- Correct counting and deterministic tie-breaking.
- Uses STL map/algorithms cleanly.`,
    stdin: "the cat the dog the\n",
    starterCode: `#include <iostream>
#include <map>
#include <string>

int main() {
  // TODO: read words, count them, print "words=<n> top=<word>".
  return 0;
}
`,
    visibleTests: [
      { name: "Most frequent word", stdin: "the cat the dog the\n", expectedStdout: "words=5 top=the\n", matcher: "exact" },
      { name: "Single word", stdin: "hello\n", expectedStdout: "words=1 top=hello\n", matcher: "exact" }
    ],
    skillTags: ["cpp.stl.map", "cpp.stl.algorithms", "dsa.strings.parsing"]
  },
  "trie-autocomplete": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a trie-backed autocomplete.

Requirements:
1. Read a word count N, then N lowercase words, then one prefix query.
2. Print every distinct word with that prefix, one per line, in sorted order.
3. Print nothing if there are no matches.

Input format:
- First line: N
- Next N lines: words
- Last line: prefix

Expected solution outline:
- Insert words into a trie (or sorted set).
- Walk to the prefix node and enumerate completions deterministically.

AI evaluation rubric:
- Correct prefix matching (prefix, not substring), including duplicates.
- Deterministic, sorted output.`,
    stdin: "4\ncar\ncart\ncarbon\ndog\ncar\n",
    starterCode: `#include <iostream>
#include <set>
#include <string>

int main() {
  // TODO: read words and print completions of the query prefix, sorted.
  return 0;
}
`,
    visibleTests: [
      {
        name: "Lists completions sorted",
        stdin: "4\ncar\ncart\ncarbon\ndog\ncar\n",
        expectedStdout: "car\ncarbon\ncart\n",
        matcher: "trimmed"
      }
    ],
    skillTags: ["dsa.strings.trie", "dsa.strings.char_frequency", "dsa.strings.case_handling"]
  },
  "tooling-status-parser": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Parse a status line.

Requirements:
1. Read one line: "<STATUS> <code> <message...>".
2. STATUS is OK or ERROR; code is a non-negative integer; message is the rest.
3. Print "ok=<1|0> code=<code> msg=<message>".
4. On malformed input (missing message or negative code) print "ok=0 code=-1 msg=malformed".

Output format:
- One line as specified above.

Expected solution outline:
- Read the status word and code, then getline the remaining message (drop one leading space).
- Validate before trusting parsed values.

AI evaluation rubric:
- Correct happy-path parse and malformed handling.
- Preserves spaces inside the message; rejects negative codes.`,
    stdin: "OK 200 all systems go\n",
    starterCode: `#include <iostream>
#include <string>

int main() {
  // TODO: parse "<STATUS> <code> <message>" and print the normalized result.
  return 0;
}
`,
    visibleTests: [
      { name: "Parses OK status", stdin: "OK 200 all systems go\n", expectedStdout: "ok=1 code=200 msg=all systems go\n", matcher: "exact" },
      { name: "Parses ERROR status", stdin: "ERROR 503 down\n", expectedStdout: "ok=0 code=503 msg=down\n", matcher: "exact" }
    ],
    skillTags: [
      "cpp.tooling.debugging_method",
      "cpp.tooling.unit_testing",
      "cpp.tooling.regression_testing",
      "cpp.tooling.warnings",
      "cpp.tooling.sanitizers",
      "cpp.tooling.cmake"
    ]
  },
  "filesystem-inventory": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Summarize a filesystem inventory (driven by a text manifest for testability).

Requirements:
1. Read lines of "<path> <sizeBytes>" until EOF.
2. Count regular files and total bytes.
3. Print "files=<count> bytes=<total>".

Output format:
- One line: files=<count> bytes=<total>

Expected solution outline:
- getline each manifest entry; split path and size.
- Validate the size token before adding; accumulate totals.

AI evaluation rubric:
- Robust parsing and stream-state validation.
- Correct aggregate counts; handles empty input (files=0 bytes=0).`,
    stdin: "a/b.txt 100\nc.cpp 250\n",
    starterCode: `#include <iostream>
#include <string>

int main() {
  // TODO: read "<path> <size>" lines and print "files=<n> bytes=<total>".
  return 0;
}
`,
    visibleTests: [
      { name: "Counts files and bytes", stdin: "a/b.txt 100\nc.cpp 250\n", expectedStdout: "files=2 bytes=350\n", matcher: "exact" },
      { name: "Empty manifest", stdin: "", expectedStdout: "files=0 bytes=0\n", matcher: "exact" }
    ],
    skillTags: ["cpp.utilities.filesystem", "cpp.utilities.file_io", "cpp.utilities.stream_validation"]
  },
  "concurrency-task-queue": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Model a bounded task queue (single-threaded for deterministic tests).

Requirements:
1. Read capacity C, then commands: "push <n>", "pop", "close".
2. push enqueues if not full and not closed; pop dequeues FIFO and prints the value.
3. After close, reject further pushes; pops still drain remaining items.

Output format:
- One line per successful pop with the popped value.

Expected solution outline:
- Model the queue with a deque plus a capacity and closed flag.
- Apply commands in order; enforce capacity and closed semantics.

AI evaluation rubric:
- Correct FIFO order and capacity/closed handling.
- No lost or duplicated items.`,
    stdin: "2\npush 1\npush 2\npop\npop\nclose\n",
    starterCode: `#include <deque>
#include <iostream>
#include <string>

int main() {
  // TODO: process push/pop/close over a bounded FIFO queue.
  return 0;
}
`,
    visibleTests: [
      { name: "FIFO push/pop", stdin: "2\npush 1\npush 2\npop\npop\nclose\n", expectedStdout: "1\n2\n", matcher: "trimmed" }
    ],
    skillTags: [
      "cpp.concurrency.threads",
      "cpp.concurrency.mutexes",
      "cpp.concurrency.condition_variables",
      "cpp.concurrency.deadlock",
      "cpp.concurrency.shared_state_design"
    ]
  },
  "graph-maze-shortest-path": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Find the shortest path through a maze with BFS.

Requirements:
1. Read R and C, then R lines of a grid with S (start), G (goal), '.' open, '#' wall.
2. BFS from S over 4-directional moves through open cells.
3. Print "steps <k>" for the shortest path length, or "no route" if unreachable.

Output format:
- One line: "steps <k>" or "no route".

Expected solution outline:
- Parse the grid; find S and G.
- BFS with a queue and a visited/distance grid; respect walls and bounds.

AI evaluation rubric:
- Correct BFS shortest distance; handles unreachable and S==G.`,
    stdin: "1 3\nS.G\n",
    starterCode: `#include <iostream>
#include <queue>
#include <string>
#include <vector>

int main() {
  // TODO: parse the grid, BFS from S, print "steps <k>" or "no route".
  return 0;
}
`,
    visibleTests: [
      { name: "Shortest steps on a corridor", stdin: "1 3\nS.G\n", expectedStdout: "steps 2", matcher: "contains" },
      { name: "Start equals goal not present -> no route", stdin: "1 3\nS#G\n", expectedStdout: "no route", matcher: "contains" }
    ],
    skillTags: ["dsa.graphs.bfs", "dsa.graphs.connected_components", "dsa.graphs.shortest_path"]
  },
  "math-combination-generator": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Count combinations.

Requirements:
1. Read two integers n and k.
2. Print C(n, k) (the binomial coefficient).
3. Print 0 when k < 0 or k > n.

Output format:
- One line: the integer C(n, k).

Expected solution outline:
- Use Pascal's recurrence C(n,k)=C(n-1,k-1)+C(n-1,k) with base cases k=0 and k=n,
  or a multiplicative formula with overflow care.

AI evaluation rubric:
- Correct counting, including impossible counts (0) and edge cases (k=0, k=n).`,
    stdin: "5 2\n",
    starterCode: `#include <iostream>

int main() {
  // TODO: read n and k, print C(n, k).
  return 0;
}
`,
    visibleTests: [
      { name: "C(5,2)=10", stdin: "5 2\n", expectedStdout: "10", matcher: "trimmed" },
      { name: "Impossible count", stdin: "3 5\n", expectedStdout: "0", matcher: "trimmed" }
    ],
    skillTags: ["dsa.math.counting_principle", "dsa.math.generate_combinations", "dsa.math.bitmask_techniques"]
  },
  "loops-number-summary": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Summarize a list of integers in one pass.

Requirements:
1. Read n, then n integers.
2. In a single loop, track the count, sum, minimum, maximum, and how many are even.
3. Print exactly: count=<c> sum=<s> min=<mn> max=<mx> even=<e>
4. For n == 0, print count=0 sum=0 min=0 max=0 even=0.

Input format:
- First line: n
- Second line: n integers (absent when n == 0)

Output format:
- One line: count=<c> sum=<s> min=<mn> max=<mx> even=<e>

Expected solution outline:
- Seed min and max from the first value, then update every field as you read.

AI evaluation rubric:
- Single pass, correct empty-input handling, even count via v % 2 == 0.`,
    stdin: "5\n1 2 3 4 5\n",
    starterCode: `#include <iostream>
using namespace std;

int main() {
  int n;
  cin >> n;
  long long sum = 0;
  int count = 0, mn = 0, mx = 0, even = 0;
  for (int i = 0; i < n; ++i) {
    int v;
    cin >> v;
    // TODO: update count, sum, mn, mx, even in this single pass.
    (void)v;
  }
  cout << "count=" << count << " sum=" << sum << " min=" << mn
       << " max=" << mx << " even=" << even << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic list", stdin: "5\n1 2 3 4 5\n", expectedStdout: "count=5 sum=15 min=1 max=5 even=2\n", matcher: "exact" },
      { name: "Handles negatives", stdin: "3\n-5 -2 3\n", expectedStdout: "count=3 sum=-4 min=-5 max=3 even=1\n", matcher: "exact" },
      { name: "Empty input", stdin: "0\n", expectedStdout: "count=0 sum=0 min=0 max=0 even=0\n", matcher: "exact" }
    ],
    skillTags: ["cpp.control_flow.loops", "cpp.control_flow.loop_invariants", "dsa.arrays.traversal"]
  },
  "functions-temperature-converter": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Convert a Celsius temperature to Fahrenheit using a dedicated function.

Requirements:
1. Read one Celsius value (a real number).
2. Implement celsius_to_fahrenheit(c) = c * 9 / 5 + 32 as its own function.
3. Print exactly: F=<value> with one digit after the decimal point.

Input format:
- One line: a Celsius temperature.

Output format:
- One line: F=<fahrenheit rounded to 1 decimal>

Expected solution outline:
- Use floating-point division (9.0 / 5.0) inside a small named function.

AI evaluation rubric:
- Correct formula, function decomposition, no integer division.`,
    stdin: "100\n",
    starterCode: `#include <iostream>
#include <cstdio>
using namespace std;

double celsius_to_fahrenheit(double c) {
  // TODO: return c * 9 / 5 + 32 using floating-point division.
  (void)c;
  return 0.0;
}

int main() {
  double c;
  cin >> c;
  printf("F=%.1f\\n", celsius_to_fahrenheit(c));
  return 0;
}
`,
    visibleTests: [
      { name: "Freezing point", stdin: "0\n", expectedStdout: "F=32.0\n", matcher: "exact" },
      { name: "Boiling point", stdin: "100\n", expectedStdout: "F=212.0\n", matcher: "exact" },
      { name: "Minus forty", stdin: "-40\n", expectedStdout: "F=-40.0\n", matcher: "exact" }
    ],
    skillTags: ["cpp.functions.basics", "cpp.functions.decomposition", "cpp.values_types.conversions"]
  },
  "getline-contact-parser": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Parse a single "Name, email, phone" line.

Requirements:
1. Read the whole line with getline.
2. Split it on commas into exactly three fields and trim surrounding spaces.
3. If there are three non-empty fields and the email contains '@', print:
   OK <name>|<email>|<phone>
4. Otherwise print: INVALID

Input format:
- One line, comma-separated.

Output format:
- Either "OK <name>|<email>|<phone>" or "INVALID".

Expected solution outline:
- Trim with find_first_not_of / find_last_not_of; validate field count, non-empty, and '@'.

AI evaluation rubric:
- Correct trimming, exact field-count check, '@' validation.`,
    stdin: "Ada Lovelace,ada@math.org,555-0100\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

string trim(const string& s) {
  const string ws = " \\t\\r\\n";
  auto b = s.find_first_not_of(ws);
  if (b == string::npos) return "";
  auto e = s.find_last_not_of(ws);
  return s.substr(b, e - b + 1);
}

int main() {
  string line;
  getline(cin, line);
  // TODO: split on ',', trim fields, validate, then print OK ... or INVALID.
  cout << "INVALID\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Clean line", stdin: "Ada Lovelace,ada@math.org,555-0100\n", expectedStdout: "OK Ada Lovelace|ada@math.org|555-0100\n", matcher: "exact" },
      { name: "Trims spaces", stdin: "  Grace , grace@x.com , 555 \n", expectedStdout: "OK Grace|grace@x.com|555\n", matcher: "exact" },
      { name: "Rejects bad email", stdin: "Al,not-email,5\n", expectedStdout: "INVALID\n", matcher: "exact" }
    ],
    skillTags: ["cpp.utilities.getline_input", "cpp.utilities.stream_validation", "dsa.strings.parsing_edge_cases"]
  },
  "references-swap-clamp": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Swap two values, then clamp each into a range, using reference parameters.

Requirements:
1. Read four integers: a, b, lo, hi.
2. swap_ints(a, b) exchanges them through references.
3. clamp_in_place(x, lo, hi) pins x into [lo, hi] through its reference.
4. Print exactly: a=<a> b=<b> after swapping then clamping both.

Input format:
- One line: a b lo hi

Output format:
- One line: a=<a> b=<b>

Expected solution outline:
- Swap first, then clamp each value into [lo, hi].

AI evaluation rubric:
- Reference-based swap, correct clamp order, no copies returned.`,
    stdin: "99 -20 -5 5\n",
    starterCode: `#include <iostream>
using namespace std;

void swap_ints(int& a, int& b) {
  // TODO: exchange a and b through their references.
  (void)a; (void)b;
}

void clamp_in_place(int& x, int lo, int hi) {
  // TODO: pin x into [lo, hi].
  (void)x; (void)lo; (void)hi;
}

int main() {
  int a, b, lo, hi;
  cin >> a >> b >> lo >> hi;
  swap_ints(a, b);
  clamp_in_place(a, lo, hi);
  clamp_in_place(b, lo, hi);
  cout << "a=" << a << " b=" << b << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Swap only", stdin: "3 8 0 10\n", expectedStdout: "a=8 b=3\n", matcher: "exact" },
      { name: "Swap then clamp both", stdin: "99 -20 -5 5\n", expectedStdout: "a=-5 b=5\n", matcher: "exact" },
      { name: "Clamp high side", stdin: "3 8 0 5\n", expectedStdout: "a=5 b=3\n", matcher: "exact" }
    ],
    skillTags: ["cpp.references.references", "cpp.references.parameter_passing", "cpp.references.const_correctness"]
  },
  "const-report-statistics": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Report statistics over a read-only vector of numbers.

Requirements:
1. Read n, then n real numbers into a vector.
2. Compute mean, min, max, and range (= max - min) without modifying the vector.
3. Print exactly: mean=<m> min=<mn> max=<mx> range=<r>, each with one decimal.

Input format:
- First line: n
- Second line: n real numbers

Output format:
- One line: mean=<m> min=<mn> max=<mx> range=<r>

Expected solution outline:
- Pass the vector by const reference to a helper; single pass for total/min/max.

AI evaluation rubric:
- const-correct read-only access, correct range, single pass.`,
    stdin: "4\n3 9 1 7\n",
    starterCode: `#include <iostream>
#include <cstdio>
#include <vector>
using namespace std;

struct Stats { double mean, mn, mx, range; };

Stats compute_stats(const vector<double>& values) {
  // TODO: single pass over the const reference; do not modify values.
  (void)values;
  return Stats{0.0, 0.0, 0.0, 0.0};
}

int main() {
  int n;
  cin >> n;
  vector<double> v(n);
  for (int i = 0; i < n; ++i) cin >> v[i];
  Stats s = compute_stats(v);
  printf("mean=%.1f min=%.1f max=%.1f range=%.1f\\n", s.mean, s.mn, s.mx, s.range);
  return 0;
}
`,
    visibleTests: [
      { name: "Even spread", stdin: "3\n2 4 6\n", expectedStdout: "mean=4.0 min=2.0 max=6.0 range=4.0\n", matcher: "exact" },
      { name: "Mixed order", stdin: "4\n3 9 1 7\n", expectedStdout: "mean=5.0 min=1.0 max=9.0 range=8.0\n", matcher: "exact" }
    ],
    skillTags: ["cpp.references.const_correctness", "cpp.references.parameter_passing", "dsa.arrays.traversal"]
  }
};
