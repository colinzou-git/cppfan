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
  "dsa-count-set-bits": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DSA: count set bits.

Read a non-negative integer and print how many 1 bits are in its binary form
(its Hamming weight).

Input format:
- A single non-negative integer (fits in 32 bits).

Output format:
- A single integer: the number of set bits, then a newline.

7 -> 3 (0b111); 8 -> 1; 255 -> 8.

AI evaluation rubric:
- Bit operations (e.g. n &= n - 1), not string conversion.
- Correct for 0 and for all 32 bits set.`,
    stdin: "255\n",
    starterCode: `#include <iostream>
using namespace std;

int countSetBits(unsigned int n) {
  // TODO: clear the lowest set bit (n &= n - 1) repeatedly, counting the steps.
  (void)n;
  return 0;
}

int main() {
  unsigned int n;
  cin >> n;
  cout << countSetBits(n) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Three bits", stdin: "7\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Power of two", stdin: "8\n", expectedStdout: "1\n", matcher: "exact" },
      { name: "Byte of ones", stdin: "255\n", expectedStdout: "8\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.bit_manipulation"]
  },
  "bit-single-number": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Bit manipulation: the single number.

Every value in the array appears exactly twice, except one value that appears
once. Print that single value.

Input format:
- The first line is n, the number of values.
- The second line has n space-separated integers.

Output format:
- The single value that appears once, then a newline.

[2 2 1] -> 1; [4 1 2 1 2] -> 4.

AI evaluation rubric:
- Uses XOR (O(n) time, O(1) space), not a hash set.
- Correct with negative values.`,
    stdin: "5\n4 1 2 1 2\n",
    starterCode: `#include <iostream>
using namespace std;

int main() {
  int n;
  cin >> n;
  int acc = 0;
  for (int i = 0; i < n; ++i) {
    int value;
    cin >> value;
    // TODO: fold each value into acc with XOR.
    (void)value;
  }
  cout << acc << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Small", stdin: "3\n2 2 1\n", expectedStdout: "1\n", matcher: "exact" },
      { name: "Five values", stdin: "5\n4 1 2 1 2\n", expectedStdout: "4\n", matcher: "exact" },
      { name: "Single", stdin: "1\n42\n", expectedStdout: "42\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.bit_manipulation", "dsa.arrays.traversal"]
  },
  "bit-missing-number": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Bit manipulation: the missing number.

The array holds n distinct integers drawn from the range 0..n (inclusive), so
exactly one value in that range is missing. Print the missing value.

Input format:
- The first line is n, the number of values.
- The second line has n space-separated integers.

Output format:
- The missing value in 0..n, then a newline.

[3 0 1] -> 2; [0 1 2] -> 3.

AI evaluation rubric:
- Uses XOR or the arithmetic sum (O(n) time, O(1) space), not a hash set.
- Handles a missing 0 and a missing n.`,
    stdin: "3\n3 0 1\n",
    starterCode: `#include <iostream>
using namespace std;

int main() {
  int n;
  cin >> n;
  int acc = n;
  for (int i = 0; i < n; ++i) {
    int value;
    cin >> value;
    // TODO: fold i and value into acc with XOR.
    (void)value;
    (void)i;
  }
  cout << acc << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Missing middle", stdin: "3\n3 0 1\n", expectedStdout: "2\n", matcher: "exact" },
      { name: "Missing last", stdin: "3\n0 1 2\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Missing zero", stdin: "3\n1 2 3\n", expectedStdout: "0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.bit_manipulation", "dsa.arrays.traversal"]
  },
  "bit-power-of-two": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Bit manipulation: power of two.

Print whether the given integer is a power of two (1, 2, 4, 8, ...).

Input format:
- One line with the integer n.

Output format:
- "true" or "false", then a newline.

16 -> true; 6 -> false; 0 -> false.

AI evaluation rubric:
- Uses the n > 0 && (n & (n - 1)) == 0 trick (O(1)), not a loop dividing by 2.
- Rejects zero and negatives.`,
    stdin: "16\n",
    starterCode: `#include <iostream>
using namespace std;

int main() {
  int n;
  cin >> n;
  bool result = false;
  // TODO: set result to true iff n > 0 and n has exactly one set bit.
  cout << (result ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Power", stdin: "16\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Not a power", stdin: "6\n", expectedStdout: "false\n", matcher: "exact" },
      { name: "Zero", stdin: "0\n", expectedStdout: "false\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.bit_manipulation"]
  },
  "bit-hamming-distance": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Bit manipulation: Hamming distance.

Print the number of bit positions at which the two given non-negative integers
differ.

Input format:
- One line with two space-separated integers a and b.

Output format:
- The Hamming distance, then a newline.

1 and 4 -> 2; 0 and 255 -> 8.

AI evaluation rubric:
- Computes popcount(a ^ b); counts set bits (e.g. x &= x - 1), not per-bit shifts
  with an off-by-one.`,
    stdin: "1 4\n",
    starterCode: `#include <iostream>
using namespace std;

int main() {
  int a, b;
  cin >> a >> b;
  unsigned int diff = (unsigned)a ^ (unsigned)b;
  int count = 0;
  // TODO: count the set bits of diff (clear the lowest bit each step).
  cout << count << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Classic", stdin: "1 4\n", expectedStdout: "2\n", matcher: "exact" },
      { name: "All byte bits", stdin: "0 255\n", expectedStdout: "8\n", matcher: "exact" },
      { name: "Equal", stdin: "7 7\n", expectedStdout: "0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.bit_manipulation"]
  },
  "strings-reverse-words": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: reverse the word order.

Reverse the ORDER of the words in a sentence (not the letters within each word).
Words are runs of non-space characters; collapse any run of spaces to a single
separator and drop leading and trailing spaces.

Input format:
- One line of text (which may contain multiple, leading, or trailing spaces).

Output format:
- The words in reverse order, single-spaced, then a newline. An input with no
  words prints an empty line.

"the sky is blue" -> "blue is sky the".

AI evaluation rubric:
- Splits on whitespace runs and ignores leading/trailing spaces.
- Joins with single spaces and no trailing space.`,
    stdin: "the sky is blue\n",
    starterCode: `#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

int main() {
  string line;
  getline(cin, line);
  istringstream in(line);
  vector<string> words;
  string word;
  while (in >> word) {
    words.push_back(word);
  }
  // TODO: print words in reverse order, single-spaced, then a newline.
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "the sky is blue\n", expectedStdout: "blue is sky the\n", matcher: "exact" },
      { name: "Extra spaces", stdin: "a good   example\n", expectedStdout: "example good a\n", matcher: "exact" },
      { name: "Trimmed", stdin: "  hello world  \n", expectedStdout: "world hello\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.manipulation", "dsa.strings.parsing"]
  },
  "strings-roman-to-integer": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: Roman numeral to integer.

Convert a valid uppercase Roman numeral to its integer value.

Symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Add each value, except when a
smaller value sits directly before a larger one, in which case subtract it
(IV = 4, IX = 9, XL = 40, CM = 900, ...).

Input format:
- One line with the Roman numeral.

Output format:
- The integer value, then a newline.

"LVIII" -> 58; "MCMXCIV" -> 1994.

AI evaluation rubric:
- Compares each symbol's value to the next to decide add vs. subtract.`,
    stdin: "MCMXCIV\n",
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int value(char c) {
  switch (c) {
    case 'I': return 1; case 'V': return 5; case 'X': return 10;
    case 'L': return 50; case 'C': return 100; case 'D': return 500;
    case 'M': return 1000; default: return 0;
  }
}

int main() {
  string s;
  getline(cin, s);
  int total = 0;
  // TODO: add each value, subtracting when the next symbol is larger.
  cout << total << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Mixed", stdin: "LVIII\n", expectedStdout: "58\n", matcher: "exact" },
      { name: "Large", stdin: "MCMXCIV\n", expectedStdout: "1994\n", matcher: "exact" },
      { name: "Subtractive", stdin: "IX\n", expectedStdout: "9\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.parsing", "dsa.strings.manipulation"]
  },
  "math-gcd": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Math: greatest common divisor.

Print the greatest common divisor of two non-negative integers using Euclid's
algorithm.

Input format:
- One line with two space-separated integers a and b (not both zero).

Output format:
- gcd(a, b), then a newline.

12 and 18 -> 6; 13 and 7 -> 1.

AI evaluation rubric:
- Uses the Euclid loop gcd(a,b)=gcd(b,a%b) (O(log min)), not a factor scan.`,
    stdin: "12 18\n",
    starterCode: `#include <iostream>
using namespace std;

int main() {
  int a, b;
  cin >> a >> b;
  // TODO: while b != 0, replace (a, b) with (b, a % b); print a.
  cout << a << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Common factor", stdin: "12 18\n", expectedStdout: "6\n", matcher: "exact" },
      { name: "Coprime", stdin: "13 7\n", expectedStdout: "1\n", matcher: "exact" },
      { name: "With zero", stdin: "7 0\n", expectedStdout: "7\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.number_theory"]
  },
  "dp-edit-distance": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DP: edit distance.

Print the minimum number of single-character edits (insert, delete, or replace)
needed to turn string a into string b (Levenshtein distance).

Input format:
- The first line is string a (may be empty).
- The second line is string b (may be empty).

Output format:
- The edit distance, then a newline.

"horse" -> "ros" is 3; "cat" -> "cut" is 1.

AI evaluation rubric:
- Fills a 2D dp table (O(n*m)); correct base cases dp[i][0]=i, dp[0][j]=j.
- Uses min of insert/delete/replace when characters differ.`,
    stdin: "horse\nros\n",
    starterCode: `#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  string a, b;
  getline(cin, a);
  getline(cin, b);
  int n = (int)a.size(), m = (int)b.size();
  vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
  // TODO: initialize base cases and fill the table, then print dp[n][m].
  cout << dp[n][m] << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Classic", stdin: "horse\nros\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Replace one", stdin: "cat\ncut\n", expectedStdout: "1\n", matcher: "exact" },
      { name: "One empty", stdin: "abc\n\n", expectedStdout: "3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_forms"]
  },
  "dp-word-break": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DP: word break.

Given a string s and a dictionary of words, print whether s can be segmented
into a sequence of one or more dictionary words. Words may be reused.

Input format:
- The first line is the string s.
- The second line has the dictionary words, space-separated.

Output format:
- "true" or "false", then a newline.

s="leetcode", dict={leet, code} -> true.

AI evaluation rubric:
- Builds dp over prefixes (dp[i] = s[0..i) segmentable), dp[0] true.
- Uses an unordered_set for O(1) dictionary lookups.`,
    stdin: "leetcode\nleet code\n",
    starterCode: `#include <iostream>
#include <sstream>
#include <string>
#include <unordered_set>
#include <vector>
using namespace std;

int main() {
  string s, dictLine;
  getline(cin, s);
  getline(cin, dictLine);
  istringstream in(dictLine);
  unordered_set<string> words;
  string w;
  while (in >> w) words.insert(w);

  int n = (int)s.size();
  vector<char> dp(n + 1, false);
  dp[0] = true;
  // TODO: for each i, if some j<i has dp[j] and s[j..i) in words, set dp[i].
  cout << (dp[n] ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Segmentable", stdin: "leetcode\nleet code\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Reused word", stdin: "applepenapple\napple pen\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Not segmentable", stdin: "catsandog\ncats dog sand and cat\n", expectedStdout: "false\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.strings.searching"]
  },
  "dp-min-path-sum": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DP: minimum path sum.

Starting at the top-left of a grid of non-negative costs and moving only right or
down, print the minimum total cost to reach the bottom-right cell.

Input format:
- The first line has two integers m and n (rows and columns).
- The next m lines each have n space-separated non-negative integers.

Output format:
- The minimum path sum, then a newline.

[[1 3 1] [1 5 1] [4 2 1]] -> 7.

AI evaluation rubric:
- dp[r][c] = grid + min(up, left); first row/column have a single direction.`,
    stdin: "3 3\n1 3 1\n1 5 1\n4 2 1\n",
    starterCode: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  int m, n;
  cin >> m >> n;
  vector<vector<int>> g(m, vector<int>(n));
  for (int r = 0; r < m; ++r)
    for (int c = 0; c < n; ++c) cin >> g[r][c];
  vector<vector<int>> dp(m, vector<int>(n, 0));
  // TODO: fill dp[r][c] = g[r][c] + min(up, left); print dp[m-1][n-1].
  cout << dp[m - 1][n - 1] << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Classic", stdin: "3 3\n1 3 1\n1 5 1\n4 2 1\n", expectedStdout: "7\n", matcher: "exact" },
      { name: "Single row", stdin: "1 3\n1 2 3\n", expectedStdout: "6\n", matcher: "exact" },
      { name: "2x2", stdin: "2 2\n1 2\n1 1\n", expectedStdout: "3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.arrays.indexing"]
  },
  "dp-max-product-subarray": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DP: maximum product subarray.

Print the largest product of any contiguous non-empty subarray.

Input format:
- The first line is n, the number of values.
- The second line has n space-separated integers.

Output format:
- The maximum subarray product, then a newline.

[2 3 -2 4] -> 6; [-2 3 -4] -> 24.

AI evaluation rubric:
- Tracks BOTH running max and min (negatives flip them); O(n) single pass.`,
    stdin: "4\n2 3 -2 4\n",
    starterCode: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  int best = a[0], curMax = a[0], curMin = a[0];
  // TODO: for each next x, recompute curMax/curMin from x, x*curMax, x*curMin.
  cout << best << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "4\n2 3 -2 4\n", expectedStdout: "6\n", matcher: "exact" },
      { name: "Two negatives", stdin: "3\n-2 3 -4\n", expectedStdout: "24\n", matcher: "exact" },
      { name: "All negative", stdin: "4\n-1 -3 -10 -2\n", expectedStdout: "60\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.arrays.traversal"]
  },
  "stack-next-greater-element": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Stack: next greater element.

For each element, print the first element to its right that is strictly greater,
or -1 if there is none.

Input format:
- The first line is n, the number of values.
- The second line has n space-separated integers.

Output format:
- The next-greater value for each element, space-separated, then a newline.

[2 1 2 4 3] -> "4 2 4 -1 -1".

AI evaluation rubric:
- Monotonic stack of indices (O(n)); resolves an index when a larger value
  arrives.`,
    stdin: "5\n2 1 2 4 3\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  vector<int> ans(n, -1);
  vector<int> st;  // indices awaiting a greater element
  // TODO: for each i, resolve stack indices with a smaller value, then push i.
  for (int i = 0; i < n; ++i) cout << (i ? " " : "") << ans[i];
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "5\n2 1 2 4 3\n", expectedStdout: "4 2 4 -1 -1\n", matcher: "exact" },
      { name: "Increasing", stdin: "4\n1 2 3 4\n", expectedStdout: "2 3 4 -1\n", matcher: "exact" },
      { name: "Decreasing", stdin: "4\n4 3 2 1\n", expectedStdout: "-1 -1 -1 -1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.stacks.basic_stack", "dsa.arrays.traversal"]
  },
  "strings-atoi": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: string to integer (atoi).

Parse the input line as a 32-bit signed integer (like C's atoi).

Input format:
- One line: the string to parse (it may contain spaces and other text).

Output format:
- The parsed integer, then a newline.

"   -42" -> -42; "4193 with words" -> 4193; "words" -> 0.

AI evaluation rubric:
- Skips leading spaces, reads an optional sign, then digits until a non-digit.
- Clamps to [-2147483648, 2147483647] instead of overflowing.`,
    stdin: "   -42\n",
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
  string s;
  getline(cin, s);
  long long value = 0;
  int sign = 1;
  size_t i = 0;
  // TODO: skip spaces, read sign, accumulate digits, clamp to the int range.
  (void)sign; (void)i;
  cout << value << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "42\n", expectedStdout: "42\n", matcher: "exact" },
      { name: "Leading spaces + sign", stdin: "   -42\n", expectedStdout: "-42\n", matcher: "exact" },
      { name: "Trailing words", stdin: "4193 with words\n", expectedStdout: "4193\n", matcher: "exact" },
      { name: "No digits", stdin: "words and 987\n", expectedStdout: "0\n", matcher: "exact" },
      { name: "Overflow clamp", stdin: "99999999999\n", expectedStdout: "2147483647\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.parsing", "dsa.complexity.big_o"]
  },
  "dp-partition-equal-subset-sum": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DP: partition equal subset sum.

Print whether the array can be split into two subsets with equal sums.

Input format:
- The first line is n, the number of values.
- The second line has n space-separated non-negative integers.

Output format:
- "true" or "false", then a newline.

[1 5 11 5] -> true ({11} and {1,5,5}); [1 2 3 5] -> false (odd total).

AI evaluation rubric:
- Returns false immediately when the total sum is odd.
- Runs a boolean subset-sum DP up to sum/2 (O(n * sum)).`,
    stdin: "4\n1 5 11 5\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  bool result = false;
  // TODO: if the total is even, run a boolean subset-sum DP up to sum/2.
  cout << (result ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Splittable", stdin: "4\n1 5 11 5\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Odd total", stdin: "4\n1 2 3 5\n", expectedStdout: "false\n", matcher: "exact" },
      { name: "Pair", stdin: "2\n3 3\n", expectedStdout: "true\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.arrays.traversal"]
  },
  "bit-single-number-ii": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Bit manipulation: single number (appears three times).

Every value appears exactly three times except one, which appears once.
Print that unique value.

Input format:
- The first line is n, the number of values.
- The second line has n space-separated integers.

Output format:
- The value that appears once, then a newline.

[2 2 3 2] -> 3; [0 1 0 1 0 1 99] -> 99.

AI evaluation rubric:
- Counts set bits per position mod 3 (O(n), O(1) extra), not XOR.
- Handles negatives via the 32-bit two's-complement pattern.`,
    stdin: "4\n2 2 3 2\n",
    starterCode: `#include <cstdint>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  uint32_t result = 0;
  // TODO: for each of the 32 bit positions, sum the set bits mod 3.
  cout << (int)result << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "4\n2 2 3 2\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Bigger", stdin: "7\n0 1 0 1 0 1 99\n", expectedStdout: "99\n", matcher: "exact" },
      { name: "Negative", stdin: "4\n-2 -2 -2 5\n", expectedStdout: "5\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.bit_manipulation", "dsa.arrays.traversal"]
  },
  "dp-coin-change-ways": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DP: coin change (count combinations).

Print how many distinct combinations of coins (unlimited supply of each) sum
exactly to a target amount. Order does not matter.

Input format:
- The first line has two integers: n (number of coin types) and amount.
- The second line has n space-separated coin denominations.

Output format:
- The number of combinations, then a newline.

coins [1 2 5], amount 5 -> 4; coins [2], amount 3 -> 0.

AI evaluation rubric:
- Loops coins on the OUTER loop so 1+2 and 2+1 are not double-counted.
- ways[0] = 1; adds ways[t - coin] to ways[t].`,
    stdin: "3 5\n1 2 5\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n, amount;
  cin >> n >> amount;
  vector<int> coins(n);
  for (auto& c : coins) cin >> c;
  vector<long long> ways(amount + 1, 0);
  ways[0] = 1;
  // TODO: for each coin, add ways[t - coin] to ways[t] for t from coin to amount.
  cout << ways[amount] << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "3 5\n1 2 5\n", expectedStdout: "4\n", matcher: "exact" },
      { name: "Impossible", stdin: "1 3\n2\n", expectedStdout: "0\n", matcher: "exact" },
      { name: "Multiple", stdin: "3 4\n1 2 3\n", expectedStdout: "4\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.arrays.traversal"]
  },
  "linked-list-merge-two-sorted": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Linked list: merge two sorted lists.

