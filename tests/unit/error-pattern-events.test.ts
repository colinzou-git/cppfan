import { describe, expect, it } from "vitest";
import { decideErrorPatternEvents } from "@/features/remediation/error-pattern-events";
import { OBSERVE_THRESHOLD } from "@/features/remediation/error-tags";

// Deterministic observe/clear rules for error-pattern evidence (#126).
const TAG = "cpp.references.copy_vs_alias";
const OTHER = "dsa.complexity.loop_cost";

describe("decideErrorPatternEvents (#126)", () => {
  it("observes a tag that reaches the threshold and is not already observed", () => {
    const decision = decideErrorPatternEvents({ wrongByTag: { [TAG]: OBSERVE_THRESHOLD }, observedTags: [] });
    expect(decision.observe).toEqual([TAG]);
    expect(decision.clear).toEqual([]);
  });

  it("does not re-observe a tag already in the observed state", () => {
    const decision = decideErrorPatternEvents({
      wrongByTag: { [TAG]: OBSERVE_THRESHOLD + 1 },
      observedTags: [TAG]
    });
    expect(decision.observe).toEqual([]);
    expect(decision.clear).toEqual([]);
  });

  it("clears a previously-observed tag once its recent wrong count drops below threshold", () => {
    const decision = decideErrorPatternEvents({ wrongByTag: { [TAG]: 0 }, observedTags: [TAG] });
    expect(decision.clear).toEqual([TAG]);
    expect(decision.observe).toEqual([]);
  });

  it("does not observe below the threshold", () => {
    const decision = decideErrorPatternEvents({ wrongByTag: { [TAG]: OBSERVE_THRESHOLD - 1 }, observedTags: [] });
    expect(decision.observe).toEqual([]);
  });

  it("handles observe and clear together for different tags", () => {
    const decision = decideErrorPatternEvents({
      wrongByTag: { [OTHER]: OBSERVE_THRESHOLD },
      observedTags: [TAG]
    });
    expect(decision.observe).toEqual([OTHER]);
    expect(decision.clear).toEqual([TAG]);
  });
});
