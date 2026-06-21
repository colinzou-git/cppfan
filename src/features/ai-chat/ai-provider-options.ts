export type UserAiProviderPreference = "app_default" | "google" | "groq";
export type PersonalAiProvider = Exclude<UserAiProviderPreference, "app_default">;

export const AI_PROVIDER_DEFAULT_MODELS: Record<PersonalAiProvider, string> = {
  google: "gemini-3.5-flash",
  groq: "openai/gpt-oss-120b"
};

export const USER_AI_PROVIDER_OPTIONS: Array<{
  value: UserAiProviderPreference;
  label: string;
  description: string;
}> = [
  {
    value: "app_default",
    label: "cppFan shared provider",
    description: "Use the app-level provider configured by the deployment. No personal API key is required."
  },
  {
    value: "google",
    label: "Google Gemini",
    description: "Use your own Google AI Studio Gemini API key. Good for free-tier experimentation."
  },
  {
    value: "groq",
    label: "Groq",
    description: "Use your own Groq API key with Groq-hosted chat models."
  }
];

export function isUserAiProviderPreference(value: string): value is UserAiProviderPreference {
  return value === "app_default" || value === "google" || value === "groq";
}

export function isPersonalAiProvider(value: string): value is PersonalAiProvider {
  return value === "google" || value === "groq";
}

export function defaultModelForPersonalProvider(provider: PersonalAiProvider): string {
  return AI_PROVIDER_DEFAULT_MODELS[provider];
}
