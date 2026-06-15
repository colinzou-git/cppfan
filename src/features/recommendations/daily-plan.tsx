import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyPlan as DailyPlanData, RecommendationKind } from "./recommendation-types";

const KIND_STYLES: Record<RecommendationKind, string> = {
  due_reviews: "bg-sky-100 text-sky-900",
  regressed_skill: "bg-rose-100 text-rose-900",
  weak_skill: "bg-amber-100 text-amber-900",
  remediation: "bg-rose-100 text-rose-900",
  placement_start: "bg-teal-100 text-teal-900",
  next_lesson: "bg-blue-100 text-blue-900",
  prerequisite: "bg-violet-100 text-violet-900",
  capstone_milestone: "bg-indigo-100 text-indigo-900",
  explore: "bg-slate-100 text-slate-700"
};

const KIND_LABELS: Record<RecommendationKind, string> = {
  due_reviews: "Reviews",
  regressed_skill: "Regressed",
  weak_skill: "Weak",
  remediation: "Misconception",
  placement_start: "Placement",
  next_lesson: "Next lesson",
  prerequisite: "Prerequisite",
  capstone_milestone: "Capstone",
  explore: "Explore"
};

/*
 * Read-only daily plan: an ordered, explained list of what to do next, built by
 * the rule-based recommendation engine (no ML). Each item links to the relevant
 * place and states why it is recommended.
 */
export function DailyPlan({ plan }: { plan: DailyPlanData }) {
  return (
    <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur" data-testid="daily-plan">
      <CardHeader>
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-700">
          <ListChecks className="h-5 w-5" />
        </div>
        <CardTitle>Today&apos;s plan</CardTitle>
        <CardDescription>
          {plan.authenticated
            ? "A suggested order for today, based on due reviews, weak skills, and your current path."
            : "A starting plan. Sign in so it can use your due reviews, weak skills, and goals."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-2">
          {plan.recommendations.map((rec, index) => (
            <li key={`${rec.kind}-${index}`}>
              <Link
                href={rec.href}
                data-testid="daily-plan-item"
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <span className="grid gap-1">
                  <span className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${KIND_STYLES[rec.kind]}`}>
                      {KIND_LABELS[rec.kind]}
                    </span>
                    <span className="text-sm font-bold text-slate-950">{rec.title}</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">{rec.reason}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-blue-600" />
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
