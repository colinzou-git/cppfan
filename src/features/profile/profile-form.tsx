import Link from "next/link";
import { Target, Timer, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_DAILY_NEW_SKILLS_GOAL,
  DEFAULT_DAILY_REVIEW_MINUTES,
  DEFAULT_EXPERIENCE_LEVEL,
  EXPERIENCE_OPTIONS,
  LEARNING_GOAL_OPTIONS,
  PLATFORM_OPTIONS
} from "./profile-constants";
import { saveProfileAction } from "./profile-actions";
import type { Profile } from "./profile-types";

type ProfileFormProps = {
  disabled?: boolean;
  email?: string | null;
  error?: string | null;
  mode: "onboarding" | "profile";
  nextPath: string;
  profile?: Profile | null;
};

function hasSelected(values: readonly string[] | undefined, value: string) {
  return values?.includes(value) ?? false;
}

export function ProfileForm({ disabled = false, email, error, mode, nextPath, profile }: ProfileFormProps) {
  const title = mode === "profile" ? "Profile settings" : "Set up your cppFan profile";
  const description =
    mode === "profile"
      ? "Update your learning preferences. These settings will drive future review and practice recommendations."
      : "Tell cppFan how to start. These settings are suggestions, not hard locks.";

  return (
    <Card className="w-full border-white/70 bg-white/85 shadow-xl backdrop-blur">
      <CardHeader>
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700">
          <UserRound className="h-6 w-6" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {email ? (
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            Signed in as <span className="font-black">{email}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {error}
          </div>
        ) : null}

        {disabled ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Supabase is not configured yet. Add environment variables and apply the profile migration before saving.
          </div>
        ) : null}

        <form action={saveProfileAction} className="grid gap-6">
          <input name="mode" type="hidden" value={mode} />
          <input name="next" type="hidden" value={nextPath} />

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Display name
            <input
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
              defaultValue={profile?.display_name ?? ""}
              disabled={disabled}
              maxLength={80}
              name="display_name"
              placeholder="Colin"
              required
              type="text"
            />
          </label>

          <section className="grid gap-3">
            <div>
              <h2 className="text-base font-black text-slate-950">Current C++ level</h2>
              <p className="text-sm text-slate-600">This controls recommendation priority, not access locks.</p>
            </div>

            <div className="grid gap-3">
              {EXPERIENCE_OPTIONS.map((option) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50"
                  key={option.value}
                >
                  <input
                    defaultChecked={(profile?.experience_level ?? DEFAULT_EXPERIENCE_LEVEL) === option.value}
                    disabled={disabled}
                    name="experience_level"
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

          <section className="grid gap-3">
            <div className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 text-blue-700" />
              <div>
                <h2 className="text-base font-black text-slate-950">Learning goals</h2>
                <p className="text-sm text-slate-600">Choose all that matter right now.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {LEARNING_GOAL_OPTIONS.map((option) => (
                <label className="flex cursor-pointer gap-3 rounded-2xl bg-slate-100 p-4 font-semibold" key={option.value}>
                  <input
                    defaultChecked={hasSelected(profile?.learning_goals, option.value)}
                    disabled={disabled}
                    name="learning_goals"
                    type="checkbox"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>

          <section className="grid gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 text-blue-700" />
              <div className="grid gap-1">
                <h2 className="text-base font-black text-slate-950">Staff systems interview target</h2>
                <p className="text-sm text-slate-700">
                  Configure role, C++ standard, prep horizon, and recent interview practice separately from ordinary cppFan progress.
                </p>
                <Link
                  className="w-fit text-sm font-black text-blue-700"
                  data-testid="interview-target-profile-link"
                  href="/interview/target"
                >
                  Configure interview target
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-3">
            <div>
              <h2 className="text-base font-black text-slate-950">Main devices</h2>
              <p className="text-sm text-slate-600">cppFan should stay friendly across these screens.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {PLATFORM_OPTIONS.map((option) => (
                <label className="flex cursor-pointer gap-3 rounded-2xl bg-slate-100 p-4 font-semibold" key={option.value}>
                  <input
                    defaultChecked={hasSelected(profile?.preferred_platforms, option.value)}
                    disabled={disabled}
                    name="preferred_platforms"
                    type="checkbox"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-700" />
                New skills per day
              </span>
              <input
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                defaultValue={profile?.daily_new_skills_goal ?? DEFAULT_DAILY_NEW_SKILLS_GOAL}
                disabled={disabled}
                max={10}
                min={0}
                name="daily_new_skills_goal"
                type="number"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-blue-700" />
                Review minutes per day
              </span>
              <input
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                defaultValue={profile?.daily_review_minutes ?? DEFAULT_DAILY_REVIEW_MINUTES}
                disabled={disabled}
                max={120}
                min={5}
                name="daily_review_minutes"
                type="number"
              />
            </label>
          </section>

          <Button disabled={disabled} size="lg" type="submit">
            {mode === "profile" ? "Save profile" : "Finish onboarding"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
