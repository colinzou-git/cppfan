import Link from "next/link";
import { Bot, ExternalLink, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  defaultModelForPersonalProvider,
  isPersonalAiProvider,
  USER_AI_PROVIDER_OPTIONS
} from "@/features/ai-chat/ai-provider-options";
import type { AiProviderPreferenceView } from "@/features/ai-chat/provider-preferences";
import {
  clearAiProviderCredentialAction,
  saveAiProviderSettingsAction
} from "./ai-provider-actions";

type Props = {
  disabled?: boolean;
  preference: AiProviderPreferenceView;
};

function providerDefaultModel(provider: AiProviderPreferenceView["provider"]) {
  return isPersonalAiProvider(provider) ? defaultModelForPersonalProvider(provider) : "Deployment default";
}

export function AiProviderSettingsForm({ disabled = false, preference }: Props) {
  return (
    <Card className="border-white/70 bg-white/85 shadow-xl backdrop-blur">
      <CardHeader>
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700">
          <Bot className="h-6 w-6" />
        </div>
        <CardTitle>AI provider</CardTitle>
        <CardDescription>
          Choose the AI provider used by tutor chat. Personal credentials are stored in a secure, HTTP-only browser cookie for this device and are never rendered back to the page.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {disabled ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            Sign-in storage is not configured yet. Configure Supabase before saving AI settings.
          </div>
        ) : null}

        <form action={saveAiProviderSettingsAction} className="grid gap-6">
          <input name="next" type="hidden" value="/settings?message=saved" />

          <section className="grid gap-3">
            <h2 className="text-base font-black text-slate-950">Provider</h2>
            <div className="grid gap-3">
              {USER_AI_PROVIDER_OPTIONS.map((option) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50"
                  key={option.value}
                >
                  <input
                    defaultChecked={preference.provider === option.value}
                    disabled={disabled}
                    name="provider"
                    type="radio"
                    value={option.value}
                  />
                  <span>
                    <span className="block font-black text-slate-900">{option.label}</span>
                    <span className="block text-sm text-slate-600">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Model
            <input
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
              defaultValue={preference.model}
              disabled={disabled}
              maxLength={160}
              name="model"
              placeholder={providerDefaultModel(preference.provider)}
              type="text"
            />
            <span className="text-xs font-medium text-slate-500">
              Leave blank to use the provider default. Google default: gemini-3.5-flash. Groq default: openai/gpt-oss-120b.
            </span>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-700" />
              Personal provider credential
            </span>
            <input
              autoComplete="off"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
              disabled={disabled}
              name="credential"
              placeholder={
                preference.hasCredential
                  ? `Saved for this device; leave blank to keep ending in ${preference.credentialSuffix}`
                  : "Paste a Google Gemini or Groq API key"
              }
              type="password"
            />
            <span className="text-xs font-medium text-slate-500">
              A personal provider requires your own credential. It is sent only to cppFan's server endpoint when tutor chat runs.
            </span>
          </label>

          <div className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-700" />
              <div>
                <p className="font-black">How this works</p>
                <p className="mt-1 text-blue-900">
                  The shared provider keeps the deployment-wide setup. Google or Groq uses your browser-saved credential for this device.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 font-black">
              <Link className="inline-flex items-center gap-1 text-blue-700" href="https://aistudio.google.com/app/apikey" target="_blank">
                Google AI Studio <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <Link className="inline-flex items-center gap-1 text-blue-700" href="https://console.groq.com/keys" target="_blank">
                Groq keys <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={disabled} size="lg" type="submit">
              Save AI settings
            </Button>
          </div>
        </form>

        {preference.hasCredential ? (
          <form action={clearAiProviderCredentialAction}>
            <Button disabled={disabled} type="submit" variant="secondary">
              Clear saved personal credential
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
