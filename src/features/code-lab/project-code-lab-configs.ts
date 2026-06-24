import type { LearningItemCodeLab } from "./code-lab-types";

/**
 * Project-level Code Lab configs (#439), keyed by PROJECT id. Each Project Labs
 * entry compiles and tests ONE main.cpp codebase; milestones are checkpoints
 * inside that code, never compiled separately. Visible tests may carry a
 * `milestoneId` to label which checkpoint they exercise so milestone progress
 * can later be inferred from project-level attempts. This module is pure data,
 * client-readable, and must never contain hidden test inputs/expected outputs.
 */
export const PROJECT_CODE_LAB_CONFIGS: Record<string, LearningItemCodeLab> = {
  "cli-flashcard-reviewer": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a command-line flashcard reviewer.

Requirements:
1. Read flashcards from stdin: a count N, then N lines of "question|answer".
2. After the cards, read N answer lines (one per card, in order).
3. Mark each answer right/wrong (exact, trimmed match).
4. Print a final "score X/N" summary line.

Milestones:
1. Read cards into a vector of {question, answer}.
2. Prompt each card and read the learner's answer.
3. Compare answers and track right/wrong.
4. Print the final score summary.

Expected solution outline:
- Read N with std::cin, then getline the remaining lines.
- Split each card line on the first '|'.
- Compare trimmed answers; count correct.
- Print "score correct/total".

AI evaluation rubric:
- Parses the card count and "question|answer" lines safely.
- Handles a card with no matching answer without crashing.
- Keeps parsing separate from scoring.
- Uses clear data structures (a Card struct/vector).`,
    stdin: "2\nWhat is 2+2?|4\nCapital of France?|Paris\n4\nParis\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>

struct Card {
  std::string question;
  std::string answer;
};

int main() {
  // TODO: read N cards, quiz them, and print "score X/N".
  return 0;
}
`,
    visibleTests: [
      {
        name: "M4: scores two cards",
        stdin: "2\nWhat is 2+2?|4\nCapital of France?|Paris\n4\nParis\n",
        expectedStdout: "score 2/2",
        matcher: "contains",
        milestoneId: "cli-flashcard-reviewer.m4"
      }
    ],
    skillTags: ["dsa.strings.parsing", "cpp.utilities.file_io"]
  },
  "text-statistics-analyzer": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a text statistics analyzer.

Requirements:
1. Read all text from stdin.
2. Count words and lines.
3. Tally word frequencies (case-insensitive) in a std::map<string,int>.
4. Print the most frequent word as "top: <word> <count>".

Milestones:
1. Read the input and split it into words.
2. Count words with a std::map<string,int>.
3. Sort and report the most frequent word.

Expected solution outline:
- getline each line; split on whitespace.
- Lowercase each word before counting.
- Track the max-count word deterministically (ties broken by first seen).
- Print the top word and its count.

AI evaluation rubric:
- Correct word/line counting on multi-line input.
- Case-insensitive frequency counting.
- Deterministic tie-breaking.
- Separates tokenizing from counting.`,
    stdin: "the cat sat\nthe dog ran\nthe end\n",
    starterCode: `#include <iostream>
#include <map>
#include <string>

int main() {
  // TODO: read text, count words, and print "top: <word> <count>".
  return 0;
}
`,
    visibleTests: [
      {
        name: "M3: reports the most frequent word",
        stdin: "the cat sat\nthe dog ran\nthe end\n",
        expectedStdout: "top: the 3",
        matcher: "contains",
        milestoneId: "text-statistics-analyzer.m3"
      }
    ],
    skillTags: ["dsa.strings.char_frequency", "cpp.stl.map"]
  },
  "dictionary-autocomplete": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a dictionary autocomplete.

Requirements:
1. Read a word count N, then N dictionary words.
2. Read a prefix query.
3. Print every word with that prefix, one per line, in sorted order.

Milestones:
1. Insert dictionary words into a prefix structure (trie or sorted set).
2. Distinguish exact matches from prefixes.
3. Enumerate completions for a prefix in deterministic order.
4. Compare trie cost with a hash set for exact-only lookup.

Expected solution outline:
- Store words (a trie or std::set).
- For the query prefix, collect all words that start with it.
- Print matches in sorted order.

AI evaluation rubric:
- Correct prefix matching, including the empty prefix.
- Deterministic, sorted output.
- No false positives (substring vs prefix).
- Clear separation of insert and query.`,
    stdin: "4\ncar\ncart\ncarbon\ndog\ncar\n",
    starterCode: `#include <iostream>
#include <set>
#include <string>

int main() {
  // TODO: read words, then print all completions of the query prefix.
  return 0;
}
`,
    visibleTests: [
      {
        name: "M3: lists completions in order",
        stdin: "4\ncar\ncart\ncarbon\ndog\ncar\n",
        expectedStdout: "car\ncarbon\ncart\n",
        matcher: "trimmed",
        milestoneId: "dictionary-autocomplete.m3"
      }
    ],
    skillTags: ["dsa.strings.trie", "dsa.strings.searching"]
  },
  "csv-table-summarizer": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a CSV table summarizer.

