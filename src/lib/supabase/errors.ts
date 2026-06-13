// Shared Supabase/PostgREST error classification (#146).
//
// Distinguishes a legitimate pre-migration / missing-object state (where a
// labeled seed fallback is acceptable) from a real configured-database failure
// (permission, network, schema, drift) that must NOT silently serve seed data.

// Codes that mean the function/table/relation does not exist yet:
//  - PGRST202 (no matching function), PGRST205 (table not found in schema cache)
//  - 42883 undefined_function, 42P01 undefined_table, 42P17 invalid object def
export const MISSING_OBJECT_CODES = new Set(["PGRST202", "PGRST205", "42883", "42P01", "42P17"]);

export function isMissingObjectError(error: { code?: string | null } | null | undefined): boolean {
  return Boolean(error) && MISSING_OBJECT_CODES.has(error?.code ?? "");
}

/**
 * True when a configured database returned a real failure (permission, network,
 * schema, drift) — i.e. an error that is NOT a legitimate pre-migration
 * missing-object state. Read-only previews may still fall back to labeled seed
 * data, but a configured failure must be observable, never silently swallowed.
 */
export function isConfiguredFailure(error: { code?: string | null } | null | undefined): boolean {
  return Boolean(error) && !isMissingObjectError(error);
}

/** Secret-free structured server log for a configured database failure. */
export function logConfiguredFailure(scope: string, error: { code?: string | null } | null | undefined): void {
  if (isConfiguredFailure(error)) {
    console.error(`[${scope}] configured database read failed (code=${error?.code ?? "none"}); using fallback`);
  }
}