Merge two ascending sorted singly linked lists into one ascending sorted list
and print its values.

Input format:
- The first line is n, the length of list A, then n values.
- The next line is m, the length of list B, then m values.

Output format:
- The merged values, space-separated, then a newline (empty line if both lists
  are empty).

A [1 3 5], B [2 4 6] -> "1 2 3 4 5 6".

AI evaluation rubric:
- Uses a dummy head and a tail pointer; splices smaller node each step, then
  attaches the leftover tail. O(n + m).`,
    stdin: "3 1 3 5\n3 2 4 6\n",
    starterCode: `#include <iostream>
using namespace std;

struct ListNode { int val; ListNode* next; ListNode(int v) : val(v), next(nullptr) {} };

ListNode* merge_two(ListNode* a, ListNode* b) {
  // TODO: splice nodes from a and b in sorted order; attach the leftover tail.
  (void)a; (void)b;
  return nullptr;
}

static ListNode* read_list() {
  int n; cin >> n;
  ListNode* head = nullptr; ListNode** tail = &head;
  for (int i = 0; i < n; ++i) { int x; cin >> x; *tail = new ListNode(x); tail = &(*tail)->next; }
  return head;
}

int main() {
  ListNode* a = read_list();
  ListNode* b = read_list();
  bool first = true;
  for (ListNode* c = merge_two(a, b); c; c = c->next) { cout << (first ? "" : " ") << c->val; first = false; }
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "3 1 3 5\n3 2 4 6\n", expectedStdout: "1 2 3 4 5 6\n", matcher: "exact" },
      { name: "One empty", stdin: "0\n3 0 7 9\n", expectedStdout: "0 7 9\n", matcher: "exact" },
      { name: "Duplicates", stdin: "3 1 2 2\n2 2 3\n", expectedStdout: "1 2 2 2 3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.linked_list", "cpp.references.pointers"]
  },
  "tree-path-sum": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Binary tree: root-to-leaf path sum.

Print whether the tree has a root-to-LEAF path whose node values sum to a
target.

Input format:
- The first line has two integers: n (number of level-order tokens) and target.
- The second line has n space-separated tokens: integers, or X for a missing
  child.

Output format:
- "true" or "false", then a newline.

Tree [5 4 8 11 X 13 4 7 2], target 22 -> true (5->4->11->2).

AI evaluation rubric:
- Recurses subtracting each node's value; succeeds only at a leaf.
- Empty tree returns false.`,
    stdin: "9 22\n5 4 8 11 X 13 4 7 2\n",
    starterCode: `#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct T { int v; T* l; T* r; T(int x) : v(x), l(0), r(0) {} };

bool has_path_sum(T* root, int target) {
  // TODO: at a leaf, check target == v; otherwise recurse with target - v.
  (void)root; (void)target;
  return false;
}

int main() {
  int n, target;
  cin >> n >> target;
  vector<string> tok(n);
  for (auto& t : tok) cin >> t;
  T* root = nullptr;
  if (n > 0 && tok[0] != "X") {
    root = new T(stoi(tok[0]));
    queue<T*> q; q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tok.size()) {
      T* x = q.front(); q.pop();
      if (i < tok.size()) { if (tok[i] != "X") { x->l = new T(stoi(tok[i])); q.push(x->l); } ++i; }
      if (i < tok.size()) { if (tok[i] != "X") { x->r = new T(stoi(tok[i])); q.push(x->r); } ++i; }
    }
  }
  cout << (has_path_sum(root, target) ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Has path", stdin: "9 22\n5 4 8 11 X 13 4 7 2\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "No path", stdin: "9 100\n5 4 8 11 X 13 4 7 2\n", expectedStdout: "false\n", matcher: "exact" },
      { name: "Empty", stdin: "1 0\nX\n", expectedStdout: "false\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.traversal", "cpp.references.pointers"]
  },
  "linked-list-palindrome": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Linked list: palindrome check.

Print whether a singly linked list reads the same forwards and backwards.

Input format:
- The first line is n, the number of nodes.
- The second line has n space-separated node values.

Output format:
- "true" or "false", then a newline.

[1 2 2 1] -> true; [1 2 3] -> false.

AI evaluation rubric:
- Compares the value sequence against its reverse (vector two-pointer is fine;
  O(1) space reverses the second half). Empty/single lists are palindromes.`,
    stdin: "4\n1 2 2 1\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

struct ListNode { int val; ListNode* next; ListNode(int v) : val(v), next(nullptr) {} };

bool is_palindrome(ListNode* head) {
  // TODO: compare the value sequence against its reverse.
  (void)head;
  return false;
}

int main() {
  int n;
  cin >> n;
  ListNode* head = nullptr;
  ListNode** tail = &head;
  for (int i = 0; i < n; ++i) { int x; cin >> x; *tail = new ListNode(x); tail = &(*tail)->next; }
  cout << (is_palindrome(head) ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Even palindrome", stdin: "4\n1 2 2 1\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Odd palindrome", stdin: "5\n1 2 3 2 1\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Not a palindrome", stdin: "3\n1 2 3\n", expectedStdout: "false\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.linked_list", "cpp.references.pointers"]
  },
  "tree-validate-bst": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Binary tree: validate a BST.

Print whether the tree is a valid binary search tree (every node's left subtree
is strictly smaller and right subtree strictly larger).

Input format:
- The first line is n, the number of level-order tokens.
- The second line has n space-separated tokens: integers, or X for a missing
  child.

Output format:
- "true" or "false", then a newline.

[2 1 3] -> true; [5 1 4 X X 3 6] -> false.

AI evaluation rubric:
- Carries an inherited (low, high) range, not just parent/child comparisons.
- Uses a wide 64-bit range; rejects equal values (strict BST).`,
    stdin: "3\n2 1 3\n",
    starterCode: `#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct T { int v; T* l; T* r; T(int x) : v(x), l(0), r(0) {} };

bool valid(T* node, long long low, long long high) {
  // TODO: null is valid; else check low < v < high and recurse with tighter bounds.
  (void)node; (void)low; (void)high;
  return false;
}

int main() {
  int n;
  cin >> n;
  vector<string> tok(n);
  for (auto& t : tok) cin >> t;
  T* root = nullptr;
  if (n > 0 && tok[0] != "X") {
    root = new T(stoi(tok[0]));
    queue<T*> q; q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tok.size()) {
      T* x = q.front(); q.pop();
      if (i < tok.size()) { if (tok[i] != "X") { x->l = new T(stoi(tok[i])); q.push(x->l); } ++i; }
      if (i < tok.size()) { if (tok[i] != "X") { x->r = new T(stoi(tok[i])); q.push(x->r); } ++i; }
    }
  }
  cout << (valid(root, -4000000000LL, 4000000000LL) ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Valid", stdin: "3\n2 1 3\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Invalid right", stdin: "7\n5 1 4 X X 3 6\n", expectedStdout: "false\n", matcher: "exact" },
      { name: "Invalid deep", stdin: "7\n10 5 15 X X 6 20\n", expectedStdout: "false\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.bst_search", "dsa.trees.traversal", "cpp.references.pointers"]
  },
  "stack-daily-temperatures": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Stack: daily temperatures.

For each day, print the number of days to wait for a strictly warmer day (0 if
none).

Input format:
- The first line is n, the number of days.
- The second line has n space-separated temperatures.

Output format:
- The wait-days for each day, space-separated, then a newline.

[73 74 75 71 69 72 76 73] -> "1 1 4 2 1 1 0 0".

AI evaluation rubric:
- Monotonic stack of indices (O(n)); answer[popped] = i - popped when warmer.`,
    stdin: "8\n73 74 75 71 69 72 76 73\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> t(n);
  for (auto& x : t) cin >> x;
  vector<int> ans(n, 0);
  vector<int> st;  // indices awaiting a warmer day
  // TODO: for each i, resolve stack indices with a smaller temp, then push i.
  for (int i = 0; i < n; ++i) cout << (i ? " " : "") << ans[i];
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Classic", stdin: "8\n73 74 75 71 69 72 76 73\n", expectedStdout: "1 1 4 2 1 1 0 0\n", matcher: "exact" },
      { name: "Increasing", stdin: "4\n30 40 50 60\n", expectedStdout: "1 1 1 0\n", matcher: "exact" },
      { name: "Decreasing", stdin: "4\n60 50 40 30\n", expectedStdout: "0 0 0 0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.stacks.basic_stack", "dsa.arrays.traversal"]
  },
  "dp-longest-increasing-subsequence": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DP: longest increasing subsequence.

Print the length of the longest strictly increasing subsequence of the array.
A subsequence keeps order but may skip elements.

Input format:
- The first line is n, the number of values (n may be 0).
- The second line has n space-separated integers.

Output format:
- The LIS length, then a newline.

[10 9 2 5 3 7 101 18] -> 4; [5 4 3 2 1] -> 1.

AI evaluation rubric:
- A correct DP (e.g. dp[i] = longest LIS ending at i), strictly increasing.
- Handles the empty array (length 0).`,
    stdin: "8\n10 9 2 5 3 7 101 18\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> nums(n);
  for (int i = 0; i < n; ++i) cin >> nums[i];
  // TODO: dp[i] = 1 + max(dp[j]) for j < i with nums[j] < nums[i]; print the max.
  int best = n == 0 ? 0 : 1;
  cout << best << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Classic", stdin: "8\n10 9 2 5 3 7 101 18\n", expectedStdout: "4\n", matcher: "exact" },
      { name: "Decreasing", stdin: "5\n5 4 3 2 1\n", expectedStdout: "1\n", matcher: "exact" },
      { name: "Empty", stdin: "0\n\n", expectedStdout: "0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_design", "dsa.arrays.traversal"]
  },
  "dp-unique-paths": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DP: unique grid paths.

A robot at the top-left of an m x n grid may move only right or down. Print how
many distinct paths reach the bottom-right cell.

Input format:
- Two integers m and n (rows and columns), each >= 1.

Output format:
- The number of paths, then a newline.

3 7 -> 28; 3 3 -> 6; 1 5 -> 1.

AI evaluation rubric:
- Grid DP (dp[i][j] = dp[i-1][j] + dp[i][j-1]) or the combinatorial formula.
- Uses a 64-bit count.`,
    stdin: "3 7\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int m, n;
  cin >> m >> n;
  vector<long long> row(n, 1);
  // TODO: for each subsequent row, row[j] += row[j-1]; print row[n-1].
  cout << row[n - 1] << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "3x7", stdin: "3 7\n", expectedStdout: "28\n", matcher: "exact" },
      { name: "Square", stdin: "3 3\n", expectedStdout: "6\n", matcher: "exact" },
      { name: "Single row", stdin: "1 5\n", expectedStdout: "1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_design", "dsa.math.combinatorics"]
  },
  "strings-longest-common-prefix": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: longest common prefix.

Print the longest string that is a prefix of every input word. If there is no
common prefix, print an empty line.

Input format:
- The first line is n, the number of words.
- Each of the next n lines has one word (no spaces).

Output format:
- The longest common prefix, then a newline (an empty line if none).

[flower, flow, flight] -> fl; [dog, cat] -> (empty).

AI evaluation rubric:
- Compares character positions across all words, stopping at the first mismatch.
- Handles no-common-prefix (empty output).`,
    stdin: "3\nflower\nflow\nflight\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<string> words(n);
  for (int i = 0; i < n; ++i) cin >> words[i];
  string prefix;
  // TODO: build the longest prefix shared by every word.
  cout << prefix << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Common", stdin: "3\nflower\nflow\nflight\n", expectedStdout: "fl\n", matcher: "exact" },
      { name: "Whole word", stdin: "3\ngo\ngoto\ngopher\n", expectedStdout: "go\n", matcher: "exact" },
      { name: "None", stdin: "2\ndog\ncat\n", expectedStdout: "\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.manipulation", "dsa.arrays.traversal"]
  },
  "dsa-sort-by-frequency": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DSA: sort by frequency.

Read a list of integers and print them sorted by how often each value occurs
(ascending), breaking ties by the value itself (ascending).

Input format:
- First line: n.
- Second line: n integers.

Output format:
- The reordered values on one line, space-separated, then a newline.

For [1,1,2,2,2,3] the result is "3 1 1 2 2 2".

AI evaluation rubric:
- Frequency map, then std::sort with a comparator on (count, then value).
- Stable, correct tie-breaking; handles empty/single inputs.`,
    stdin: "6\n1 1 2 2 2 3\n",
    starterCode: `#include <iostream>
#include <vector>
#include <map>
#include <algorithm>
using namespace std;

vector<int> sortByFrequency(vector<int> nums) {
  // TODO: count occurrences, then sort by ascending frequency, ties by value.
  return nums;
}

int main() {
  int n;
  cin >> n;
  vector<int> nums(n);
  for (int i = 0; i < n; ++i) cin >> nums[i];
  vector<int> sorted = sortByFrequency(nums);
  for (size_t i = 0; i < sorted.size(); ++i) {
    if (i) cout << " ";
    cout << sorted[i];
  }
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Frequency order", stdin: "6\n1 1 2 2 2 3\n", expectedStdout: "3 1 1 2 2 2\n", matcher: "exact" },
      { name: "Same frequency by value", stdin: "3\n3 1 2\n", expectedStdout: "1 2 3\n", matcher: "exact" },
      { name: "Tie by value", stdin: "5\n3 3 2 2 1\n", expectedStdout: "1 2 2 3 3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.sorting.comparator", "dsa.hashing.lookup"]
  },
  "cpp-string-split": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `C++: split a string.

Read a delimiter character and a line, then print each field on its own line.

Input format:
- First line: a single delimiter character.
- Second line: the text to split (may contain the delimiter and be empty).

Output format:
- Each field between delimiters on its own line. Empty fields print as blank
  lines. (n delimiters produce n+1 lines.)

AI evaluation rubric:
- Keeps empty fields; splits on the exact delimiter character.
- Emits delimiter-count + 1 fields, including a trailing empty field.`,
    stdin: ",\na,,b\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<string> split(const string& s, char delim) {
  // TODO: accumulate a field; on a delimiter push it and reset; push the last.
  (void)s;
  (void)delim;
  return {};
}

int main() {
  string delimLine;
  getline(cin, delimLine);
  char delim = delimLine.empty() ? ',' : delimLine[0];
  string text;
  getline(cin, text);
  for (const string& field : split(text, delim)) cout << field << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Keeps empty field", stdin: ",\na,,b\n", expectedStdout: "a\n\nb\n", matcher: "exact" },
      { name: "Three fields", stdin: ",\nx,y,z\n", expectedStdout: "x\ny\nz\n", matcher: "exact" },
      { name: "Space delimiter", stdin: " \none two\n", expectedStdout: "one\ntwo\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.parsing", "cpp.stl.string"]
  },
  "dsa-move-zeroes": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `DSA: move zeroes to the end.

Read an array and print it with every 0 moved to the end, keeping the order of
the non-zero values.

Input format:
- First line: n.
- Second line: n integers.

Output format:
- The rearranged values on one line, space-separated, then a newline.

[0,1,0,3,12] -> "1 3 12 0 0".

AI evaluation rubric:
- Stable two-pointer rearrangement in O(n); non-zero order preserved.
- Handles all-zero, no-zero, and empty inputs.`,
    stdin: "5\n0 1 0 3 12\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

vector<int> moveZeroes(vector<int> nums) {
  // TODO: copy non-zero values forward to a write index, then fill with zeroes.
  return nums;
}

int main() {
  int n;
  cin >> n;
  vector<int> nums(n);
  for (int i = 0; i < n; ++i) cin >> nums[i];
  vector<int> out = moveZeroes(nums);
  for (size_t i = 0; i < out.size(); ++i) {
    if (i) cout << " ";
    cout << out[i];
  }
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Interleaved zeroes", stdin: "5\n0 1 0 3 12\n", expectedStdout: "1 3 12 0 0\n", matcher: "exact" },
      { name: "No zeroes", stdin: "3\n1 2 3\n", expectedStdout: "1 2 3\n", matcher: "exact" },
      { name: "Preserves order", stdin: "6\n4 0 5 0 0 6\n", expectedStdout: "4 5 6 0 0 0\n", matcher: "exact" }
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
  },
  "pointers-safe-find": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Find the first matching element and report its index via a pointer.

Requirements:
1. Read n, then n integers, then a target.
2. Use a helper that returns a pointer to the first element equal to target,
   or nullptr when none matches.
3. Print the 0-based index of that element, or -1 if there is no match.

Input format:
- First line: n
- Second line: n integers
- Third line: target

Output format:
- One integer: the index, or -1.

Expected solution outline:
- Return &element from the search; the index is pointer - &vec[0].

AI evaluation rubric:
- Pointer returned into the vector (not a copy), nullptr when absent.`,
    stdin: "5\n4 8 15 16 23\n15\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

const int* find_first(const vector<int>& values, int target) {
  // TODO: return the address of the first matching element, or nullptr.
  (void)values; (void)target;
  return nullptr;
}

int main() {
  int n;
  cin >> n;
  vector<int> v(n);
  for (int i = 0; i < n; ++i) cin >> v[i];
  int target;
  cin >> target;
  const int* p = find_first(v, target);
  cout << (p ? static_cast<int>(p - &v[0]) : -1) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Finds match", stdin: "5\n4 8 15 16 23\n15\n", expectedStdout: "2\n", matcher: "exact" },
      { name: "No match", stdin: "3\n1 2 3\n99\n", expectedStdout: "-1\n", matcher: "exact" },
      { name: "First of duplicates", stdin: "4\n5 7 5 7\n7\n", expectedStdout: "1\n", matcher: "exact" }
    ],
    skillTags: ["cpp.references.pointers", "cpp.references.non_owning", "cpp.references.dangling"]
  },
  "structs-point-distance": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Compute the distance between two points using a const method.

Requirements:
1. Read four numbers: x1 y1 x2 y2.
2. Define a Point struct with a const distance_to method.
3. Print the Euclidean distance with four digits after the decimal point.

Input format:
- One line: x1 y1 x2 y2

Output format:
- One line: the distance formatted as %.4f

