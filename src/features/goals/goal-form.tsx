"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createGoalAction } from "@/app/goals/actions";
import { localDateKey } from "@/lib/time/local-day";
import { goalSkillOptions } from "./goal-skill-options";

const DRAFT_KEY = "cppfan:goal-wizard:v1";
const DEFAULT_TIMEZONE = "America/Los_Angeles";
const validGoalSkillIds = new Set(goalSkillOptions.map((skill) => skill.id));

function localToday(timezone: string) {
  return localDateKey(new Date(), timezone);
}

function addDays(localDate: string, count: number) {
  const [yearText, monthText, dateText] = localDate.split("-");
  const year = Number(yearText ?? 0);
  const month = Number(monthText ?? 1);
  const date = Number(dateText ?? 1);
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

function defaultDraft(): Draft {
  return {
    step: 1,
    duration: 7,
    start: localToday(DEFAULT_TIMEZONE),
    timezone: DEFAULT_TIMEZONE,
    title: "",
    note: "",
    skillIds: []
  };
}

function normalizeDraft(value: unknown, fallback: Draft): Draft {
  const record = typeof value === "object" && value !== null ? value as Partial<Draft> : {};
  const step = typeof record.step === "number" && Number.isInteger(record.step) && record.step >= 1 && record.step <= 4
    ? record.step
    : fallback.step;
  const duration = typeof record.duration === "number" && Number.isInteger(record.duration) && record.duration >= 1 && record.duration <= 30
    ? record.duration
    : fallback.duration;
  const skillIds = Array.isArray(record.skillIds)
    ? [...new Set(record.skillIds.filter((skillId): skillId is string => typeof skillId === "string" && validGoalSkillIds.has(skillId)))]
    : fallback.skillIds;

  return {
    step,
    duration,
    start: typeof record.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(record.start) ? record.start : fallback.start,
    timezone: typeof record.timezone === "string" && record.timezone ? record.timezone : fallback.timezone,
    title: typeof record.title === "string" ? record.title : fallback.title,
    note: typeof record.note === "string" ? record.note : fallback.note,
    skillIds
  };
}

export function GoalForm({
  recommendedSkillIds = [],
  recommendationReason
}: {
  recommendedSkillIds?: string[];
  recommendationReason?: string;
}) {
  const [draft, setDraft] = useState<Draft>(() => defaultDraft());
  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);
  const end = useMemo(() => addDays(draft.start, draft.duration - 1), [draft.start, draft.duration]);
  const suggested = recommendedSkillIds.length > 0
    ? goalSkillOptions.filter((skill) => recommendedSkillIds.includes(skill.id))
    : goalSkillOptions.slice(0, 4);
  const suggestedIds = useMemo(() => suggested.map((skill) => skill.id), [suggested]);
  const suggestedIdSet = useMemo(() => new Set(suggestedIds), [suggestedIds]);
  const selectedSkillIds = useMemo(() => new Set(draft.skillIds), [draft.skillIds]);
  const selectedSuggestedCount = suggestedIds.filter((skillId) => selectedSkillIds.has(skillId)).length;

  useEffect(() => {
    const fallback = defaultDraft();
    const saved = window.localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        setDraft(normalizeDraft(JSON.parse(saved), fallback));
        setRestored(true);
      } catch {
        window.localStorage.removeItem(DRAFT_KEY);
        setRestored(false);
      }
    } else {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || fallback.timezone;
      setDraft((current) => ({
        ...current,
        timezone,
        start: localToday(timezone)
      }));
      setRestored(false);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  function patch(values: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...values }));
  }

  function toggleSkill(skillId: string) {
    setDraft((current) => {
      const selected = current.skillIds.includes(skillId);
      return {
        ...current,
        skillIds: selected
          ? current.skillIds.filter((currentSkillId) => currentSkillId !== skillId)
          : [...current.skillIds, skillId]
      };
    });
  }

  function selectSuggestedSkills() {
    setDraft((current) => ({
      ...current,
      skillIds: [...new Set([...current.skillIds, ...suggestedIds])]
    }));
  }

  function clearSuggestedSkills() {
    setDraft((current) => ({
      ...current,
      skillIds: current.skillIds.filter((skillId) => !suggestedIdSet.has(skillId))
    }));
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
          <p className="text-sm text-slate-600">These unfinished curriculum targets are suggestions, not locks. Select the ones to add, modify them later, or ignore them.</p>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 text-sm">
            <p aria-live="polite" className="font-bold text-slate-700">{selectedSuggestedCount} of {suggested.length} recommended target{suggested.length === 1 ? "" : "s"} selected</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={selectSuggestedSkills}>Select all</Button>
              <Button type="button" variant="secondary" onClick={clearSuggestedSkills} disabled={selectedSuggestedCount === 0}>Clear selected</Button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggested.map((skill) => {
              const isSelected = selectedSkillIds.has(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleSkill(skill.id)}
                  className={`rounded-2xl border p-3 text-left text-sm font-bold transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isSelected ? "border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-200" : "border-indigo-200 bg-white/70"}`}
                >
                  <span className="flex gap-3">
                    <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"}`}>{isSelected ? "✓" : ""}</span>
                    <span>
                      {skill.label}
                      <span className="mt-1 block text-xs font-medium text-slate-500">Start or continue initial acquisition · adjustable workload</span>
                      <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-black ${isSelected ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-600"}`}>{isSelected ? "Selected for this goal" : "Tap to select"}</span>
                    </span>
                  </span>
                </button>
              );
            })}
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
          <div className="grid gap-2 text-sm font-bold">
            <p id="goal-skills-label">Skills</p>
            <p id="goal-skills-help" className="text-xs font-semibold text-slate-500">Check each skill to include in this goal. {draft.skillIds.length} selected.</p>
            <div role="group" aria-labelledby="goal-skills-label" aria-describedby="goal-skills-help" className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 font-medium">
              {goalSkillOptions.map((skill) => {
                const isSelected = selectedSkillIds.has(skill.id);
                return (
                  <label key={skill.id} className={`flex cursor-pointer items-start gap-3 rounded-xl p-2 text-sm transition hover:bg-indigo-50 ${isSelected ? "bg-indigo-50 text-indigo-950" : "text-slate-800"}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSkill(skill.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
                    />
                    <span>{skill.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
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
