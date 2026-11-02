import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import {
  getLearningItemById,
  learningItemChoices,
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


const REASONING_ITEM_IDS = [
  "cpp.concurrency.threads.reasoning_join_trace",
  "cpp.concurrency.threads.reasoning_dangling_capture",
  "cpp.concurrency.data_races.reasoning_lost_update",
  "cpp.concurrency.data_races.reasoning_plain_flag",
  "cpp.concurrency.mutexes.reasoning_multi_field_invariant",
  "cpp.concurrency.mutexes.reasoning_manual_unlock",
  "cpp.concurrency.async.reasoning_exception_get",
  "cpp.concurrency.async.reasoning_default_policy",
  "cpp.concurrency.deadlock.reasoning_wait_cycle",
  "cpp.concurrency.deadlock.reasoning_scoped_lock",
  "cpp.concurrency.condition_variables.reasoning_predicate_trace",
  "cpp.concurrency.condition_variables.reasoning_shutdown_notify",
  "cpp.concurrency.atomics.reasoning_compound_check",
  "cpp.concurrency.atomics.reasoning_volatile_stop",
  "cpp.concurrency.jthread.reasoning_stop_trace",
  "cpp.concurrency.jthread.reasoning_blocked_wait",
  "cpp.concurrency.promise_future.reasoning_exception_channel",
  "cpp.concurrency.promise_future.reasoning_get_twice",
  "cpp.concurrency.task_selection.reasoning_io_concurrency",
  "cpp.concurrency.task_selection.reasoning_detached_poller",
  "cpp.concurrency.memory_ordering.reasoning_release_acquire",
  "cpp.concurrency.memory_ordering.reasoning_relaxed_publish",
  "cpp.concurrency.lock_granularity.reasoning_short_critical_section",
  "cpp.concurrency.lock_granularity.reasoning_shared_ref_escape",
  "cpp.concurrency.shared_state_design.reasoning_local_reduce",
  "cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation"
] as const;

const REQUIRED_REASONING_TYPES = ["code_reading", "bug_spotting"] as const;

const REQUIRED_RESOURCES = [
  "cpp-core-guidelines-concurrency",
  "cppreference-condition-variable",
  "cppreference-jthread",
  "cppreference-atomic",
  "clang-thread-sanitizer"
];

describe("concurrency completion/depth coverage (#118/#704)", () => {
  it("keeps the original #78 conceptual scope represented as active skills and items", () => {
    const activeSkillIds = new Set(skillSeed.filter((skill) => skill.is_active).map((skill) => skill.id));

    for (const skillId of REQUIRED_SKILLS) {
      expect(activeSkillIds.has(skillId), `${skillId} should be active`).toBe(true);
      const itemCount = learningItemSkills.filter((mapping) => mapping.skill_id === skillId).length;
      expect(itemCount, `${skillId} should have lesson and quiz coverage`).toBeGreaterThanOrEqual(2);
    }
  });


  it("keeps deterministic reasoning depth on every concurrency skill (#704)", () => {
    expect(new Set(REASONING_ITEM_IDS).size).toBe(26);

    for (const skillId of REQUIRED_SKILLS) {
      const mappings = learningItemSkills.filter((mapping) => mapping.skill_id === skillId);
      expect(mappings.length, `${skillId} should have lesson, retrieval, and reasoning depth`).toBeGreaterThanOrEqual(4);

      const types = mappings
        .map((mapping) => getLearningItemById(mapping.learning_item_id)?.item.type)
        .filter(Boolean);
      for (const type of REQUIRED_REASONING_TYPES) {
        expect(types, `${skillId} should include ${type}`).toContain(type);
      }
    }

    for (const itemId of REASONING_ITEM_IDS) {
      const details = getLearningItemById(itemId);
      expect(details, itemId).toBeTruthy();
      expect(["code_reading", "bug_spotting"]).toContain(details!.item.type);
      expect(details!.item.prompt).not.toMatch(/sleep_for|sleep_until/i);

      const choices = learningItemChoices.filter((choice) => choice.learning_item_id === itemId);
      expect(choices, `${itemId} should have four choices`).toHaveLength(4);
      expect(choices.filter((choice) => choice.is_correct), `${itemId} should have one answer`).toHaveLength(1);
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
