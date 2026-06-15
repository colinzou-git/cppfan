// Result type for the rubric self-review action. Kept out of the "use server"
// action module so the client component can import it without pulling server code.
export type RubricActionResult = { status: "ok" | "signed_out" | "error" };