Expected solution outline:
- distance_to returns sqrt(dx*dx + dy*dy).

AI evaluation rubric:
- const method, correct Euclidean formula.`,
    stdin: "0 0 3 4\n",
    starterCode: `#include <iostream>
#include <cstdio>
#include <cmath>
using namespace std;

struct Point {
  double x, y;
  double distance_to(const Point& o) const {
    // TODO: sqrt((x - o.x)^2 + (y - o.y)^2)
    (void)o;
    return 0.0;
  }
};

int main() {
  Point a, b;
  cin >> a.x >> a.y >> b.x >> b.y;
  printf("%.4f\\n", a.distance_to(b));
  return 0;
}
`,
    visibleTests: [
      { name: "3-4-5 triangle", stdin: "0 0 3 4\n", expectedStdout: "5.0000\n", matcher: "exact" },
      { name: "Same point", stdin: "1 1 1 1\n", expectedStdout: "0.0000\n", matcher: "exact" },
      { name: "Horizontal", stdin: "0 0 3 0\n", expectedStdout: "3.0000\n", matcher: "exact" }
    ],
    skillTags: ["cpp.structs_classes.syntax", "cpp.structs_classes.const_methods_intro", "dsa.arrays.traversal"]
  },
  "class-bank-account": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Apply a sequence of operations to a bank account that guards its balance.

Requirements:
1. Read an opening balance (a negative opening clamps to 0).
2. Read m, then m operations, each "D amount" (deposit) or "W amount" (withdraw).
3. Reject any deposit with amount <= 0 and any withdrawal that is <= 0 or exceeds
   the balance; a rejected operation leaves the balance unchanged.
4. Print the final balance.

Input format:
- First line: opening balance
- Second line: m
- Next m lines: "D <amount>" or "W <amount>"

Output format:
- One integer: the final balance.

Expected solution outline:
- Keep the balance private; validate each operation before applying it.

AI evaluation rubric:
- Invariant preserved (never negative), rejected ops are no-ops.`,
    stdin: "100\n3\nD 50\nW 30\nW 999\n",
    starterCode: `#include <iostream>
using namespace std;

class BankAccount {
public:
  explicit BankAccount(long long opening) { balance_ = opening < 0 ? 0 : opening; }
  long long balance() const { return balance_; }
  bool deposit(long long a) {
    // TODO: accept only a > 0.
    (void)a; return false;
  }
  bool withdraw(long long a) {
    // TODO: accept only 0 < a <= balance_.
    (void)a; return false;
  }
private:
  long long balance_ = 0;
};

int main() {
  long long opening;
  cin >> opening;
  BankAccount acct(opening);
  int m;
  cin >> m;
  for (int i = 0; i < m; ++i) {
    char op; long long a;
    cin >> op >> a;
    if (op == 'D') acct.deposit(a); else acct.withdraw(a);
  }
  cout << acct.balance() << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Deposit then withdraw, one rejected", stdin: "100\n3\nD 50\nW 30\nW 999\n", expectedStdout: "120\n", matcher: "exact" },
      { name: "Simple flow", stdin: "0\n2\nD 100\nW 40\n", expectedStdout: "60\n", matcher: "exact" }
    ],
    skillTags: ["cpp.structs_classes.public_private", "cpp.structs_classes.invariants_intro", "cpp.structs_classes.const_methods_intro"]
  },
  "constructors-student-record": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Construct a student record with validation and report it.

Requirements:
1. Read a name (single token), an id, and a gpa.
2. Build a Student via a parameterized constructor: a negative id becomes 0,
   and the gpa is clamped into [0.0, 4.0].
3. Print: <name> <id> <gpa with 1 decimal> <yes|no> where the last field is the
   honor-roll flag (gpa >= 3.5).

Input format:
- One line: name id gpa

Output format:
- One line: name id gpa honor

Expected solution outline:
- Use a member initializer list and clamp inside it.

AI evaluation rubric:
- Initializer-list construction, correct clamping and honor threshold.`,
    stdin: "Ada 42 3.9\n",
    starterCode: `#include <iostream>
#include <cstdio>
#include <string>
using namespace std;

class Student {
public:
  Student(string name, int id, double gpa) {
    // TODO: initializer list; clamp id (>= 0) and gpa into [0, 4].
    (void)name; (void)id; (void)gpa;
  }
  const string& name() const { static string s; return s; } // TODO
  int id() const { return 0; }        // TODO
  double gpa() const { return 0.0; }  // TODO
  bool is_honor_roll() const { return false; } // TODO: gpa >= 3.5
};

int main() {
  string name; int id; double gpa;
  cin >> name >> id >> gpa;
  Student s(name, id, gpa);
  printf("%s %d %.1f %s\\n", s.name().c_str(), s.id(), s.gpa(),
         s.is_honor_roll() ? "yes" : "no");
  return 0;
}
`,
    visibleTests: [
      { name: "Honor student", stdin: "Ada 42 3.9\n", expectedStdout: "Ada 42 3.9 yes\n", matcher: "exact" },
      { name: "Clamps id and gpa", stdin: "Bo -7 4.5\n", expectedStdout: "Bo 0 4.0 yes\n", matcher: "exact" },
      { name: "Below honor roll", stdin: "Gu 5 3.4\n", expectedStdout: "Gu 5 3.4 no\n", matcher: "exact" }
    ],
    skillTags: ["cpp.constructors.parameterized_constructor", "cpp.constructors.member_initializer_list", "cpp.constructors.default_constructor"]
  },
  "operators-fraction-normalize": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Add two fractions and print the normalized sum.

Requirements:
1. Read four integers: n1 d1 n2 d2 (denominators are non-zero).
2. Build a Fraction type whose constructor stores lowest terms with den > 0.
3. Overload operator+ and print the sum as "num/den".

Input format:
- One line: n1 d1 n2 d2

Output format:
- One line: num/den (normalized)

Expected solution outline:
- Normalize in the constructor (sign to numerator, divide by gcd).

AI evaluation rubric:
- Correct common-denominator addition and normalization.`,
    stdin: "1 2 1 3\n",
    starterCode: `#include <iostream>
#include <numeric>
using namespace std;

struct Fraction {
  long long num, den;
  Fraction(long long n = 0, long long d = 1) : num(n), den(d) {
    // TODO: sign to numerator (den > 0), then divide by gcd(|num|, den).
  }
};

Fraction operator+(const Fraction& a, const Fraction& b) {
  // TODO: common denominator, then construct (normalizes).
  (void)a; (void)b;
  return Fraction();
}

int main() {
  long long n1, d1, n2, d2;
  cin >> n1 >> d1 >> n2 >> d2;
  Fraction s = Fraction(n1, d1) + Fraction(n2, d2);
  cout << s.num << "/" << s.den << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "1/2 + 1/3", stdin: "1 2 1 3\n", expectedStdout: "5/6\n", matcher: "exact" },
      { name: "Sum reduces", stdin: "1 6 1 6\n", expectedStdout: "1/3\n", matcher: "exact" },
      { name: "Negative and zero", stdin: "1 -2 0 5\n", expectedStdout: "-1/2\n", matcher: "exact" }
    ],
    skillTags: ["cpp.structs_classes.invariants_intro", "cpp.structs_classes.syntax", "cpp.functions.basics"]
  },
  "unordered-map-log-counter": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Tally event names and report the most frequent one.

Requirements:
1. Read n, then n event names (one token each).
2. Count them in a hash map.
3. Print: most=<event> distinct=<d> where <event> is the most frequent name
   (ties broken by the lexicographically smallest name) and <d> is the number of
   distinct names.

Input format:
- First line: n
- Next n lines: an event name

Output format:
- One line: most=<event> distinct=<d>

Expected solution outline:
- ++counts[name]; scan the map tracking the best (count, then smallest name).

AI evaluation rubric:
- Correct tie-breaking and distinct count.`,
    stdin: "5\nview\nview\nview\nclick\nclick\n",
    starterCode: `#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

int main() {
  int n;
  cin >> n;
  unordered_map<string, int> counts;
  for (int i = 0; i < n; ++i) {
    string name;
    cin >> name;
    // TODO: tally name.
  }
  // TODO: find the most frequent (ties -> smallest name) and print the summary.
  cout << "most= distinct=" << counts.size() << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Most frequent", stdin: "5\nview\nview\nview\nclick\nclick\n", expectedStdout: "most=view distinct=2\n", matcher: "exact" },
      { name: "Tie by name", stdin: "2\nbeta\nalpha\n", expectedStdout: "most=alpha distinct=2\n", matcher: "exact" }
    ],
    skillTags: ["cpp.stl.map", "cpp.stl.algorithms", "dsa.strings.hashing"]
  },
  "set-deduplicate-preserve-count": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Deduplicate a list and report how many duplicates were removed.

Requirements:
1. Read n, then n integers.
2. Print: distinct=<d> removed=<r> followed by the distinct values in ascending
   order, all space-separated.

Input format:
- First line: n
- Second line: n integers

Output format:
- distinct=<d> removed=<r> v1 v2 ... (ascending unique values)

Expected solution outline:
- Insert into a std::set for sorted, unique keys; removed = n - set.size().

AI evaluation rubric:
- Correct distinct/removed counts and ascending unique output.`,
    stdin: "5\n3 1 2 3 1\n",
    starterCode: `#include <iostream>
#include <set>
using namespace std;

int main() {
  int n;
  cin >> n;
  set<int> unique;
  for (int i = 0; i < n; ++i) {
    int x;
    cin >> x;
    // TODO: insert x.
  }
  // TODO: print distinct/removed and the ascending unique values.
  cout << "distinct=" << unique.size() << " removed=" << (n - (int)unique.size());
  for (int v : unique) cout << " " << v;
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Removes duplicates", stdin: "5\n3 1 2 3 1\n", expectedStdout: "distinct=3 removed=2 1 2 3\n", matcher: "exact" },
      { name: "Already unique", stdin: "3\n5 4 6\n", expectedStdout: "distinct=3 removed=0 4 5 6\n", matcher: "exact" }
    ],
    skillTags: ["cpp.stl.set", "cpp.stl.algorithms", "dsa.arrays.traversal"]
  },
  "priority-queue-top-k": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Print the k largest values in descending order using a max-heap.

Requirements:
1. Read n, then n integers, then k.
2. Print the k largest values in descending order, space-separated (duplicates
   kept). If k >= n, print all values sorted descending. If k <= 0, print an
   empty line.

Input format:
- First line: n
- Second line: n integers
- Third line: k

Output format:
- The top-k values, descending, space-separated.

Expected solution outline:
- Build a std::priority_queue (max-heap); pop min(k, n) times.

AI evaluation rubric:
- Correct descending order, duplicates kept, k bounds handled.`,
    stdin: "6\n4 1 7 3 9 2\n3\n",
    starterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> v(n);
  for (auto& x : v) cin >> x;
  int k;
  cin >> k;
  // TODO: max-heap, then pop min(k, n) values in descending order.
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Top three", stdin: "6\n4 1 7 3 9 2\n3\n", expectedStdout: "9 7 4\n", matcher: "exact" },
      { name: "k >= n", stdin: "3\n2 5 1\n10\n", expectedStdout: "5 2 1\n", matcher: "exact" }
    ],
    skillTags: ["cpp.stl.adapters", "cpp.stl.algorithms", "dsa.arrays.traversal"]
  },
  "deque-browser-history": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Simulate browser back/forward navigation.

Requirements:
1. Read a homepage line, then m, then m operations:
   - "V <url>": visit url (clears forward history).
   - "B <steps>": go back up to steps pages (clamp at first), print the page.
   - "F <steps>": go forward up to steps pages (clamp at last), print the page.
2. Print one line per B/F operation with the resulting current page.

Input format:
- First line: homepage
- Second line: m
- Next m lines: an operation

Output format:
- One page name per B/F operation.

Expected solution outline:
- Vector of pages + a cursor; V resizes to cursor+1 before appending.

AI evaluation rubric:
- Forward history cleared on visit; back/forward clamp at the ends.`,
    stdin: "home\n5\nV a\nV b\nB 1\nF 1\nB 5\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  string home;
  getline(cin, home);
  int m;
  cin >> m;
  vector<string> history{home};
  size_t cursor = 0;
  for (int i = 0; i < m; ++i) {
    string op;
    cin >> op;
    if (op == "V") {
      string url; cin >> url;
      // TODO: drop forward history, append url, move cursor.
    } else if (op == "B") {
      int s; cin >> s;
      // TODO: move back up to s (clamp at 0) and print history[cursor].
    } else {
      int s; cin >> s;
      // TODO: move forward up to s (clamp at last) and print history[cursor].
    }
  }
  return 0;
}
`,
    visibleTests: [
      { name: "Back and forward", stdin: "home\n5\nV a\nV b\nB 1\nF 1\nB 5\n", expectedStdout: "a\nb\nhome\n", matcher: "exact" },
      { name: "Visit clears forward", stdin: "start\n3\nV x\nB 1\nF 9\n", expectedStdout: "start\nx\n", matcher: "exact" }
    ],
    skillTags: ["cpp.structs_classes.public_private", "dsa.arrays.indexing", "cpp.structs_classes.invariants_intro"]
  },
  "algorithm-clean-scores": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Clean a list of scores with STL algorithms.

Requirements:
1. Read lo, hi, n, then n integers.
2. Drop scores outside the inclusive range [lo, hi], sort ascending, and remove
   duplicates.
3. Print the cleaned values, space-separated (empty line if none remain).

Input format:
- First line: lo hi n
- Second line: n integers

Output format:
- The cleaned values, ascending, space-separated.

Expected solution outline:
- erase-remove_if for range, std::sort, then unique-erase.

AI evaluation rubric:
- Inclusive bounds, sorted, de-duplicated.`,
    stdin: "0 100 5\n-5 40 150 40 90\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <vector>
using namespace std;

int main() {
  int lo, hi, n;
  cin >> lo >> hi >> n;
  vector<int> v(n);
  for (auto& x : v) cin >> x;
  // TODO: drop out-of-range, sort, remove duplicates.
  for (size_t i = 0; i < v.size(); ++i) cout << v[i] << (i + 1 < v.size() ? " " : "");
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Drops and dedupes", stdin: "0 100 5\n-5 40 150 40 90\n", expectedStdout: "40 90\n", matcher: "exact" },
      { name: "Inclusive bounds", stdin: "0 100 4\n0 100 101 -1\n", expectedStdout: "0 100\n", matcher: "exact" }
    ],
    skillTags: ["cpp.stl.algorithms", "cpp.stl.vector", "cpp.stl.lambdas"]
  },
  "string-anagram-groups": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Group anagrams and print them deterministically.

Requirements:
1. Read n, then n words.
2. Group words that are anagrams (same sorted letters).
3. Sort words within each group ascending (keep duplicates), and sort the
   groups by their first word. Print one group per line, words space-separated.

Input format:
- First line: n
- Following whitespace-separated: n words

Output format:
- One line per group of sorted words.

Expected solution outline:
- Bucket by sorted-letter key in a std::map, then sort within and across groups.

AI evaluation rubric:
- Correct grouping and deterministic ordering.`,
    stdin: "6\neat tea tan ate nat bat\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <map>
#include <string>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  map<string, vector<string>> groups;
  for (int i = 0; i < n; ++i) {
    string w;
    cin >> w;
    // TODO: key by sorted letters, then bucket w.
  }
  // TODO: sort within/across groups and print one group per line.
  return 0;
}
`,
    visibleTests: [
      { name: "Classic anagrams", stdin: "6\neat tea tan ate nat bat\n", expectedStdout: "ate eat tea\nbat\nnat tan\n", matcher: "exact" },
      { name: "All distinct", stdin: "3\ndog cat bird\n", expectedStdout: "bird\ncat\ndog\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.hashing", "dsa.strings.char_frequency", "cpp.stl.map"]
  },
  "csv-row-parser": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Parse one CSV row, handling quoted fields.

Requirements:
1. Read one line.
2. Split on commas, but a field wrapped in double quotes may contain commas, and
   "" inside quotes is an escaped double quote.
3. Print each field on its own line, wrapped in [brackets].

Input format:
- One CSV line.

Output format:
- One [field] per line.

Expected solution outline:
- Character-by-character state machine tracking an in_quotes flag.

AI evaluation rubric:
- Quoted commas kept, doubled quotes unescaped, empty fields preserved.`,
    stdin: "a,\"b,c\",d\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<string> parse_csv_row(const string& line) {
  // TODO: scan chars; a comma splits only outside quotes; "" -> literal quote.
  (void)line;
  return {""};
}

int main() {
  string line;
  getline(cin, line);
  for (const auto& f : parse_csv_row(line)) cout << "[" << f << "]\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Quoted comma", stdin: "a,\"b,c\",d\n", expectedStdout: "[a]\n[b,c]\n[d]\n", matcher: "exact" },
      { name: "Empty middle field", stdin: "a,,c\n", expectedStdout: "[a]\n[]\n[c]\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.parsing", "dsa.strings.parsing_edge_cases", "cpp.utilities.stream_validation"]
  },
  "kmp-prefix-table": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Print the KMP prefix (failure) function of a string.

Requirements:
1. Read one line as the string s.
2. Print lps[0..n-1], space-separated, where lps[i] is the length of the longest
   proper prefix of s[0..i] that is also a suffix.

Input format:
- One line: the string.

Output format:
- The lps values, space-separated (empty line for an empty string).

Expected solution outline:
- Keep a running length k, falling back via k = lps[k-1] when characters differ.

AI evaluation rubric:
- O(n) build, correct fallback, lps[0] == 0.`,
    stdin: "abacaba\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  string s;
  getline(cin, s);
  vector<int> lps(s.size(), 0);
  // TODO: for i from 1, extend/fall back to fill lps.
  for (size_t i = 0; i < lps.size(); ++i) cout << lps[i] << (i + 1 < lps.size() ? " " : "");
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Overlapping", stdin: "abacaba\n", expectedStdout: "0 0 1 0 1 2 3\n", matcher: "exact" },
      { name: "Periodic", stdin: "abcabc\n", expectedStdout: "0 0 0 1 2 3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.prefix_function", "dsa.strings.searching", "dsa.strings.substring_subsequence"]
  },
  "rolling-hash-substring-equality": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Answer substring-equality queries with prefix hashing.

Requirements:
1. Read a string s, then q, then q queries "a b len".
2. For each query print YES when s[a, a+len) == s[b, b+len), else NO.
   len == 0 is YES; a range past the end is NO.

Input format:
- First line: s
- Second line: q
- Next q lines: a b len

Output format:
- YES or NO per query.

Expected solution outline:
- Precompute polynomial prefix hashes and BASE powers; compare substring hashes.

AI evaluation rubric:
- O(1) per query after O(n) precompute; correct bounds handling.`,
    stdin: "ababcabab\n3\n0 2 2\n0 4 1\n0 5 4\n",
    starterCode: `#include <iostream>
