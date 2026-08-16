import type { CodePractice } from "./code-practice-types";

export class CodePracticeClientError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "CodePracticeClientError";
  }
}

async function parseError(response: Response): Promise<never> {
  const body = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
  };
  throw new CodePracticeClientError(
    body.error?.message ?? "Saved practices request failed.",
    response.status
  );
}

export async function loadPracticesRequest(
  itemId: string
): Promise<{ status: "ok"; practices: CodePractice[] } | { status: "signed_out" }> {
  const response = await fetch(`/api/code/practices?itemId=${encodeURIComponent(itemId)}`, {
    cache: "no-store"
  });
  if (response.status === 401) return { status: "signed_out" };
  if (!response.ok) return parseError(response);
  const body = (await response.json()) as { practices?: CodePractice[] };
  return { status: "ok", practices: Array.isArray(body.practices) ? body.practices : [] };
}

export async function createPracticeRequest(input: {
  itemId: string;
  name: string;
  source: string;
}): Promise<CodePractice> {
  const response = await fetch("/api/code/practices", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) return parseError(response);
  const body = (await response.json()) as { practice: CodePractice };
  return body.practice;
}

export async function updatePracticeRequest(input: {
  practiceId: string;
  name?: string;
  source?: string;
}): Promise<CodePractice> {
  const response = await fetch("/api/code/practices", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) return parseError(response);
  const body = (await response.json()) as { practice: CodePractice };
  return body.practice;
}

export async function deletePracticeRequest(practiceId: string): Promise<void> {
  const response = await fetch("/api/code/practices", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ practiceId })
  });
  if (!response.ok) return parseError(response);
}
