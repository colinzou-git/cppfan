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
  "io-grade-calculator": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `I/O: grade calculator.

Read a student's name and three scores, then print the average and a letter grade.

Input format:
- First line: the student's name (may contain spaces).
- Second line: three scores separated by spaces.

Output format:
- "Average: X.X" — the mean of the three scores to one decimal place.
- "Grade: L" — the letter grade for that average.

Grade thresholds (inclusive): average >= 90 is A, >= 80 is B, >= 70 is C,
>= 60 is D, otherwise F. Exactly 90.0 is an A.

AI evaluation rubric:
- Reads the name line and three numeric scores.
- Computes the average as a double and prints it to one decimal.
- Maps the average to the correct letter from highest threshold to lowest.`,
    stdin: "Ada Lovelace\n95 90 100\n",
    starterCode: `#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

char letterFor(double average) {
  // TODO: return 'A','B','C','D' for average >= 90/80/70/60, else 'F'.
  return 'F';
}

int main() {
  string name;
  getline(cin, name);
  double a, b, c;
  cin >> a >> b >> c;
  double average = (a + b + c) / 3.0;
  cout << "Average: " << fixed << setprecision(1) << average << "\\n";
  cout << "Grade: " << letterFor(average) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "A grade", stdin: "Ada Lovelace\n95 90 100\n", expectedStdout: "Average: 95.0\nGrade: A\n", matcher: "exact" },
      { name: "Boundary B grade", stdin: "Grace Hopper\n80 80 80\n", expectedStdout: "Average: 80.0\nGrade: B\n", matcher: "exact" },
      { name: "F grade", stdin: "Test Student\n50 55 45\n", expectedStdout: "Average: 50.0\nGrade: F\n", matcher: "exact" }
    ],
    skillTags: [
      "cpp.program_basics.io",
      "cpp.values_types.variables",
      "cpp.values_types.conversions",
      "cpp.control_flow.conditionals"
    ]
  },
  "strings-valid-palindrome": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: valid palindrome.

Read one line of text and decide whether it is a palindrome, considering only
alphanumeric characters and ignoring case.

Input format:
- A single line (may contain spaces and punctuation).

Output format:
- Print "true" if it is a palindrome, otherwise "false".

A man, a plan, a canal: Panama -> true. race a car -> false. An empty line (or one
with no letters/digits) is a palindrome.

AI evaluation rubric:
- Two-pointer scan from both ends, skipping non-alphanumerics.
- Case-insensitive comparison; O(n) time, O(1) extra space.`,
    stdin: "A man, a plan, a canal: Panama\n",
    starterCode: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isPalindrome(const string& s) {
  // TODO: two indices from the ends; skip non-alphanumerics; compare lowercased.
  (void)s;
  return false;
}

