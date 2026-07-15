import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { getContentItemForOwner, getExerciseForOwner } from "@/features/user-content/user-content-queries";
import {
  addExternalAttachment,
  archiveContent,
  deleteContent,
  publishContent,
  removeAttachment,
  publishExercise,
  restoreVersionAsDraft,
  saveExerciseDraft,
  saveLessonDraft,
  setAttachmentVisibility
} from "@/features/user-content/user-content-actions";
import { CURRENT_LESSON_SCHEMA_VERSION, type LessonPayload } from "@/features/user-content/user-content-types";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/features/user-content/user-content-queries", () => ({ getContentItemForOwner: vi.fn(), getExerciseForOwner: vi.fn() }));

const mockedCreate = vi.mocked(createClient);
const mockedDetail = vi.mocked(getContentItemForOwner);
const mockedExercise = vi.mocked(getExerciseForOwner);

function rpcClient(impl: (fn: string, args: Record<string, unknown>) => { data?: unknown; error?: unknown }) {
  return { rpc: vi.fn(async (fn: string, args: Record<string, unknown>) => impl(fn, args)) } as unknown as NonNullable<
    Awaited<ReturnType<typeof createClient>>
  >;
}

const validPayload = { itemType: "lesson", title: "T", content: "C", explanation: "E" };

beforeEach(() => {
  vi.clearAllMocks();
  mockedCreate.mockResolvedValue(null);
});

describe("saveLessonDraft (#487)", () => {
  it("rejects an invalid payload before touching the backend", async () => {
    const result = await saveLessonDraft({ title: "", payload: { itemType: "lesson", title: "", content: "", explanation: "" } });
    expect(result.status).toBe("invalid");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("reports unconfigured when there is no backend", async () => {
    const result = await saveLessonDraft({ title: "T", payload: validPayload });
    expect(result.status).toBe("unconfigured");
  });

  it("returns the RPC result on success", async () => {
    mockedCreate.mockResolvedValue(
      rpcClient(() => ({
        data: [{ content_id: "c1", draft_version_id: "v1", revision: 1, saved_at: "2026-01-01T00:00:00Z" }],
        error: null
      }))
    );
    const result = await saveLessonDraft({ title: "T", payload: validPayload });
    expect(result).toMatchObject({ status: "ok", contentId: "c1", draftVersionId: "v1", revision: 1 });
  });

  it("maps a 40001 error to a conflict", async () => {
    mockedCreate.mockResolvedValue(rpcClient(() => ({ data: null, error: { code: "40001" } })));
    const result = await saveLessonDraft({ contentId: "c1", title: "T", expectedRevision: 1, payload: validPayload });
    expect(result.status).toBe("conflict");
  });
});

describe("saveExerciseDraft (#488)", () => {
  const validExercise = { title: "Reverse", prompt: "Reverse a line.", mode: "stdin_program", evaluationMode: "self_evaluation" };

  it("rejects an invalid exercise payload before touching the backend", async () => {
    const result = await saveExerciseDraft({ title: "", payload: { prompt: "p" } });
    expect(result.status).toBe("invalid");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("reports unconfigured when there is no backend", async () => {
    const result = await saveExerciseDraft({ title: "Reverse", payload: validExercise });
    expect(result.status).toBe("unconfigured");
  });

  it("stamps kind = exercise and returns the RPC result", async () => {
    let seenKind: unknown;
    mockedCreate.mockResolvedValue(
      rpcClient((_fn, args) => {
        seenKind = args.p_kind;
        return { data: [{ content_id: "e1", draft_version_id: "v1", revision: 1, saved_at: "2026-01-01T00:00:00Z" }], error: null };
      })
    );
    const result = await saveExerciseDraft({ title: "Reverse", payload: validExercise });
    expect(seenKind).toBe("exercise");
    expect(result).toMatchObject({ status: "ok", contentId: "e1", revision: 1 });
  });
});

describe("publishExercise (#488)", () => {
  function exerciseDetail(evaluationMode: "self_evaluation" | "automated_tests", withTests = false): Awaited<ReturnType<typeof getExerciseForOwner>> {
    return {
      id: "e1",
      kind: "exercise",
      title: "Reverse",
      lifecycleStatus: "draft",
      recommendationEnabled: true,
      draftRevision: 1,
      updatedAt: "2026-01-01T00:00:00Z",
      publishedAt: null,
      nativeModuleId: null,
      draftPayload: {
        schemaVersion: 1,
        title: "Reverse",
        prompt: "Reverse a line.",
        mode: "stdin_program" as const,
        evaluationMode,
        ...(withTests ? { tests: [{ name: "t", input: "", expectedOutput: "", hidden: false }] } : {})
      },
      publishedPayload: null
    };
  }

  it("blocks publishing when automated evaluation has no tests", async () => {
    mockedExercise.mockResolvedValue(exerciseDetail("automated_tests"));
    const result = await publishExercise({ contentId: "e1" });
    expect(result.status).toBe("invalid");
  });

  it("restores an exercise version through the exercise draft path", async () => {
    mockedDetail.mockResolvedValue({ kind: "exercise" } as Awaited<ReturnType<typeof getContentItemForOwner>>);
    let seenKind: unknown;
    mockedCreate.mockResolvedValue({
      rpc: vi.fn(async (_fn: string, args: Record<string, unknown>) => {
        seenKind = args.p_kind;
        return { data: [{ content_id: "e1", draft_version_id: "v2", revision: 2, saved_at: "2026-01-01T00:00:00Z" }], error: null };
      }),
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { payload: { title: "Reverse", prompt: "P", mode: "stdin_program", evaluationMode: "self_evaluation" } },
                error: null
              })
            })
          })
        })
      })
    } as unknown as NonNullable<Awaited<ReturnType<typeof createClient>>>);

    const result = await restoreVersionAsDraft({ contentId: "e1", versionNumber: 1, expectedRevision: 1 });
    expect(seenKind).toBe("exercise");
    expect(result.status).toBe("ok");
  });

  it("publishes a valid exercise via the shared RPC", async () => {
    mockedExercise.mockResolvedValue(exerciseDetail("self_evaluation"));
    mockedCreate.mockResolvedValue(
      rpcClient(() => ({
        data: [{ out_content_id: "e1", out_skill_id: "user.skill.e1", out_learning_item_id: "user.item.e1", out_version_number: 1 }],
        error: null
      }))
    );
    const result = await publishExercise({ contentId: "e1" });
    expect(result).toMatchObject({ status: "ok", learningItemId: "user.item.e1", skillId: "user.skill.e1" });
  });
});

