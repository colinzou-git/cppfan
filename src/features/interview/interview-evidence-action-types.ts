// Result type for the interview-evidence action. Kept out of the "use server"
// action module so the client form can import it without pulling server code.
export type EvidenceActionResult = { status: "ok" | "signed_out" | "error" };
