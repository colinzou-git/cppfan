import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

export async function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies directly.
          // Middleware or route handlers can refresh sessions when needed.
        }
      }
    }
  });
}
