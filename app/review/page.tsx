import Link from "next/link";
import { CalendarClock } from "lucide-react";
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
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
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
        <ReviewQueue entries={queue.due} />
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
    </main>
  );
}
