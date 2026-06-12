import Link from "next/link";
import { notFound } from "next/navigation";
import { LearningItemView } from "@/features/learning-items/learning-item-view";
import { getLearningItemWithDetails } from "@/features/learning-items/learning-item-queries";

export default async function LearningItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const data = await getLearningItemWithDetails(decodeURIComponent(itemId));

  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <Link href="/dashboard" className="text-sm font-bold text-blue-700">
          ← Back to dashboard
        </Link>
      </header>
      <LearningItemView data={data} />
    </main>
  );
}
