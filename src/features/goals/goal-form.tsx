import { Button } from "@/components/ui/button";
import { createGoalAction } from "@/app/goals/actions";
import { goalSkillOptions } from "./goal-skill-options";

function day(offset: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function GoalForm() {
  return (
    <form action={createGoalAction} className="grid gap-5 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-black text-slate-950">Add Goal</h2>
        <p className="text-sm text-slate-600">Choose a 1–30 day initial-learning target. FSRS review stays separate.</p>
      </div>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Goal title
        <input name="title" required minLength={2} maxLength={120} className="h-12 rounded-2xl border border-slate-200 px-4" />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold text-slate-700">Start
          <input name="start_local_date" type="date" required defaultValue={day(0)} className="h-12 rounded-2xl border border-slate-200 px-3" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">End
          <input name="end_local_date" type="date" required defaultValue={day(6)} className="h-12 rounded-2xl border border-slate-200 px-3" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Timezone
          <input name="timezone" required defaultValue="America/Los_Angeles" className="h-12 rounded-2xl border border-slate-200 px-3" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold text-slate-700">Skills
        <select name="skill_ids" multiple required size={12} className="rounded-2xl border border-slate-200 bg-white p-3 font-medium">
          {goalSkillOptions.map((skill) => <option key={skill.id} value={skill.id}>{skill.label}</option>)}
        </select>
        <span className="text-xs font-medium text-slate-500">Use Ctrl/Command-click for multiple skills.</span>
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">Note
        <textarea name="learner_note" maxLength={1000} className="min-h-24 rounded-2xl border border-slate-200 p-3" />
      </label>
      <Button type="submit">Create goal</Button>
    </form>
  );
}
