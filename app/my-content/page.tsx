import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { ContentSourceBadge } from "@/features/user-content/content-source-badge";
import { ContentRowActions } from "@/features/user-content/content-row-actions";
import { getMyContentItems } from "@/features/user-content/user-content-queries";
import { getMyExerciseGroups } from "@/features/user-content/exercise-group-queries";
import { ExerciseGroupManager } from "@/features/user-content/exercise-group-manager";
import { requireOwnerSession } from "@/features/user-content/require-owner";
import {
  CONTENT_STATUS_FILTERS,
  STATUS_FILTER_LABELS,
  filterByStatus,
  parseStatusFilter,
  statusCounts
} from "@/features/user-content/content-filters";

export const dynamic = "force-dynamic";

export default async function MyContentPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  await requireOwnerSession("/my-content");
  const { status } = await searchParams;
  const filter = parseStatusFilter(status);
  const items = await getMyContentItems();
  const counts = statusCounts(items);
  const visible = filterByStatus(items, filter);
  const exerciseGroups = (await getMyExerciseGroups()).map((g) => ({ id: g.id, name: g.name }));

  return (
    <PageShell className="grid gap-6" size="reading">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-blue-700">← Dashboard</Link>
          <h1 className="mt-2 text-3xl font-black text-slate-950">My Content</h1>
          <p className="text-slate-600">Your private lessons. Native and user-created content mix everywhere with source badges.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/my-content/lessons/new">Create a lesson</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/my-content/exercises/new">Create Exercise</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/my-content/labs/new">Create Lab</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/my-content/interview/new">Create Interview Problem</Link>
          </Button>
        </div>
      </header>

      <ExerciseGroupManager initialGroups={exerciseGroups} />

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600">
          <p className="font-semibold">You have not created any content yet.</p>
          <p className="mt-1 text-sm">Start with a lesson — save a draft, then publish it to learn and review from it.</p>
          <Button asChild className="mt-4">
            <Link href="/my-content/lessons/new">Create a lesson</Link>
          </Button>
        </div>
      ) : (
        <>
          <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
            {CONTENT_STATUS_FILTERS.map((key) => {
              const active = key === filter;
              return (
                <Link
                  key={key}
                  href={key === "all" ? "/my-content" : `/my-content?status=${key}`}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white"
                      : "rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 hover:border-slate-300"
                  }
                >
                  {STATUS_FILTER_LABELS[key]} ({counts[key]})
                </Link>
              );
            })}
          </nav>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-600">
              No {STATUS_FILTER_LABELS[filter].toLowerCase()} lessons yet.
            </div>
          ) : (
            <ul className="grid gap-3">
              {visible.map((item) => (
                <li key={item.id} className="grid gap-3 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <Link
                    href={`/my-content/${item.kind === "exercise" ? "exercises" : "lessons"}/${item.id}/edit`}
                    className="flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-bold text-slate-900">{item.title || (item.kind === "exercise" ? "Untitled exercise" : "Untitled lesson")}</span>
                        <ContentSourceBadge source="user" />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.kind} · {item.lifecycleStatus} · updated {new Date(item.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-blue-700">Edit →</span>
                  </Link>
                  <ContentRowActions contentId={item.id} kind={item.kind} status={item.lifecycleStatus} revision={item.draftRevision} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </PageShell>
  );
}
