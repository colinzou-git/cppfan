// Pure placement results builder (#125). Maps graded per-item outcomes onto the
// placement modules to produce per-module suggestions. DB-independent and
// deterministic so it is unit-testable and reused on the server. Only answered
// items count toward a module total; an unanswered module defaults to start_here
// (the safe, non-locking default in classifyPlacement).
import { getPlacementModules } from "./placement-seed";
import { summarizeModule, type PlacementModuleResult } from "./placement-scoring";

/** Build per-module placement results from a map of itemId -> graded correctness. */
export function buildPlacementResults(
  gradedByItem: Record<string, boolean | undefined>
): PlacementModuleResult[] {
  return getPlacementModules().map((module) => {
    let correct = 0;
    let total = 0;
    for (const itemId of module.item_ids) {
      const graded = gradedByItem[itemId];
      if (graded === undefined) {
        continue;
      }
      total += 1;
      if (graded) {
        correct += 1;
      }
    }
    return summarizeModule(module, correct, total);
  });
}

/** Look up which placement module a given item belongs to (first match). */
export function moduleIdForItem(itemId: string): string | null {
  for (const module of getPlacementModules()) {
    if (module.item_ids.includes(itemId)) {
      return module.module_id;
    }
  }
  return null;
}
