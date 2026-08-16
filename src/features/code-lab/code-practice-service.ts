import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { getLearningItemWithDetails } from "@/features/learning-items/learning-item-queries";
import { isUserLearningItemId } from "@/features/user-content/user-content-id";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import type {
  CodePractice,
  CodePracticeServiceResult,
  LessonPracticeContext
} from "./code-practice-types";

type PracticeRow = {
  id: string;
  learning_item_id: string;
  name: string;
  source_code: string;
  language: string;
  skill_ids: string[] | null;
  content_version_id: string | null;
  lesson_source_version: string;
  standard_source_code_snapshot: string;
  created_at: string;
  updated_at: string;
};

const PRACTICE_COLUMNS =
  "id,learning_item_id,name,source_code,language,skill_ids,content_version_id,lesson_source_version,standard_source_code_snapshot,created_at,updated_at";

function rowToPractice(row: PracticeRow): CodePractice {
  return {
    id: row.id,
    itemId: row.learning_item_id,
    name: row.name,
    sourceCode: row.source_code,
    language: "cpp",
    skillIds: row.skill_ids ?? [],
    contentVersionId: row.content_version_id,
    lessonSourceVersion: row.lesson_source_version,
    standardSourceCodeSnapshot: row.standard_source_code_snapshot,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function deriveLessonSourceVersion(updatedAt: string | null | undefined, source: string): string {
  if (updatedAt) return `updated:${updatedAt}`;
  return `sha256:${createHash("sha256").update(source).digest("hex")}`;
}

/**
 * Server-authoritative v1 eligibility for explicit saved practices (#674).
 * Only native/generated lesson Code Labs participate. Exercises, labs,
 * interviews, worked examples, and user-created content stay disabled even if
 * they reuse the generic Code Lab component.
 */
export async function resolveLessonPracticeContext(
  itemId: string
): Promise<CodePracticeServiceResult<LessonPracticeContext>> {
  if (isUserLearningItemId(itemId)) return { status: "not_eligible" };

  const result = await getLearningItemWithDetails(itemId);
  if (result.status === "error") return { status: "unavailable" };
  if (result.status !== "ok") return { status: "not_found" };
  if (result.data.item.type !== "lesson") return { status: "not_eligible" };

  const config = getCodeLabConfigForItem(itemId);
  if (!config || config.language !== "cpp") return { status: "not_eligible" };

  const skillIds = result.data.skills.map((mapping) => mapping.skill_id);
  const authoritativeSkills = skillIds.length > 0 ? skillIds : (config.skillTags ?? []);

  return {
    status: "ok",
    data: {
      itemId,
      skillIds: authoritativeSkills,
      currentStandardSource: config.starterCode,
      lessonSourceVersion: deriveLessonSourceVersion(result.data.item.updated_at, config.starterCode),
      contentVersionId: null
    }
  };
}

async function auth() {
  const supabase = await createClient();
  if (!supabase) return { status: "unavailable" as const };
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed_out" as const };
  return { status: "ok" as const, supabase, userId: user.id };
}

function logFailure(operation: string, error: { code?: string | null } | null) {
  if (error && !isMissingObjectError(error)) {
    console.error(`[code-practice] ${operation} failed (code=${error.code ?? "none"})`);
  }
}

export async function listCodePractices(
  itemId: string
): Promise<CodePracticeServiceResult<CodePractice[]>> {
  const session = await auth();
  if (session.status !== "ok") return { status: session.status };

  const context = await resolveLessonPracticeContext(itemId);
  if (context.status !== "ok") return context;

  const { data, error } = await session.supabase
    .from("code_lab_practices")
    .select(PRACTICE_COLUMNS)
    .eq("user_id", session.userId)
    .eq("learning_item_id", itemId)
    .order("updated_at", { ascending: false });

  if (error) {
    logFailure("list", error);
    return { status: "unavailable" };
  }
  return { status: "ok", data: ((data ?? []) as PracticeRow[]).map(rowToPractice) };
}

export async function createCodePractice(input: {
  itemId: string;
  name: string;
  source: string;
}): Promise<CodePracticeServiceResult<CodePractice>> {
  const session = await auth();
  if (session.status !== "ok") return { status: session.status };

  const context = await resolveLessonPracticeContext(input.itemId);
  if (context.status !== "ok") return context;

  const { data, error } = await session.supabase
    .from("code_lab_practices")
    .insert({
      user_id: session.userId,
      learning_item_id: input.itemId,
      name: input.name,
      source_code: input.source,
      language: "cpp",
      skill_ids: context.data.skillIds,
      content_version_id: context.data.contentVersionId,
      lesson_source_version: context.data.lessonSourceVersion,
      standard_source_code_snapshot: context.data.currentStandardSource
    })
    .select(PRACTICE_COLUMNS)
    .single();

  if (error || !data) {
    logFailure("create", error);
    return { status: "unavailable" };
  }
  return { status: "ok", data: rowToPractice(data as PracticeRow) };
}

export async function updateCodePractice(input: {
  practiceId: string;
  name?: string;
  source?: string;
}): Promise<CodePracticeServiceResult<CodePractice>> {
  const session = await auth();
  if (session.status !== "ok") return { status: session.status };

  const { data: existing, error: readError } = await session.supabase
    .from("code_lab_practices")
    .select(PRACTICE_COLUMNS)
    .eq("id", input.practiceId)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (readError) {
    logFailure("update read", readError);
    return { status: "unavailable" };
  }
  if (!existing) return { status: "not_found" };

  const row = existing as PracticeRow;
  const context = await resolveLessonPracticeContext(row.learning_item_id);
  if (context.status !== "ok") return context;

  const changes: Record<string, string> = {};
  if (input.name !== undefined) changes.name = input.name;
  if (input.source !== undefined) changes.source_code = input.source;

  const { data, error } = await session.supabase
    .from("code_lab_practices")
    .update(changes)
    .eq("id", input.practiceId)
    .eq("user_id", session.userId)
    .select(PRACTICE_COLUMNS)
    .single();

  if (error || !data) {
    logFailure("update", error);
    return { status: "unavailable" };
  }
  return { status: "ok", data: rowToPractice(data as PracticeRow) };
}

export async function deleteCodePractice(
  practiceId: string
): Promise<CodePracticeServiceResult<{ id: string }>> {
  const session = await auth();
  if (session.status !== "ok") return { status: session.status };

  const { data, error } = await session.supabase
    .from("code_lab_practices")
    .delete()
    .eq("id", practiceId)
    .eq("user_id", session.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    logFailure("delete", error);
    return { status: "unavailable" };
  }
  if (!data) return { status: "not_found" };
  return { status: "ok", data: { id: data.id as string } };
}
