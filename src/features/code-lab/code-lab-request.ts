import { CODE_LAB_LIMITS } from "./code-lab-types";
import { getCodeLabConfigForItem } from "./code-lab-catalog";

/**
 * Shared request validation for the Code Lab API routes (#407). Enforces the
 * boundary limits (source/stdin size) and that the item is actually code-capable
 * before any runner/AI work happens.
 */

export type ParsedCodeRequest =
  | { ok: true; itemId: string; source: string; stdin: string; userQuestion?: string }
  | { ok: false; code: string; message: string };

export function parseBodyRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function validateCodeRequest(body: Record<string, unknown>): ParsedCodeRequest {
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId || itemId.length > 240) {
    return { ok: false, code: "invalid_item", message: "A valid item id is required." };
  }
  if (!getCodeLabConfigForItem(itemId)) {
    return { ok: false, code: "not_code_capable", message: "This item does not have a Code Lab." };
  }

  const source = typeof body.source === "string" ? body.source : "";
  if (!source.trim()) {
    return { ok: false, code: "empty_source", message: "Write some code before running." };
  }
  if (source.length > CODE_LAB_LIMITS.maxSourceChars) {
    return {
      ok: false,
      code: "source_too_large",
      message: `Code must be under ${CODE_LAB_LIMITS.maxSourceChars.toLocaleString()} characters.`
    };
  }

  const stdin = typeof body.stdin === "string" ? body.stdin : "";
  if (stdin.length > CODE_LAB_LIMITS.maxStdinChars) {
    return {
      ok: false,
      code: "stdin_too_large",
      message: `Input must be under ${CODE_LAB_LIMITS.maxStdinChars.toLocaleString()} characters.`
    };
  }

  const userQuestion =
    typeof body.userQuestion === "string" ? body.userQuestion.slice(0, 1_000) : undefined;

  return { ok: true, itemId, source, stdin, userQuestion };
}

export type ParsedDraftRequest =
  | { ok: true; itemId: string; source: string }
  | { ok: false; code: string; message: string };

/**
 * Validate an autosave draft write (#431). Unlike a run, an empty draft is
 * allowed (the learner may clear the editor), but the item must be code-capable
 * and the source within the same size bound as a run.
 */
export function validateDraftRequest(body: Record<string, unknown>): ParsedDraftRequest {
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId || itemId.length > 240) {
    return { ok: false, code: "invalid_item", message: "A valid item id is required." };
  }
  if (!getCodeLabConfigForItem(itemId)) {
    return { ok: false, code: "not_code_capable", message: "This item does not have a Code Lab." };
  }

  const source = typeof body.source === "string" ? body.source : "";
  if (source.length > CODE_LAB_LIMITS.maxSourceChars) {
    return {
      ok: false,
      code: "source_too_large",
      message: `Code must be under ${CODE_LAB_LIMITS.maxSourceChars.toLocaleString()} characters.`
    };
  }

  return { ok: true, itemId, source };
}

/** Validate the item id on a draft load (GET ?itemId=). */
export function validateDraftItemId(itemId: string | null): ParsedDraftRequest {
  const trimmed = typeof itemId === "string" ? itemId.trim() : "";
  if (!trimmed || trimmed.length > 240) {
    return { ok: false, code: "invalid_item", message: "A valid item id is required." };
  }
  if (!getCodeLabConfigForItem(trimmed)) {
    return { ok: false, code: "not_code_capable", message: "This item does not have a Code Lab." };
  }
  return { ok: true, itemId: trimmed, source: "" };
}
