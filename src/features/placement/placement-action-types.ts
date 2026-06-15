// Result types for the placement actions. Kept out of the "use server" action
// module (which may only export async functions) so the client component can
// import them without pulling server code.
import type { PlacementModuleResult } from "./placement-scoring";

export type PlacementSubmitResult =
  | { status: "ok"; results: PlacementModuleResult[]; persisted: boolean }
  | { status: "invalid" }
  | { status: "error" };

export type PlacementResetResult = { status: "ok" } | { status: "error" };
