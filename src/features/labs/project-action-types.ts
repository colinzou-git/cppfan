// Result type for the project completion action (#439). Kept out of the
// "use server" action module (which may only export async functions) so the
// client card can import it without pulling server code.
export type ProjectActionResult = {
  status: "ok" | "signed_out" | "unavailable" | "invalid_project" | "error";
};
