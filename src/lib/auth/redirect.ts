export function getSafeNextPath(value: string | null | undefined) {
  if (!value) {
    return "/dashboard";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export function getAuthRedirectUrl(origin: string, nextPath: string) {
  const safeNextPath = getSafeNextPath(nextPath);
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNextPath)}`;
}
