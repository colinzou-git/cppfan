import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { LessonEditor } from "@/features/user-content/lesson-editor";
import { requireOwnerSession } from "@/features/user-content/require-owner";

export const dynamic = "force-dynamic";

export default async function NewLessonPage() {
  await requireOwnerSession("/my-content/lessons/new");
  return (
    <PageShell className="grid gap-6" size="reading">
      <header className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
        <h1 className="mt-2 text-3xl font-black text-slate-950">New lesson</h1>
        <p className="text-slate-600">Draft autosaves as you type; publish when it is ready.</p>
      </header>
      <LessonEditor />
    </PageShell>
  );
}
