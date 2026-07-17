import { describe, expect, it } from "vitest";
import {
  validateDraftItemId,
  validateDraftRequest
} from "@/features/code-lab/code-lab-request";
import { draftStorageKey } from "@/features/code-lab/use-code-draft";

// A seeded code-capable item id (has a Code Lab config).
const ITEM = "cpp.program_basics.structure.lesson";

describe("Code Lab draft request validation", () => {
  it("accepts a draft for a code-capable item, including empty source", () => {
    const full = validateDraftRequest({ itemId: ITEM, source: "int main(){}" });
    expect(full.ok).toBe(true);
    if (full.ok) expect(full.source).toBe("int main(){}");

    // Unlike a run, clearing the editor is a valid draft to persist.
    const empty = validateDraftRequest({ itemId: ITEM, source: "" });
    expect(empty.ok).toBe(true);
    if (empty.ok) expect(empty.source).toBe("");
  });

  it("rejects unknown / non-code items on write and load", () => {
    expect(validateDraftRequest({ itemId: "not.a.real.item", source: "x" }).ok).toBe(false);
    expect(validateDraftRequest({ itemId: "", source: "x" }).ok).toBe(false);
    expect(validateDraftItemId("not.a.real.item").ok).toBe(false);
    expect(validateDraftItemId(null).ok).toBe(false);
  });

  it("accepts a valid item id on load", () => {
    const parsed = validateDraftItemId(ITEM);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.itemId).toBe(ITEM);
  });

  it("rejects an oversized draft", () => {
    const huge = "x".repeat(20_001);
    expect(validateDraftRequest({ itemId: ITEM, source: huge }).ok).toBe(false);
  });

  it("namespaces the localStorage key per item", () => {
    expect(draftStorageKey(ITEM)).toBe(`cppfan:code-lab:draft:${ITEM}`);
    expect(draftStorageKey("a")).not.toBe(draftStorageKey("b"));
  });

  it("scopes the localStorage key by content version (#612)", () => {
    // No version keeps the original (native/legacy) key for recoverability.
    expect(draftStorageKey(ITEM)).toBe(`cppfan:code-lab:draft:${ITEM}`);
    expect(draftStorageKey(ITEM, "v2")).toBe(`cppfan:code-lab:draft:${ITEM}@v2`);
    // A new version cannot collide with an old version or the unversioned key.
    expect(draftStorageKey(ITEM, "v1")).not.toBe(draftStorageKey(ITEM, "v2"));
    expect(draftStorageKey(ITEM, "v1")).not.toBe(draftStorageKey(ITEM));
  });
});
