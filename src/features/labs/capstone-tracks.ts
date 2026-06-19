// Sequenced capstone tracks and structured milestones (#129 / #82, spec in
// docs/CAPSTONE_PROJECTS.md). Organizes the existing flat project labs
// (project-labs.ts) into ordered tracks and gives selected projects explicit,
// individually-trackable, skill-linked milestones. Like project-labs this is a
// typed catalog (labs are not DB-backed), so no migration is needed. Per-learner
// milestone progress (#130) is stored separately under RLS.

export type MilestoneVerification = "manual_checklist" | "exercise_tests" | "reflection";

export type CapstoneMilestone = {
  /** Stable id within the project, e.g. "<projectId>.m1". */
  id: string;
  title: string;
  /** Required vs optional (optional milestones are stretch/extension). */
  required: boolean;
  estimatedMinutes: number;
  /** Skills this milestone applies (links to skills.id). */
  practicedSkillIds: string[];
  /** How the learner verifies completion. */
  verification: MilestoneVerification;
  reflectionPrompt: string;
  /** Optional stretch goal beyond the required work. */
  extensionTask?: string;
  /** Optional linked write-code exercise package (#81). */
  exerciseId?: string;
};

export type CapstoneProject = {
  /** Reuses an existing project-labs id (content is preserved, not duplicated). */
  id: string;
  trackId: string;
  /** Skills assumed before starting (recommendations, not hard locks). */
  prerequisiteSkillIds: string[];
  milestones: CapstoneMilestone[];
};

export type CapstoneTrack = {
  id: string;
  title: string;
  summary: string;
  order_index: number;
  /** Ordered project-labs ids that make up the track. */
  projectIds: string[];
};

export const capstoneTracks: CapstoneTrack[] = [
  {
    id: "beginner_utility",
    title: "Beginner utility track",
    summary: "Small command-line utilities that build core C++ fluency one concept at a time.",
    order_index: 10,
    projectIds: ["cli-flashcard-reviewer", "note-manager", "todo-planner", "unit-converter"]
  },
  {
    id: "data_analysis",
    title: "Text and data analysis track",
    summary: "Parse and summarize real text and tabular data, applying strings, maps, and parsing care.",
    order_index: 20,
    projectIds: ["text-statistics-analyzer", "csv-table-summarizer", "directory-inventory-reporter"]
  },
  {
    id: "string_applications",
    title: "String applications track",
    summary: "Turn string processing, prefix structures, and hashing choices into small searchable tools.",
    order_index: 25,
    projectIds: ["dictionary-autocomplete"]
  },
  {
    id: "games_simulation",
    title: "Games and simulation track",
    summary: "Interactive programs using randomness, state, and aggregate statistics.",
    order_index: 30,
    projectIds: ["quiz-generator", "number-guessing-stats"]
  },
  {
    id: "dsa_graphs",
    title: "Graph problem-solving track",
    summary: "Model graph states, trace traversal, and turn BFS/DFS ideas into small tools.",
    order_index: 40,
    projectIds: ["maze-route-planner"]
  },
  {
    id: "dsa_math",
    title: "Math technique track",
    summary: "Practice bitmasks, number theory, combinatorics, and geometry as reusable problem-solving tools.",
    order_index: 45,
    projectIds: ["math-technique-playground"]
  },
  {
    id: "concurrency_practice",
    title: "Concurrency correctness track",
    summary: "Practice shared-state design, synchronization, and deterministic concurrent testing.",
    order_index: 50,
    projectIds: ["task-queue-lab"]
  }
];

