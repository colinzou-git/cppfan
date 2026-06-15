import { describe, expect, it } from "vitest";
import { buildCapstoneTrackView, nextCapstoneMilestone } from "@/features/labs/capstone-view";
import { capstoneProjects, getCapstoneTracks } from "@/features/labs/capstone-tracks";

// Capstone track view model (#129/#130). Resolves structured projects to their
// project-labs titles and skill prerequisites to readable names, in display order.

describe("buildCapstoneTrackView (#129/#130)", () => {
  const view = buildCapstoneTrackView();

  it("only includes tracks that have at least one structured (milestone) project", () => {
    const structuredTrackIds = new Set(capstoneProjects.map((p) => p.trackId));
    for (const track of view) {
      expect(structuredTrackIds.has(track.id)).toBe(true);
      expect(track.projects.length).toBeGreaterThan(0);
    }
    // A track with no structured projects is omitted.
    const emptyTrack = getCapstoneTracks().find((t) => !structuredTrackIds.has(t.id));
    if (emptyTrack) {
      expect(view.some((t) => t.id === emptyTrack.id)).toBe(false);
    }
  });

  it("resolves project titles and milestone lists", () => {
    const noteManager = view.flatMap((t) => t.projects).find((p) => p.id === "note-manager");
    expect(noteManager).toBeDefined();
    expect(noteManager!.title.length).toBeGreaterThan(0);
    expect(noteManager!.milestones.length).toBe(5);
    expect(noteManager!.milestones[0].id).toBe("note-manager.m1");
  });

  it("resolves prerequisite skill ids to readable titles", () => {
    const noteManager = view.flatMap((t) => t.projects).find((p) => p.id === "note-manager")!;
    expect(noteManager.prerequisiteTitles.length).toBe(noteManager.prerequisiteSkillIds.length);
    expect(noteManager.prerequisiteTitles.length).toBeGreaterThan(0);
    // Titles are resolved (not the raw dotted skill id).
    expect(noteManager.prerequisiteTitles[0]).not.toBe(noteManager.prerequisiteSkillIds[0]);
  });

  it("preserves track display order", () => {
    const orders = view.map((t) => getCapstoneTracks().find((g) => g.id === t.id)!.order_index);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe("nextCapstoneMilestone (#130)", () => {
  const view = buildCapstoneTrackView();

  it("returns the first required milestone when none are completed", () => {
    const next = nextCapstoneMilestone(view, new Set());
    expect(next).not.toBeNull();
    expect(next!.milestoneId).toBe("note-manager.m1");
    expect(next!.projectTitle.length).toBeGreaterThan(0);
  });

  it("advances past completed required milestones", () => {
    const next = nextCapstoneMilestone(view, new Set(["note-manager.m1", "note-manager.m2"]));
    expect(next!.milestoneId).toBe("note-manager.m3");
  });

  it("skips optional milestones (only required are suggested)", () => {
    // note-manager.m5 is optional; completing all required of note-manager moves on.
    const requiredOfNoteManager = ["note-manager.m1", "note-manager.m2", "note-manager.m3", "note-manager.m4"];
    const next = nextCapstoneMilestone(view, new Set(requiredOfNoteManager));
    expect(next!.milestoneId).not.toBe("note-manager.m5");
  });
});
