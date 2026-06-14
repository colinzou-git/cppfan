import { describe, expect, it } from "vitest";
import {
  capstoneProjects,
  capstoneTracks,
  getCapstoneMilestones,
  getCapstoneProject,
  getCapstoneTracks,
  type MilestoneVerification
} from "@/features/labs/capstone-tracks";
import { projectLabs } from "@/features/labs/project-labs";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const labIds = new Set(projectLabs.map((lab) => lab.id));
const skillIds = new Set(skillSeed.map((skill) => skill.id));
const exerciseIds = new Set(exerciseCatalog.map((ex) => ex.id));
const VERIFICATIONS = new Set<MilestoneVerification>(["manual_checklist", "exercise_tests", "reflection"]);

describe("capstone tracks integrity (#129)", () => {
  it("has at least three tracks with unique ids and order", () => {
    expect(capstoneTracks.length).toBeGreaterThanOrEqual(3);
    expect(new Set(capstoneTracks.map((t) => t.id)).size).toBe(capstoneTracks.length);
    expect(new Set(capstoneTracks.map((t) => t.order_index)).size).toBe(capstoneTracks.length);
  });

  it("references only existing project labs and preserves every current lab", () => {
    const referenced = new Set<string>();
    for (const track of capstoneTracks) {
      expect(new Set(track.projectIds).size).toBe(track.projectIds.length);
      for (const id of track.projectIds) {
        expect(labIds.has(id), `track ${track.id} references missing lab ${id}`).toBe(true);
        referenced.add(id);
      }
    }
    // Every current lab must be organized into a track (no lab dropped).
    for (const lab of projectLabs) {
      expect(referenced.has(lab.id), `lab ${lab.id} is not in any track`).toBe(true);
    }
  });
});

describe("capstone milestones integrity (#129)", () => {
  it("each structured project reuses a real lab and a known track", () => {
    const trackIds = new Set(capstoneTracks.map((t) => t.id));
    for (const project of capstoneProjects) {
      expect(labIds.has(project.id), `project ${project.id} is not a real lab`).toBe(true);
      expect(trackIds.has(project.trackId), `project ${project.id} bad track`).toBe(true);
      for (const skill of project.prerequisiteSkillIds) {
        expect(skillIds.has(skill), `${project.id} prereq ${skill}`).toBe(true);
      }
    }
  });

  it("milestones have unique ids and valid, complete metadata", () => {
    const allIds = getCapstoneMilestones().map((m) => m.id);
    expect(new Set(allIds).size).toBe(allIds.length);

    for (const project of capstoneProjects) {
      for (const m of project.milestones) {
        expect(m.id.startsWith(`${project.id}.`), `${m.id} id convention`).toBe(true);
        expect(typeof m.required).toBe("boolean");
        expect(m.estimatedMinutes).toBeGreaterThan(0);
        expect(VERIFICATIONS.has(m.verification), `${m.id} verification`).toBe(true);
        expect(m.practicedSkillIds.length).toBeGreaterThan(0);
        for (const skill of m.practicedSkillIds) {
          expect(skillIds.has(skill), `${m.id} practiced ${skill}`).toBe(true);
        }
        expect(typeof m.reflectionPrompt).toBe("string");
        if (m.exerciseId) {
          expect(exerciseIds.has(m.exerciseId), `${m.id} exercise ${m.exerciseId}`).toBe(true);
        }
      }
    }
  });

  it("at least two projects have five or more sequenced milestones", () => {
    const withFive = capstoneProjects.filter((p) => p.milestones.length >= 5);
    expect(withFive.length).toBeGreaterThanOrEqual(2);
  });

  it("integrates a beginner and a DSA project with #81 exercise packages", () => {
    const linkedExercises = new Set(
      getCapstoneMilestones()
        .map((m) => m.exerciseId)
        .filter((id): id is string => Boolean(id))
    );
    expect(linkedExercises.has("raii-scoped-array")).toBe(true); // note-manager (beginner)
    expect(linkedExercises.has("dsa-two-sum-sorted")).toBe(true); // csv-table-summarizer (DSA)
  });
});

describe("capstone accessors (#129)", () => {
  it("returns tracks in display order", () => {
    const orders = getCapstoneTracks().map((t) => t.order_index);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("resolves a project by id", () => {
    expect(getCapstoneProject("note-manager")?.milestones.length).toBeGreaterThanOrEqual(5);
    expect(getCapstoneProject("does-not-exist")).toBeNull();
  });
});
