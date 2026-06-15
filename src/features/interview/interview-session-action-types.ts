// Result type for the interview-session action. Kept out of the "use server"
// action module so the client runner can import it without pulling server code.
export type InterviewSessionActionResult = { status: "ok" | "signed_out" | "error" };
