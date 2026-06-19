import type { BrowserContext } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const PASSWORD = "Test-Password-123!";

type CookieToSet = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date | string | number;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
  };
};

type AuthEnv = {
  anonKey: string;
  serviceKey: string;
  url: string;
};

type CreateAuthenticatedLearnerOptions = {
  completeOnboarding?: boolean;
};

function maybeLocalAuthEnv(): AuthEnv | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!url || !anonKey || !serviceKey) {
    return null;
  }

  const parsed = new URL(url);
  const isLocal = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  if (!isLocal) {
    throw new Error("Authenticated E2E tests require a local Supabase URL.");
  }

  return { anonKey, serviceKey, url };
}

export function hasAuthenticatedE2EEnv() {
  return maybeLocalAuthEnv() !== null;
}

function normalizeSameSite(value: NonNullable<CookieToSet["options"]>["sameSite"] | undefined) {
  if (value === "strict") {
    return "Strict" as const;
  }
  if (value === "none") {
    return "None" as const;
  }
  return "Lax" as const;
}

function toExpires(options: CookieToSet["options"]) {
  if (!options) {
    return undefined;
  }

  if (typeof options.maxAge === "number") {
    return Math.floor(Date.now() / 1000) + options.maxAge;
  }

  if (options.expires instanceof Date) {
    return Math.floor(options.expires.getTime() / 1000);
  }

  if (typeof options.expires === "string" || typeof options.expires === "number") {
    const date = new Date(options.expires);
    return Number.isNaN(date.getTime()) ? undefined : Math.floor(date.getTime() / 1000);
  }

  return undefined;
}

function upsertCookie(jar: CookieToSet[], cookie: CookieToSet) {
  const index = jar.findIndex((existing) => existing.name === cookie.name);
  if (index >= 0) {
    jar[index] = cookie;
    return;
  }
  jar.push(cookie);
}

export async function createAuthenticatedLearner(
  context: BrowserContext,
  baseURL: string,
  options: CreateAuthenticatedLearnerOptions = {}
) {
  const env = maybeLocalAuthEnv();
  if (!env) {
    throw new Error("Authenticated E2E Supabase env is missing.");
  }

  const service = createSupabaseClient(env.url, env.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `playwright-${stamp}@example.test`;

  const created = await service.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true
  });
  if (created.error || !created.data.user) {
    throw created.error ?? new Error("Could not create Playwright learner.");
  }

  const userId = created.data.user.id;
  const jar: CookieToSet[] = [];
  const browserLikeClient = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return jar.map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          upsertCookie(jar, cookie);
        }
      }
    }
  });

  const signedIn = await browserLikeClient.auth.signInWithPassword({ email, password: PASSWORD });
  if (signedIn.error) {
    await service.auth.admin.deleteUser(userId).catch(() => undefined);
    throw signedIn.error;
  }

  if (options.completeOnboarding !== false) {
    const profile = await browserLikeClient.from("profiles").upsert(
      {
        id: userId,
        email,
        display_name: "Playwright Learner",
        experience_level: "some_cpp",
        daily_new_skills_goal: 2,
        daily_review_minutes: 15,
        learning_goals: ["cpp_core", "dsa_patterns"],
        preferred_platforms: ["windows_pc"],
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );
    if (profile.error) {
      await service.auth.admin.deleteUser(userId).catch(() => undefined);
      throw profile.error;
    }
  }

  const activeCookies = jar.filter((cookie) => cookie.value && (cookie.options?.maxAge ?? 1) > 0);
  await context.addCookies(
    activeCookies.map((cookie) => {
      const expires = toExpires(cookie.options);
      return {
        name: cookie.name,
        value: cookie.value,
        url: baseURL,
        httpOnly: cookie.options?.httpOnly ?? false,
        secure: cookie.options?.secure ?? false,
        sameSite: normalizeSameSite(cookie.options?.sameSite),
        ...(expires ? { expires } : {})
      };
    })
  );

  return {
    email,
    userId,
    async cleanup() {
      await service.auth.admin.deleteUser(userId).catch(() => undefined);
    }
  };
}