Requirements:
1. Read CSV text from stdin.
2. Treat the first row as headers.
3. Split simple comma-separated rows.
4. Detect numeric columns.
5. Print min, max, and average for each numeric column.

Milestones:
1. Split each line on commas into fields.
2. Handle empty fields and trailing commas safely.
3. Detect numeric columns and accumulate values.
4. Print min/max/average per numeric column.

Expected solution outline:
- Read all lines with getline.
- Split each line into fields.
- Store headers.
- For each non-header row, try parsing each field as double.
- Track count, min, max, and sum per numeric column.
- Print one summary line per numeric column.

AI evaluation rubric:
- Correct parsing for simple CSV.
- Handles empty input safely.
- Does not crash on non-numeric fields.
- Uses clear functions.
- Keeps numeric aggregation separate from string splitting.`,
    stdin: "name,score,age\nAlice,95,18\nBob,87,19\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>

std::vector<std::string> splitCsvLine(const std::string& line) {
  // TODO: split on commas
  return {};
}

int main() {
  std::string line;
  while (std::getline(std::cin, line)) {
    // TODO: parse and summarize
  }
  return 0;
}
`,
    visibleTests: [
      {
        name: "M1: splits simple CSV fields",
        stdin: "a,b,c\n",
        expectedStdout: "a\nb\nc\n",
        matcher: "trimmed",
        milestoneId: "csv-table-summarizer.m1"
      },
      {
        name: "M4: summarizes one numeric column",
        stdin: "name,score\nAlice,95\nBob,85\n",
        expectedStdout: "score min=85 max=95 avg=90",
        matcher: "trimmed",
        milestoneId: "csv-table-summarizer.m4"
      }
    ],
    skillTags: ["dsa.strings.parsing", "cpp.utilities.stream_validation"]
  },
  "directory-inventory-reporter": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a directory inventory reporter (driven by a text manifest for testability).

Requirements:
1. Read lines from stdin of the form "<name> <sizeBytes>".
2. Classify each file by extension (the text after the last '.').
3. Aggregate total size per extension.
4. Print "<ext> <count> <totalBytes>" per extension, sorted by extension.

Milestones:
1. Read and parse manifest lines safely.
2. Classify files by extension without crashing on no extension.
3. Aggregate counts and sizes per type.
4. Print a deterministic, sorted report.

Expected solution outline:
- getline each manifest entry; split name and size.
- Derive the extension (or "(none)").
- Accumulate count and bytes in a std::map.
- Print sorted per-extension lines.

AI evaluation rubric:
- Robust parsing of the manifest.
- Correct extension handling, including files without one.
- Deterministic, sorted output.
- Validates stream state before trusting parsed numbers.`,
    stdin: "a.txt 100\nb.txt 50\nc.cpp 200\n",
    starterCode: `#include <iostream>
#include <map>
#include <string>

int main() {
  // TODO: read "<name> <size>" lines and print a per-extension report.
  return 0;
}
`,
    visibleTests: [
      {
        name: "M4: aggregates by extension",
        stdin: "a.txt 100\nb.txt 50\nc.cpp 200\n",
        expectedStdout: "cpp 1 200\ntxt 2 150\n",
        matcher: "trimmed",
        milestoneId: "directory-inventory-reporter.m4"
      }
    ],
    skillTags: ["cpp.utilities.file_io", "cpp.utilities.stream_validation"]
  },
  "note-manager": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a simple note manager driven by stdin commands.

Requirements:
1. Read commands from stdin: "add <text>", "del <index>", "list".
2. Keep notes in a vector in insertion order.
3. On "list", print each note as "<index>: <text>" (1-based), in order.

Milestones:
1. Model a Note and keep a vector of notes in memory.
2. Implement add/list/delete commands in a loop.
3. Keep indices stable and 1-based on list.

Expected solution outline:
- getline each command; split the verb from the argument.
- add appends; del removes by 1-based index if valid.
- list prints "<n>: <text>" lines.

AI evaluation rubric:
- Correct command parsing.
- Safe deletion (ignores out-of-range indices).
- Correct 1-based listing order.
- Clear separation of command handling from storage.`,
    stdin: "add buy milk\nadd call mom\ndel 1\nlist\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>

