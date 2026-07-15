"use client";

import { useState } from "react";
import { restoreVersionAsDraft } from "./user-content-actions";
import type { ContentVersionSummary } from "./user-content-queries";

const STATE_LABELS: Record<ContentVersionSummary["versionState"], string> = {
  draft: "Draft",
  published: "Published",
  superseded: "Superseded"
};

/**
 * Version history for a user lesson (#487). Lists the immutable version
 * snapshots and lets the owner restore any prior version as a new draft
 * (preserving history). Restoring reloads the editor so it shows the restored
 * content; publishing it is still a separate explicit action.
 */
export function VersionHistory({
  contentId,
  versions,
  currentRevision,
  onRestored
}: {
  contentId?: string;
  versions: ContentVersionSummary[];
  currentRevision: number | null;
  onRestored: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!contentId || versions.length === 0) {
    return null;
  }

  async function restore(versionNumber: number) {
    if (!contentId) {
      return;
    }
    setBusy(true);
    setMessage("");
    const result = await restoreVersionAsDraft({ contentId, versionNumber, expectedRevision: currentRevision });
    setBusy(false);
    if (result.status === "ok") {
      onRestored();
    } else if (result.status === "conflict") {
      setMessage("This lesson changed elsewhere. Reload first.");
    } else if (result.status === "unconfigured") {
      setMessage("Restoring needs a configured backend.");
    } else {
      setMessage("Could not restore that version.");
    }
  }

  return (
    <div className="grid gap-2 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
      <div className="text-sm font-bold text-amber-900">Version history</div>
      <ul className="grid gap-1.5">
        {versions.map((version) => (
          <li key={version.versionNumber} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white bg-white px-3 py-2 text-sm">
            <span className="text-slate-700">
              <span className="font-bold">v{version.versionNumber}</span>{" "}
              <span className="text-slate-400">· {STATE_LABELS[version.versionState]} · {new Date(version.publishedAt ?? version.createdAt).toLocaleString()}</span>
            </span>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50"
              disabled={busy}
              onClick={() => void restore(version.versionNumber)}
            >
              Restore as new draft
            </button>
          </li>
        ))}
      </ul>
      {message ? <span className="text-xs font-semibold text-rose-700">{message}</span> : null}
    </div>
  );
}
