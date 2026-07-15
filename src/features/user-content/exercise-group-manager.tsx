"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createExerciseGroup, renameExerciseGroup, deleteExerciseGroup } from "./exercise-group-actions";
import type { UserExerciseGroup } from "./exercise-group-queries";

type Group = Pick<UserExerciseGroup, "id" | "name">;

/**
 * #488 GAP B: a compact owner panel to create/rename/delete custom exercise
 * groups. Deleting a group never touches an exercise's stored group assignment —
 * a dangling groupId reads as "Your exercises" in the catalog.
 */
export function ExerciseGroupManager({ initialGroups }: { initialGroups: Group[] }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate() {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    setError(null);
    const result = await createExerciseGroup({ name });
    setBusy(false);
    if (result.status === "ok") {
      setGroups((prev) => [...prev, { id: result.group.id, name: result.group.name }]);
      setNewName("");
    } else {
      setError(result.status === "invalid" ? "Enter a group name." : "Could not create the group.");
    }
  }

  async function onRename(id: string, current: string) {
    const next = window.prompt("Rename group", current);
    if (next === null) return;
    const name = next.trim();
    if (!name || name === current) return;
    const result = await renameExerciseGroup({ id, name });
    if (result.status === "ok") {
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name: result.group.name } : g)));
    } else {
      setError("Could not rename the group.");
    }
  }

  async function onDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? Exercises in it become ungrouped.`)) return;
    const result = await deleteExerciseGroup(id);
    if (result.status === "ok") {
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } else {
      setError("Could not delete the group.");
    }
  }

  return (
    <section
      className="grid gap-3 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm"
      data-testid="exercise-group-manager"
      aria-label="Manage exercise groups"
    >
      <div>
        <h2 className="text-lg font-black text-slate-900">Exercise groups</h2>
        <p className="text-xs text-slate-500">Organise your exercises. Assign each exercise to a group in its editor.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
          placeholder="New group name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void onCreate();
            }
          }}
          data-testid="exercise-group-new-name"
          maxLength={200}
        />
        <Button type="button" onClick={() => void onCreate()} disabled={busy || newName.trim().length === 0}>
          Add group
        </Button>
      </div>

      {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}

      {groups.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="exercise-group-empty">
          No custom groups yet.
        </p>
      ) : (
        <ul className="grid gap-2">
          {groups.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2"
              data-testid="exercise-group-item"
            >
              <span className="truncate text-sm font-semibold text-slate-800">{g.name}</span>
              <span className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="text-xs font-bold text-blue-700 hover:underline"
                  onClick={() => void onRename(g.id, g.name)}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="text-xs font-bold text-red-600 hover:underline"
                  onClick={() => void onDelete(g.id, g.name)}
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
