import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyNewPlan } from "./daily-new-model";

export function DailyNew({ plan }: { plan: DailyNewPlan }) {
  const unavailable = plan.state === "unavailable" || plan.state === "error";
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
        ) : plan.actions.length === 0 ? (
          <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            Today&apos;s planned acquisition work is complete, or your daily new-skill cap is zero.
          </p>
        ) : (
          <ol className="grid gap-2">
            {plan.actions.map((action) => (
              <li key={action.id}>
                <Link
                  href={action.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 transition hover:border-violet-200 hover:bg-violet-50/60"
                >
                  <span>
                    <span className="block text-sm font-bold text-slate-950">{action.title}</span>
                    <span className="block text-xs font-medium text-slate-500">{action.reason}</span>
                    <span className="block text-xs font-semibold text-violet-700">
                      {action.goalTitles.join(" · ")}{action.estimatedMinutes ? ` · about ${action.estimatedMinutes} min` : ""}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-violet-600" />
                </Link>
              </li>
            ))}
          </ol>
        )}
        {plan.extraAction ? (
          <Button asChild variant="secondary">
            <Link href={plan.extraAction.href}>Learn Extra: {plan.extraAction.title}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