int main() {
  // TODO: process add/del/list commands over a vector of notes.
  return 0;
}
`,
    visibleTests: [
      {
        name: "M2: add, delete, then list",
        stdin: "add buy milk\nadd call mom\ndel 1\nlist\n",
        expectedStdout: "1: call mom",
        matcher: "contains",
        milestoneId: "note-manager.m2"
      }
    ],
    skillTags: ["cpp.functions.decomposition", "cpp.utilities.file_io"]
  },
  "todo-planner": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a todo list planner driven by stdin.

Requirements:
1. Read a count N, then N lines of "<priority> <title>" (lower priority number = higher importance).
2. Sort tasks by ascending priority, ties broken by input order (stable).
3. Print each task as "<priority> <title>", one per line.

Milestones:
1. Define a Task with title and priority.
2. Read tasks into a vector.
3. Sort by priority with a comparator and print.

Expected solution outline:
- Read N, then parse each "<priority> <title>".
- std::stable_sort by priority.
- Print sorted tasks.

AI evaluation rubric:
- Correct stable ordering by priority.
- Robust parsing of priority and multi-word titles.
- Uses a clear comparator.
- Separates parsing from sorting/printing.`,
    stdin: "3\n2 write report\n1 fix bug\n2 email team\n",
    starterCode: `#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Task {
  int priority;
  std::string title;
};

int main() {
  // TODO: read tasks, stable-sort by priority, and print them.
  return 0;
}
`,
    visibleTests: [
      {
        name: "M3: sorts by priority (stable)",
        stdin: "3\n2 write report\n1 fix bug\n2 email team\n",
        expectedStdout: "1 fix bug\n2 write report\n2 email team\n",
        matcher: "trimmed",
        milestoneId: "todo-planner.m3"
      }
    ],
    skillTags: ["dsa.sorting.comparator", "cpp.utilities.enums"]
  },
  "quiz-generator": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a small quiz grader (deterministic, no randomness in the visible path).

Requirements:
1. Read a count N, then N lines of "question|answer".
2. Read N learner answer lines in order.
3. Grade with trimmed comparison and print "score X/N".

Milestones:
1. Load a question bank into a vector.
2. Read learner answers for each question.
3. Grade answers and report the score.

Expected solution outline:
- Parse "question|answer" lines.
- Compare trimmed learner answers.
- Print "score correct/total".

AI evaluation rubric:
- Correct parsing of the bank and answers.
- Trimmed, case-sensitive comparison.
- Handles missing answers gracefully.
- Keeps grading separate from I/O.`,
    stdin: "2\n2+2?|4\nsky color?|blue\n4\nblue\n",
    starterCode: `#include <iostream>
#include <string>
#include <vector>

int main() {
  // TODO: load a question bank, grade answers, print "score X/N".
  return 0;
}
`,
    visibleTests: [
      {
        name: "M3: grades a short quiz",
        stdin: "2\n2+2?|4\nsky color?|blue\n4\nblue\n",
        expectedStdout: "score 2/2",
        matcher: "contains",
        milestoneId: "quiz-generator.m3"
      }
    ],
    skillTags: ["dsa.strings.parsing", "cpp.functions.decomposition"]
  },
  "unit-converter": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a unit conversion tool driven by stdin.

Requirements:
1. Read a line "<value> <from> <to>" where units are c or f (Celsius/Fahrenheit).
2. Convert temperature between the two units.
3. Print the result rounded to one decimal place.

Milestones:
1. Implement conversion functions for one category (temperature).
2. Parse the value and unit selection.
3. Extend to more categories without duplicating logic.

Expected solution outline:
- Parse value and units.
- c->f: v*9/5+32; f->c: (v-32)*5/9; same unit: identity.
- Print with one decimal (e.g., std::fixed, setprecision(1)).

AI evaluation rubric:
- Correct conversion math.
- Handles same-unit and both directions.
- Clean, reusable conversion functions.
- Robust input parsing.`,
    stdin: "100 c f\n",
    starterCode: `#include <iomanip>
#include <iostream>
#include <string>

int main() {
  // TODO: read "<value> <from> <to>" and print the converted value.
  return 0;
}
`,
    visibleTests: [
      {
        name: "M1: Celsius to Fahrenheit",
        stdin: "100 c f\n",
        expectedStdout: "212.0",
        matcher: "contains",
        milestoneId: "unit-converter.m1"
      }
    ],
    skillTags: ["cpp.functions.basics", "cpp.control_flow.conditionals"]
  },
  "number-guessing-stats": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a number guessing game with statistics (deterministic for tests).

Requirements:
1. Read a target T, then guesses until the guess equals T.
2. After each wrong guess print "higher" or "lower".
3. When correct, print "got it in <k> guesses".

Milestones:
1. Read the target and loop on guesses with hints.
2. Track the number of attempts.
3. Report the attempt count on success.

Expected solution outline:
- Read T, then read guesses in a loop.
- Print "higher"/"lower" hints.
- Count attempts; on match print "got it in <k> guesses".

