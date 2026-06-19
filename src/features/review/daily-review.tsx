import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyReviewView } from "./daily-review-model";

export function DailyReview({ view }: { view: DailyReviewView }) {
  const unavailable = view.state === "unavailable" || view.state === "error";
  return (
    <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur" data-testid="daily-review">
      <CardHeader>
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700">
          <CalendarClock className="h-5 w-5" />
        </div>
        <CardTitle>Daily Review</CardTitle>
        <CardDescription>
          Previously learned practices scheduled by FSRS through today in {view.timezone}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {unavailable ? (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            Review scheduling is temporarily unavailable. No fallback items were substituted.
          </p>
        ) : view.items.length === 0 ? (
          <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            No FSRS reviews are due today.
          </p>
        ) : (
          <ol className="grid gap-2">
            {view.items.map((item) => (
              <li key={item.cardId}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 transition hover:border-sky-200 hover:bg-sky-50/60"
                >
                  <span>
                    <span className="block text-sm font-bold text-slate-950">{item.title}</span>
                    <span className="block text-xs font-medium text-slate-500">
                      {item.overdue ? "Overdue" : "Due today"}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-sky-600" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