int main() {
  string line;
  getline(cin, line);
  cout << (isPalindrome(line) ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Classic palindrome phrase", stdin: "A man, a plan, a canal: Panama\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Not a palindrome", stdin: "race a car\n", expectedStdout: "false\n", matcher: "exact" },
      { name: "Digits palindrome", stdin: "12321\n", expectedStdout: "true\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.palindrome", "dsa.arrays.two_pointers", "dsa.strings.case_handling"]
  },
  "dsa-binary-search-lower-bound": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DSA: binary search lower bound.

Read a sorted array and a target, then print the lower-bound index: the first
position whose value is >= target (or n if every value is smaller).

Input format:
- First line: n.
- Second line: n integers in non-decreasing order (may repeat).
- Third line: target.

Output format:
- A single integer: the 0-based lower-bound index, then a newline.

AI evaluation rubric:
- Binary search over a half-open range; O(log n), no linear scan.
- Returns the first index >= target, handling duplicates and out-of-range.`,
    stdin: "5\n1 3 5 7 9\n4\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int lowerBoundIndex(const vector<int>& nums, int target) {
  // TODO: binary search [lo, hi); move lo past values strictly < target.
  (void)nums;
  (void)target;
  return 0;
}

int main() {
  int n;
  cin >> n;
  vector<int> nums(n);
  for (int i = 0; i < n; ++i) cin >> nums[i];
  int target;
  cin >> target;
  cout << lowerBoundIndex(nums, target) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Insertion point between values", stdin: "5\n1 3 5 7 9\n4\n", expectedStdout: "2\n", matcher: "exact" },
      { name: "First of duplicates", stdin: "5\n2 2 2 4 4\n2\n", expectedStdout: "0\n", matcher: "exact" },
      { name: "Above all -> n", stdin: "3\n1 3 5\n10\n", expectedStdout: "3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.searching.binary_search", "dsa.arrays.indexing"]
  },
  "strings-anagram-check": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: anagram check.

Read two lines and decide whether they are anagrams of each other, ignoring
spaces and letter case.

Input format:
- First line: string A.
- Second line: string B.

Output format:
- Print "true" if A and B are anagrams, otherwise "false".

"Dormitory" and "Dirty Room" -> true. "hello" and "world" -> false.

AI evaluation rubric:
- Frequency counting (array or hash map), O(n); no sorting required.
- Ignores spaces and case; counts must match exactly.`,
    stdin: "Dormitory\nDirty Room\n",
    starterCode: `#include <iostream>
#include <string>
#include <array>
#include <cctype>
using namespace std;

bool areAnagrams(const string& a, const string& b) {
  // TODO: tally character frequencies (skip spaces, lowercase), then compare.
  (void)a;
  (void)b;
  return false;
}

int main() {
  string a, b;
  getline(cin, a);
  getline(cin, b);
  cout << (areAnagrams(a, b) ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Anagram ignoring case/space", stdin: "Dormitory\nDirty Room\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Not an anagram", stdin: "hello\nworld\n", expectedStdout: "false\n", matcher: "exact" },
      { name: "Counts must match", stdin: "aab\nabb\n", expectedStdout: "false\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.char_frequency", "dsa.strings.hashing"]
  },
  "dsa-max-subarray-sum": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DSA: maximum subarray sum.

Read an array of integers and print the largest sum of any non-empty contiguous
subarray (Kadane's algorithm).

Input format:
- First line: n.
- Second line: n integers (may be negative).

Output format:
- A single integer: the maximum subarray sum, then a newline.

For [-2,1,-3,4,-1,2,1,-5,4] the answer is 6 (the subarray [4,-1,2,1]).

AI evaluation rubric:
- O(n) Kadane scan; extend the running sum while positive, else restart.
- Uses long long; handles all-negative arrays (largest single element).`,
    stdin: "9\n-2 1 -3 4 -1 2 1 -5 4\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

long long maxSubarraySum(const vector<int>& nums) {
  // TODO: Kadane's algorithm. Track the best sum ending here and the overall max.
  (void)nums;
  return 0;
}

int main() {
  int n;
  cin >> n;
  vector<int> nums(n);
  for (int i = 0; i < n; ++i) cin >> nums[i];
  cout << maxSubarraySum(nums) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Mixed signs", stdin: "9\n-2 1 -3 4 -1 2 1 -5 4\n", expectedStdout: "6\n", matcher: "exact" },
      { name: "All positive", stdin: "4\n1 2 3 4\n", expectedStdout: "10\n", matcher: "exact" },
      { name: "All negative", stdin: "5\n-8 -3 -6 -2 -5\n", expectedStdout: "-2\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dp_design", "dsa.techniques.prefix_sums"]
  },
  "stl-vector-stats": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `STL: vector statistics.

Read a list of integers and print their minimum, maximum, sum, and mean.

Input format:
- First line: n.
- Second line: n integers.

Output format:
- "min: X", "max: X", "sum: X", "mean: X.X" — one per line; the mean to one
  decimal place.

Use the standard algorithms (min_element, max_element, accumulate) rather than
hand-written loops.

AI evaluation rubric:
- Correct min/max/sum/mean; sum accumulated as long long.
- Uses STL algorithms; mean printed to one decimal.`,
    stdin: "4\n1 2 3 4\n",
    starterCode: `#include <iostream>
#include <iomanip>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> nums(n);
  for (int i = 0; i < n; ++i) cin >> nums[i];
  // TODO: compute min, max, sum (long long), and mean (double) with STL.
  long long sum = 0;
  int mn = nums.empty() ? 0 : nums[0];
  int mx = mn;
  double mean = 0.0;
  cout << "min: " << mn << "\\n";
  cout << "max: " << mx << "\\n";
  cout << "sum: " << sum << "\\n";
  cout << "mean: " << fixed << setprecision(1) << mean << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic stats", stdin: "4\n1 2 3 4\n", expectedStdout: "min: 1\nmax: 4\nsum: 10\nmean: 2.5\n", matcher: "exact" },
      { name: "Negatives", stdin: "4\n-5 -1 -9 -3\n", expectedStdout: "min: -9\nmax: -1\nsum: -18\nmean: -4.5\n", matcher: "exact" }
    ],
    skillTags: ["cpp.stl.vector", "cpp.stl.algorithms"]
  },
  "cpp-rational-reduce": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `C++: reduce a fraction.

Read a numerator and denominator and print the fraction in lowest terms.

Input format:
- One line: two integers, the numerator and denominator (denominator is not 0).

Output format:
- "num/den" in lowest terms, with a positive denominator (move any sign to the
  numerator). 0/d prints as "0/1".

AI evaluation rubric:
- Reduces by the gcd; keeps the denominator positive.
- Handles negative inputs and a zero numerator.`,
    stdin: "2 -4\n",
    starterCode: `#include <iostream>
using namespace std;

int gcdInt(int a, int b) {
  if (a < 0) a = -a;
  if (b < 0) b = -b;
  while (b != 0) { int t = a % b; a = b; b = t; }
  return a;
}

int main() {
  int num, den;
  cin >> num >> den;
  // TODO: normalize the sign onto the numerator, then divide both by the gcd.
  cout << num << "/" << den << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Sign moves to numerator", stdin: "2 -4\n", expectedStdout: "-1/2\n", matcher: "exact" },
      { name: "Reduces to integer", stdin: "6 3\n", expectedStdout: "2/1\n", matcher: "exact" },
      { name: "Zero numerator", stdin: "0 5\n", expectedStdout: "0/1\n", matcher: "exact" }
    ],
    skillTags: ["cpp.structs_classes.invariants_intro"]
  },
  "dsa-valid-parentheses": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DSA: valid parentheses.

