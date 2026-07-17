"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PersonalMockSelection } from "./personal-mock-pack";

export type MockComposerCandidate = {
  problemId: string;
  source: "native" | "user";
  title: string;
  contentVersionId?: string | null;
};

/**
 * Compose a personal mock pack (#613): manually select native and user-created
 * problems, name the pack, and save. A custom selection carries its immutable
 * content version so a later republish is reconciled explicitly. The save handler
 * is injected so the component is fully testable without the server action.
 */
export function PersonalMockComposer({
  candidates,
  onSave
}: {
  candidates: MockComposerCandidate[];
  onSave: (title: string, selections: PersonalMockSelection[]) => Promise<boolean>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedIds = candidates.filter((c) => checked[c.problemId]);
  const canSave = title.trim().length > 0 && selectedIds.length > 0 && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setMessage("");
    const selections: PersonalMockSelection[] = selectedIds.map((c) => ({
      problemId: c.problemId,
      source: c.source,
      contentVersionId: c.contentVersionId ?? null
    }));
    try {
      const ok = await onSave(title.trim(), selections);
      if (ok) {
        setMessage("Saved.");
        setTitle("");
        setChecked({});
        router.refresh(); // surface the new pack in the list below
      } else {
        setMessage("Could not save (sign in to keep your packs).");
      }
    } catch {
      setMessage("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3" data-testid="personal-mock-composer">
      <h2 className="text-sm font-black text-slate-900">Build your own mock pack</h2>
      <label className="grid gap-1 text-xs font-semibold text-slate-600">
        Pack name
        <input
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm font-normal text-slate-800"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Graphs + DP warmup"
          disabled={saving}
        />
      </label>
      <fieldset className="grid max-h-64 gap-1 overflow-auto" disabled={saving}>
        {candidates.map((c) => (
          <label key={c.problemId} className="flex items-center gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={Boolean(checked[c.problemId])}
              onChange={(e) => setChecked((prev) => ({ ...prev, [c.problemId]: e.target.checked }))}
            />
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                c.source === "user" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {c.source === "user" ? "Custom" : "Native"}
            </span>
            {c.title}
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        onClick={() => void save()}
        disabled={!canSave}
        className="self-start rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : `Save pack (${selectedIds.length})`}
      </button>
      {message ? <p className="text-xs font-semibold text-slate-600">{message}</p> : null}
    </section>
  );
}