#include <cstdint>
#include <string>
#include <vector>
using namespace std;

int main() {
  string s;
  getline(cin, s);
  size_t n = s.size();
  vector<uint64_t> pre(n + 1, 0), pw(n + 1, 1);
  const uint64_t BASE = 1315423911ULL;
  // TODO: fill pre and pw.
  auto H = [&](size_t st, size_t len) { return pre[st + len] - pre[st] * pw[len]; };
  int q;
  cin >> q;
  for (int i = 0; i < q; ++i) {
    size_t a, b, l;
    cin >> a >> b >> l;
    bool eq = false;  // TODO: len==0 -> true; out of range -> false; else compare H.
    (void)H;
    cout << (eq ? "YES" : "NO") << "\\n";
  }
  return 0;
}
`,
    visibleTests: [
      { name: "Mixed queries", stdin: "ababcabab\n3\n0 2 2\n0 4 1\n0 5 4\n", expectedStdout: "YES\nNO\nYES\n", matcher: "exact" },
      { name: "Zero length and range", stdin: "hello\n2\n0 3 0\n0 3 3\n", expectedStdout: "YES\nNO\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.hashing", "dsa.strings.searching", "dsa.strings.substring_subsequence"]
  },
  "array-remove-duplicates-sorted": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Remove duplicates from a sorted array in place.

Requirements:
1. Read n, then n sorted integers.
2. Compact the array so the distinct values come first, in order.
3. Print: <k>: v0 v1 ... where k is the number of distinct values.

Input format:
- First line: n
- Second line: n sorted integers

Output format:
- One line: <k>: followed by the k distinct values.

Expected solution outline:
- Two pointers: a write index and a read index; copy forward on change.

AI evaluation rubric:
- O(n) in-place two-pointer, correct distinct count.`,
    stdin: "5\n1 1 2 2 3\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int remove_duplicates(vector<int>& nums) {
  // TODO: two-pointer in-place compaction; return the new length.
  (void)nums;
  return 0;
}

int main() {
  int n;
  cin >> n;
  vector<int> v(n);
  for (auto& x : v) cin >> x;
  int k = remove_duplicates(v);
  cout << k << ":";
  for (int i = 0; i < k; ++i) cout << " " << v[i];
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Removes runs", stdin: "5\n1 1 2 2 3\n", expectedStdout: "3: 1 2 3\n", matcher: "exact" },
      { name: "All same", stdin: "4\n5 5 5 5\n", expectedStdout: "1: 5\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.two_pointers", "dsa.arrays.traversal", "dsa.complexity.big_o"]
  },
  "array-product-except-self": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Compute the product of all elements except self, without division.

Requirements:
1. Read n, then n integers.
2. Print result[0..n-1] space-separated, where result[i] is the product of every
   element except nums[i].

Input format:
- First line: n
- Second line: n integers

Output format:
- One line: the n products, space-separated.

Expected solution outline:
- Prefix products left-to-right, then multiply suffix products right-to-left.

AI evaluation rubric:
- No division; O(n); zeros handled naturally.`,
    stdin: "4\n1 2 3 4\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<long long> a(n);
  for (auto& x : a) cin >> x;
  vector<long long> r(n, 1);
  // TODO: prefix pass, then suffix pass (no division).
  for (int i = 0; i < n; ++i) cout << r[i] << (i + 1 < n ? " " : "");
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "No zeros", stdin: "4\n1 2 3 4\n", expectedStdout: "24 12 8 6\n", matcher: "exact" },
      { name: "Single zero", stdin: "3\n0 4 2\n", expectedStdout: "8 0 0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.prefix_sums", "dsa.arrays.traversal", "dsa.complexity.big_o"]
  },
  "array-plus-one": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Arrays: plus one.

The input is a non-negative integer stored one decimal digit per value, most
significant digit first (e.g. "1 2 9" is 129). Print the digits of that number
plus one, space-separated.

Input format:
- The first line is n, the number of digits.
- The second line has n space-separated digits (each 0..9).

Output format:
- The incremented number's digits, space-separated, then a newline.

[1 2 9] -> "1 3 0"; [9 9 9] -> "1 0 0 0".

AI evaluation rubric:
- Propagates the carry right-to-left; prepends a 1 when the number was all nines.`,
    stdin: "3\n1 2 9\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> d(n);
  for (auto& x : d) cin >> x;
  // TODO: add one to the last digit, carry left, and prepend 1 if needed.
  for (size_t i = 0; i < d.size(); ++i) cout << (i ? " " : "") << d[i];
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Carry", stdin: "3\n1 2 9\n", expectedStdout: "1 3 0\n", matcher: "exact" },
      { name: "All nines", stdin: "3\n9 9 9\n", expectedStdout: "1 0 0 0\n", matcher: "exact" },
      { name: "No carry", stdin: "3\n1 2 3\n", expectedStdout: "1 2 4\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.traversal", "dsa.arrays.indexing"]
  },
  "array-rotate-right": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Arrays: rotate right by k.

Print the array rotated to the right by k positions: each element at index i
moves to (i + k) % n. k may be larger than n.

Input format:
- The first line has two integers n and k.
- The second line has n space-separated integers.

Output format:
- The rotated array, space-separated, then a newline.

[1 2 3 4 5], k=2 -> "4 5 1 2 3".

AI evaluation rubric:
- Reduces k modulo n; rotates in O(n) (e.g. three reversals), not k single shifts.`,
    stdin: "5 2\n1 2 3 4 5\n",
    starterCode: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n, k;
  cin >> n >> k;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  if (n > 0) {
    k %= n;
    // TODO: rotate a right by k (e.g. reverse all, reverse first k, reverse rest).
  }
  for (size_t i = 0; i < a.size(); ++i) cout << (i ? " " : "") << a[i];
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "5 2\n1 2 3 4 5\n", expectedStdout: "4 5 1 2 3\n", matcher: "exact" },
      { name: "k wraps", stdin: "3 7\n1 2 3\n", expectedStdout: "3 1 2\n", matcher: "exact" },
      { name: "k=0", stdin: "3 0\n1 2 3\n", expectedStdout: "1 2 3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.two_pointers", "dsa.arrays.indexing"]
  },
  "strings-longest-palindrome-buildable": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: longest buildable palindrome.

Print the length of the longest palindrome that can be built from the characters
of the input string (case-sensitive). You need not use every character.

Input format:
- One line with the string.

Output format:
- The maximum palindrome length, then a newline.

"abccccdd" -> 7; "abc" -> 1.

AI evaluation rubric:
- Sums freq/2*2 across characters and adds 1 if any character had an odd count.`,
    stdin: "abccccdd\n",
    starterCode: `#include <array>
#include <iostream>
#include <string>
using namespace std;

int main() {
  string s;
  getline(cin, s);
  array<int, 256> freq{};
  for (unsigned char c : s) ++freq[c];
  int length = 0;
  bool hasOdd = false;
  // TODO: add freq/2*2 for each char; set hasOdd if any count is odd.
  cout << length + (hasOdd ? 1 : 0) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Mixed", stdin: "abccccdd\n", expectedStdout: "7\n", matcher: "exact" },
      { name: "One odd", stdin: "aaabb\n", expectedStdout: "5\n", matcher: "exact" },
      { name: "All distinct", stdin: "abc\n", expectedStdout: "1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.char_frequency", "dsa.strings.palindrome"]
  },
  "matrix-transpose": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Matrix: transpose.

Print the transpose of an m x n matrix: the value at (row r, col c) moves to
(row c, col r), producing an n x m matrix.

Input format:
- The first line has two integers m and n (rows and columns).
- The next m lines each have n space-separated integers.

Output format:
- The transposed matrix: n lines of m space-separated integers each.

[[1 2 3] [4 5 6]] -> [[1 4] [2 5] [3 6]].

AI evaluation rubric:
- Builds an n x m result and copies result[c][r] = matrix[r][c].`,
    stdin: "2 3\n1 2 3\n4 5 6\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int m, n;
  cin >> m >> n;
  vector<vector<int>> a(m, vector<int>(n));
  for (int r = 0; r < m; ++r)
    for (int c = 0; c < n; ++c) cin >> a[r][c];
  // TODO: build the n x m transpose and print it, one row per line.
  return 0;
}
`,
    visibleTests: [
      { name: "Rectangular", stdin: "2 3\n1 2 3\n4 5 6\n", expectedStdout: "1 4\n2 5\n3 6\n", matcher: "exact" },
      { name: "Square", stdin: "2 2\n1 2\n3 4\n", expectedStdout: "1 3\n2 4\n", matcher: "exact" },
      { name: "Single row", stdin: "1 3\n1 2 3\n", expectedStdout: "1\n2\n3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.indexing", "dsa.arrays.traversal"]
  },
  "matrix-rotate-image": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Matrix: rotate image 90 degrees.

Print the n x n matrix rotated 90 degrees clockwise. Element (r, c) moves to
(c, n-1-r).

Input format:
- The first line is n.
- The next n lines each have n space-separated integers.

Output format:
- The rotated matrix: n lines of n space-separated integers each.

[[1 2 3] [4 5 6] [7 8 9]] -> [[7 4 1] [8 5 2] [9 6 3]].

AI evaluation rubric:
- Maps result[c][n-1-r] = matrix[r][c] (or transpose + reverse rows).`,
    stdin: "3\n1 2 3\n4 5 6\n7 8 9\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<vector<int>> a(n, vector<int>(n));
  for (int r = 0; r < n; ++r)
    for (int c = 0; c < n; ++c) cin >> a[r][c];
  vector<vector<int>> out(n, vector<int>(n, 0));
  // TODO: fill out[c][n-1-r] = a[r][c], then print row by row.
  for (int r = 0; r < n; ++r) {
    for (int c = 0; c < n; ++c) cout << (c ? " " : "") << out[r][c];
    cout << "\\n";
  }
  return 0;
}
`,
    visibleTests: [
      { name: "3x3", stdin: "3\n1 2 3\n4 5 6\n7 8 9\n", expectedStdout: "7 4 1\n8 5 2\n9 6 3\n", matcher: "exact" },
      { name: "2x2", stdin: "2\n1 2\n3 4\n", expectedStdout: "3 1\n4 2\n", matcher: "exact" },
      { name: "1x1", stdin: "1\n42\n", expectedStdout: "42\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.indexing", "dsa.arrays.traversal"]
  },
  "matrix-spiral-order": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Matrix: spiral order.

Print the elements of an m x n matrix in clockwise spiral order (starting at the
top-left), space-separated on one line.

Input format:
- The first line has two integers m and n.
- The next m lines each have n space-separated integers.

Output format:
- The values in spiral order, space-separated, then a newline.

[[1 2 3] [4 5 6] [7 8 9]] -> "1 2 3 6 9 8 7 4 5".

AI evaluation rubric:
- Peels layers with top/bottom/left/right boundaries; guards the bottom row and
  left column so a thin strip is not revisited.`,
    stdin: "3\n1 2 3\n4 5 6\n7 8 9\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int m, n;
  cin >> m >> n;
  vector<vector<int>> a(m, vector<int>(n));
  for (int r = 0; r < m; ++r)
    for (int c = 0; c < n; ++c) cin >> a[r][c];
  vector<int> out;
  // TODO: walk the spiral (top row, right col, bottom row, left col), shrinking.
  for (size_t i = 0; i < out.size(); ++i) cout << (i ? " " : "") << out[i];
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "3x3", stdin: "3 3\n1 2 3\n4 5 6\n7 8 9\n", expectedStdout: "1 2 3 6 9 8 7 4 5\n", matcher: "exact" },
      { name: "Rectangular", stdin: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n", expectedStdout: "1 2 3 4 8 12 11 10 9 5 6 7\n", matcher: "exact" },
      { name: "Single row", stdin: "1 3\n1 2 3\n", expectedStdout: "1 2 3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.indexing", "dsa.arrays.traversal"]
  },
  "strings-is-subsequence": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: is subsequence.

Print whether string s is a subsequence of string t: s can be formed by deleting
zero or more characters of t without reordering the rest.

Input format:
- The first line is s.
- The second line is t.

Output format:
- "true" or "false", then a newline.

s="abc", t="ahbgdc" -> true; s="axc", t="ahbgdc" -> false.

AI evaluation rubric:
- Two-pointer scan of t, advancing through s on each match; s empty is always
  true.`,
    stdin: "abc\nahbgdc\n",
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
  string s, t;
  getline(cin, s);
  getline(cin, t);
  size_t i = 0;
  // TODO: scan t; advance i on each match; s is a subsequence iff i == s.size().
  bool ok = (i == s.size());
  cout << (ok ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Subsequence", stdin: "abc\nahbgdc\n", expectedStdout: "true\n", matcher: "exact" },
      { name: "Not a subsequence", stdin: "axc\nahbgdc\n", expectedStdout: "false\n", matcher: "exact" },
      { name: "Empty s", stdin: "\nabc\n", expectedStdout: "true\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.manipulation", "dsa.arrays.two_pointers"]
  },
  "math-integer-sqrt": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Math: integer square root.

Print floor(sqrt(x)) for a non-negative integer x: the largest r with r*r <= x.
Use integer arithmetic only (no std::sqrt).

Input format:
- One line with the integer x.

Output format:
- The integer square root, then a newline.

8 -> 2; 144 -> 12.

AI evaluation rubric:
- Binary searches r in [0, x] with a 64-bit product to avoid overflow.`,
    stdin: "8\n",
    starterCode: `#include <iostream>
using namespace std;

int main() {
  int x;
  cin >> x;
  long long lo = 0, hi = x, best = 0;
  // TODO: binary search the largest r with (long long)r*r <= x.
  cout << best << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Non-square", stdin: "8\n", expectedStdout: "2\n", matcher: "exact" },
      { name: "Perfect square", stdin: "144\n", expectedStdout: "12\n", matcher: "exact" },
      { name: "Zero", stdin: "0\n", expectedStdout: "0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.searching.binary_search", "dsa.math.number_theory"]
  },
  "sliding-window-min-size-subarray": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Find the shortest subarray whose sum reaches a target.

Requirements:
1. Read target, then n, then n positive integers.
2. Print the length of the shortest contiguous subarray with sum >= target,
   or 0 if none.

Input format:
- First line: target n
- Second line: n positive integers

Output format:
- One integer: the shortest length (0 if impossible).

Expected solution outline:
- Sliding window: grow right, shrink left while the sum stays >= target.

AI evaluation rubric:
- O(n) window, correct no-solution handling.`,
    stdin: "7 6\n2 3 1 2 4 3\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int target, n;
  cin >> target >> n;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  // TODO: sliding window over a; track the shortest length.
  int best = 0;
  cout << best << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Short window", stdin: "7 6\n2 3 1 2 4 3\n", expectedStdout: "2\n", matcher: "exact" },
      { name: "No solution", stdin: "100 3\n1 2 3\n", expectedStdout: "0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.sliding_window", "dsa.arrays.two_pointers", "dsa.complexity.big_o"]
  },
  "binary-search-first-last": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Find the first and last index of a target in a sorted array.

Requirements:
1. Read n, then n sorted integers, then a target.
2. Print "<first> <last>" (0-based), or "-1 -1" if the target is absent.
3. Use binary search (O(log n)).

Input format:
- First line: n
- Second line: n sorted integers
- Third line: target

Output format:
- One line: first and last index, space-separated.

Expected solution outline:
- Two binary searches biased left and right.

AI evaluation rubric:
- O(log n), correct duplicate range and absent handling.`,
    stdin: "6\n5 7 7 8 8 10\n8\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  int target;
  cin >> target;
  // TODO: binary-search the leftmost and rightmost occurrence.
  int first = -1, last = -1;
  cout << first << " " << last << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Range of eights", stdin: "6\n5 7 7 8 8 10\n8\n", expectedStdout: "3 4\n", matcher: "exact" },
      { name: "Absent", stdin: "6\n5 7 7 8 8 10\n6\n", expectedStdout: "-1 -1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.searching.binary_search", "dsa.arrays.two_pointers", "dsa.complexity.big_o"]
  },
  "interval-merge-meetings": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Merge overlapping meeting intervals.

Requirements:
1. Read n, then n intervals (start end per line).
2. Merge intervals that overlap or touch.
3. Print the merged intervals sorted by start as "s-e" tokens, space-separated.

Input format:
- First line: n
- Next n lines: start end

Output format:
- One line: merged intervals as s-e, space-separated.

Expected solution outline:
- Sort by start; merge when the next start <= current end.

AI evaluation rubric:
- Correct sorting, touching-merge, and nesting handling.`,
    stdin: "4\n1 3\n2 6\n8 10\n15 18\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<pair<int, int>> v(n);
  for (auto& p : v) cin >> p.first >> p.second;
  // TODO: sort by start, then merge overlapping/touching intervals.
  vector<pair<int, int>> m;
  for (size_t i = 0; i < m.size(); ++i)
    cout << m[i].first << "-" << m[i].second << (i + 1 < m.size() ? " " : "");
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic merge", stdin: "4\n1 3\n2 6\n8 10\n15 18\n", expectedStdout: "1-6 8-10 15-18\n", matcher: "exact" },
      { name: "Touching", stdin: "2\n1 4\n4 5\n", expectedStdout: "1-5\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.interval_scheduling", "dsa.sorting.comparator", "dsa.complexity.big_o"]
  },
  "linked-list-reverse": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Reverse a singly linked list and print it.

Requirements:
1. Read n, then n integers; build a linked list in that order.
2. Reverse the list in place (repoint next pointers; no new nodes).
3. Print the reversed values, space-separated.

Input format:
- First line: n
- Second line: n integers

Output format:
- The reversed values, space-separated.

Expected solution outline:
- prev/curr/next three-pointer walk; return the old tail as the new head.

AI evaluation rubric:
- In-place O(1)-space reversal, correct order.`,
    stdin: "3\n1 2 3\n",
    starterCode: `#include <iostream>
using namespace std;

struct ListNode { int val; ListNode* next; ListNode(int v) : val(v), next(nullptr) {} };

ListNode* reverse_list(ListNode* head) {
  // TODO: reverse the next pointers; return the new head.
  return head;
}

int main() {
  int n;
  cin >> n;
  ListNode* head = nullptr;
  ListNode** tail = &head;
  for (int i = 0; i < n; ++i) { int x; cin >> x; *tail = new ListNode(x); tail = &(*tail)->next; }
  head = reverse_list(head);
  bool first = true;
  for (ListNode* c = head; c; c = c->next) { cout << (first ? "" : " ") << c->val; first = false; }
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Three nodes", stdin: "3\n1 2 3\n", expectedStdout: "3 2 1\n", matcher: "exact" },
      { name: "Five nodes", stdin: "5\n10 20 30 40 50\n", expectedStdout: "50 40 30 20 10\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.linked_list", "cpp.references.pointers", "dsa.trees.list_vs_vector"]
  },
  "linked-list-remove-elements": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Linked list: remove elements.

