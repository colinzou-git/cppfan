import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import {
  getLearningItemById,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { capstoneProjects, capstoneTracks } from "@/features/labs/capstone-tracks";
import { projectLabs } from "@/features/labs/project-labs";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const REQUIRED_SKILLS = [
  "cpp.concurrency.threads",
  "cpp.concurrency.data_races",
  "cpp.concurrency.mutexes",
  "cpp.concurrency.async",
  "cpp.concurrency.deadlock",
  "cpp.concurrency.condition_variables",
  "cpp.concurrency.atomics",
  "cpp.concurrency.jthread",
  "cpp.concurrency.promise_future",
  "cpp.concurrency.task_selection",
  "cpp.concurrency.memory_ordering",
  "cpp.concurrency.lock_granularity",
  "cpp.concurrency.shared_state_design"
];

const REQUIRED_RESOURCES = [
  "cpp-core-guidelines-concurrency",
  "cppreference-condition-variable",
  "cppreference-jthread",
  "cppreference-atomic",
  "clang-thread-sanitizer"
];

describe("concurrency completion coverage (#118)", () => {
  it("keeps the original #78 conceptual scope represented as active skills and items", () => {
    const activeSkillIds = new Set(skillSeed.filter((skill) => skill.is_active).map((skill) => skill.id));

    for (const skillId of REQUIRED_SKILLS) {
      expect(activeSkillIds.has(skillId), `${skillId} should be active`).toBe(true);
      const itemCount = learningItemSkills.filter((mapping) => mapping.skill_id === skillId).length;
      expect(itemCount, `${skillId} should have lesson and quiz coverage`).toBeGreaterThanOrEqual(2);
    }
  });

  it("covers deterministic synchronization, communication, atomics, and task-selection reasoning", () => {
    const condition = getLearningItemById("cpp.concurrency.condition_variables.lesson")?.item;
    const deadlock = getLearningItemById("cpp.concurrency.deadlock.lesson")?.item;
    const atomics = getLearningItemById("cpp.concurrency.atomics.lesson")?.item;
    const memory = getLearningItemById("cpp.concurrency.memory_ordering.lesson")?.item;
    const shared = getLearningItemById("cpp.concurrency.shared_state_design.lesson")?.item;
    const task = getLearningItemById("cpp.concurrency.task_selection.lesson")?.item;

    expect(condition?.prompt).toMatch(/predicate|spurious/i);
    expect(deadlock?.prompt).toMatch(/consistent order|scoped_lock|deadlock/i);
    expect(atomics?.prompt).toMatch(/volatile.*not synchronization|higher-level/i);
    expect(memory?.prompt).toMatch(/release|acquire|relaxed|seq_cst/i);
    expect(shared?.prompt).toMatch(/immutable|message passing|minimize shared/i);
    expect(task?.prompt).toMatch(/concurrency|parallelism|task/i);
  });

  it("registers a deterministic producer-consumer exercise and lab", () => {
    const exercise = exerciseCatalog.find((entry) => entry.id === "concurrency-task-queue");
    expect(exercise?.projectLab).toBe("task-queue-lab");
    expect(exercise?.skillIds).toEqual([
      "cpp.concurrency.threads",
      "cpp.concurrency.mutexes",
      "cpp.concurrency.condition_variables",
      "cpp.concurrency.deadlock",
      "cpp.concurrency.shared_state_design"
    ]);
    expect(exercise?.requiredTests).toEqual([
      "test_fifo_single_thread",
      "test_close_rejects_new_work_and_drains_existing",
      "test_blocked_consumer_gets_pushed_task_without_sleep",
      "test_multiple_producers_consumers_exactly_once"
    ]);

    const tests = readFileSync(join(process.cwd(), "exercises", "concurrency-task-queue", "tests", "tests.cpp"), "utf8");
    expect(tests).toMatch(/std::promise/);
    expect(tests).toMatch(/join\(\)/);
    expect(tests).toMatch(/exactly_once|all_of/);
    expect(tests).not.toMatch(/sleep_for|sleep_until/);

    expect(existsSync(join(process.cwd(), "exercises", "concurrency-task-queue", "solution", "bounded_task_queue.hpp"))).toBe(
      true
    );
    expect(projectLabs.find((lab) => lab.id === "task-queue-lab")?.focus).toContain("condition variables");
    expect(capstoneTracks.find((track) => track.id === "concurrency_practice")?.projectIds).toContain("task-queue-lab");

    const project = capstoneProjects.find((entry) => entry.id === "task-queue-lab");
    expect(project?.milestones.some((milestone) => milestone.exerciseId === "concurrency-task-queue")).toBe(true);
  });

  it("registers concurrency resources", () => {
    const resourceIds = new Set(
      externalResources.filter((resource) => resource.tags.includes("cpp")).map((resource) => resource.id)
    );
    for (const id of REQUIRED_RESOURCES) {
      expect(resourceIds.has(id), `${id} should be registered`).toBe(true);
    }
  });
});
