import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { LabPreview } from "@/features/user-content/lab-preview";
import { getLabForOwner } from "@/features/user-content/user-content-queries";
import { requireOwnerSession } from "@/features/user-content/require-owner";

export const dynamic = "force-dynamic";

export default async function PreviewLabPage({ params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  await requireOwnerSession(`/my-content/labs/${contentId}/preview`);
  const detail = await getLabForOwner(contentId);
  if (!detail) {
    notFound();
  }
  const payload = detail.draftPayload ?? detail.publishedPayload;
  if (!payload) {
    notFound();
  }

  return (
    <PageShell className="grid gap-6" size="reading">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <div>
          <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
          <p className="mt-1 text-slate-600">Preview as a learner. Reference solution and hidden fields stay hidden.</p>
        </div>
        <Link href={`/my-content/labs/${contentId}/edit`} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white">
          Back to editor
        </Link>
      </header>
      <LabPreview payload={payload} status={detail.lifecycleStatus} />
    </PageShell>
  );
}
