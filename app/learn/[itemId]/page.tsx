import Link from "next/link";
import { notFound } from "next/navigation";
import { LearningItemView } from "@/features/learning-items/learning-item-view";
import { getLearningItemWithDetails } from "@/features/learning-items/learning-item-queries";

export default async function LearningItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const result = await getLearningItemWithDetails(decodeURIComponent(itemId));

  if (result.status === "not_found") {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
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
        <LearningItemView data={result.data} />
      )}
    </main>
  );
}