export const capstoneProjects: CapstoneProject[] = [
  {
    id: "note-manager",
    trackId: "beginner_utility",
    prerequisiteSkillIds: ["cpp.structs_classes.syntax", "cpp.functions.basics"],
    milestones: [
      {
        id: "note-manager.m1",
        title: "Model a Note and hold notes in memory",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: ["cpp.structs_classes.syntax"],
        verification: "manual_checklist",
        reflectionPrompt: "What state does a Note own, and why keep notes in a vector rather than fixed variables?"
      },
      {
        id: "note-manager.m2",
        title: "Add a menu loop for add / list / delete",
        required: true,
        estimatedMinutes: 30,
        practicedSkillIds: ["cpp.control_flow.loops", "cpp.functions.basics"],
        verification: "manual_checklist",
        reflectionPrompt: "How did you keep the command loop readable as commands grew?"
      },
      {
        id: "note-manager.m3",
        title: "Persist notes to a file and load them on start",
        required: true,
        estimatedMinutes: 35,
        practicedSkillIds: ["cpp.utilities.file_io", "cpp.utilities.stream_validation"],
        verification: "manual_checklist",
        reflectionPrompt: "What happens if the file is missing or malformed, and how did you handle it?"
      },
      {
        id: "note-manager.m4",
        title: "Make resource handling safe with RAII",
        required: true,
        estimatedMinutes: 30,
        practicedSkillIds: ["cpp.raii.resource_lifetime", "cpp.raii.destructor_cleanup"],
        verification: "exercise_tests",
        reflectionPrompt: "Where could a leak or double-free have happened, and how does RAII prevent it?",
        exerciseId: "raii-scoped-array"
      },
      {
        id: "note-manager.m5",
        title: "Sort and search notes",
        required: false,
        estimatedMinutes: 25,
        practicedSkillIds: ["cpp.stl.algorithms"],
        verification: "reflection",
        reflectionPrompt: "Which std algorithm did you reach for, and why was it a better fit than a hand-written loop?",
        extensionTask: "Add tag-based filtering and sort notes by most recently edited."
      }
    ]
  },
  {
    id: "csv-table-summarizer",
    trackId: "data_analysis",
    prerequisiteSkillIds: ["dsa.strings.parsing", "cpp.functions.basics"],
    milestones: [
      {
        id: "csv-table-summarizer.m1",
        title: "Split each line into fields",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: ["dsa.strings.parsing"],
        verification: "manual_checklist",
        reflectionPrompt: "How did you split on commas, and what did you do with whitespace around fields?"
      },
      {
        id: "csv-table-summarizer.m2",
        title: "Handle parsing edge cases",
        required: true,
        estimatedMinutes: 30,
        practicedSkillIds: ["dsa.strings.parsing_edge_cases", "cpp.utilities.stream_validation"],
        verification: "manual_checklist",
        reflectionPrompt: "Which edge cases (empty fields, trailing commas, CRLF) did you find, and how did you cover them?"
      },
      {
        id: "csv-table-summarizer.m3",
        title: "Detect numeric columns and accumulate values",
        required: true,
        estimatedMinutes: 35,
        practicedSkillIds: ["cpp.utilities.stream_validation"],
        verification: "manual_checklist",
        reflectionPrompt: "How do you decide a column is numeric without crashing on a stray non-number?"
      },
      {
        id: "csv-table-summarizer.m4",
        title: "Print min / max / average per numeric column",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: ["cpp.stl.algorithms"],
        verification: "manual_checklist",
        reflectionPrompt: "What is the time complexity of your summary pass over the table?"
      },
      {
        id: "csv-table-summarizer.m5",
        title: "Practice the two-pointer pattern on sorted data",
        required: false,
        estimatedMinutes: 25,
        practicedSkillIds: ["dsa.arrays.two_pointers", "dsa.complexity.big_o"],
        verification: "exercise_tests",
        reflectionPrompt: "Why is two-pointer O(n) better than the nested-loop O(n^2) approach here?",
        exerciseId: "dsa-two-sum-sorted"
      }
    ]
  },
  {
    id: "dictionary-autocomplete",
    trackId: "string_applications",
    prerequisiteSkillIds: ["dsa.strings.char_frequency", "dsa.strings.trie"],
    milestones: [
      {
        id: "dictionary-autocomplete.m1",
        title: "Normalize dictionary input",
        required: true,
        estimatedMinutes: 20,
        practicedSkillIds: ["dsa.strings.case_handling", "dsa.strings.char_frequency"],
        verification: "manual_checklist",
        reflectionPrompt: "Which characters did you normalize or reject, and why is that decision visible to users?"
      },
      {
        id: "dictionary-autocomplete.m2",
        title: "Model trie nodes and terminal words",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: ["dsa.strings.trie"],
        verification: "reflection",
        reflectionPrompt: "How does your node representation distinguish a full word from a prefix?"
      },
      {
        id: "dictionary-autocomplete.m3",
        title: "Implement prefix suggestions",
        required: true,
        estimatedMinutes: 35,
        practicedSkillIds: ["dsa.strings.trie", "dsa.strings.substring_subsequence"],
        verification: "exercise_tests",
        reflectionPrompt: "Why does walking to the prefix node avoid scanning every dictionary word?",
        exerciseId: "trie-autocomplete"
      },
      {
        id: "dictionary-autocomplete.m4",
        title: "Compare trie, hash map, and rolling-hash choices",
        required: true,
        estimatedMinutes: 20,
        practicedSkillIds: ["dsa.strings.trie", "dsa.strings.hashing"],
        verification: "reflection",
        reflectionPrompt: "When would a hash set be enough, and when does prefix enumeration justify trie memory?"
      },
      {
        id: "dictionary-autocomplete.m5",
        title: "Add search/log parsing import",
        required: false,
        estimatedMinutes: 30,
        practicedSkillIds: ["dsa.strings.parsing_edge_cases", "dsa.strings.searching"],
        verification: "manual_checklist",
        reflectionPrompt: "Which delimiter, empty-field, and CRLF cases did your import path preserve?",
        extensionTask: "Load the dictionary from a log or CSV export, then report rejected rows with line numbers."
      }
    ]
  },
  {
    id: "directory-inventory-reporter",
    trackId: "data_analysis",
    prerequisiteSkillIds: ["cpp.utilities.file_io", "cpp.utilities.filesystem"],
    milestones: [
      {
        id: "directory-inventory-reporter.m1",
        title: "Accept and compose portable paths",
        required: true,
        estimatedMinutes: 20,
        practicedSkillIds: ["cpp.utilities.filesystem"],
        verification: "manual_checklist",
        reflectionPrompt: "Where did you use fs::path operator/ instead of manual separators?"
      },
      {
        id: "directory-inventory-reporter.m2",
        title: "Traverse the directory safely",
        required: true,
        estimatedMinutes: 35,
        practicedSkillIds: ["cpp.utilities.filesystem", "cpp.utilities.stream_validation"],
        verification: "exercise_tests",
        reflectionPrompt: "Which missing-root, plain-file, and nested-directory cases did your scan handle?",
        exerciseId: "filesystem-inventory"
      },
      {
        id: "directory-inventory-reporter.m3",
        title: "Write and validate the report file",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: ["cpp.utilities.file_io", "cpp.utilities.stream_validation"],
        verification: "manual_checklist",
        reflectionPrompt: "How did RAII closing help, and where did you check stream state for write failures?"
      },
      {
        id: "directory-inventory-reporter.m4",
        title: "Measure scan duration",
        required: true,
        estimatedMinutes: 20,
        practicedSkillIds: ["cpp.utilities.chrono_depth"],
        verification: "reflection",
        reflectionPrompt: "Why is steady_clock the right clock for elapsed scan duration?"
      },
      {
        id: "directory-inventory-reporter.m5",
        title: "Model scan state explicitly",
        required: false,
        estimatedMinutes: 20,
        practicedSkillIds: ["cpp.utilities.enums", "cpp.utilities.any_caution"],
        verification: "reflection",
        reflectionPrompt: "Why is enum class a better fit than std::any for this closed set of scan states?",
        extensionTask: "Add a deterministic sample mode that uses <random> with a fixed seed during tests."
      }
    ]
  },
  {
    id: "maze-route-planner",
    trackId: "dsa_graphs",
    prerequisiteSkillIds: ["dsa.graphs.representation", "dsa.graphs.bfs"],
    milestones: [
      {
        id: "maze-route-planner.m1",
        title: "Model the grid as an implicit graph",
        required: true,
        estimatedMinutes: 20,
        practicedSkillIds: ["dsa.graphs.connected_components"],
        verification: "reflection",
        reflectionPrompt: "Which cells are vertices, which moves are edges, and why does a wall remove an edge?"
      },
      {
        id: "maze-route-planner.m2",
        title: "Trace BFS queue and visited state",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: ["dsa.graphs.bfs"],
        verification: "manual_checklist",
        reflectionPrompt: "What invariant tells you that the first time BFS reaches a cell, its distance is shortest?"
      },
      {
        id: "maze-route-planner.m3",
        title: "Store parents for route reconstruction",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: ["dsa.graphs.bfs", "dsa.graphs.shortest_path"],
        verification: "manual_checklist",
        reflectionPrompt: "How do parent links let you recover the route after BFS reaches the goal?"
      },
      {
        id: "maze-route-planner.m4",
        title: "Implement and test shortest route length",
        required: true,
        estimatedMinutes: 30,
        practicedSkillIds: ["dsa.graphs.bfs", "dsa.graphs.connected_components"],
        verification: "exercise_tests",
        reflectionPrompt: "Which unreachable and boundary cases did your tests cover?",
        exerciseId: "graph-maze-shortest-path"
      },
      {
        id: "maze-route-planner.m5",
        title: "Compare BFS, DFS, and Dijkstra choices",
        required: false,
        estimatedMinutes: 20,
        practicedSkillIds: ["dsa.graphs.shortest_path_algorithms"],
        verification: "reflection",
        reflectionPrompt: "Why is BFS enough for an unweighted maze, and what would change if moves had different costs?",
        extensionTask: "Add weighted terrain costs and switch the route finder to Dijkstra."
      }
    ]
  },
  {
    id: "task-queue-lab",
    trackId: "concurrency_practice",
    prerequisiteSkillIds: ["cpp.concurrency.threads", "cpp.concurrency.mutexes"],
    milestones: [
      {
        id: "task-queue-lab.m1",
        title: "Define the queue contract",
        required: true,
        estimatedMinutes: 20,
        practicedSkillIds: ["cpp.concurrency.task_selection", "cpp.concurrency.shared_state_design"],
        verification: "reflection",
        reflectionPrompt: "Which operations are allowed after close, and how does the contract avoid shared writable state outside the queue?"
      },
      {
        id: "task-queue-lab.m2",
        title: "Protect queue state with scoped locking",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: ["cpp.concurrency.mutexes", "cpp.concurrency.lock_granularity"],
        verification: "manual_checklist",
        reflectionPrompt: "What exact state is protected by the mutex, and where is the lock released before notifying or returning?"
      },
      {
        id: "task-queue-lab.m3",
        title: "Coordinate producers and consumers",
        required: true,
        estimatedMinutes: 35,
        practicedSkillIds: ["cpp.concurrency.condition_variables", "cpp.concurrency.deadlock"],
        verification: "manual_checklist",
        reflectionPrompt: "Which condition-variable predicates prevent spurious wakeups and deadlock?"
      },
      {
        id: "task-queue-lab.m4",
        title: "Implement and test the bounded queue",
        required: true,
        estimatedMinutes: 45,
        practicedSkillIds: [
          "cpp.concurrency.threads",
          "cpp.concurrency.mutexes",
          "cpp.concurrency.condition_variables",
          "cpp.concurrency.shared_state_design"
        ],
        verification: "exercise_tests",
        reflectionPrompt: "Which invariant proves every task is processed exactly once without relying on sleep timing?",
        exerciseId: "concurrency-task-queue"
      },
      {
        id: "task-queue-lab.m5",
        title: "Compare shared queue vs task/future alternatives",
        required: false,
        estimatedMinutes: 20,
        practicedSkillIds: ["cpp.concurrency.async", "cpp.concurrency.promise_future", "cpp.concurrency.task_selection"],
        verification: "reflection",
        reflectionPrompt: "When would a future, promise, or message-passing design be simpler than a shared queue?",
        extensionTask: "Add a packaged_task-based producer and compare the ownership and shutdown rules."
      }
    ]
  },
  {
    id: "math-technique-playground",
    trackId: "dsa_math",
    prerequisiteSkillIds: ["dsa.math.bit_manipulation", "dsa.math.number_theory", "dsa.math.combinatorics"],
    milestones: [
      {
        id: "math-technique-playground.m1",
        title: "Trace bit rows and masks",
        required: true,
        estimatedMinutes: 20,
        practicedSkillIds: ["dsa.math.bit_manipulation", "dsa.math.bitmask_techniques"],
        verification: "manual_checklist",
        reflectionPrompt: "Which bitwise operator did each flag operation need, and what overflow assumption did you state?"
      },
      {
        id: "math-technique-playground.m2",
        title: "Consolidate GCD, LCM, and divisibility helpers",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: ["dsa.math.number_theory"],
        verification: "reflection",
        reflectionPrompt: "Why is LCM safer to compute as a / gcd(a,b) * b, and where can overflow still occur?"
      },
      {
        id: "math-technique-playground.m3",
        title: "Generate combinations with tests",
        required: true,
        estimatedMinutes: 35,
        practicedSkillIds: [
          "dsa.math.counting_principle",
          "dsa.math.generate_combinations",
          "dsa.math.bitmask_techniques"
        ],
        verification: "exercise_tests",
        reflectionPrompt: "How does the advancing start index prevent duplicate combinations?",
        exerciseId: "math-combination-generator"
      },
      {
        id: "math-technique-playground.m4",
        title: "Trace coordinate geometry primitives",
        required: true,
        estimatedMinutes: 25,
        practicedSkillIds: [
          "dsa.math.vectors_dot_cross",
          "dsa.math.segment_intersection",
          "dsa.math.geometry_precision"
        ],
        verification: "manual_checklist",
        reflectionPrompt: "Which geometry checks stayed exact as integers, and which would need an epsilon?"
      },
      {
        id: "math-technique-playground.m5",
        title: "Use convex hull as enrichment",
        required: false,
        estimatedMinutes: 25,
        practicedSkillIds: ["dsa.math.convex_hull", "dsa.math.geometry_area"],
        verification: "reflection",
        reflectionPrompt: "What prerequisite primitive does monotone chain reuse, and why is hull optional enrichment here?",
        extensionTask: "Add a small monotone-chain demo and decide whether to keep or drop collinear boundary points."
      }
    ]
  }
];

