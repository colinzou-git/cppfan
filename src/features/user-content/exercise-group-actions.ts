"use server";

// #488 GAP B: create/rename/reorder/delete owner-owned exercise groups. RLS
// gates every row on auth.uid() = user_id, so a mutation for another user's row
// simply matches nothing. Deleting a group does not touch any exercise payload
// (versioned snapshots are immutable) — a dangling groupId reads as ungrouped.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EXERCISE_LIMITS } from "./exercise-content-types";
import type { UserExerciseGroup } from "./exercise-group-queries";

export type GroupMutationResult =
  | { status: "ok"; group: UserExerciseGroup }
  | { status: "invalid" }
  | { status: "unconfigured" }
  | { status: "not_found" }
  | { status: "error" };

export type GroupDeleteResult =
  | { status: "ok" }
  | { status: "unconfigured" }
  | { status: "error" };

const NAME_MAX = EXERCISE_LIMITS.titleMaxLength;
const DESC_MAX = EXERCISE_LIMITS.fieldMaxLength;

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > NAME_MAX) return null;
  return trimmed;
}

function cleanDescription(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, DESC_MAX);
}

type Row = {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

function toGroup(row: Row): UserExerciseGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const SELECT = "id,name,description,order_index,created_at,updated_at";

export async function createExerciseGroup(input: {
  name: string;
  description?: string | null;
  orderIndex?: number;
}): Promise<GroupMutationResult> {
  const name = cleanName(input?.name);
  if (!name) {
    return { status: "invalid" };
  }
  const supabase = await createClient();
  if (!supabase) {
    return { status: "unconfigured" };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "unconfigured" };
  }
  const { data, error } = await supabase
    .from("user_exercise_groups")
    .insert({
      user_id: user.id,
      name,
      description: cleanDescription(input?.description),
      order_index: Number.isFinite(input?.orderIndex) ? Number(input?.orderIndex) : 0
    })
    .select(SELECT)
    .single();
  if (error || !data) {
    return { status: "error" };
  }
  revalidatePath("/my-content");
  return { status: "ok", group: toGroup(data as Row) };
}

export async function renameExerciseGroup(input: {
  id: string;
  name?: string;
  description?: string | null;
  orderIndex?: number;
}): Promise<GroupMutationResult> {
  if (typeof input?.id !== "string" || input.id.length === 0) {
    return { status: "invalid" };
  }
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) {
    const name = cleanName(input.name);
    if (!name) {
      return { status: "invalid" };
    }
    patch.name = name;
  }
  if (input.description !== undefined) {
    patch.description = cleanDescription(input.description);
  }
  if (input.orderIndex !== undefined) {
    if (!Number.isFinite(input.orderIndex)) {
      return { status: "invalid" };
    }
    patch.order_index = Number(input.orderIndex);
  }
  const supabase = await createClient();
  if (!supabase) {
    return { status: "unconfigured" };
  }
  const { data, error } = await supabase
    .from("user_exercise_groups")
    .update(patch)
    .eq("id", input.id)
    .select(SELECT)
    .maybeSingle();
  if (error) {
    return { status: "error" };
  }
  if (!data) {
    return { status: "not_found" };
  }
  revalidatePath("/my-content");
  return { status: "ok", group: toGroup(data as Row) };
}

export async function deleteExerciseGroup(id: string): Promise<GroupDeleteResult> {
  if (typeof id !== "string" || id.length === 0) {
    return { status: "error" };
  }
  const supabase = await createClient();
  if (!supabase) {
    return { status: "unconfigured" };
  }
  const { error } = await supabase.from("user_exercise_groups").delete().eq("id", id);
  if (error) {
    return { status: "error" };
  }
  revalidatePath("/my-content");
  return { status: "ok" };
}
