import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { LearningItemView } from "@/features/learning-items/learning-item-view";
import { LearnerResources } from "@/features/user-content/learner-resources";
import { getLearningItemWithDetails } from "@/features/learning-items/learning-item-queries";
import { getPrimarySkillId } from "@/features/learning-items/learning-item-seed";
import { isCodeLabItem } from "@/features/code-lab/code-lab-catalog";
import { recordSkillEvent } from "@/features/events/event-service";

export default async function LearningItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const result = await getLearningItemWithDetails(decodeURIComponent(itemId));

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "ok" && result.data.item.type === "worked_example") {
    await recordSkillEvent({
      eventType: "worked_example_viewed",
      skillId: getPrimarySkillId(result.data.item.id),
      learningItemId: result.data.item.id
    });
  }

  // Only Code Lab items use the wide split-pane layout; other items keep a
  // comfortable reading width so they are not awkwardly stretched (#431).
  const wide = result.status === "ok" && isCodeLabItem(result.data.item.id);

  return (
    <PageShell className="grid gap-6" size={wide ? "wide" : "reading"}>
      <header>
        <Link href="/dashboard" className="text-sm font-bold text-blue-700">
          ← Back to dashboard
        </Link>
      </header>
      {result.status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <p className="font-bold">This item is temporarily unavailable.</p>
          <p className="mt-1">We couldn’t load it from the database just now. Please refresh or try again shortly.</p>
        </div>
      ) : (
        <>
          <LearningItemView data={result.data} />
          <LearnerResources itemId={result.data.item.id} />
        </>
      )}
    </PageShell>
  );
}
