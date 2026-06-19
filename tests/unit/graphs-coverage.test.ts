import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import { graphTraceFixtures } from "@/features/learning-items/graph-fixtures";
import {
  getLearningItemById,
  learningItemChoices,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { capstoneProjects, capstoneTracks } from "@/features/labs/capstone-tracks";
import { projectLabs } from "@/features/labs/project-labs";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const REQUIRED_SKILLS = [
  "dsa.graphs.representation",
  "dsa.graphs.bfs",
  "dsa.graphs.dfs",
  "dsa.graphs.shortest_path",
  "dsa.graphs.connected_components",
  "dsa.graphs.cycle_detection",
  "dsa.graphs.topological_sort",
  "dsa.graphs.shortest_path_algorithms",
  "dsa.graphs.mst",
  "dsa.graphs.bipartite_scc",
  "dsa.graphs.connectivity_patterns"
];

const REQUIRED_ITEMS = [
  "dsa.graphs.connected_components.code_grid_trace",
  "dsa.graphs.bfs.code_parent_trace",
  "dsa.graphs.shortest_path_algorithms.mc_select_conditions",
  "dsa.graphs.shortest_path_algorithms.code_floyd_trace",
  "dsa.graphs.mst.code_kruskal_trace",
  "dsa.graphs.bipartite_scc.code_color_trace",
  "dsa.graphs.connectivity_patterns.lesson",
  "dsa.graphs.connectivity_patterns.mc_offline_deletions"
];

const REQUIRED_RESOURCES = [
  "cses-graph-algorithms",
  "usaco-guide-graph-traversal",
  "usaco-guide-unweighted-shortest-paths",
  "cp-algorithms-bfs",
  "cp-algorithms-dijkstra",
  "cp-algorithms-bellman-ford",
  "cp-algorithms-floyd-warshall",
  "cp-algorithms-kruskal-dsu",
  "cp-algorithms-strongly-connected-components",
  "cp-algorithms-bridges"
];

describe("graph structure/shortest-path/connectivity completion coverage (#115)", () => {
  it("keeps the original #75 phases represented as active skills and items", () => {
    const activeSkillIds = new Set(skillSeed.filter((skill) => skill.is_active).map((skill) => skill.id));

    for (const skillId of REQUIRED_SKILLS) {
      expect(activeSkillIds.has(skillId), `${skillId} should be active`).toBe(true);
      const itemCount = learningItemSkills.filter((mapping) => mapping.skill_id === skillId).length;
      expect(itemCount, `${skillId} should have multiple learning items`).toBeGreaterThanOrEqual(2);
    }

    for (const itemId of REQUIRED_ITEMS) {
      expect(getLearningItemById(itemId), `${itemId} should exist`).not.toBeNull();
    }
  });

  it("uses shared graph fixtures with text alternatives for trace prompts", () => {
    expect(graphTraceFixtures.messageRoute.expectedPath).toEqual(["0", "1", "3", "4"]);
    expect(graphTraceFixtures.weightedRoads.mstTotal).toBe(4);

    const bfsTrace = learningItems.find((item) => item.id === "dsa.graphs.bfs.code_parent_trace");
    const mstTrace = learningItems.find((item) => item.id === "dsa.graphs.mst.code_kruskal_trace");
    const gridTrace = learningItems.find((item) => item.id === "dsa.graphs.connected_components.code_grid_trace");

    expect(bfsTrace?.prompt).toContain(graphTraceFixtures.messageRoute.textDescription);
    expect(bfsTrace?.explanation).toMatch(/0 -> 1 -> 3 -> 4/);
    expect(mstTrace?.prompt).toContain(graphTraceFixtures.weightedRoads.textDescription);
    expect(mstTrace?.explanation).toMatch(/total weight 4/);
    expect(gridTrace?.prompt).toMatch(/Text equivalent: open cells/i);
  });

  it("states shortest-path and connectivity preconditions in gradeable items", () => {
    const shortestChoices = learningItemChoices.filter(
      (choice) => choice.learning_item_id === "dsa.graphs.shortest_path_algorithms.mc_select_conditions"
    );
    const connectivityChoices = learningItemChoices.filter(
      (choice) => choice.learning_item_id === "dsa.graphs.connectivity_patterns.mc_offline_deletions"
    );

    expect(shortestChoices.filter((choice) => choice.is_correct).map((choice) => choice.content)).toEqual([
      "Bellman-Ford, O(V*E)"
    ]);
    expect(connectivityChoices.filter((choice) => choice.is_correct).map((choice) => choice.content)).toEqual([
      "Process queries in reverse so deletions become DSU unions"
    ]);

    const floyd = learningItems.find((item) => item.id === "dsa.graphs.shortest_path_algorithms.code_floyd_trace");
    const offline = learningItems.find((item) => item.id === "dsa.graphs.connectivity_patterns.lesson");
    expect(floyd?.explanation).toMatch(/small all-pairs|O\(V\^3\)|negative cycles/i);
    expect(offline?.prompt).toMatch(/OFFLINE|bridge|articulation|O\(V\+E\)/);
  });

  it("registers graph resources, a maze lab, and a BFS exercise package", () => {
    const resourceIds = new Set(
      externalResources.filter((resource) => resource.tags.includes("dsa")).map((resource) => resource.id)
    );
    for (const id of REQUIRED_RESOURCES) {
      expect(resourceIds.has(id), `${id} should be registered`).toBe(true);
    }

    expect(projectLabs.find((lab) => lab.id === "maze-route-planner")?.focus).toContain("BFS");
    expect(capstoneTracks.find((track) => track.id === "dsa_graphs")?.projectIds).toContain("maze-route-planner");

    const project = capstoneProjects.find((entry) => entry.id === "maze-route-planner");
    expect(project?.milestones.some((milestone) => milestone.exerciseId === "graph-maze-shortest-path")).toBe(true);

    const exercise = exerciseCatalog.find((entry) => entry.id === "graph-maze-shortest-path");
    expect(exercise?.skillIds).toEqual([
      "dsa.graphs.bfs",
      "dsa.graphs.connected_components",
      "dsa.graphs.shortest_path"
    ]);
    expect(existsSync(join(process.cwd(), "exercises", "graph-maze-shortest-path", "tests", "tests.cpp"))).toBe(true);
  });

  it("keeps compile-checked examples for the missing graph algorithm families", () => {
    for (const id of ["bellman-ford-floyd-warshall", "kruskal-mst-total", "bipartite-coloring-check"]) {
      expect(existsSync(join(process.cwd(), "curriculum-examples", id, "example.cpp")), id).toBe(true);
    }
  });
});
