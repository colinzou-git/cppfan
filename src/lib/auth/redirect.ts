// Fixed internal base used only to normalize and origin-check a redirect target.
// Any user-supplied `next` that resolves to a different origin is rejected.
const INTERNAL_BASE = "https://internal.invalid";
const FALLBACK_PATH = "/dashboard";

// Raw backslash (normalized to "/" by the URL parser) and percent-encoded
// backslash/slash can be turned into an origin change by URL resolution.
const RAW_BACKSLASH = /\\/;
const ENCODED_SLASHES = /%5c|%2f/i;

// Control characters (<= 0x1f), space (0x20), and DEL (0x7f) have no place in a
// legitimate internal redirect path. Checked by code point to avoid embedding
// control characters in a regex literal.
function hasControlOrSpace(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f) {
      return true;
    }
  }
  return false;
}

/**
 * Return a safe, same-origin, absolute-path redirect target, or "/dashboard".
 *
 * Hardened for #140: the callback resolves the result with `new URL(next, origin)`,
 * where a backslash (raw or encoded) is treated as a path separator and can turn
 * `/\evil.example` into the external origin `evil.example`. So we parse and
 * origin-check rather than trusting string prefixes, reject backslashes /
 * encoded slashes-or-backslashes / control characters / scheme-relative and
 * host forms, and return the normalized pathname+query+hash.
 */
export function getSafeNextPath(value: string | null | undefined): string {
  if (!value) {
    return FALLBACK_PATH;
  }

  // Must be an absolute-path reference (single leading slash), never
  // scheme-relative ("//host") which resolves to an external origin.
  if (!value.startsWith("/") || value.startsWith("//")) {
    return FALLBACK_PATH;
  }

  if (RAW_BACKSLASH.test(value) || ENCODED_SLASHES.test(value) || hasControlOrSpace(value)) {
    return FALLBACK_PATH;
  }

  // Normalize once against a fixed internal origin and require it to stay there.
  let url: URL;
  try {
    url = new URL(value, INTERNAL_BASE);
  } catch {
    return FALLBACK_PATH;
  }
  if (url.origin !== INTERNAL_BASE || url.username || url.password) {
    return FALLBACK_PATH;
  }

  const normalized = `${url.pathname}${url.search}${url.hash}`;
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return FALLBACK_PATH;
  }
  return normalized;
}

export function getAuthRedirectUrl(origin: string, nextPath: string) {
  const safeNextPath = getSafeNextPath(nextPath);
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNextPath)}`;
}
