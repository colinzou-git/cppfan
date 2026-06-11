function getTrimmedEnvValue(value: string | undefined) {
  return (value ?? "").trim();
}

function isValidHttpUrl(value: string) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabaseEnv() {
  const publishableKey =
    getTrimmedEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    getTrimmedEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return {
    url: getTrimmedEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey
  };
}

export function isSupabaseConfigured() {
  const { url, publishableKey } = getSupabaseEnv();
  return isValidHttpUrl(url) && Boolean(publishableKey);
}

export function getAppUrl() {
  const appUrl = getTrimmedEnvValue(process.env.NEXT_PUBLIC_APP_URL);
  return isValidHttpUrl(appUrl) ? appUrl : "http://localhost:3000";
}