export function getCapstoneTracks(): CapstoneTrack[] {
  return [...capstoneTracks].sort((a, b) => a.order_index - b.order_index);
}

export function getCapstoneProject(id: string): CapstoneProject | null {
  return capstoneProjects.find((project) => project.id === id) ?? null;
}

/** All milestones across structured projects, for navigation and progress. */
export function getCapstoneMilestones(): CapstoneMilestone[] {
  return capstoneProjects.flatMap((project) => project.milestones);
}

/** Look up a single milestone by id, or null. */
export function getCapstoneMilestone(milestoneId: string): CapstoneMilestone | null {
  return getCapstoneMilestones().find((milestone) => milestone.id === milestoneId) ?? null;
}

/** The project id that owns a milestone, or null for an unknown milestone. */
export function getCapstoneProjectIdForMilestone(milestoneId: string): string | null {
  return capstoneProjects.find((project) => project.milestones.some((m) => m.id === milestoneId))?.id ?? null;
}

/**
 * Practiced-skill evidence from completed milestones: the distinct union of the
 * practicedSkillIds of the given completed milestones (#130). This is bounded
 * transfer evidence only — it never declares mastery and is separate from FSRS.
 */
export function practicedSkillsForMilestones(completedMilestoneIds: string[]): string[] {
  const wanted = new Set(completedMilestoneIds);
  const skills = new Set<string>();
  for (const milestone of getCapstoneMilestones()) {
    if (wanted.has(milestone.id)) {
      for (const skillId of milestone.practicedSkillIds) {
        skills.add(skillId);
      }
    }
  }
  return [...skills];
}
