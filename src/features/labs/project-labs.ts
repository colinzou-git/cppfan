export type ProjectDifficulty = "beginner" | "intermediate";

export type ProjectLab = {
  id: string;
  title: string;
  summary: string;
  difficulty: ProjectDifficulty;
  /** Skills/topics the project exercises, as readable tags. */
  focus: string[];
  /** Ordered milestones; not graded — guidance for the learner. */
  milestones: string[];
  /** Optional content version so saved chat threads invalidate on edits (#439). */
  version?: string;
};

/*
 * A static catalog of small, guided C++ project ideas. Projects apply concepts
 * in context; they do not run or grade code in the browser. Keep entries
 * original and beginner-friendly.
 */
export const projectLabs: ProjectLab[] = [
  {
    id: "cli-flashcard-reviewer",
    title: "Command-line flashcard reviewer",
    summary: "Load question/answer cards from a file and quiz yourself in the terminal, tracking which cards you miss.",
    difficulty: "beginner",
    focus: ["structs/classes", "vectors", "file input"],
    milestones: [
      "Define a Card struct and read cards from a text file into a vector.",
      "Show each card, read the user's answer, and mark right/wrong.",
      "Repeat missed cards and print a final score summary."
    ]
  },
  {
    id: "text-statistics-analyzer",
    title: "Text statistics analyzer",
    summary: "Read a text file and report word count, line count, and the most common words.",
    difficulty: "beginner",
    focus: ["strings", "maps", "file input"],
    milestones: [
      "Read the file and split it into words.",
      "Count words with a std::map<string,int>.",
      "Sort and print the top N most frequent words."
    ]
  },
  {
    id: "dictionary-autocomplete",
    title: "Dictionary autocomplete",
    summary: "Build a small word index that answers exact lookup and prefix/autocomplete queries.",
    difficulty: "intermediate",
    focus: ["strings", "tries", "prefix queries", "autocomplete"],
    milestones: [
      "Normalize and insert dictionary words into a prefix tree.",
      "Mark terminal nodes so exact matches differ from prefixes.",
      "Walk to a prefix node and enumerate completions in deterministic order.",
      "Compare trie memory cost with a hash set when only exact lookup is required."
    ]
  },
  {
    id: "csv-table-summarizer",
    title: "CSV table summarizer",
    summary: "Parse a simple CSV file and print per-column summaries (min, max, average for numeric columns).",
    difficulty: "intermediate",
    focus: ["strings", "vectors", "parsing"],
    milestones: [
      "Split each line on commas into fields.",
      "Detect numeric columns and accumulate values.",
      "Print min/max/average per numeric column."
    ]
  },
  {
    id: "directory-inventory-reporter",
    title: "Directory inventory reporter",
    summary: "Traverse a folder, summarize files by type and size, and save a portable text report.",
    difficulty: "intermediate",
    focus: ["file I/O", "filesystem", "chrono", "enum state"],
    milestones: [
      "Accept a root path and compose report paths with std::filesystem::path.",
      "Traverse directories and classify regular files without parsing path strings.",
      "Write a text report with ofstream and validate stream state before trusting output.",
      "Measure traversal duration with steady_clock.",
      "Model scan status with enum class values such as Ready, Scanning, Done, and Error."
    ]
  },
  {
    id: "note-manager",
    title: "Simple note manager",
    summary: "A small CLI to add, list, and delete short notes persisted to a file.",
    difficulty: "beginner",
    focus: ["classes", "vectors", "file input/output"],
    milestones: [
      "Model a Note and keep a vector of notes in memory.",
      "Add a menu loop for add/list/delete commands.",
      "Save notes to a file on exit and load them on start."
    ]
  },
  {
    id: "todo-planner",
    title: "Todo list planner",
    summary: "Track tasks with priorities and a done flag, sorted by priority.",
    difficulty: "beginner",
    focus: ["structs/classes", "sorting", "enums"],
    milestones: [
      "Define a Task with title, priority, and done state.",
      "Add, complete, and remove tasks.",
      "Display tasks sorted by priority with std::sort and a comparator."
    ]
  },
  {
    id: "quiz-generator",
    title: "Small quiz generator",
    summary: "Pick random questions from a bank and grade a short quiz.",
    difficulty: "intermediate",
    focus: ["vectors", "random", "classes"],
    milestones: [
      "Load a question bank into a vector.",
      "Shuffle and pick N questions for a session.",
      "Grade answers and report the score."
    ]
  },
  {
    id: "unit-converter",
    title: "Unit conversion tool",
    summary: "Convert between units (length, weight, temperature) chosen by the user.",
    difficulty: "beginner",
    focus: ["functions", "control flow", "enums"],
    milestones: [
      "Implement conversion functions for one category.",
      "Add a menu to choose category, units, and value.",
      "Extend to more categories without duplicating logic."
    ]
  },
  {
    id: "number-guessing-stats",
    title: "Number guessing game with statistics",
    summary: "Classic guess-the-number game that records games played, wins, and best guess count.",
    difficulty: "beginner",
    focus: ["control flow", "random", "classes"],
    milestones: [
      "Generate a random target and loop on guesses with hints.",
      "Track attempts per game.",
      "Persist and display aggregate statistics across games."
    ]
  },
  {
    id: "maze-route-planner",
    title: "Maze route planner",
    summary: "Read a small grid maze and find the shortest route from start to goal using BFS.",
    difficulty: "intermediate",
    focus: ["graphs", "BFS", "grid modeling", "path reconstruction"],
    milestones: [
      "Model open grid cells as graph vertices with 4-directional edges.",
      "Run BFS from S while storing distance and parent direction.",
      "Reconstruct and print the shortest route to G, or report that no route exists."
    ]
  },
  {
    id: "math-technique-playground",
    title: "Math technique playground",
    summary: "Build a small toolkit that traces bit masks, counts combinations, and checks simple geometry primitives.",
    difficulty: "intermediate",
    focus: ["bitmasks", "number theory", "combinatorics", "geometry"],
    milestones: [
      "Trace bit rows for set, clear, toggle, and test operations.",
      "Add GCD/LCM helpers that state integer range assumptions.",
      "Count and generate combinations with backtracking.",
      "Use orientation and squared-distance checks on small point sets.",
      "Record which technique fits each sample task and why."
    ]
  },
  {
    id: "task-queue-lab",
    title: "Bounded task queue lab",
    summary: "Build a small producer-consumer queue that shuts down cleanly and passes deterministic thread tests.",
    difficulty: "intermediate",
    focus: ["threads", "mutexes", "condition variables", "producer-consumer"],
    milestones: [
      "Define the queue contract: capacity, FIFO order, push, pop, and close.",
      "Protect the queue and closed flag with one mutex.",
      "Use condition_variable predicates so producers wait for space and consumers wait for work.",
      "Close the queue by waking all waiting threads and draining queued tasks.",
      "Verify exact-once processing with deterministic tests instead of sleeps."
    ]
  }
];

export function getProjectLabsByDifficulty(difficulty: ProjectDifficulty): ProjectLab[] {
  return projectLabs.filter((lab) => lab.difficulty === difficulty);
}

/** Lookup a project lab by id, or null when it is not a known project (#439). */
export function getProjectLabById(id: string): ProjectLab | null {
  return projectLabs.find((project) => project.id === id) ?? null;
}
