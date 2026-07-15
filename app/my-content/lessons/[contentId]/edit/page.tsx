import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { LessonEditor } from "@/features/user-content/lesson-editor";
import { getAttachmentsForOwner, getContentItemForOwner, getContentVersions } from "@/features/user-content/user-content-queries";
import { requireOwnerSession } from "@/features/user-content/require-owner";

export const dynamic = "force-dynamic";

export default async function EditLessonPage({ params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  await requireOwnerSession(`/my-content/lessons/${contentId}/edit`);
  const detail = await getContentItemForOwner(contentId);
  if (!detail) {
    notFound();
  }
  const [attachments, versions] = await Promise.all([
    getAttachmentsForOwner(contentId),
    getContentVersions(contentId)
  ]);

  return (
    <PageShell className="grid gap-6" size="reading">
      <header className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Edit lesson</h1>
        <p className="text-slate-600">Editing a published lesson creates a new draft; publish to make it live.</p>
      </header>
      <LessonEditor
        initialContentId={detail.id}
        initialRevision={detail.draftRevision}
        initialPayload={detail.draftPayload ?? detail.publishedPayload}
        initialLifecycle={detail.lifecycleStatus}
        initialAttachments={attachments}
        initialVersions={versions}
      />
    </PageShell>
  );
}
