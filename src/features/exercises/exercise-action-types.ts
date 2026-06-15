// Result type for the exercise actions. Kept out of the "use server" action
// module (which may only export async functions) so the client component can
// import it without pulling server code.
export type ExerciseActionResult = { status: "ok" | "signed_out" | "error" };
