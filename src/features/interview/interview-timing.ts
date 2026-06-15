// Timing breakdown for the readiness report (#182). Pure and deterministic:
// summarizes how long the learner takes to reach a viable approach and a working
// implementation, from the per-evidence timings captured on interview_evidence
// (#180). Medians (robust to outliers) in minutes; null samples are ignored so a
// missing timing never skews the picture. Never touches FSRS.

export type TimingSample = {
  approachSeconds: number | null;
  implementationSeconds: number | null;
};

export type TimingSummary = {
  /** Median minutes to a viable approach, or null when no approach timing logged. */
  approachMedianMinutes: number | null;
  /** Median minutes to a working implementation, or null when none logged. */
  implementationMedianMinutes: number | null;
  approachSamples: number;
  implementationSamples: number;
};

/** Median of a non-empty number list (deterministic; lower-middle on even counts). */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function medianMinutes(seconds: number[]): number | null {
  if (seconds.length === 0) {
    return null;
  }
  return Math.round((median(seconds) / 60) * 10) / 10;
}

/** Summarize approach/implementation timings; ignores null (unlogged) samples. Pure. */
export function summarizeTiming(samples: TimingSample[]): TimingSummary {
  const approach = samples
    .map((s) => s.approachSeconds)
    .filter((v): v is number => typeof v === "number" && v >= 0);
  const implementation = samples
    .map((s) => s.implementationSeconds)
    .filter((v): v is number => typeof v === "number" && v >= 0);
  return {
    approachMedianMinutes: medianMinutes(approach),
    implementationMedianMinutes: medianMinutes(implementation),
    approachSamples: approach.length,
    implementationSamples: implementation.length
  };
}
