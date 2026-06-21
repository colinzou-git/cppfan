import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getReviewQueue } from "@/features/review/review-queries";
import { ReviewQueue } from "@/features/review/review-queue";

// Per-user content: render per request so the signed-in learner's due queue is
// never served from a statically prerendered (signed-out) preview.
export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const queue = await getReviewQueue();

  return (
    <PageShell className="grid gap-6" size="wide">
      <header>
        <Link href="/dashboard" className="text-sm font-bold text-blue-700">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <CalendarClock className="h-7 w-7 text-blue-700" />
          Review queue
        </h1>
        <p className="mt-1 text-slate-600">
          Spaced reviews scheduled with FSRS. Review scheduling is separate from skill mastery.
        </p>
      </header>

      {queue.authenticated ? (
        // Keep the recall card readable (max ~48rem) and add session metadata to
        // the side on desktop instead of stretching the prompt; mobile stacks.
        <div className="grid gap-6 xl:grid-cols-[minmax(0,48rem)_minmax(18rem,1fr)] xl:items-start">
          <ReviewQueue entries={queue.due} />
          <aside className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm shadow-sm xl:sticky xl:top-6">
            <p className="font-black text-slate-950">Review progress</p>
            <p className="mt-1 text-slate-600">{queue.due.length} due in this session.</p>
            <p className="mt-3 text-xs text-slate-500">Recall first, reveal, then rate with FSRS.</p>
          </aside>
        </div>
      ) : (
        <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur" data-testid="review-preview">
          <CardHeader>
            <CardTitle>Items ready for review scheduling</CardTitle>
            <CardDescription>
              Sign in to start scheduling. Each eligible item becomes an FSRS review card that comes
              due on its own schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <ul className="grid gap-2">
              {queue.preview.map((entry) => (
                <li
                  key={entry.itemId}
                  data-testid="review-preview-item"
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800"
                >
                  {entry.title}
                </li>
              ))}
            </ul>
            <Button asChild variant="secondary" className="mt-2 w-fit">
              <Link href="/login?next=/review">Sign in to review</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
