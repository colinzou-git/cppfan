"use server";

import { redirect } from "next/navigation";
import { getSafeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import { isUserAiProviderPreference } from "@/features/ai-chat/ai-provider-options";
import {
  clearAiProviderCredential,
  saveAiProviderPreference
} from "@/features/ai-chat/provider-preferences";

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function redirectWith(messageKind: "message" | "error", message: string): never {
  redirect(`/settings?${messageKind}=${encodeURIComponent(message)}`);
}

async function requireSignedInSettingsUser() {
  const supabase = await createClient();
  if (!supabase) {
    redirectWith("error", "Sign-in storage is not configured yet.");
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/login?next=${encodeURIComponent("/settings")}`);
  }
}

export async function saveAiProviderSettingsAction(formData: FormData) {
  await requireSignedInSettingsUser();

  const provider = field(formData, "provider");
  if (!isUserAiProviderPreference(provider)) {
    redirectWith("error", "Choose a supported AI provider.");
  }

  const model = field(formData, "model").slice(0, 160);
  const credential = field(formData, "credential");
  const next = getSafeNextPath(field(formData, "next") || "/settings?message=saved");

  await saveAiProviderPreference({
    provider,
    model,
    credential
  });

  redirect(next);
}

export async function clearAiProviderCredentialAction() {
  await requireSignedInSettingsUser();
  await clearAiProviderCredential();
  redirectWith("message", "Personal provider credential cleared.");
}
