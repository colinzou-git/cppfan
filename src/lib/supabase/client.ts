"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