AI evaluation rubric:
- Correct hint direction.
- Accurate attempt counting.
- Terminates cleanly on the correct guess.
- Separates game loop from statistics.`,
    stdin: "7\n5\n9\n7\n",
    starterCode: `#include <iostream>

int main() {
  // TODO: read target, give higher/lower hints, count attempts.
  return 0;
}
`,
    visibleTests: [
      {
        name: "M3: reports attempts on success",
        stdin: "7\n5\n9\n7\n",
        expectedStdout: "got it in 3 guesses",
        matcher: "contains",
        milestoneId: "number-guessing-stats.m3"
      }
    ],
    skillTags: ["cpp.control_flow.loops", "cpp.utilities.random"]
  },
  "maze-route-planner": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a maze route planner using BFS.

Requirements:
1. Read R and C, then R lines of a grid with S (start), G (goal), '.' (open), '#' (wall).
2. Run BFS from S over 4-directional moves through open cells.
3. Print the shortest path length as "steps <k>", or "no route" if unreachable.

Milestones:
1. Model open grid cells as graph vertices with 4-directional edges.
2. Run BFS from S storing distance.
3. Report the shortest distance to G, or that no route exists.

Expected solution outline:
- Parse the grid; find S and G.
- BFS with a queue and visited/distance grid.
- Print "steps <dist>" or "no route".

AI evaluation rubric:
- Correct BFS over the grid.
- Respects walls and bounds.
- Handles the unreachable case.
- Separates parsing from search.`,
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
      {
        name: "M3: shortest steps on a line maze",
        stdin: "1 3\nS.G\n",
        expectedStdout: "steps 2",
        matcher: "contains",
        milestoneId: "maze-route-planner.m3"
      }
    ],
    skillTags: ["dsa.graphs.bfs", "dsa.graphs.shortest_path"]
  },
  "math-technique-playground": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a math technique playground driven by stdin commands.

Requirements:
1. Read a command line. Support at least: "gcd <a> <b>" and "popcount <n>".
2. gcd prints the greatest common divisor.
3. popcount prints the number of set bits in n.

Milestones:
1. Trace bit operations (set/clear/toggle/test) and count set bits.
2. Add GCD/LCM helpers stating integer range assumptions.
3. Count/generate combinations with backtracking.
4. Use orientation / squared-distance checks on small point sets.

Expected solution outline:
- Parse the command verb and operands.
- Implement std::gcd-style Euclid and a popcount loop.
- Print the single numeric result.

AI evaluation rubric:
- Correct gcd and popcount.
- Handles zero operands sensibly.
- Clear, reusable helper functions.
- States integer-range assumptions.`,
    stdin: "gcd 12 18\n",
    starterCode: `#include <iostream>
#include <string>

int main() {
  // TODO: read a command and print the numeric result (gcd, popcount, ...).
  return 0;
}
`,
    visibleTests: [
      {
        name: "M2: gcd via Euclid",
        stdin: "gcd 12 18\n",
        expectedStdout: "6",
        matcher: "trimmed",
        milestoneId: "math-technique-playground.m2"
      }
    ],
    skillTags: ["dsa.math.number_theory", "dsa.math.bitmask_techniques"]
  },
  "task-queue-lab": {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: `Build a bounded task queue lab (single-threaded model for deterministic tests).

Requirements:
1. Read a capacity C, then commands: "push <n>", "pop", "close".
2. push enqueues if not full and not closed; pop dequeues FIFO and prints the value.
3. After "close", further pushes are rejected; pops drain remaining items.

Milestones:
1. Define the queue contract: capacity, FIFO order, push, pop, close.
2. Track items and a closed flag.
3. Reject pushes past capacity or after close.
4. Drain remaining items after close.
5. Verify exact-once processing deterministically.

Expected solution outline:
- Model the queue with a std::deque and capacity + closed flag.
- Apply commands in order; print popped values.
- Enforce capacity and closed semantics.

AI evaluation rubric:
- Correct FIFO order.
- Correct capacity and closed-state handling.
- No lost or duplicated items.
- Clear queue contract.`,
    stdin: "2\npush 1\npush 2\npop\npop\nclose\n",
    starterCode: `#include <deque>
#include <iostream>
#include <string>

int main() {
  // TODO: model a bounded FIFO queue with push/pop/close commands.
  return 0;
}
`,
    visibleTests: [
      {
        name: "M2: FIFO push/pop order",
        stdin: "2\npush 1\npush 2\npop\npop\nclose\n",
        expectedStdout: "1\n2\n",
        matcher: "trimmed",
        milestoneId: "task-queue-lab.m2"
      }
    ],
    skillTags: ["cpp.concurrency.condition_variables", "cpp.concurrency.shared_state_design"]
  }
};