Remove every node whose value equals val from a singly linked list and print the
remaining values.

Input format:
- The first line is n, the number of nodes.
- The second line has n space-separated node values.
- The third line is val.

Output format:
- The remaining values in order, space-separated (empty line if none), then a
  newline.

[1 2 6 3 6], val=6 -> "1 2 3".

AI evaluation rubric:
- Uses a dummy head; unlinks and deletes matches; advances prev only on no-match.`,
    stdin: "5\n1 2 6 3 6\n6\n",
    starterCode: `#include <iostream>
using namespace std;

struct ListNode { int val; ListNode* next; ListNode(int v) : val(v), next(nullptr) {} };

ListNode* remove_elements(ListNode* head, int val) {
  // TODO: use a dummy node; unlink and delete nodes whose value is val.
  (void)val;
  return head;
}

int main() {
  int n;
  cin >> n;
  ListNode* head = nullptr;
  ListNode** tail = &head;
  for (int i = 0; i < n; ++i) { int x; cin >> x; *tail = new ListNode(x); tail = &(*tail)->next; }
  int val;
  cin >> val;
  head = remove_elements(head, val);
  bool first = true;
  for (ListNode* c = head; c; c = c->next) { cout << (first ? "" : " ") << c->val; first = false; }
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Remove middle", stdin: "5\n1 2 6 3 6\n6\n", expectedStdout: "1 2 3\n", matcher: "exact" },
      { name: "Remove head", stdin: "4\n7 7 1 2\n7\n", expectedStdout: "1 2\n", matcher: "exact" },
      { name: "Remove all", stdin: "3\n5 5 5\n5\n", expectedStdout: "\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.linked_list", "cpp.references.pointers"]
  },
  "linked-list-middle-node": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Linked list: middle node.

Print the values from the MIDDLE node of a singly linked list to the end. For an
even number of nodes, the middle is the second of the two middle nodes.

Input format:
- The first line is n, the number of nodes.
- The second line has n space-separated node values.

Output format:
- The values from the middle node to the end, space-separated, then a newline.

[1 2 3 4 5] -> "3 4 5"; [1 2 3 4 5 6] -> "4 5 6".

AI evaluation rubric:
- Uses slow/fast pointers in one pass; slow lands on the (second) middle.`,
    stdin: "5\n1 2 3 4 5\n",
    starterCode: `#include <iostream>
using namespace std;

struct ListNode { int val; ListNode* next; ListNode(int v) : val(v), next(nullptr) {} };

ListNode* middle_node(ListNode* head) {
  // TODO: advance slow by 1 and fast by 2; return slow when fast runs out.
  return head;
}

int main() {
  int n;
  cin >> n;
  ListNode* head = nullptr;
  ListNode** tail = &head;
  for (int i = 0; i < n; ++i) { int x; cin >> x; *tail = new ListNode(x); tail = &(*tail)->next; }
  bool first = true;
  for (ListNode* c = middle_node(head); c; c = c->next) { cout << (first ? "" : " ") << c->val; first = false; }
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Odd length", stdin: "5\n1 2 3 4 5\n", expectedStdout: "3 4 5\n", matcher: "exact" },
      { name: "Even length", stdin: "6\n1 2 3 4 5 6\n", expectedStdout: "4 5 6\n", matcher: "exact" },
      { name: "Single", stdin: "1\n42\n", expectedStdout: "42\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.linked_list", "cpp.references.pointers"]
  },
  "linked-list-detect-cycle": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Detect a cycle in a singly linked list.

Requirements:
1. Read n, then n integers, then pos.
2. Build a list of the n values; if pos >= 0, make the last node's next point to
   node index pos (0-based), creating a cycle.
3. Print YES if the list has a cycle, else NO. Use Floyd's algorithm.

Input format:
- First line: n
- Second line: n integers
- Third line: pos (-1 for no cycle)

Output format:
- YES or NO.

Expected solution outline:
- Slow/fast pointers; a cycle exists when they meet.

AI evaluation rubric:
- O(1) space (no visited set), correct detection.`,
    stdin: "4\n1 2 3 4\n1\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

struct ListNode { int val; ListNode* next; ListNode(int v) : val(v), next(nullptr) {} };

bool has_cycle(ListNode* head) {
  // TODO: Floyd's tortoise and hare.
  (void)head;
  return false;
}

int main() {
  int n;
  cin >> n;
  vector<ListNode*> nodes;
  for (int i = 0; i < n; ++i) { int x; cin >> x; nodes.push_back(new ListNode(x)); }
  for (int i = 0; i + 1 < n; ++i) nodes[i]->next = nodes[i + 1];
  int pos; cin >> pos;
  if (pos >= 0 && n > 0) nodes.back()->next = nodes[pos];
  cout << (has_cycle(n ? nodes[0] : nullptr) ? "YES" : "NO") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Has cycle", stdin: "4\n1 2 3 4\n1\n", expectedStdout: "YES\n", matcher: "exact" },
      { name: "No cycle", stdin: "3\n1 2 3\n-1\n", expectedStdout: "NO\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.linked_list", "cpp.references.pointers", "dsa.graphs.cycle_detection"]
  },
  "stack-min-stack": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Drive a min-stack with a command script.

Requirements:
1. Read m, then m commands: "PUSH x", "POP", "TOP", or "MIN".
2. Maintain a stack that reports its current minimum in O(1).
3. Print the result of each TOP and MIN command, one per line.

Input format:
- First line: m
- Next m lines: a command

Output format:
- One line per TOP/MIN with the value.

Expected solution outline:
- Keep a parallel stack of running minimums.

AI evaluation rubric:
- O(1) get_min via a min-tracking stack.`,
    stdin: "6\nPUSH 3\nPUSH 5\nMIN\nPUSH 2\nMIN\nTOP\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  int m;
  cin >> m;
  vector<int> data, mins;
  for (int i = 0; i < m; ++i) {
    string op;
    cin >> op;
    if (op == "PUSH") {
      int x; cin >> x;
      // TODO: push x and update the running minimum.
    } else if (op == "POP") {
      // TODO: pop from both stacks.
    } else if (op == "TOP") {
      // TODO: print the top value.
    } else {  // MIN
      // TODO: print the current minimum.
    }
  }
  return 0;
}
`,
    visibleTests: [
      { name: "Min tracking", stdin: "6\nPUSH 3\nPUSH 5\nMIN\nPUSH 2\nMIN\nTOP\n", expectedStdout: "3\n2\n2\n", matcher: "exact" },
      { name: "Pop restores min", stdin: "5\nPUSH 4\nPUSH 1\nPOP\nMIN\nTOP\n", expectedStdout: "4\n4\n", matcher: "exact" }
    ],
    skillTags: ["dsa.stacks.basic_stack", "cpp.stl.adapters", "dsa.complexity.amortized"]
  },
  "stack-evaluate-rpn": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Stack: evaluate Reverse Polish Notation.

Evaluate a postfix (RPN) arithmetic expression. Tokens are integers or one of the
operators + - * / . Print the integer result.

Input format:
- The first line is n, the number of tokens.
- The second line has n space-separated tokens.

Output format:
- The evaluated result, then a newline.

["2","1","+","3","*"] -> 9.

AI evaluation rubric:
- Uses a stack; the second popped operand is the LEFT one; int division truncates
  toward zero.`,
    stdin: "5\n2 1 + 3 *\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<string> tok(n);
  for (auto& t : tok) cin >> t;
  vector<int> st;
  // TODO: push numbers; on an operator pop two (right then left), apply, push.
  cout << (st.empty() ? 0 : st.back()) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "5\n2 1 + 3 *\n", expectedStdout: "9\n", matcher: "exact" },
      { name: "Division", stdin: "5\n4 13 5 / +\n", expectedStdout: "6\n", matcher: "exact" },
      { name: "Single", stdin: "1\n42\n", expectedStdout: "42\n", matcher: "exact" }
    ],
    skillTags: ["dsa.stacks.basic_stack", "dsa.arrays.traversal"]
  },
  "array-majority-element": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Arrays: majority element.

Print the majority element: the value that appears more than n/2 times (it is
guaranteed to exist).

Input format:
- The first line is n, the number of values.
- The second line has n space-separated integers.

Output format:
- The majority element, then a newline.

[2 2 1 1 1 2 2] -> 2.

AI evaluation rubric:
- Uses Boyer-Moore voting (O(n) time, O(1) space), not a frequency map/sort.`,
    stdin: "7\n2 2 1 1 1 2 2\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  int candidate = 0, count = 0;
  // TODO: Boyer-Moore voting; adopt a new candidate when count hits 0.
  cout << candidate << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Seven values", stdin: "7\n2 2 1 1 1 2 2\n", expectedStdout: "2\n", matcher: "exact" },
      { name: "Three", stdin: "3\n3 2 3\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Single", stdin: "1\n7\n", expectedStdout: "7\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.traversal", "dsa.complexity.big_o"]
  },
  "array-container-most-water": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Arrays: container with most water.

Each value is a vertical line height. Print the maximum water area between two
lines: min(height[i], height[j]) * (j - i).

Input format:
- The first line is n, the number of lines.
- The second line has n space-separated heights.

Output format:
- The maximum area, then a newline.

[1 8 6 2 5 4 8 3 7] -> 49.

AI evaluation rubric:
- Two pointers from the ends (O(n)); moves the shorter side inward, not O(n^2).`,
    stdin: "9\n1 8 6 2 5 4 8 3 7\n",
    starterCode: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> h(n);
  for (auto& x : h) cin >> x;
  int i = 0, j = n - 1, best = 0;
  // TODO: track max min(h[i],h[j])*(j-i); move the shorter side inward.
  cout << best << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Classic", stdin: "9\n1 8 6 2 5 4 8 3 7\n", expectedStdout: "49\n", matcher: "exact" },
      { name: "Valley", stdin: "5\n5 1 1 1 5\n", expectedStdout: "20\n", matcher: "exact" },
      { name: "Two lines", stdin: "2\n1 1\n", expectedStdout: "1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.arrays.two_pointers", "dsa.complexity.big_o"]
  },
  "math-count-primes": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Math: count primes below n.

Print the number of prime numbers strictly less than n.

Input format:
- One line with the integer n.

Output format:
- The count of primes in [2, n), then a newline.

n = 10 -> 4 (2, 3, 5, 7); n = 100 -> 25.

AI evaluation rubric:
- Uses the Sieve of Eratosthenes (mark from p*p); n <= 2 yields 0.`,
    stdin: "10\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  int count = 0;
  // TODO: sieve [0, n); mark composites from p*p; count the remaining primes.
  cout << count << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Below 10", stdin: "10\n", expectedStdout: "4\n", matcher: "exact" },
      { name: "Below 100", stdin: "100\n", expectedStdout: "25\n", matcher: "exact" },
      { name: "None", stdin: "2\n", expectedStdout: "0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.number_theory", "dsa.arrays.traversal"]
  },
  "tree-lowest-common-ancestor-bst": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Find the lowest common ancestor of two values in a BST.

Requirements:
1. Read n, then n integers inserted (in order) into a BST, then p and q.
2. Print the value of the lowest common ancestor of p and q.
3. Use the BST ordering to walk down in O(height).

Input format:
- First line: n
- Second line: n integers (insertion order)
- Third line: p q

Output format:
- One integer: the LCA value.

Expected solution outline:
- Descend left when both < node, right when both > node, else stop.

AI evaluation rubric:
- Uses BST property; no full traversal.`,
    stdin: "9\n6 2 8 0 4 7 9 3 5\n3 5\n",
    starterCode: `#include <iostream>
using namespace std;

struct TreeNode { int val; TreeNode* left; TreeNode* right; TreeNode(int v) : val(v), left(nullptr), right(nullptr) {} };

TreeNode* insert(TreeNode* root, int v) {
  if (!root) return new TreeNode(v);
  if (v < root->val) root->left = insert(root->left, v); else root->right = insert(root->right, v);
  return root;
}

TreeNode* lowest_common_ancestor(TreeNode* root, int p, int q) {
  // TODO: descend using the BST ordering until the values split.
  (void)p; (void)q;
  return root;
}

int main() {
  int n;
  cin >> n;
  TreeNode* root = nullptr;
  for (int i = 0; i < n; ++i) { int x; cin >> x; root = insert(root, x); }
  int p, q; cin >> p >> q;
  cout << lowest_common_ancestor(root, p, q)->val << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Split in subtree", stdin: "9\n6 2 8 0 4 7 9 3 5\n3 5\n", expectedStdout: "4\n", matcher: "exact" },
      { name: "Split at root", stdin: "9\n6 2 8 0 4 7 9 3 5\n2 8\n", expectedStdout: "6\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.bst_search", "dsa.trees.traversal", "cpp.references.pointers"]
  },
  "dsu-number-of-islands": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Count the islands in a grid.

Requirements:
1. Read r, then r rows of a grid of '1' (land) and '0' (water).
2. Count 4-directionally connected groups of land cells.
3. Print the number of islands.

Input format:
- First line: r
- Next r lines: the grid rows (equal length)

Output format:
- One integer: the island count.

Expected solution outline:
- Union-find over land cells (or DFS/BFS flood fill).

AI evaluation rubric:
- 4-directional connectivity, correct component count.`,
    stdin: "4\n11000\n11000\n00100\n00011\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int num_islands(const vector<string>& grid) {
  // TODO: union/flood-fill adjacent land cells and count the components.
  (void)grid;
  return 0;
}

int main() {
  int r;
  cin >> r;
  vector<string> grid(r);
  for (auto& row : grid) cin >> row;
  cout << num_islands(grid) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Three islands", stdin: "4\n11000\n11000\n00100\n00011\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Diagonal not connected", stdin: "3\n101\n010\n101\n", expectedStdout: "5\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.disjoint_set", "dsa.graphs.connected_components", "dsa.trees.dsu_internals"]
  },
  "graph-course-schedule": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Decide whether all courses can be finished.

Requirements:
1. Read num_courses, then m, then m pairs "a b" meaning b must come before a.
2. Print YES if every course is finishable (no cyclic dependency), else NO.

Input format:
- First line: num_courses
- Second line: m
- Next m lines: a b

Output format:
- YES or NO.

Expected solution outline:
- Kahn's algorithm: repeatedly take an in-degree-0 course; a leftover means a cycle.

AI evaluation rubric:
- Correct topological/cycle logic.`,
    stdin: "2\n1\n1 0\n",
    starterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
  int nc, m;
  cin >> nc >> m;
  vector<vector<int>> adj(nc);
  vector<int> indeg(nc, 0);
  for (int i = 0; i < m; ++i) {
    int a, b; cin >> a >> b;
    adj[b].push_back(a); ++indeg[a];
  }
  // TODO: Kahn's algorithm; print YES if all nc courses can be taken, else NO.
  cout << "YES" << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Finishable", stdin: "2\n1\n1 0\n", expectedStdout: "YES\n", matcher: "exact" },
      { name: "Cycle", stdin: "2\n2\n1 0\n0 1\n", expectedStdout: "NO\n", matcher: "exact" }
    ],
    skillTags: ["dsa.graphs.topological_sort", "dsa.graphs.cycle_detection", "dsa.graphs.representation"]
  },
  "graph-bipartite-coloring": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Decide whether an undirected graph is bipartite.

Requirements:
1. Read n, then m, then m undirected edges "u v".
2. Print YES if the graph can be 2-colored with no same-colored edge, else NO.
3. Handle disconnected graphs.

Input format:
- First line: n
- Second line: m
- Next m lines: u v

Output format:
- YES or NO.

Expected solution outline:
- BFS-color each component; a same-color edge means not bipartite.

AI evaluation rubric:
- Every component checked; correct on odd cycles.`,
    stdin: "4\n4\n0 1\n1 2\n2 3\n3 0\n",
    starterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
  int n, m;
  cin >> n >> m;
  vector<vector<int>> adj(n);
  for (int i = 0; i < m; ++i) { int u, v; cin >> u >> v; adj[u].push_back(v); adj[v].push_back(u); }
  // TODO: 2-color every component with BFS; print NO on a conflict, else YES.
  cout << "YES" << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Even cycle", stdin: "4\n4\n0 1\n1 2\n2 3\n3 0\n", expectedStdout: "YES\n", matcher: "exact" },
      { name: "Triangle", stdin: "3\n3\n0 1\n1 2\n2 0\n", expectedStdout: "NO\n", matcher: "exact" }
    ],
    skillTags: ["dsa.graphs.bipartite_scc", "dsa.graphs.bfs", "dsa.graphs.representation"]
  },
  "graph-dijkstra-network-delay": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Compute how long a signal takes to reach all nodes.

Requirements:
1. Read n, m, source, then m directed edges "u v w" (non-negative w).
2. Print the maximum shortest-path distance from source to all nodes, or -1 if
   any node is unreachable.

Input format:
- First line: n m source
- Next m lines: u v w

Output format:
- One integer.

Expected solution outline:
- Dijkstra with a min-heap; answer is the largest finite distance.

AI evaluation rubric:
- Correct shortest paths and unreachable handling.`,
    stdin: "4\n4\n0\n0 1 1\n0 2 4\n1 2 2\n2 3 1\n",
    starterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
  int n, m, s;
  cin >> n >> m >> s;
  vector<vector<pair<int,int>>> adj(n);
  for (int i = 0; i < m; ++i) { int u, v, w; cin >> u >> v >> w; adj[u].push_back({v, w}); }
  // TODO: Dijkstra from s; print max finite distance or -1.
  cout << -1 << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Reaches all", stdin: "4\n4\n0\n0 1 1\n0 2 4\n1 2 2\n2 3 1\n", expectedStdout: "4\n", matcher: "exact" },
      { name: "Unreachable", stdin: "3\n1\n0\n0 1 1\n", expectedStdout: "-1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.graphs.shortest_path", "dsa.graphs.shortest_path_algorithms", "dsa.graphs.representation"]
  },
  "graph-kruskal-mst": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Compute the total weight of a minimum spanning tree.

Requirements:
1. Read n, m, then m undirected weighted edges "u v w".
2. Print the MST total weight, or -1 if the graph is disconnected.

Input format:
- First line: n
- Second line: m
- Next m lines: u v w

Output format:
- One integer.

Expected solution outline:
- Kruskal: sort edges, union endpoints in different components, stop at n-1 edges.

AI evaluation rubric:
- Correct MST weight and disconnected detection.`,
    stdin: "4\n5\n0 1 1\n1 2 2\n2 3 3\n0 3 4\n0 2 5\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <array>
#include <numeric>
#include <vector>
using namespace std;