describe("publishContent (#487)", () => {
  function detail(overrides: Partial<LessonPayload>): Awaited<ReturnType<typeof getContentItemForOwner>> {
    return {
      id: "c1",
      kind: "lesson",
      title: "T",
      lifecycleStatus: "draft",
      recommendationEnabled: true,
      draftRevision: 1,
      updatedAt: "2026-01-01T00:00:00Z",
      publishedAt: null,
      nativeModuleId: null,
      publishedPayload: null,
      draftPayload: {
        schemaVersion: CURRENT_LESSON_SCHEMA_VERSION,
        itemType: "lesson",
        title: "T",
        content: "C",
        explanation: "E",
        ...overrides
      }
    };
  }

  it("blocks publishing a draft that fails type-specific validation", async () => {
    mockedDetail.mockResolvedValue(detail({ itemType: "multiple_choice", choices: [] }));
    const result = await publishContent({ contentId: "c1" });
    expect(result.status).toBe("invalid");
  });

  it("publishes a valid draft and returns the projected ids", async () => {
    mockedDetail.mockResolvedValue(detail({}));
    mockedCreate.mockResolvedValue(
      rpcClient(() => ({
        data: [{ out_content_id: "c1", out_skill_id: "user.skill.c1", out_learning_item_id: "user.item.c1", out_version_number: 1 }],
        error: null
      }))
    );
    const result = await publishContent({ contentId: "c1", expectedRevision: 1 });
    expect(result).toMatchObject({ status: "ok", skillId: "user.skill.c1", learningItemId: "user.item.c1", versionNumber: 1 });
  });

  it("reports not_found when the item is not visible but the backend is configured", async () => {
    mockedDetail.mockResolvedValue(null);
    mockedCreate.mockResolvedValue(rpcClient(() => ({ data: null, error: null })));
    const result = await publishContent({ contentId: "missing" });
    expect(result.status).toBe("not_found");
  });
});

describe("lifecycle actions (#487)", () => {
  it("archive/delete report unconfigured without a backend", async () => {
    expect((await archiveContent("c1")).status).toBe("unconfigured");
    expect((await deleteContent("c1", "delete_all")).status).toBe("unconfigured");
  });

  it("rejects a bad delete mode", async () => {
    const result = await deleteContent("c1", "nuke" as unknown as "delete_all");
    expect(result.status).toBe("error");
  });

  it("returns ok when the RPC succeeds", async () => {
    mockedCreate.mockResolvedValue(rpcClient(() => ({ error: null })));
    expect((await archiveContent("c1")).status).toBe("ok");
  });
});

describe("attachment actions (#487)", () => {
  it("validates external URLs and lesson refs before the backend", async () => {
    expect((await addExternalAttachment({ contentId: "c1", kind: "url", visibility: "author_source", externalUrl: "http://x" })).status).toBe("invalid");
    expect((await addExternalAttachment({ contentId: "c1", kind: "lesson_ref", visibility: "author_source" })).status).toBe("invalid");
    expect((await addExternalAttachment({ contentId: "c1", kind: "bogus" as unknown as "url", visibility: "author_source" })).status).toBe("invalid");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("reports unconfigured, then returns the new id on success", async () => {
    expect((await addExternalAttachment({ contentId: "c1", kind: "url", visibility: "learner_resource", externalUrl: "https://ok.example" })).status).toBe("unconfigured");
    mockedCreate.mockResolvedValue(rpcClient(() => ({ data: "att-1", error: null })));
    const result = await addExternalAttachment({ contentId: "c1", kind: "url", visibility: "learner_resource", externalUrl: "https://ok.example" });
    expect(result).toMatchObject({ status: "ok", attachmentId: "att-1" });
  });

  it("guards visibility and delete inputs", async () => {
    expect((await setAttachmentVisibility("a1", "bad" as unknown as "author_source")).status).toBe("error");
    expect((await removeAttachment("")).status).toBe("error");
    expect((await removeAttachment("a1")).status).toBe("unconfigured");
  });
});