Read one line and decide whether its brackets are balanced and correctly nested.

Input format:
- A single line that may contain (), [], {} and other characters.

Output format:
- Print "true" if balanced, otherwise "false".

Non-bracket characters are ignored: "a(b)c" is balanced; "([)]" is not.

AI evaluation rubric:
- Stack-based matching of (), [], {}; O(n).
- A closing bracket with an empty/mismatched stack fails; leftover openers fail.`,
    stdin: "{[()]}\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

bool isBalanced(const string& s) {
  // TODO: push openers; on a closer, check it matches the stack top and pop.
  (void)s;
  return false;
}

int main() {
  string line;
  getline(cin, line);
  cout << (isBalanced(line) ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Nested balanced", stdin: "{[()]}\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Mismatched", stdin: "([)]\n", expectedStdout: "false\n", matcher: "exact" },
      { name: "Ignores other chars", stdin: "if (x) { y[0]; }\n", expectedStdout: "true\n", matcher: "exact" }
    ],
    skillTags: ["dsa.stacks.basic_stack"]
  },
  "dsa-first-unique-char": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DSA: first unique character.

Read one line and print the index of the first character that appears exactly
once, or -1 if every character repeats.

Input format:
- A single line of text.

Output format:
- A single integer: the 0-based index of the first unique character, else -1.

For "leetcode" the answer is 0 ('l'); for "loveleetcode" it is 2 ('v').

AI evaluation rubric:
- Count character frequencies, then scan for the first count of 1; O(n).
- Returns -1 when nothing is unique.`,
    stdin: "loveleetcode\n",
    starterCode: `#include <iostream>
#include <string>
#include <array>
using namespace std;

int firstUniqueIndex(const string& s) {
  // TODO: tally frequencies, then return the first index with a count of 1.
  (void)s;
  return -1;
}

int main() {
  string line;
  getline(cin, line);
  cout << firstUniqueIndex(line) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Later unique char", stdin: "loveleetcode\n", expectedStdout: "2\n", matcher: "exact" },
      { name: "First char unique", stdin: "leetcode\n", expectedStdout: "0\n", matcher: "exact" },
      { name: "None unique", stdin: "aabb\n", expectedStdout: "-1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.hashing.lookup", "dsa.strings.char_frequency"]
  },
  "strings-longest-unique-substring": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: longest unique substring.

Read one line and print the length of the longest substring with no repeated
characters.

Input format:
- A single line of text.

Output format:
- A single integer: the length of the longest substring of distinct characters.

For "abcabcbb" the answer is 3 ("abc"); for "bbbbb" it is 1.

AI evaluation rubric:
- Sliding window with each character's last position; O(n).
- Moves the window's left edge past a repeat; tracks the max width.`,
    stdin: "abcabcbb\n",
    starterCode: `#include <iostream>
#include <string>
#include <array>
using namespace std;

int longestUnique(const string& s) {
  // TODO: sliding window; remember each char's last index; track the max width.
  (void)s;
  return 0;
}

int main() {
  string line;
  getline(cin, line);
  cout << longestUnique(line) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Classic", stdin: "abcabcbb\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "All same", stdin: "bbbbb\n", expectedStdout: "1\n", matcher: "exact" },
      { name: "All unique", stdin: "abcdef\n", expectedStdout: "6\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.sliding_window", "dsa.hashing.lookup"]
  },
  "dsa-merge-sorted-arrays": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DSA: merge two sorted arrays.

Read two sorted arrays and print their merge as one sorted line.

Input format:
- First line: n, then n sorted integers on the second line.
- Third line: m, then m sorted integers on the fourth line.

Output format:
- The merged sorted values on one line, space-separated, then a newline. An empty
  result prints an empty line.

AI evaluation rubric:
- Two-pointer merge in O(n + m); no concatenate-and-resort.
- Stable on ties (take from the first array first); handles empty inputs.`,
    stdin: "3\n1 3 5\n3\n2 4 6\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

vector<int> mergeSorted(const vector<int>& a, const vector<int>& b) {
  // TODO: two indices; append the smaller front element; then the remainder.
  (void)a;
  (void)b;
  return {};
}

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (int i = 0; i < n; ++i) cin >> a[i];
  int m;
  cin >> m;
  vector<int> b(m);
  for (int i = 0; i < m; ++i) cin >> b[i];
  vector<int> merged = mergeSorted(a, b);
  for (size_t i = 0; i < merged.size(); ++i) {
    if (i) cout << " ";
    cout << merged[i];
  }
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Interleave", stdin: "3\n1 3 5\n3\n2 4 6\n", expectedStdout: "1 2 3 4 5 6\n", matcher: "exact" },
      { name: "One empty", stdin: "0\n\n3\n1 2 3\n", expectedStdout: "1 2 3\n", matcher: "exact" },
      { name: "Duplicates", stdin: "3\n1 1 2\n2\n1 3\n", expectedStdout: "1 1 1 2 3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.two_pointers", "dsa.arrays.traversal"]
  },
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
  }
};
