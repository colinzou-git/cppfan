// Google-targeted Staff systems coding mock packs (#182 / #174). Reviewed, typed
// packs that COMPOSE existing original problems (#176) and follow-ups (#181) into
// timed sessions — original cppFan content, no proprietary/leaked questions, no
// claim of guaranteed Google questions. Versioned so historical scores stay
// interpretable. A reserved calibration pool is excluded from ordinary practice.
// The judged execution, randomization-with-coverage, and the 12-pack library are
// follow-up slices (this is the typed catalog + first packs).
import { getInterviewProblem } from "./problem-catalog";
import { followUps } from "./follow-ups";

export type MockPackCategory = "core_algorithm" | "ds_implementation" | "cpp_debugging";

export type MockPack = {
  id: string;
  version: number;
  title: string;
  category: MockPackCategory;
  /** 45 or 50 minute sessions. */
  durationMinutes: 45 | 50;
  /** Ordered original problems (from the #176 catalog). */
  problemIds: string[];
  /** At least one reviewed follow-up (from the #181 catalog). */
  followUpIds: string[];
  /** Patterns this pack exercises, for coverage balancing. */
  patternCoverage: string[];
  /** Reserved for final/calibration assessment; ordinary practice cannot select it. */
  calibrationReserved: boolean;
};

export const mockPacks: MockPack[] = [
  {
    id: "pack.core.dependency-order",
    version: 1,
    title: "Dependency ordering under time",
    category: "core_algorithm",
    durationMinutes: 45,
    problemIds: ["iv.graph.service-init-order"],
    followUpIds: ["fu.service-init.witness"],
    patternCoverage: ["graphs_paths"],
    calibrationReserved: false
  },
  {
    id: "pack.core.load-window",
    version: 1,
    title: "Monitoring window under a load cap",
    category: "core_algorithm",
    durationMinutes: 45,
    problemIds: ["iv.sliding.longest-window-under-budget"],
    followUpIds: ["fu.sliding.negatives"],
    patternCoverage: ["two_pointers_sliding_window"],
    calibrationReserved: false
  },
  {
    id: "pack.ds.top-k-stream",
    version: 1,
    title: "Streaming top-k design",
    category: "ds_implementation",
    durationMinutes: 50,
    problemIds: ["iv.heap.top-k-hot-keys"],
    followUpIds: ["fu.top-k.updates"],
    patternCoverage: ["heaps_topk_streaming"],
    calibrationReserved: false
  },
  {
    id: "pack.core.maintenance-peak",
    version: 1,
    title: "Peak maintenance concurrency (calibration)",
    category: "core_algorithm",
    durationMinutes: 45,
    problemIds: ["iv.intervals.max-concurrent-maintenance"],
    followUpIds: ["fu.intervals.witness"],
    patternCoverage: ["intervals_sweepline"],
    calibrationReserved: true
  },
  {
    id: "pack.core.threshold-rate",
    version: 1,
    title: "Tune a rate to meet a deadline",
    category: "core_algorithm",
    durationMinutes: 45,
    problemIds: ["iv.bsearch.min-rate-before-deadline"],
    followUpIds: ["fu.min-rate.stricter-target"],
    patternCoverage: ["binary_search"],
    calibrationReserved: false
  },
  {
    id: "pack.core.k-closest-stream",
    version: 1,
    title: "Closest signals under load",
    category: "core_algorithm",
    durationMinutes: 45,
    problemIds: ["iv.heap.k-closest-points"],
    followUpIds: ["fu.k-closest.stream"],
    patternCoverage: ["heaps_topk_streaming"],
    calibrationReserved: false
  },
  {
    id: "pack.core.tree-aggregate",
    version: 1,
    title: "Aggregate over a tree",
    category: "core_algorithm",
    durationMinutes: 45,
    problemIds: ["iv.tree.diameter"],
    followUpIds: ["fu.tree-diameter.return-witness"],
    patternCoverage: ["trees_bst"],
    calibrationReserved: false
  },
  {
    id: "pack.core.cheapest-route",
    version: 1,
    title: "Cheapest route across links",
    category: "core_algorithm",
    durationMinutes: 50,
    problemIds: ["iv.graph.cheapest-route"],
    followUpIds: ["fu.cheapest-route.compare-approaches"],
    patternCoverage: ["graphs_paths"],
    calibrationReserved: false
  },
  {
    id: "pack.core.coin-planning",
    version: 1,
    title: "Plan the fewest units",
    category: "core_algorithm",
    durationMinutes: 45,
    problemIds: ["iv.dp.fewest-coins"],
    followUpIds: ["fu.fewest-coins.return-witness"],
    patternCoverage: ["dp_backtracking"],
    calibrationReserved: false
  },
  {
    id: "pack.ds.lru-cache",
    version: 1,
    title: "Bounded LRU cache design",
    category: "ds_implementation",
    durationMinutes: 50,
    problemIds: ["iv.cache.lru-design"],
    followUpIds: ["fu.lru.thread-safety"],
    patternCoverage: ["linked_cache"],
    calibrationReserved: false
  },
  {
    id: "pack.cpp.iterator-invalidation",
    version: 1,
    title: "Debug an iterator-invalidation crash",
    category: "cpp_debugging",
    durationMinutes: 45,
    problemIds: ["iv.cpp.iterator-invalidation"],
    followUpIds: ["fu.iterator-invalidation.make-reusable"],
    patternCoverage: ["cpp_implementation"],
    calibrationReserved: false
  },
  {
    id: "pack.cpp.ownership-lifetime",
    version: 1,
    title: "Fix ownership and lifetime bugs",
    category: "cpp_debugging",
    durationMinutes: 50,
    problemIds: ["iv.cpp.dangling-reference", "iv.cpp.missing-virtual-destructor"],
    followUpIds: ["fu.dangling-reference.make-reusable", "fu.missing-virtual-destructor.make-reusable"],
    patternCoverage: ["cpp_implementation"],
    calibrationReserved: false
  }
];

const followUpIds = new Set(followUps.map((f) => f.id));

/** Packs ordinary practice may select (excludes the reserved calibration pool). */
export function getPracticeMockPacks(): MockPack[] {
  return mockPacks.filter((pack) => !pack.calibrationReserved);
}

/** The reserved calibration pool used only for final assessment. */
export function getCalibrationMockPacks(): MockPack[] {
  return mockPacks.filter((pack) => pack.calibrationReserved);
}

export function getMockPack(id: string): MockPack | null {
  return mockPacks.find((pack) => pack.id === id) ?? null;
}

/** Whether a pack only references existing problems and follow-ups. */
export function mockPackReferencesAreValid(pack: MockPack): boolean {
  const problemsOk = pack.problemIds.length > 0 && pack.problemIds.every((id) => getInterviewProblem(id) !== null);
  const followUpsOk = pack.followUpIds.length > 0 && pack.followUpIds.every((id) => followUpIds.has(id));
  return problemsOk && followUpsOk;
}
