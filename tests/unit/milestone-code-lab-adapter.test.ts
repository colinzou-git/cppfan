import { describe, expect, it } from "vitest";
import {
  canRunMilestoneInApp,
  getMilestoneExecutionLabel,
  milestoneToCodeLabConfig
} from "@/features/labs/milestone-code-lab-adapter";
import { getCapstoneMilestone } from "@/features/labs/capstone-tracks";

const inApp = getCapstoneMilestone("csv-table-summarizer.m1")!;
const manual = getCapstoneMilestone("csv-table-summarizer.m2")!;

describe("milestone code-lab adapter", () => {
  it("resolves the Code Lab config for an in-app milestone", () => {
    expect(inApp.executionMode).toBe("in_app_code_lab");
    expect(milestoneToCodeLabConfig(inApp)?.language).toBe("cpp");
    expect(canRunMilestoneInApp(inApp)).toBe(true);
  });

  it("returns no config for a non-code milestone", () => {
    expect(milestoneToCodeLabConfig(manual)).toBeNull();
    expect(canRunMilestoneInApp(manual)).toBe(false);
  });

  it("labels the execution mode", () => {
    expect(getMilestoneExecutionLabel(inApp)).toMatch(/in-app code lab/i);
    expect(getMilestoneExecutionLabel(manual)).toMatch(/manual|external/i);
  });
});
