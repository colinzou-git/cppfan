// #488 GAP B: owner-scoped exercise groups. A user-created exercise's payload
// `groupId` may point at one of these custom flat groups (or a native exercise
// group). RLS keeps every row owner-private; these reads/writes never leak.
import { createClient } from "@/lib/supabase/server";

export type UserExerciseGroup = {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

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

/** The signed-in owner's custom exercise groups, ordered for display. */
export async function getMyExerciseGroups(): Promise<UserExerciseGroup[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const { data, error } = await supabase
    .from("user_exercise_groups")
    .select("id,name,description,order_index,created_at,updated_at")
    .eq("user_id", user.id)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) {
    return [];
  }
  return (data as Row[]).map(toGroup);
}
