import "server-only";

import { cookies } from "next/headers";
import {
  AI_PROVIDER_DEFAULT_MODELS,
  defaultModelForPersonalProvider,
  isPersonalAiProvider,
  isUserAiProviderPreference,
  type PersonalAiProvider,
  type UserAiProviderPreference
} from "./ai-provider-options";

const PROVIDER_NAME = "cppfan_ai_provider";
const MODEL_NAME = "cppfan_ai_model";
const CREDENTIAL_NAME = "cppfan_ai_credential";
const ONE_YEAR = 60 * 60 * 24 * 365;

export type AiProviderPreferenceView = {
  provider: UserAiProviderPreference;
  model: string;
  hasCredential: boolean;
  credentialSuffix: string | null;
};

export type AiProviderPreferenceOverride = {
  provider: PersonalAiProvider;
  model: string;
  credential: string | null;
  credentialSource: "user";
};

function options() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR
  };
}

function modelFor(provider: UserAiProviderPreference, model: string | null | undefined) {
  const trimmed = (model ?? "").trim().slice(0, 160);
  if (provider === "app_default") return "";
  return trimmed || defaultModelForPersonalProvider(provider);
}

function suffix(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  return trimmed.slice(Math.max(0, trimmed.length - 4));
}

async function readPreference() {
  const store = await cookies();
  const providerRaw = store.get(PROVIDER_NAME)?.value ?? "app_default";
  const provider = isUserAiProviderPreference(providerRaw) ? providerRaw : "app_default";
  const model = modelFor(provider, store.get(MODEL_NAME)?.value);
  const credential = store.get(CREDENTIAL_NAME)?.value?.trim() || null;
  return { provider, model, credential };
}

export async function getAiProviderPreferenceView(): Promise<AiProviderPreferenceView> {
  const preference = await readPreference();
  return {
    provider: preference.provider,
    model: preference.model,
    hasCredential: Boolean(preference.credential),
    credentialSuffix: suffix(preference.credential)
  };
}

export async function getAiProviderPreferenceOverride(): Promise<AiProviderPreferenceOverride | null> {
  const preference = await readPreference();
  if (!isPersonalAiProvider(preference.provider)) return null;
  return {
    provider: preference.provider,
    model: preference.model || AI_PROVIDER_DEFAULT_MODELS[preference.provider],
    credential: preference.credential,
    credentialSource: "user"
  };
}

export async function saveAiProviderPreference({
  provider,
  model,
  credential
}: {
  provider: UserAiProviderPreference;
  model?: string | null;
  credential?: string | null;
}) {
  const store = await cookies();
  const cookieOptions = options();

  if (provider === "app_default") {
    store.set(PROVIDER_NAME, provider, cookieOptions);
    store.delete(MODEL_NAME);
    store.delete(CREDENTIAL_NAME);
    return;
  }

  store.set(PROVIDER_NAME, provider, cookieOptions);
  store.set(MODEL_NAME, modelFor(provider, model), cookieOptions);
  const nextCredential = credential?.trim();
  if (nextCredential) {
    store.set(CREDENTIAL_NAME, nextCredential, cookieOptions);
  }
}

export async function clearAiProviderCredential() {
  const store = await cookies();
  store.delete(CREDENTIAL_NAME);
}
