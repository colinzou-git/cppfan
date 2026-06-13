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
