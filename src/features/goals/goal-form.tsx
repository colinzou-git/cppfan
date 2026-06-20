"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createGoalAction } from "@/app/goals/actions";
import { goalSkillOptions } from "./goal-skill-options";

const DRAFT_KEY = "cppfan:goal-wizard:v1";

function day(offset: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function addDays(localDate: string, count: number) {
  const [year, month, date] = localDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + count)).toISOString().slice(0, 10);
}

type Draft = {
  step: number;
  duration: number;
  start: string;
  timezone: string;
  title: string;
  note: string;
  skillIds: string[];
};

export function GoalForm({
  recommendedSkillIds = [],
  recommendationReason
}: {
  recommendedSkillIds?: string[];
  recommendationReason?: string;
}) {
  const [draft, setDraft] = useState<Draft>({
    step: 1,
    duration: 7,
    start: day(0),
    timezone: "America/Los_Angeles",
    title: "",
    note: "",
    skillIds: recommendedSkillIds
  });
  const [restored, setRestored] = useState(false);
  const end = useMemo(() => addDays(draft.start, draft.duration - 1), [draft.start, draft.duration]);
  const suggested = recommendedSkillIds.length > 0
    ? goalSkillOptions.filter((skill) => recommendedSkillIds.includes(skill.id))
    : goalSkillOptions.slice(0, 4);

  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try { setDraft(JSON.parse(saved) as Draft); } catch { window.localStorage.removeItem(DRAFT_KEY); }
    } else {
      setDraft((current) => ({
        ...current,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || current.timezone
      }));
    }
    setRestored(Boolean(saved));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    const warn = (event: BeforeUnloadEvent) => {
      if (draft.title || draft.skillIds.length > 0 || draft.step > 1) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft]);

  function patch(values: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...values }));
  }

  return (
    <form
      action={createGoalAction}
      className="grid gap-5 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm"
      data-testid="goal-wizard"
    >
      <input type="hidden" name="title" value={draft.title} />
      <input type="hidden" name="start_local_date" value={draft.start} />
      <input type="hidden" name="end_local_date" value={end} />
      <input type="hidden" name="timezone" value={draft.timezone} />
      <input type="hidden" name="learner_note" value={draft.note} />
      <input type="hidden" name="recommendation_source" value={recommendedSkillIds.length > 0 ? "evaluation" : "history_recommendation"} />
      <input type="hidden" name="recommendation_reason" value={recommendationReason ?? "Ranked from unfinished curriculum starting points."} />
      {draft.skillIds.map((skillId) => <input key={skillId} type="hidden" name="skill_ids" value={skillId} />)}

      <div>
        <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Step {draft.step} of 4</p>
        <h2 className="text-xl font-black text-slate-950">Add Goal</h2>
        <p className="text-sm text-slate-600">Goals pace unfinished learning. FSRS Daily Review remains independently scheduled.</p>
        {restored ? <p role="status" className="mt-2 text-xs font-bold text-emerald-700">Your saved draft was restored.</p> : null}
      </div>

      {draft.step === 1 ? (
        <div className="grid gap-4">
          <h3 className="font-black">Choose duration</h3>
          <label className="grid gap-2 text-sm font-bold">Duration: {draft.duration} days
            <input aria-label="Goal duration" type="range" min={1} max={30} value={draft.duration} onChange={(event) => patch({ duration: Number(event.target.value) })} />
          </label>
          <label className="grid gap-2 text-sm font-bold">Start date
            <input type="date" value={draft.start} onChange={(event) => patch({ start: event.target.value })} className="h-12 rounded-2xl border border-slate-200 px-3" />
          </label>
          <p className="text-sm text-slate-600">Inclusive range: <strong>{draft.start}</strong> through <strong>{end}</strong> ({draft.timezone}).</p>
        </div>
      ) : null}

      {draft.step === 2 ? (
        <div className="grid gap-4">
          <h3 className="font-black">Recommended starting points</h3>
          <p className="text-sm text-slate-600">These unfinished curriculum targets are suggestions, not locks. Choose, modify, or ignore them.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggested.map((skill) => (
              <button key={skill.id} type="button" onClick={() => patch({ skillIds: [...new Set([...draft.skillIds, skill.id])] })} className="rounded-2xl border border-indigo-200 p-3 text-left text-sm font-bold hover:bg-indigo-50">
                {skill.label}<span className="mt-1 block text-xs font-medium text-slate-500">Start or continue initial acquisition · adjustable workload</span>
              </button>
            ))}
          </div>
          <Button asChild variant="secondary"><Link href="/goals/evaluation">Optional: run the 30-question Evaluation</Link></Button>
          <p className="text-xs text-slate-500">Your duration, title, and selections stay in this browser while you complete or abandon Evaluation.</p>
        </div>
      ) : null}

      {draft.step === 3 ? (
        <div className="grid gap-4">
          <h3 className="font-black">Customize targets</h3>
          <label className="grid gap-2 text-sm font-bold">Goal title
            <input required minLength={2} maxLength={120} value={draft.title} onChange={(event) => patch({ title: event.target.value })} className="h-12 rounded-2xl border border-slate-200 px-4" />
          </label>
          <label className="grid gap-2 text-sm font-bold">Skills
            <select multiple required size={12} value={draft.skillIds} onChange={(event) => patch({ skillIds: [...event.target.selectedOptions].map((option) => option.value) })} className="rounded-2xl border border-slate-200 bg-white p-3 font-medium">
              {goalSkillOptions.map((skill) => <option key={skill.id} value={skill.id}>{skill.label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">Note
            <textarea maxLength={1000} value={draft.note} onChange={(event) => patch({ note: event.target.value })} className="min-h-24 rounded-2xl border border-slate-200 p-3" />
          </label>
        </div>
      ) : null}

      {draft.step === 4 ? (
        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4">
          <h3 className="font-black">Review and save</h3>
          <p><strong>{draft.title}</strong> · {draft.start} through {end} · {draft.timezone}</p>
          <p>{draft.skillIds.length} unfinished acquisition target{draft.skillIds.length === 1 ? "" : "s"}; roughly {Math.max(1, Math.ceil(draft.skillIds.length / draft.duration))} new target(s) per day.</p>
          <p className="text-sm text-slate-600">Daily Review load stays separate. Learn Extra can add one optional action later without changing these dates or targets.</p>
          <Button type="submit" disabled={draft.title.trim().length < 2 || draft.skillIds.length === 0}>Create goal</Button>
        </div>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="secondary" disabled={draft.step === 1} onClick={() => patch({ step: draft.step - 1 })}>Back</Button>
        {draft.step < 4 ? <Button type="button" onClick={() => patch({ step: draft.step + 1 })}>Continue</Button> : null}
      </div>
    </form>
  );
}