int main() {
  int n, m;
  cin >> n >> m;
  vector<array<int,3>> e(m);  // {weight, u, v}
  for (auto& x : e) { int u, v, w; cin >> u >> v >> w; x = {w, u, v}; }
  // TODO: sort by weight and union with a DSU; print total or -1.
  cout << -1 << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Square graph", stdin: "4\n5\n0 1 1\n1 2 2\n2 3 3\n0 3 4\n0 2 5\n", expectedStdout: "6\n", matcher: "exact" },
      { name: "Disconnected", stdin: "3\n1\n0 1 1\n", expectedStdout: "-1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.graphs.mst", "dsa.trees.disjoint_set", "dsa.sorting.comparator"]
  },
  "graph-clone-undirected": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Deep-copy an undirected graph and print the copy's structure.

Requirements:
1. Read n, m, then m undirected edges "u v"; nodes are 0..n-1 with val == id.
2. Deep-copy the graph (no shared pointers), then print each node's sorted
   neighbor ids as "i: n1 n2 ..." on its own line.

Input format:
- First line: n
- Second line: m
- Next m lines: u v

Output format:
- n lines "i:" followed by sorted neighbor ids.

Expected solution outline:
- Map original->copy during traversal so cycles are copied once.

AI evaluation rubric:
- Structure preserved by a genuine deep copy.`,
    stdin: "4\n4\n0 1\n1 2\n2 3\n3 0\n",
    starterCode: `#include <iostream>
#include <unordered_map>
#include <algorithm>
#include <vector>
using namespace std;

struct GraphNode { int val; vector<GraphNode*> neighbors; GraphNode(int v) : val(v) {} };

GraphNode* clone_graph(GraphNode* node) {
  // TODO: deep-copy using an original->copy map.
  return node;
}

int main() {
  int n, m;
  cin >> n >> m;
  vector<GraphNode*> nd;
  for (int i = 0; i < n; ++i) nd.push_back(new GraphNode(i));
  for (int i = 0; i < m; ++i) { int u, v; cin >> u >> v; nd[u]->neighbors.push_back(nd[v]); nd[v]->neighbors.push_back(nd[u]); }
  GraphNode* cl = clone_graph(n ? nd[0] : nullptr);
  vector<vector<int>> out(n);
  vector<GraphNode*> st; unordered_map<GraphNode*, bool> seen;
  if (cl) { st.push_back(cl); seen[cl] = true; }
  while (!st.empty()) {
    GraphNode* c = st.back(); st.pop_back();
    for (GraphNode* x : c->neighbors) { out[c->val].push_back(x->val); if (!seen[x]) { seen[x] = true; st.push_back(x); } }
  }
  for (int i = 0; i < n; ++i) { sort(out[i].begin(), out[i].end()); cout << i << ":"; for (int v : out[i]) cout << " " << v; cout << "\\n"; }
  return 0;
}
`,
    visibleTests: [
      { name: "Square preserved", stdin: "4\n4\n0 1\n1 2\n2 3\n3 0\n", expectedStdout: "0: 1 3\n1: 0 2\n2: 1 3\n3: 0 2\n", matcher: "exact" },
      { name: "Triangle preserved", stdin: "3\n3\n0 1\n1 2\n2 0\n", expectedStdout: "0: 1 2\n1: 0 2\n2: 0 1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.graphs.dfs", "dsa.graphs.representation", "cpp.references.pointers"]
  },
  "dp-climbing-stairs": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Count the ways to climb n stairs (1 or 2 steps at a time).

Requirements:
1. Read n.
2. Print the number of distinct ways to climb, using ways(n) = ways(n-1) + ways(n-2).

Input format:
- One integer n.

Output format:
- One integer (use long long; it grows like Fibonacci).

Expected solution outline:
- Iterate, keeping the previous two counts.

AI evaluation rubric:
- O(n)/O(1) iteration, correct base cases.`,
    stdin: "5\n",
    starterCode: `#include <iostream>
using namespace std;

int main() {
  int n;
  cin >> n;
  // TODO: roll two counts forward; print ways(n).
  long long ways = 0;
  cout << ways << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Five stairs", stdin: "5\n", expectedStdout: "8\n", matcher: "exact" },
      { name: "Ten stairs", stdin: "10\n", expectedStdout: "89\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.recursion.base_case", "dsa.techniques.dp_forms"]
  },
  "dp-house-robber": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Maximize the loot without robbing two adjacent houses.

Requirements:
1. Read n, then n house values.
2. Print the maximum total with no two chosen houses adjacent.

Input format:
- First line: n
- Second line: n integers

Output format:
- One integer.

Expected solution outline:
- Track "best taking house i" vs "best skipping it" as you scan.

AI evaluation rubric:
- O(n)/O(1) DP, correct adjacency constraint.`,
    stdin: "5\n2 7 9 3 1\n",
    starterCode: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
  int n;
  cin >> n;
  long long take = 0, skip = 0;
  for (int i = 0; i < n; ++i) {
    int v; cin >> v;
    // TODO: update take/skip.
    (void)v;
  }
  cout << max(take, skip) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Alternating pick", stdin: "5\n2 7 9 3 1\n", expectedStdout: "12\n", matcher: "exact" },
      { name: "Small", stdin: "4\n1 2 3 1\n", expectedStdout: "4\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_design", "dsa.arrays.traversal"]
  },
  "dp-coin-change-min": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Make an amount with the fewest coins.

Requirements:
1. Read k, then k coin denominations, then the target amount.
2. Print the minimum number of coins that sum to amount, or -1 if impossible.

Input format:
- First line: k
- Second line: k coin values
- Third line: amount

Output format:
- One integer (-1 if impossible).

Expected solution outline:
- Bottom-up DP: best[a] = 1 + min over coins of best[a-coin].

AI evaluation rubric:
- Correct DP (not greedy), impossible handled.`,
    stdin: "3\n1 2 5\n11\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int k;
  cin >> k;
  vector<int> coins(k);
  for (auto& c : coins) cin >> c;
  int amount;
  cin >> amount;
  // TODO: fill best[0..amount]; print best[amount] or -1.
  cout << -1 << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Eleven", stdin: "3\n1 2 5\n11\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Impossible", stdin: "1\n2\n3\n", expectedStdout: "-1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_design", "dsa.complexity.time_space_tradeoffs"]
  },
  "dp-longest-common-subsequence": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Length of the longest common subsequence of two strings.

Requirements:
1. Read two lines: strings a and b.
2. Print the length of their longest common subsequence.

Input format:
- First line: a
- Second line: b

Output format:
- One integer.

Expected solution outline:
- 2-D DP; match extends the diagonal, else take the better of dropping a char.

AI evaluation rubric:
- Correct LCS recurrence and empty handling.`,
    stdin: "abcde\nace\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
  string a, b;
  getline(cin, a);
  getline(cin, b);
  // TODO: DP over a and b; print the LCS length.
  cout << 0 << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Classic", stdin: "abcde\nace\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Interleaved", stdin: "aggtab\ngxtxayb\n", expectedStdout: "4\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.dynamic_programming", "dsa.techniques.dp_forms", "dsa.strings.substring_subsequence"]
  },
  "greedy-jump-game": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Can you reach the last index by jumping forward?

Requirements:
1. Read n, then n integers where nums[i] is the max jump from index i.
2. Print YES if the last index is reachable from index 0, else NO.

Input format:
- First line: n
- Second line: n integers

Output format:
- YES or NO.

Expected solution outline:
- Greedy: track the farthest reachable index; fail if an index exceeds it.

AI evaluation rubric:
- O(n) greedy, correct blocked-by-zero handling.`,
    stdin: "5\n2 3 1 1 4\n",
    starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> v(n);
  for (auto& x : v) cin >> x;
  // TODO: track the farthest reach; print NO if you get stuck, else YES.
  cout << "NO" << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Reachable", stdin: "5\n2 3 1 1 4\n", expectedStdout: "YES\n", matcher: "exact" },
      { name: "Blocked by zero", stdin: "5\n3 2 1 0 4\n", expectedStdout: "NO\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.greedy", "dsa.techniques.greedy_proof", "dsa.arrays.traversal"]
  },
  "greedy-activity-selection": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Select the maximum number of non-overlapping activities.

Requirements:
1. Read n, then n "start end" pairs.
2. Print the maximum number of mutually compatible activities (an activity that
   ends at t and one that starts at t do not overlap).

Input format:
- First line: n
- Next n lines: start end

Output format:
- One integer.

Expected solution outline:
- Sort by end time; greedily take the earliest-finishing compatible activity.

AI evaluation rubric:
- Correct greedy by finish time.`,
    stdin: "3\n1 2\n2 4\n3 5\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<pair<int,int>> a(n);
  for (auto& p : a) cin >> p.first >> p.second;
  // TODO: sort by end and greedily count compatible activities.
  cout << 0 << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Two fit", stdin: "3\n1 2\n2 4\n3 5\n", expectedStdout: "2\n", matcher: "exact" },
      { name: "All overlap", stdin: "3\n1 10\n2 9\n3 8\n", expectedStdout: "1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.techniques.greedy", "dsa.techniques.interval_scheduling", "dsa.techniques.greedy_proof"]
  },
  "backtracking-subsets": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Print all subsets (the power set) of distinct integers.

Requirements:
1. Read n, then n distinct integers.
2. Sort the input, generate all 2^n subsets, sort them, and print one per line
   (values space-separated; print "-" for the empty subset).

Input format:
- First line: n
- Second line: n integers

Output format:
- 2^n lines, each a sorted subset ("-" for empty).

Expected solution outline:
- Backtrack on include/exclude for each element.

AI evaluation rubric:
- All subsets, deterministic order.`,
    stdin: "2\n1 2\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <functional>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  sort(a.begin(), a.end());
  vector<vector<int>> result;
  // TODO: backtrack to fill result with every subset.
  sort(result.begin(), result.end());
  for (auto& s : result) {
    if (s.empty()) cout << "-";
    for (size_t i = 0; i < s.size(); ++i) cout << (i ? " " : "") << s[i];
    cout << "\\n";
  }
  return 0;
}
`,
    visibleTests: [
      { name: "Two elements", stdin: "2\n1 2\n", expectedStdout: "-\n1\n1 2\n2\n", matcher: "exact" },
      { name: "Single", stdin: "1\n5\n", expectedStdout: "-\n5\n", matcher: "exact" }
    ],
    skillTags: ["dsa.recursion.base_case", "dsa.complexity.recursion_choice", "dsa.math.combinatorics"]
  },
  "backtracking-permutations": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Backtracking: all permutations.

Print every permutation (ordering) of the given distinct integers, one per line,
space-separated, in sorted (lexicographic) order.

Input format:
- The first line is n, the number of values.
- The second line has n space-separated distinct integers.

Output format:
- Each permutation on its own line, values space-separated, sorted overall.

[1 2] -> "1 2" then "2 1".

AI evaluation rubric:
- Backtracks over unused elements; sorts input + result for a stable order.`,
    stdin: "2\n1 2\n",
    starterCode: `#include <algorithm>
#include <functional>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (auto& x : a) cin >> x;
  sort(a.begin(), a.end());
  vector<vector<int>> result;
  // TODO: backtrack over unused indices to fill result with every ordering.
  sort(result.begin(), result.end());
  for (auto& p : result) {
    for (size_t i = 0; i < p.size(); ++i) cout << (i ? " " : "") << p[i];
    cout << "\\n";
  }
  return 0;
}
`,
    visibleTests: [
      { name: "Two elements", stdin: "2\n1 2\n", expectedStdout: "1 2\n2 1\n", matcher: "exact" },
      { name: "Three (normalized)", stdin: "3\n2 1 3\n", expectedStdout: "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1\n", matcher: "exact" },
      { name: "Single", stdin: "1\n5\n", expectedStdout: "5\n", matcher: "exact" }
    ],
    skillTags: ["dsa.recursion.base_case", "dsa.complexity.recursion_choice", "dsa.math.combinatorics"]
  },
  "backtracking-generate-parentheses": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Backtracking: generate parentheses.

Print every combination of n pairs of well-formed parentheses, one per line, in
sorted order.

Input format:
- One line with the integer n (0 <= n).

Output format:
- Each valid combination on its own line, sorted. n = 0 prints one empty line.

n = 2 -> "(())" then "()()".

AI evaluation rubric:
- Adds '(' while open < n and ')' only while close < open; sorts the result.`,
    stdin: "2\n",
    starterCode: `#include <algorithm>
#include <functional>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<string> result;
  string cur;
  // TODO: backtrack over open/close counts, recording strings of length 2*n.
  sort(result.begin(), result.end());
  for (auto& s : result) cout << s << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "n=2", stdin: "2\n", expectedStdout: "(())\n()()\n", matcher: "exact" },
      { name: "n=1", stdin: "1\n", expectedStdout: "()\n", matcher: "exact" },
      { name: "n=3", stdin: "3\n", expectedStdout: "((()))\n(()())\n(())()\n()(())\n()()()\n", matcher: "exact" }
    ],
    skillTags: ["dsa.recursion.base_case", "dsa.complexity.recursion_choice", "dsa.math.combinatorics"]
  },
  "backtracking-combination-sum": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Print all combinations of candidates that sum to a target.

Requirements:
1. Read k, then k distinct positive candidates, then target.
2. Each candidate may be reused. Print each combination (ascending, space-
   separated) on its own line, sorted; print "none" if there are none.

Input format:
- First line: k
- Second line: k candidates
- Third line: target

Output format:
- One combination per line, or "none".

Expected solution outline:
- Backtrack from a start index, reusing the same index; prune when a candidate
  exceeds the remaining target.

AI evaluation rubric:
- Correct combinations, no duplicates, sorted output.`,
    stdin: "4\n2 3 6 7\n7\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <functional>
#include <vector>
using namespace std;

int main() {
  int k;
  cin >> k;
  vector<int> a(k);
  for (auto& x : a) cin >> x;
  int target;
  cin >> target;
  sort(a.begin(), a.end());
  vector<vector<int>> result;
  // TODO: backtrack to collect combinations summing to target.
  sort(result.begin(), result.end());
  if (result.empty()) { cout << "none" << "\\n"; return 0; }
  for (auto& s : result) {
    for (size_t i = 0; i < s.size(); ++i) cout << (i ? " " : "") << s[i];
    cout << "\\n";
  }
  return 0;
}
`,
    visibleTests: [
      { name: "Target 7", stdin: "4\n2 3 6 7\n7\n", expectedStdout: "2 2 3\n7\n", matcher: "exact" },
      { name: "Unreachable", stdin: "1\n2\n1\n", expectedStdout: "none\n", matcher: "exact" }
    ],
    skillTags: ["dsa.recursion.base_case", "dsa.complexity.recursion_choice", "dsa.math.generate_combinations"]
  },
  "math-fast-power-mod": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Compute (base^exp) mod m with binary exponentiation.

Requirements:
1. Read base, exp, m (exp >= 0, m >= 1).
2. Print (base^exp) mod m in [0, m).

Input format:
- One line: base exp m

Output format:
- One integer.

Expected solution outline:
- Square-and-multiply; reduce mod m each step; use __int128 for the product.

AI evaluation rubric:
- O(log exp), no overflow.`,
    stdin: "2 10 1000\n",
    starterCode: `#include <iostream>
using namespace std;

long long power_mod(long long base, long long exp, long long m) {
  // TODO: binary exponentiation with a modulus (cast to __int128 for the multiply).
  (void)base; (void)exp; (void)m;
  return 0;
}

int main() {
  long long b, e, m;
  cin >> b >> e >> m;
  cout << power_mod(b, e, m) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "1024 mod 1000", stdin: "2 10 1000\n", expectedStdout: "24\n", matcher: "exact" },
      { name: "Large modulus", stdin: "2 62 1000000007\n", expectedStdout: "145586002\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.modular_arithmetic", "dsa.math.number_theory", "dsa.math.bit_manipulation"]
  },
  "geometry-segment-intersection": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Decide whether two segments intersect.

Requirements:
1. Read eight integers: x1 y1 x2 y2 x3 y3 x4 y4 (segments p1-p2 and p3-p4).
2. Print YES if the closed segments intersect (crossing, endpoint touch, or
   collinear overlap), else NO.

Input format:
- One line: x1 y1 x2 y2 x3 y3 x4 y4

Output format:
- YES or NO.

Expected solution outline:
- Orientation via cross products; handle collinear on-segment cases.

AI evaluation rubric:
- Integer-only orientation test; all touch/overlap cases handled.`,
    stdin: "0 0 4 4 0 4 4 0\n",
    starterCode: `#include <iostream>
#include <algorithm>
using namespace std;

struct P { long long x, y; };
long long cross(P o, P a, P b) { return (a.x-o.x)*(b.y-o.y) - (a.y-o.y)*(b.x-o.x); }

int main() {
  P p1, p2, p3, p4;
  cin >> p1.x >> p1.y >> p2.x >> p2.y >> p3.x >> p3.y >> p4.x >> p4.y;
  // TODO: orientation tests + collinear on-segment checks; print YES/NO.
  cout << "NO" << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Proper cross", stdin: "0 0 4 4 0 4 4 0\n", expectedStdout: "YES\n", matcher: "exact" },
      { name: "Parallel apart", stdin: "0 0 4 0 0 1 4 1\n", expectedStdout: "NO\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.segment_intersection", "dsa.math.geometry", "dsa.math.vectors_dot_cross"]
  },
  "template-generic-clamp": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Clamp a value into a range using a function template.

Requirements:
1. Read three integers: value, lo, hi.
2. Use a template clamp_value(value, lo, hi) that works for any ordered type.
3. Print the clamped value.

Input format:
- One line: value lo hi

Output format:
- One integer.

Expected solution outline:
- Return lo if value < lo, hi if hi < value, else value.

AI evaluation rubric:
- Single template using operator< only.`,
    stdin: "42 0 10\n",
    starterCode: `#include <iostream>
using namespace std;

template <typename T>
T clamp_value(const T& value, const T& lo, const T& hi) {
  // TODO: pin value into [lo, hi] using operator< only.
  (void)lo; (void)hi;
  return value;
}

int main() {
  int v, lo, hi;
  cin >> v >> lo >> hi;
  cout << clamp_value(v, lo, hi) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Above range", stdin: "42 0 10\n", expectedStdout: "10\n", matcher: "exact" },
      { name: "Within range", stdin: "5 0 10\n", expectedStdout: "5\n", matcher: "exact" }
    ],
    skillTags: ["cpp.templates.function_templates", "cpp.templates.deduction", "cpp.templates.multiple_params"]
  },
  "template-fixed-array": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Use a fixed-size array class template to sum five numbers.

Requirements:
1. Read exactly 5 integers into a FixedArray<int, 5>.
2. Print their sum via the container's sum() method.

Input format:
- Five integers.

Output format:
- One integer: the sum.

Expected solution outline:
- FixedArray<T, N> with operator[] and sum() over N elements.

AI evaluation rubric:
- Class template parameterized on type and size.`,
    stdin: "1 2 3 4 5\n",
    starterCode: `#include <iostream>
#include <cstddef>
using namespace std;

template <typename T, size_t N>
class FixedArray {
public:
  T& operator[](size_t i) { return data_[i]; }
  T sum() const {
    // TODO: accumulate all N elements from T{}.
    return T{};
  }
private:
  T data_[N]{};
};

int main() {
  FixedArray<int, 5> a;
  for (int i = 0; i < 5; ++i) cin >> a[i];
  cout << a.sum() << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Sum of five", stdin: "1 2 3 4 5\n", expectedStdout: "15\n", matcher: "exact" },
      { name: "With negatives", stdin: "10 -3 0 5 -2\n", expectedStdout: "10\n", matcher: "exact" }
    ],
    skillTags: ["cpp.templates.class_templates", "cpp.templates.multiple_params", "cpp.templates.constexpr"]
  },
  "optional-parse-int": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Parse a whole line as an int, printing the value or "invalid".

Requirements:
1. Read one line.
2. If the entire line is a valid int (optional leading +/-, no spaces, no
   overflow), print it; otherwise print "invalid".

Input format:
- One line.

Output format:
- The integer, or the word invalid.

Expected solution outline:
- std::from_chars requiring the whole string be consumed; return optional.

AI evaluation rubric:
- Whole-string validation, overflow handled.`,
    stdin: "42\n",
    starterCode: `#include <iostream>
#include <charconv>
#include <optional>
#include <string>
using namespace std;

optional<int> parse_int(const string& s) {
  // TODO: validate the whole string with from_chars; return nullopt on failure.
  (void)s;
  return nullopt;
}

int main() {
  string s;
  getline(cin, s);
  auto r = parse_int(s);
  cout << (r ? to_string(*r) : string("invalid")) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Valid", stdin: "42\n", expectedStdout: "42\n", matcher: "exact" },
      { name: "Trailing garbage", stdin: "12a\n", expectedStdout: "invalid\n", matcher: "exact" }
    ],
    skillTags: ["cpp.utilities.stream_validation", "dsa.strings.parsing_edge_cases", "cpp.functions.basics"]
  },
  "variant-json-token": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Report a JSON token's kind and truthiness via std::visit.

Requirements:
1. Read a tag: "null", or "bool <true|false>", or "number <x>", or "string <word>".
2. Build a variant<nullptr_t, bool, double, string> and print: <kind> <truthy>
   where kind is null/boolean/number/string and truthy is true/false
   (null->false, bool->itself, number->nonzero, string->non-empty).

Input format:
- One line: a tag and optional value.

Output format:
- "<kind> <true|false>".

Expected solution outline:
- std::visit with a generic lambda and if constexpr.

AI evaluation rubric:
- Correct kind and truthiness per alternative.`,
    stdin: "bool true\n",
    starterCode: `#include <iostream>
#include <string>
#include <variant>
#include <type_traits>
using namespace std;

using JsonToken = variant<nullptr_t, bool, double, string>;

string kind(const JsonToken& t) {
  // TODO: visit and return the kind name.
  (void)t; return "";
}
bool truthy(const JsonToken& t) {
  // TODO: visit and return JSON truthiness.
  (void)t; return false;
}

int main() {
  string k;
  cin >> k;
  JsonToken t;
  if (k == "null") t = nullptr;
  else if (k == "bool") { string b; cin >> b; t = (b == "true"); }
  else if (k == "number") { double d; cin >> d; t = d; }
  else { string s; cin >> s; t = s; }
  cout << kind(t) << " " << (truthy(t) ? "true" : "false") << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Boolean true", stdin: "bool true\n", expectedStdout: "boolean true\n", matcher: "exact" },
      { name: "Number zero", stdin: "number 0\n", expectedStdout: "number false\n", matcher: "exact" }
    ],
    skillTags: ["cpp.utilities.variant", "cpp.utilities.variant_visit", "cpp.templates.if_constexpr"]
  },
  "ranges-filter-transform": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Keep the even numbers and print their squares (ranges pipeline).

Requirements:
1. Read n, then n integers.
2. Using std::views::filter and std::views::transform, keep the evens and square
   them; print the results space-separated in order.

Input format:
- First line: n
- Second line: n integers

Output format:
- The even squares, space-separated.

Expected solution outline:
- nums | views::filter(even) | views::transform(square), iterated into output.

AI evaluation rubric:
- Composed ranges pipeline, correct order.`,
    stdin: "4\n1 2 3 4\n",
    starterCode: `#include <iostream>
#include <ranges>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> v(n);
  for (auto& x : v) cin >> x;
  // TODO: pipe through filter(even) then transform(square) and print in order.
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Mixed", stdin: "4\n1 2 3 4\n", expectedStdout: "4 16\n", matcher: "exact" },
      { name: "All even", stdin: "3\n2 4 6\n", expectedStdout: "4 16 36\n", matcher: "exact" }
    ],
    skillTags: ["cpp.templates.ranges", "cpp.templates.ranges_depth", "cpp.stl.lambdas"]
  },
  "geometry-convex-hull": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Compute the convex hull of a point set.

Requirements:
1. Read n, then n integer points "x y".
2. Compute the convex hull (only true corners). Print each hull vertex "x y" on
   its own line, sorted by (x, y) for a deterministic order.

Input format:
- First line: n
- Next n lines: x y

Output format:
- Hull vertices "x y", one per line, sorted.

Expected solution outline:
- Andrew's monotone chain with a cross-product turn test.

AI evaluation rubric:
- Interior/collinear points dropped; correct hull.`,
    stdin: "5\n0 0\n2 0\n2 2\n0 2\n1 1\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <vector>
