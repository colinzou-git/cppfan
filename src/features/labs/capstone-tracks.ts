// Sequenced capstone tracks and structured milestones (#129 / #82, spec in
// docs/CAPSTONE_PROJECTS.md). Organizes the existing flat project labs
// (project-labs.ts) into ordered tracks and gives selected projects explicit,
// individually-trackable, skill-linked milestones. Like project-labs this is a
// typed catalog (labs are not DB-backed), so no migration is needed. Per-learner
// milestone progress (#130) and the track/milestone UI are follow-up slices.

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
    projectIds: ["text-statistics-analyzer", "csv-table-summarizer"]
  },
  {
    id: "games_simulation",
    title: "Games and simulation track",
    summary: "Interactive programs using randomness, state, and aggregate statistics.",
    order_index: 30,
    projectIds: ["quiz-generator", "number-guessing-stats"]
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
