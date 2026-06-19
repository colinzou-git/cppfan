import { Button } from "@/components/ui/button";
import { reviseGoalAction } from "@/app/goals/actions";
import { goalSkillOptions } from "./goal-skill-options";
import type { StudyGoalView } from "./goal-view-types";

export function GoalEditForm({ goal }: { goal: StudyGoalView }) {
  const selectedSkills = new Set(goal.targets.flatMap((target) => target.skillId ? [target.skillId] : []));
  return (
    <form action={reviseGoalAction} className="grid gap-5 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
      <input type="hidden" name="goal_id" value={goal.id} />
      <input type="hidden" name="expected_revision" value={goal.currentRevision} />
      <input type="hidden" name="recommendation_reason" value={`Manual update from revision ${goal.currentRevision}`} />
      <div>
        <h2 className="text-xl font-black text-slate-950">Update goal</h2>
        <p className="text-sm text-slate-600">Saving creates a new immutable revision and leaves FSRS dates unchanged.</p>
      </div>
      <label className="grid gap-2 text-sm font-bold text-slate-700">Title
        <input name="title" required minLength={2} maxLength={120} defaultValue={goal.title} className="h-12 rounded-2xl border border-slate-200 px-4" />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold text-slate-700">Start
          <input name="start_local_date" type="date" required defaultValue={goal.startLocalDate} className="h-12 rounded-2xl border border-slate-200 px-3" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">End
          <input name="end_local_date" type="date" required defaultValue={goal.endLocalDate} className="h-12 rounded-2xl border border-slate-200 px-3" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Timezone
          <input name="timezone" required defaultValue={goal.timezone} className="h-12 rounded-2xl border border-slate-200 px-3" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold text-slate-700">Skills
        <select name="skill_ids" multiple required size={14} defaultValue={[...selectedSkills]} className="rounded-2xl border border-slate-200 bg-white p-3 font-medium">
          {goalSkillOptions.map((skill) => <option key={skill.id} value={skill.id}>{skill.label}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">Note
        <textarea name="learner_note" maxLength={1000} defaultValue={goal.learnerNote ?? ""} className="min-h-24 rounded-2xl border border-slate-200 p-3" />
      </label>
      <Button type="submit">Save new revision</Button>
    </form>
  );
}