using namespace std;

struct P { long long x, y; };
long long cross(const P& o, const P& a, const P& b) {
  return (a.x-o.x)*(b.y-o.y) - (a.y-o.y)*(b.x-o.x);
}

vector<P> convex_hull(vector<P> p) {
  // TODO: sort, build lower + upper chains, return hull vertices.
  return {};
}

int main() {
  int n;
  cin >> n;
  vector<P> p(n);
  for (auto& q : p) cin >> q.x >> q.y;
  auto h = convex_hull(p);
  sort(h.begin(), h.end(), [](const P& a, const P& b){ return a.x != b.x ? a.x < b.x : a.y < b.y; });
  for (auto& q : h) cout << q.x << " " << q.y << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Square + interior", stdin: "5\n0 0\n2 0\n2 2\n0 2\n1 1\n", expectedStdout: "0 0\n0 2\n2 0\n2 2\n", matcher: "exact" },
      { name: "Triangle", stdin: "3\n0 0\n4 0\n2 3\n", expectedStdout: "0 0\n2 3\n4 0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.math.convex_hull", "dsa.math.geometry", "dsa.math.vectors_dot_cross"]
  },
  "debug-fix-off-by-one": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Fix the off-by-one so the inclusive range sum is correct.

Requirements:
1. Read lo and hi.
2. Print the sum of all integers from lo to hi INCLUSIVE.
3. The starter loop stops one short — fix the boundary.

Input format:
- One line: lo hi

Output format:
- One integer.

Expected solution outline:
- Loop i from lo while i <= hi.

AI evaluation rubric:
- Includes hi; handles lo == hi.`,
    stdin: "1 5\n",
    starterCode: `#include <iostream>
using namespace std;

long long range_sum(int lo, int hi) {
  long long total = 0;
  for (int i = lo; i < hi; ++i) {  // BUG: excludes hi
    total += i;
  }
  return total;
}

int main() {
  int lo, hi;
  cin >> lo >> hi;
  cout << range_sum(lo, hi) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "1..5", stdin: "1 5\n", expectedStdout: "15\n", matcher: "exact" },
      { name: "Single value", stdin: "3 3\n", expectedStdout: "3\n", matcher: "exact" }
    ],
    skillTags: ["cpp.tooling.debugging_method", "cpp.control_flow.loop_invariants", "cpp.control_flow.loops"]
  },
  "input-validation-menu-loop": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Return the first valid menu choice from a list of inputs.

Requirements:
1. Read n, then n whitespace-separated tokens.
2. Print the first token that is an integer in [1, 4] (whole token, no extras),
   or -1 if none qualifies.

Input format:
- First line: n
- Following: n tokens

Output format:
- One integer (the choice, or -1).

Expected solution outline:
- Validate each token with from_chars; accept only values in [1,4].

AI evaluation rubric:
- Skips invalid input; correct first-valid selection.`,
    stdin: "3\n7 abc 3\n",
    starterCode: `#include <iostream>
#include <charconv>
#include <string>
using namespace std;

int main() {
  int n;
  cin >> n;
  int answer = -1;
  for (int i = 0; i < n; ++i) {
    string t;
    cin >> t;
    // TODO: if answer not yet found and t is a whole-string int in [1,4], take it.
  }
  cout << answer << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Skips junk", stdin: "3\n7 abc 3\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "None valid", stdin: "2\n0 5\n", expectedStdout: "-1\n", matcher: "exact" }
    ],
    skillTags: ["cpp.utilities.stream_validation", "cpp.control_flow.loops", "dsa.strings.parsing_edge_cases"]
  },
  "chrono-rate-limiter-sim": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Simulate a sliding-window rate limiter.

Requirements:
1. Read max_requests, window, n, then n non-decreasing timestamps (ms).
2. A request is allowed when fewer than max_requests have been allowed within the
   last window ms (a timestamp t' counts when t' > t - window). Print 1 (allowed)
   or 0 (throttled) per request, space-separated.

Input format:
- First line: max_requests window n
- Second line: n timestamps

Output format:
- n values of 1/0, space-separated.

Expected solution outline:
- Deque of allowed timestamps; evict front <= t - window.

AI evaluation rubric:
- Correct window eviction and allow/deny decisions.`,
    stdin: "3 1000 5\n0 100 200 300 1000\n",
    starterCode: `#include <iostream>
#include <deque>
#include <vector>
using namespace std;

int main() {
  int mx;
  long long w;
  int n;
  cin >> mx >> w >> n;
  vector<long long> t(n);
  for (auto& x : t) cin >> x;
  // TODO: sliding window of allowed timestamps; print 1/0 per request.
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Window of 3", stdin: "3 1000 5\n0 100 200 300 1000\n", expectedStdout: "1 1 1 0 1\n", matcher: "exact" },
      { name: "Limit one", stdin: "1 1000 3\n0 500 1500\n", expectedStdout: "1 0 1\n", matcher: "exact" }
    ],
    skillTags: ["cpp.utilities.chrono", "dsa.techniques.sliding_window", "dsa.arrays.traversal"]
  },
  "random-dice-histogram": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Roll a seeded die and print the face histogram.

Requirements:
1. Read seed and rolls.
2. Seed a std::mt19937 with seed; roll it that many times, mapping each output to
   a face with rng() modulo 6. Print the six counts (faces 1..6) space-separated.

Input format:
- One line: seed rolls

Output format:
- Six integers, space-separated (counts of faces 1..6).

Expected solution outline:
- mt19937(seed), loop rolls times, tally rng() % 6.

AI evaluation rubric:
- Reproducible via standardized mt19937 sequence.`,
    stdin: "42 6\n",
    starterCode: `#include <iostream>
#include <array>
#include <random>
using namespace std;

int main() {
  unsigned seed;
  int rolls;
  cin >> seed >> rolls;
  array<int, 6> counts{};
  // TODO: seed mt19937 and tally rng() % 6 across rolls.
  for (int i = 0; i < 6; ++i) cout << (i ? " " : "") << counts[i];
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Seed 42, 6 rolls", stdin: "42 6\n", expectedStdout: "2 0 0 0 2 2\n", matcher: "exact" },
      { name: "Zero rolls", stdin: "7 0\n", expectedStdout: "0 0 0 0 0 0\n", matcher: "exact" }
    ],
    skillTags: ["cpp.utilities.random", "cpp.utilities.random_quality", "dsa.arrays.traversal"]
  },
  "filesystem-extension-summary": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Summarize file extensions.

Requirements:
1. Read n, then n file names (whitespace-separated).
2. Using std::filesystem::path, count names by extension. Print "<ext> <count>"
   per line, sorted by extension; use "(none)" for names with no extension.

Input format:
- First line: n
- Following: n file names

Output format:
- Lines of "<ext> <count>", sorted by extension.

Expected solution outline:
- path(name).extension(); tally into a std::map.

AI evaluation rubric:
- Dotfiles/plain names grouped under "(none)"; last extension only.`,
    stdin: "5\na.txt b.txt c.md README photo.png\n",
    starterCode: `#include <iostream>
#include <filesystem>
#include <map>
#include <string>
using namespace std;

int main() {
  int n;
  cin >> n;
  map<string, int> counts;
  for (int i = 0; i < n; ++i) {
    string name;
    cin >> name;
    // TODO: extract the extension via std::filesystem::path and tally it.
  }
  for (auto& [ext, count] : counts) cout << ext << " " << count << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Mixed names", stdin: "5\na.txt b.txt c.md README photo.png\n", expectedStdout: "(none) 1\n.md 1\n.png 1\n.txt 2\n", matcher: "exact" },
      { name: "Multi-dot + dotfile", stdin: "3\narchive.tar.gz .gitignore run.sh\n", expectedStdout: "(none) 1\n.gz 1\n.sh 1\n", matcher: "exact" }
    ],
    skillTags: ["cpp.utilities.filesystem", "dsa.strings.parsing", "cpp.stl.map"]
  },
  "concurrency-atomic-counter": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Increment a shared atomic counter from many threads.

Requirements:
1. Read num_threads and per_thread.
2. Launch num_threads threads, each incrementing one shared std::atomic
   per_thread times. Join them and print the final value.

Input format:
- One line: num_threads per_thread

Output format:
- One integer (== num_threads * per_thread).

Expected solution outline:
- std::atomic<long long> shared by reference; fetch_add in each thread.

AI evaluation rubric:
- No lost updates under contention.`,
    stdin: "4 1000\n",
    starterCode: `#include <iostream>
#include <atomic>
#include <thread>
#include <vector>
using namespace std;

int main() {
  int num_threads, per_thread;
  cin >> num_threads >> per_thread;
  atomic<long long> counter{0};
  // TODO: launch threads incrementing counter per_thread times, then join.
  cout << counter.load() << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Four threads", stdin: "4 1000\n", expectedStdout: "4000\n", matcher: "exact" },
      { name: "Eight threads", stdin: "8 100\n", expectedStdout: "800\n", matcher: "exact" }
    ],
    skillTags: ["cpp.concurrency.atomics", "cpp.concurrency.threads", "cpp.concurrency.data_races"]
  },
  "concurrency-producer-consumer": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Run a producer/consumer pipeline and print the consumed total.

Requirements:
1. Read producers, consumers, items_each.
2. Each producer pushes 1..items_each into a shared queue; consumers pop and add
   to a shared total. Coordinate with a mutex + condition_variable and stop
   consumers once drained. Print the total.

Input format:
- One line: producers consumers items_each

Output format:
- One integer (== producers * items_each*(items_each+1)/2).

Expected solution outline:
- Mutex-guarded queue, cv.wait on (!empty || done), atomic total.

AI evaluation rubric:
- Deterministic total, clean shutdown, no deadlock.`,
    stdin: "2 3 4\n",
    starterCode: `#include <iostream>
#include <atomic>
#include <condition_variable>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>
using namespace std;

int main() {
  int producers, consumers, items_each;
  cin >> producers >> consumers >> items_each;
  // TODO: shared queue + mutex + condition_variable; producers push 1..items_each,
  // consumers pop and accumulate an atomic total; signal done to stop consumers.
  long long total = 0;
  cout << total << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Two producers", stdin: "2 3 4\n", expectedStdout: "20\n", matcher: "exact" },
      { name: "Larger", stdin: "4 2 10\n", expectedStdout: "220\n", matcher: "exact" }
    ],
    skillTags: ["cpp.concurrency.condition_variables", "cpp.concurrency.mutexes", "cpp.concurrency.shared_state_design"]
  },
  "raii-file-handle-simulator": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Show RAII cleanup with an open-handle counter.

Requirements:
1. Read n.
2. Open n RAII FileHandles inside a scope; print "open=<count>" while they are
   alive, then print "open=<count>" again after the scope exits.

Input format:
- One integer n.

Output format:
- "open=n" then "open=0".

Expected solution outline:
- Constructor increments a shared counter; destructor (via close) decrements it.

AI evaluation rubric:
- Automatic cleanup at scope exit; idempotent close.`,
    stdin: "3\n",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

class FileHandle {
public:
  FileHandle() : open_(true) { /* TODO: ++count */ }
  ~FileHandle() { /* TODO: close */ }
  static int open_count() { return count_ref(); }
private:
  static int& count_ref() { static int c = 0; return c; }
  bool open_;
};

int main() {
  int n;
  cin >> n;
  {
    vector<FileHandle> handles(n);
    cout << "open=" << FileHandle::open_count() << "\\n";
  }
  cout << "open=" << FileHandle::open_count() << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Three handles", stdin: "3\n", expectedStdout: "open=3\nopen=0\n", matcher: "exact" },
      { name: "One handle", stdin: "1\n", expectedStdout: "open=1\nopen=0\n", matcher: "exact" }
    ],
    skillTags: ["cpp.raii.resource_lifetime", "cpp.raii.destructor_cleanup", "cpp.raii.ownership_boundary"]
  },
  "value-semantics-deep-copy-buffer": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Demonstrate deep copy: modifying a copy must not affect the original.

Requirements:
1. Read n, then n integers into a Buffer a.
2. Copy a into b, then change b's first element.
3. Print a's contents (space-separated) — they must be unchanged by the copy.

Input format:
- First line: n
- Second line: n integers

Output format:
- a's values, space-separated.

Expected solution outline:
- Copy constructor makes an independent array (deep copy).

AI evaluation rubric:
- Original untouched after the copy is modified.`,
    stdin: "3\n1 2 3\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <cstddef>
#include <vector>
using namespace std;

class Buffer {
public:
  explicit Buffer(size_t n) : v_(n) {}
  // TODO: give Buffer a deep-copying copy constructor.
  int& at(size_t i) { return v_[i]; }
  size_t size() const { return v_.size(); }
private:
  vector<int> v_;
};

int main() {
  size_t n;
  cin >> n;
  Buffer a(n);
  for (size_t i = 0; i < n; ++i) cin >> a.at(i);
  Buffer b = a;
  if (b.size() > 0) b.at(0) = 999;
  for (size_t i = 0; i < n; ++i) cout << (i ? " " : "") << a.at(i);
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Original preserved", stdin: "3\n1 2 3\n", expectedStdout: "1 2 3\n", matcher: "exact" },
      { name: "Longer", stdin: "4\n5 6 7 8\n", expectedStdout: "5 6 7 8\n", matcher: "exact" }
    ],
    skillTags: ["cpp.value_semantics.deep_copy", "cpp.value_semantics.rule_of_zero_five", "cpp.value_semantics.move"]
  },
  "unique-ptr-task-list": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Store tasks in unique_ptrs and answer a lookup.

Requirements:
1. Read n, then n tasks ("id title"), then a query id.
2. Print: size=<n> found=<title|NONE> where found is the queried task's title.

