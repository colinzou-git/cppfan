// Result type for the diagnostic save action. Kept out of the "use server" action
// module so the client form can import it without pulling server code.
export type DiagnosticActionResult = { status: "ok" | "signed_out" | "error" };
