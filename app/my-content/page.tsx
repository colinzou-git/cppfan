import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { ContentSourceBadge } from "@/features/user-content/content-source-badge";
import { getMyContentItems } from "@/features/user-content/user-content-queries";
import { requireOwnerSession } from "@/features/user-content/require-owner";

export const dynamic = "force-dynamic";

export default async function MyContentPage() {
  await requireOwnerSession("/my-content");
  const items = await getMyContentItems();

  return (
    <PageShell className="grid gap-6" size="reading">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-blue-700">← Dashboard</Link>
          <h1 className="mt-2 text-3xl font-black text-slate-950">My Content</h1>
          <p className="text-slate-600">Your private lessons. Native and user-created content mix everywhere with source badges.</p>
        </div>
        <Button asChild>
          <Link href="/my-content/lessons/new">Create a lesson</Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600">
          <p className="font-semibold">You have not created any content yet.</p>
          <p className="mt-1 text-sm">Start with a lesson — save a draft, then publish it to learn and review from it.</p>
          <Button asChild className="mt-4">
            <Link href="/my-content/lessons/new">Create a lesson</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
              <Link href={`/my-content/lessons/${item.id}/edit`} className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold text-slate-900">{item.title || "Untitled lesson"}</span>
                    <ContentSourceBadge source="user" />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.kind} · {item.lifecycleStatus} · updated {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-700">Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