Input format:
- First line: n
- Next n lines: id title
- Last line: query id

Output format:
- "size=<n> found=<title or NONE>".

Expected solution outline:
- vector<unique_ptr<Task>>; find returns a non-owning pointer.

AI evaluation rubric:
- Ownership held by the list; find is a non-owning view.`,
    stdin: "2\n1 write\n2 review\n2\n",
    starterCode: `#include <iostream>
#include <memory>
#include <string>
#include <vector>
using namespace std;

struct Task { int id; string title; };

int main() {
  int n;
  cin >> n;
  vector<unique_ptr<Task>> tasks;
  for (int i = 0; i < n; ++i) {
    int id; string title;
    cin >> id >> title;
    // TODO: store a make_unique<Task>.
  }
  int query;
  cin >> query;
  const Task* found = nullptr;
  // TODO: search tasks for query (non-owning pointer).
  cout << "size=" << tasks.size() << " found=" << (found ? found->title : string("NONE")) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Found", stdin: "2\n1 write\n2 review\n2\n", expectedStdout: "size=2 found=review\n", matcher: "exact" },
      { name: "Missing", stdin: "2\n1 write\n2 review\n9\n", expectedStdout: "size=2 found=NONE\n", matcher: "exact" }
    ],
    skillTags: ["cpp.smart_pointers.unique_ptr", "cpp.smart_pointers.ownership_transfer", "cpp.smart_pointers.ownership_choice"]
  },
  "shared-weak-observer-graph": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Link a child to a parent with a weak back-reference.

Requirements:
1. Read a root value and a child value.
2. Make both shared_ptr nodes; add the child to the root (root owns child via
   shared_ptr, child->parent is a weak_ptr).
3. Print: parent=<value> count=<root.use_count()>. The weak back-link must NOT
   raise the root's use_count (so count is 1).

Input format:
- One line: root_value child_value

Output format:
- "parent=<v> count=<n>".

Expected solution outline:
- child->parent = root as weak_ptr; parent_value locks it.

AI evaluation rubric:
- Weak back-reference does not inflate use_count.`,
    stdin: "10 20\n",
    starterCode: `#include <iostream>
#include <memory>
#include <vector>
using namespace std;

struct Node {
  int value;
  vector<shared_ptr<Node>> children;
  weak_ptr<Node> parent;
  explicit Node(int v) : value(v) {}
};

int main() {
  int rv, cv;
  cin >> rv >> cv;
  auto root = make_shared<Node>(rv);
  auto child = make_shared<Node>(cv);
  // TODO: add child to root->children and set child->parent (weak) to root.
  int pv = -1;
  // TODO: lock child->parent and read its value.
  cout << "parent=" << pv << " count=" << root.use_count() << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Parent link", stdin: "10 20\n", expectedStdout: "parent=10 count=1\n", matcher: "exact" },
      { name: "Other values", stdin: "7 3\n", expectedStdout: "parent=7 count=1\n", matcher: "exact" }
    ],
    skillTags: ["cpp.smart_pointers.shared_ptr", "cpp.smart_pointers.weak_ptr", "cpp.smart_pointers.cyclic_reference"]
  },
  "vector-running-median-simple": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Print the running median after each value.

Requirements:
1. Read n, then n integers.
2. After each value, print the median of everything seen so far, formatted with
   one decimal, space-separated.

Input format:
- First line: n
- Second line: n integers

Output format:
- n medians (%.1f), space-separated.

Expected solution outline:
- Two heaps: max-heap (lower half), min-heap (upper half); rebalance each step.

AI evaluation rubric:
- Correct even/odd median; O(log n) per insertion.`,
    stdin: "4\n1 2 3 4\n",
    starterCode: `#include <iostream>
#include <cstdio>
#include <functional>
#include <queue>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  priority_queue<int> lower;
  priority_queue<int, vector<int>, greater<>> upper;
  bool first = true;
  for (int i = 0; i < n; ++i) {
    int x;
    cin >> x;
    // TODO: insert x, rebalance the heaps, then compute the median.
    double median = 0.0;
    printf("%s%.1f", first ? "" : " ", median);
    first = false;
  }
  printf("\\n");
  return 0;
}
`,
    visibleTests: [
      { name: "Increasing", stdin: "4\n1 2 3 4\n", expectedStdout: "1.0 1.5 2.0 2.5\n", matcher: "exact" },
      { name: "Mixed stream", stdin: "5\n1 5 2 8 7\n", expectedStdout: "1.0 3.0 2.0 3.5 5.0\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.heap", "dsa.trees.heap_applications", "cpp.stl.adapters"]
  },
  "binary-search-answer-capacity": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Find the minimum shipping capacity for a deadline.

Requirements:
1. Read n, then n package weights, then days.
2. Print the smallest daily capacity so all packages (shipped in order) fit
   within days days.

Input format:
- First line: n
- Second line: n weights
- Third line: days

Output format:
- One integer.

Expected solution outline:
- Binary search capacity in [max weight, total]; a helper counts days needed.

AI evaluation rubric:
- Correct feasibility check and binary search bounds.`,
    stdin: "10\n1 2 3 4 5 6 7 8 9 10\n5\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <numeric>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> w(n);
  for (auto& x : w) cin >> x;
  int days;
  cin >> days;
  // TODO: binary-search the minimum feasible capacity.
  cout << 0 << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Ten in five days", stdin: "10\n1 2 3 4 5 6 7 8 9 10\n5\n", expectedStdout: "15\n", matcher: "exact" },
      { name: "Three days", stdin: "6\n3 2 2 4 1 4\n3\n", expectedStdout: "6\n", matcher: "exact" }
    ],
    skillTags: ["dsa.searching.binary_search", "dsa.complexity.problem_framing", "dsa.arrays.traversal"]
  },
  "sort-custom-log-records": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Rank records by score (desc) then name (asc).

Requirements:
1. Read n, then n records ("name score").
2. Sort by score descending, ties by name ascending (stable). Print each record
   as "name score" on its own line.

Input format:
- First line: n
- Next n lines: name score

Output format:
- The sorted records, one "name score" per line.

Expected solution outline:
- std::stable_sort with a two-key comparator.

AI evaluation rubric:
- Correct multi-key order; stable on equal keys.`,
    stdin: "3\namy 50\nbob 90\ncid 70\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <string>
#include <vector>
using namespace std;

int main() {
  int n;
  cin >> n;
  vector<pair<string,int>> v(n);
  for (auto& p : v) cin >> p.first >> p.second;
  // TODO: stable_sort by score desc, then name asc.
  for (auto& p : v) cout << p.first << " " << p.second << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "By score", stdin: "3\namy 50\nbob 90\ncid 70\n", expectedStdout: "bob 90\ncid 70\namy 50\n", matcher: "exact" },
      { name: "Tie by name", stdin: "3\nzoe 80\nann 80\nmia 80\n", expectedStdout: "ann 80\nmia 80\nzoe 80\n", matcher: "exact" }
    ],
    skillTags: ["dsa.sorting.comparator", "cpp.stl.algorithms", "cpp.stl.lambdas"]
  },
  "queue-level-order-tree": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Print a binary tree's level-order traversal.

Requirements:
1. Read n, then n level-order tokens (integers, or "X" for a missing child).
2. Build the tree, then print its levels: values space-separated within a level,
   levels separated by "|".

Input format:
- First line: n
- Second line: n tokens (ints or X)

Output format:
- Levels joined by "|", values space-separated.

Expected solution outline:
- BFS with a queue, processing one level at a time.

AI evaluation rubric:
- Correct level grouping, left to right.`,
    stdin: "7\n3 9 20 X X 15 7\n",
    starterCode: `#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct T { int v; T* l; T* r; T(int x) : v(x), l(0), r(0) {} };

int main() {
  int n;
  cin >> n;
  vector<string> tok(n);
  for (auto& t : tok) cin >> t;
  if (n == 0 || tok[0] == "X") { cout << "\\n"; return 0; }
  T* root = new T(stoi(tok[0]));
  queue<T*> q; q.push(root);
  size_t i = 1;
  while (!q.empty() && i < tok.size()) {
    T* x = q.front(); q.pop();
    if (i < tok.size()) { if (tok[i] != "X") { x->l = new T(stoi(tok[i])); q.push(x->l); } ++i; }
    if (i < tok.size()) { if (tok[i] != "X") { x->r = new T(stoi(tok[i])); q.push(x->r); } ++i; }
  }
  // TODO: BFS by level and print values (levels joined by "|").
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Typical tree", stdin: "7\n3 9 20 X X 15 7\n", expectedStdout: "3|9 20|15 7\n", matcher: "exact" },
      { name: "Complete tree", stdin: "7\n1 2 3 4 5 6 7\n", expectedStdout: "1|2 3|4 5 6 7\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.traversal", "dsa.graphs.bfs", "cpp.stl.adapters"]
  },
  "tree-diameter": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Compute a binary tree's diameter (longest path in edges).

Requirements:
1. Read n, then n level-order tokens (ints, or "X" for a missing child).
2. Build the tree and print its diameter — the number of edges on the longest
   path between any two nodes.

Input format:
- First line: n
- Second line: n tokens (ints or X)

Output format:
- One integer.

Expected solution outline:
- One DFS returning subtree height while tracking best left+right.

AI evaluation rubric:
- Correct diameter, path need not pass through root.`,
    stdin: "5\n1 2 3 4 5\n",
    starterCode: `#include <iostream>
#include <algorithm>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct T { int v; T* l; T* r; T(int x) : v(x), l(0), r(0) {} };

int best;
int dfs(T* n) {
  // TODO: return subtree height (edges); update best = max(best, left + right).
  (void)n;
  return -1;
}

int main() {
  int n;
  cin >> n;
  vector<string> tok(n);
  for (auto& t : tok) cin >> t;
  T* root = nullptr;
  if (n && tok[0] != "X") {
    root = new T(stoi(tok[0]));
    queue<T*> q; q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tok.size()) {
      T* x = q.front(); q.pop();
      if (i < tok.size()) { if (tok[i] != "X") { x->l = new T(stoi(tok[i])); q.push(x->l); } ++i; }
      if (i < tok.size()) { if (tok[i] != "X") { x->r = new T(stoi(tok[i])); q.push(x->r); } ++i; }
    }
  }
  best = 0;
  dfs(root);
  cout << best << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Through root", stdin: "5\n1 2 3 4 5\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Complete tree", stdin: "7\n1 2 3 4 5 6 7\n", expectedStdout: "4\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.tree_diameter", "dsa.trees.traversal", "cpp.references.pointers"]
  },
  "tree-max-depth": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Binary tree: maximum depth.

Print the maximum depth (in nodes) of a binary tree along the longest
root-to-leaf path. An empty tree is 0; a single node is 1.

Input format:
- The first line is n, the number of level-order tokens.
- The second line has n space-separated tokens: integers, or X for a missing
  child.

Output format:
- The maximum depth, then a newline.

[3 9 20 X X 15 7] -> 3.

AI evaluation rubric:
- Recurses 1 + max(depth(left), depth(right)); null contributes 0.`,
    stdin: "7\n3 9 20 X X 15 7\n",
    starterCode: `#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct T { int v; T* l; T* r; T(int x) : v(x), l(0), r(0) {} };

int max_depth(T* root) {
  // TODO: return 0 for null, else 1 + max of the two subtree depths.
  (void)root;
  return 0;
}

int main() {
  int n;
  cin >> n;
  vector<string> tok(n);
  for (auto& t : tok) cin >> t;
  T* root = nullptr;
  if (n > 0 && tok[0] != "X") {
    root = new T(stoi(tok[0]));
    queue<T*> q; q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tok.size()) {
      T* x = q.front(); q.pop();
      if (i < tok.size()) { if (tok[i] != "X") { x->l = new T(stoi(tok[i])); q.push(x->l); } ++i; }
      if (i < tok.size()) { if (tok[i] != "X") { x->r = new T(stoi(tok[i])); q.push(x->r); } ++i; }
    }
  }
  cout << max_depth(root) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Unbalanced", stdin: "7\n3 9 20 X X 15 7\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Single", stdin: "1\n42\n", expectedStdout: "1\n", matcher: "exact" },
      { name: "Left chain", stdin: "5\n1 2 X 3 X\n", expectedStdout: "3\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.traversal", "cpp.references.pointers"]
  },
  "tree-sum-values": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Binary tree: sum of values.

Print the sum of all node values in a binary tree. An empty tree sums to 0.

Input format:
- The first line is n, the number of level-order tokens.
- The second line has n space-separated tokens: integers, or X for a missing
  child.

Output format:
- The total sum, then a newline.

[1 2 3 4 5 6 7] -> 28.

AI evaluation rubric:
- Recurses root->val + sum(left) + sum(right); null contributes 0.`,
    stdin: "7\n1 2 3 4 5 6 7\n",
    starterCode: `#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct T { int v; T* l; T* r; T(int x) : v(x), l(0), r(0) {} };

int tree_sum(T* root) {
  // TODO: return 0 for null, else root->v + tree_sum(l) + tree_sum(r).
  (void)root;
  return 0;
}

int main() {
  int n;
  cin >> n;
  vector<string> tok(n);
  for (auto& t : tok) cin >> t;
  T* root = nullptr;
  if (n > 0 && tok[0] != "X") {
    root = new T(stoi(tok[0]));
    queue<T*> q; q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tok.size()) {
      T* x = q.front(); q.pop();
      if (i < tok.size()) { if (tok[i] != "X") { x->l = new T(stoi(tok[i])); q.push(x->l); } ++i; }
      if (i < tok.size()) { if (tok[i] != "X") { x->r = new T(stoi(tok[i])); q.push(x->r); } ++i; }
    }
  }
  cout << tree_sum(root) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Complete", stdin: "7\n1 2 3 4 5 6 7\n", expectedStdout: "28\n", matcher: "exact" },
      { name: "Single", stdin: "1\n42\n", expectedStdout: "42\n", matcher: "exact" },
      { name: "Negatives", stdin: "6\n5 -3 8 X X -2\n", expectedStdout: "8\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.traversal", "cpp.references.pointers"]
  },
  "tree-count-leaves": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Binary tree: count leaves.

Print the number of leaf nodes (nodes with no children) in a binary tree.

Input format:
- The first line is n, the number of level-order tokens.
- The second line has n space-separated tokens: integers, or X for a missing
  child.

Output format:
- The number of leaves, then a newline.

[1 2 3 4 5 6 7] -> 4.

AI evaluation rubric:
- Returns 1 when both children are null; 0 for null; else sums the subtrees.`,
    stdin: "7\n1 2 3 4 5 6 7\n",
    starterCode: `#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct T { int v; T* l; T* r; T(int x) : v(x), l(0), r(0) {} };

int count_leaves(T* root) {
  // TODO: 0 for null; 1 when both children null; else sum of the two subtrees.
  (void)root;
  return 0;
}

int main() {
  int n;
  cin >> n;
  vector<string> tok(n);
  for (auto& t : tok) cin >> t;
  T* root = nullptr;
  if (n > 0 && tok[0] != "X") {
    root = new T(stoi(tok[0]));
    queue<T*> q; q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tok.size()) {
      T* x = q.front(); q.pop();
      if (i < tok.size()) { if (tok[i] != "X") { x->l = new T(stoi(tok[i])); q.push(x->l); } ++i; }
      if (i < tok.size()) { if (tok[i] != "X") { x->r = new T(stoi(tok[i])); q.push(x->r); } ++i; }
    }
  }
  cout << count_leaves(root) << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Full", stdin: "7\n1 2 3 4 5 6 7\n", expectedStdout: "4\n", matcher: "exact" },
      { name: "Unbalanced", stdin: "7\n3 9 20 X X 15 7\n", expectedStdout: "3\n", matcher: "exact" },
      { name: "Single", stdin: "1\n42\n", expectedStdout: "1\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.traversal", "cpp.references.pointers"]
  },
  "strings-reverse-vowels": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Strings: reverse only the vowels.

Reverse only the vowels of a string, leaving every other character in place.
Vowels are a, e, i, o, u in both lower- and uppercase.

Input format:
- One line with the string.

Output format:
- The string with its vowels reversed, then a newline.

"hello" -> "holle"; "leetcode" -> "leotcede".

AI evaluation rubric:
- Two pointers from the ends; swap vowel pairs; consonants keep their positions.`,
    stdin: "hello\n",
    starterCode: `#include <iostream>
#include <string>
using namespace std;

bool is_vowel(char c) {
  switch (c) {
    case 'a': case 'e': case 'i': case 'o': case 'u':
    case 'A': case 'E': case 'I': case 'O': case 'U': return true;
    default: return false;
  }
}

int main() {
  string s;
  getline(cin, s);
  int i = 0, j = (int)s.size() - 1;
  // TODO: advance i/j to vowels, swap, and move inward until i >= j.
  cout << s << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Basic", stdin: "hello\n", expectedStdout: "holle\n", matcher: "exact" },
      { name: "Longer", stdin: "leetcode\n", expectedStdout: "leotcede\n", matcher: "exact" },
      { name: "All vowels", stdin: "aeiou\n", expectedStdout: "uoiea\n", matcher: "exact" }
    ],
    skillTags: ["dsa.strings.manipulation", "dsa.arrays.two_pointers"]
  },
  "heap-merge-k-sorted-lists": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Merge k sorted lists into one sorted sequence.

Requirements:
1. Read k. For each list, read its length m then m sorted integers.
2. Merge all lists and print the merged sorted values, space-separated.

Input format:
- First line: k
- Then per list: a line "m v1 v2 ... vm".

Output format:
- The merged values, space-separated.

Expected solution outline:
- Min-heap of current list heads; pop smallest, push its successor.

AI evaluation rubric:
- Fully sorted output; O(N log k).`,
    stdin: "3\n3 1 4 5\n3 1 3 4\n2 2 6\n",
    starterCode: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

struct N { int v; N* n; N(int x) : v(x), n(0) {} };

int main() {
  int k;
  cin >> k;
  vector<N*> heads;
  for (int i = 0; i < k; ++i) {
    int m; cin >> m;
    N* h = nullptr; N** t = &h;
    for (int j = 0; j < m; ++j) { int x; cin >> x; *t = new N(x); t = &(*t)->n; }
    heads.push_back(h);
  }
  // TODO: min-heap merge the list heads; print values in order.
  cout << "\\n";
  return 0;
}
`,
    visibleTests: [
      { name: "Three lists", stdin: "3\n3 1 4 5\n3 1 3 4\n2 2 6\n", expectedStdout: "1 1 2 3 4 4 5 6\n", matcher: "exact" },
      { name: "With empties", stdin: "4\n0\n1 1\n0\n2 0 2\n", expectedStdout: "0 1 2\n", matcher: "exact" }
    ],
    skillTags: ["dsa.trees.heap", "dsa.trees.heap_applications", "dsa.trees.linked_list"]
  }
};
