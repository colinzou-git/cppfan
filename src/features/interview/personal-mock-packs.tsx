import Link from "next/link";
import { interviewSessionHref } from "./interview-planning-candidates";
import type { ReconciledPersonalMockPack } from "./personal-mock-pack-store";

/**
 * Renders the learner's personal mock packs (#613) with a source badge per item
 * and an explicit "needs attention" note for items that became unavailable or
 * whose published version changed — never silently substituting a problem.
 */
export function PersonalMockPacks({ packs }: { packs: ReconciledPersonalMockPack[] }) {
  if (packs.length === 0) return null;

  return (
    <section className="grid gap-3" data-testid="personal-mock-packs" aria-label="Your mock packs">
      <h2 className="text-sm font-black text-slate-900">Your mock packs</h2>
      {packs.map((pack) => {
        const attention = [...pack.reconciliation.unavailable, ...pack.reconciliation.versionChanged.map((v) => v.selection)];
        return (
          <div key={pack.id} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3" data-testid="personal-mock-pack">
            <p className="font-bold text-slate-900">{pack.title}</p>
            <ul className="grid gap-1">
              {pack.reconciliation.ok.map((item) => (
                <li key={item.problemId} className="flex items-center gap-2 text-sm">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      item.source === "user" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.source === "user" ? "Custom" : "Native"}
                  </span>
                  <Link href={interviewSessionHref(item.problemId)} className="font-semibold text-blue-700 hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
            {attention.length > 0 ? (
              <div
                className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800"
                data-testid="personal-mock-pack-attention"
              >
                {attention.length} item(s) need attention — a problem is no longer available or changed version; re-add it at the
                current version.
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
