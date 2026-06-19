import Link from "next/link";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInterviewTarget } from "@/features/interview/target-profile-store";
import { resetInterviewTargetAction, saveInterviewTargetAction } from "@/features/interview/target-profile-actions";
import {
  INTERVIEW_CPP_STANDARDS,
  INTERVIEW_TARGET_PROFILES,
  RECENT_INTERVIEW_PRACTICE
} from "@/features/interview/target-profile";

export const metadata = { title: "Interview target — cppFan" };

type SearchParams = Promise<{ saved?: string; reset?: string; error?: string }>;

const fieldClass =
  "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default async function InterviewTargetPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const result = await getInterviewTarget();
  const target = result.target;
  const canSave = result.status === "ready";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <Link href="/interview" className="text-sm font-bold text-blue-700">← Interview practice</Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <Crosshair className="h-7 w-7 text-blue-700" /> Interview target
        </h1>
        <p className="mt-1 text-slate-600">
          Choose a focused coding-refresh target independently from your general C++ experience. Changing or resetting it does not erase normal cppFan progress.
        </p>
      </header>

      {params.saved ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">Interview target saved.</p> : null}
      {params.reset ? <p className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-900">Interview target reset. Ordinary progress was preserved.</p> : null}
      {params.error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-900">Unable to save: {params.error}</p> : null}
      {result.status === "signed_out" ? (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <Link className="font-bold underline" href="/login?next=/interview/target">Sign in</Link> to save a target.
        </p>
      ) : null}
      {result.status === "unconfigured" || result.status === "unavailable" ? (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Personalized target storage is currently unavailable.</p>
      ) : null}

      <form action={saveInterviewTargetAction} className="grid gap-5 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm" data-testid="interview-target-form">
        <fieldset className="grid gap-3" disabled={!canSave}>
          <legend className="font-black text-slate-900">Target profile</legend>
          {INTERVIEW_TARGET_PROFILES.map((option) => (
            <label className="flex gap-3 rounded-2xl border border-slate-200 p-4" key={option.id}>
              <input defaultChecked={(target?.targetProfile ?? "google_staff_systems") === option.id} name="target_profile" type="radio" value={option.id} />
              <span><b className="block">{option.label}</b><span className="text-sm text-slate-600">{option.description}</span></span>
            </label>
          ))}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Interview language
            <select className={fieldClass} defaultValue={target?.cppStandard ?? "cpp20"} disabled={!canSave} name="cpp_standard">
              {INTERVIEW_CPP_STANDARDS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Target date
            <input className={fieldClass} defaultValue={target?.targetDate ?? ""} disabled={!canSave} name="target_date" type="date" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Recent practice
            <select className={fieldClass} defaultValue={target?.recentPractice ?? "none"} disabled={!canSave} name="recent_practice">
              {RECENT_INTERVIEW_PRACTICE.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <p className="text-xs text-slate-600">Recent practice is self-reported routing context only. It never counts as mastery, readiness evidence, or an FSRS review.</p>
        <Button disabled={!canSave} type="submit">Save interview target</Button>
      </form>

      {target && canSave ? (
        <form action={resetInterviewTargetAction}>
          <Button type="submit" variant="secondary">Reset interview target</Button>
        </form>
      ) : null}

      <p className="text-sm text-slate-600">
        Next: <Link className="font-bold text-blue-700" href="/interview/diagnostic">run or review the coding-refresh diagnostic</Link>.
      </p>
    </main>
  );
}
