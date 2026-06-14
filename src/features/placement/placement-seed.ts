// Optional placement assessment definitions (#125, ADR 0005). A short, optional
// assessment assembled from EXISTING learning items (reuse, never duplicate) that
// suggests where a learner should start. Typed seed first, mirrored by an
// idempotent migration in the same seed<->migration lockstep as the curriculum.
// This is suggestion-only: it never locks content or writes durable mastery.

export type PlacementModule = {
  module_id: string;
  title: string;
  order_index: number;
  /** Existing learning_item ids used to gauge familiarity with this module. */
  item_ids: string[];
};

export const placementModules: PlacementModule[] = [
  {
    module_id: "cpp.values_types",
    title: "C++ values and types",
    order_index: 10,
    item_ids: ["cpp.values_types.variables.mc_auto"]
  },
  {
    module_id: "cpp.functions",
    title: "Functions",
    order_index: 20,
    item_ids: ["cpp.functions.basics.mc_scope"]
  },
  {
    module_id: "cpp.references",
    title: "References and pointers",
    order_index: 30,
    item_ids: ["cpp.references.references.mc_init"]
  },
  {
    module_id: "cpp.structs_classes",
    title: "Structs and classes",
    order_index: 40,
    item_ids: ["cpp.structs_classes.syntax.mc_default_access"]
  },
  {
    module_id: "cpp.stl",
    title: "The standard library",
    order_index: 50,
    item_ids: ["cpp.stl.algorithms.mc_sort"]
  },
  {
    module_id: "dsa.complexity",
    title: "Complexity",
    order_index: 60,
    item_ids: ["dsa.complexity.big_o.mc_single_loop"]
  },
  {
    module_id: "dsa.arrays",
    title: "Arrays and DSA foundations",
    order_index: 70,
    item_ids: ["dsa.arrays.indexing.mc_last_index"]
  }
];

/** Placement modules in display order. */
export function getPlacementModules(): PlacementModule[] {
  return [...placementModules].sort((a, b) => a.order_index - b.order_index);
}

/** Every distinct learning item used by the assessment, in module/display order. */
export function getPlacementItemIds(): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const module of getPlacementModules()) {
    for (const id of module.item_ids) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
}
