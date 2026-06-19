import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { allocateExtraGoalAction } from "@/app/goals/actions";
import type { DailyNewAction, DailyNewPlan } from "./daily-new-model";

function ActionTile({ action }: { action: DailyNewAction }) {
  return (
    <li>
      <Link
        href={action.href}
        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 transition hover:border-violet-200 hover:bg-violet-50/60"
      >
        <span>
          <span className="mb-1 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black uppercase text-violet-800">
            {action.source === "learn_extra" ? "Extra" : "Planned"}
          </span>
          <span className="block text-sm font-bold text-slate-950">{action.title}</span>
          <span className="block text-xs font-medium text-slate-500">{action.reason}</span>
          <span className="block text-xs font-semibold text-violet-700">
            {action.goalTitles.join(" · ")}{action.estimatedMinutes ? ` · about ${action.estimatedMinutes} min` : ""}
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-violet-600" />
      </Link>
    </li>
  );
}

export function DailyNew({ plan }: { plan: DailyNewPlan }) {
  const unavailable = plan.state === "unavailable" || plan.state === "error";
  const displayed = [...plan.actions, ...plan.allocatedExtraActions];
  return (
    <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur" data-testid="daily-new-for-goals">
      <CardHeader>
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          <Sparkles className="h-5 w-5" />
        </div>
        <CardTitle>Daily New for Goals</CardTitle>
        <CardDescription>
          Unfinished initial-learning steps for active goals. FSRS reviews never appear here.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {unavailable ? (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            Goal learning recommendations are temporarily unavailable.
          </p>
        ) : plan.activeGoalCount === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-950">Set a dated goal to receive unfinished-learning steps.</p>
            <Button asChild size="sm"><Link href="/goals">Set a learning goal</Link></Button>
          </div>
        ) : displayed.length === 0 ? (
          <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            Today&apos;s planned acquisition work is complete, or your baseline new-skill cap is zero.
          </p>
        ) : (
          <ol className="grid gap-2">{displayed.map((action) => <ActionTile key={action.id} action={action} />)}</ol>
        )}
        {plan.extraAction ? (
          <form action={allocateExtraGoalAction}>
            <input type="hidden" name="submission_id" value={crypto.randomUUID()} />
            <Button type="submit" variant="secondary">Learn Extra: {plan.extraAction.title}</Button>
          </form>
        ) : plan.activeGoalCount > 0 && !unavailable ? (
          <p className="text-xs font-semibold text-slate-500">No additional safe unfinished goal action is available today.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
