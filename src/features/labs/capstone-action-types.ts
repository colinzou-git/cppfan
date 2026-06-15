// Result type for the capstone milestone action. Kept out of the "use server"
// action module (which may only export async functions) so the client component
// can import it without pulling server code.
export type CapstoneActionResult = { status: "ok" | "signed_out" | "error" };
