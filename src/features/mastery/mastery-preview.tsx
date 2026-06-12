import { Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MasterySummary, SkillStatus } from "./mastery-types";

const STATUS_STYLES: Record<SkillStatus, string> = {
  regressed: "bg-rose-100 text-rose-900",
  weak: "bg-amber-100 text-amber-900",
  reviewing: "bg-sky-100 text-sky-900",
  learning: "bg-blue-100 text-blue-900",
  strong: "bg-emerald-100 text-emerald-900",
  mastered: "bg-emerald-200 text-emerald-950",
  new: "bg-slate-100 text-slate-700"
};

const STATUS_LABELS: Record<SkillStatus, string> = {
  regressed: "Regressed",
  weak: "Weak",
  reviewing: "Reviewing",
  learning: "Learning",
  strong: "Strong",
  mastered: "Mastered",
  new: "New"
};

/*
 * Read-only dashboard preview of skill mastery, derived from the skill event
 * ledger by rule-based scoring. This is mastery, not FSRS review state.
 */
export function MasteryPreview({ summary }: { summary: MasterySummary }) {
  const hasData = summary.authenticated && summary.skills.length > 0;
  const activeCounts = (Object.entries(summary.counts) as [SkillStatus, number][]).filter(
    ([, count]) => count > 0
  );

  return (
    <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur" data-testid="mastery-preview">
      <CardHeader>
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          <Gauge className="h-5 w-5" />
        </div>
        <CardTitle>Skill mastery</CardTitle>
        <CardDescription>
          A rule-based read of how well you know each skill, built from your learning, attempts, and
          reviews. Mastery is tracked separately from review scheduling.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!hasData ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-600">
            {summary.authenticated
              ? "No mastery evidence yet. Answer practice items and complete reviews to build your skill mastery."
              : "Sign in and start practicing to build and track your skill mastery."}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2" data-testid="mastery-counts">
              {activeCounts.map(([status, count]) => (
                <span
                  key={status}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[status]}`}
                >
                  {STATUS_LABELS[status]}: {count}
                </span>
              ))}
            </div>
            <ul className="grid gap-2">
              {summary.skills.map((skill) => (
                <li
                  key={skill.skillId}
                  data-testid="mastery-skill"
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2"
                >
                  <span>
                    <span className="block text-sm font-bold text-slate-950">{skill.title}</span>
                    <span className="block text-xs font-medium text-slate-500">{skill.reason}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[skill.status]}`}
                  >
                    {STATUS_LABELS[skill.status]}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
