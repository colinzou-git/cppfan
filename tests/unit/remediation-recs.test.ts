import { describe, expect, it } from "vitest";
import { remediationRecsFromAttempts } from "@/features/remediation/remediation-recs";
import { OBSERVE_THRESHOLD } from "@/features/remediation/error-tags";

// Observed-misconception remediation from recent wrong attempts (#126). Uses the
// real seeded choice->tag mapping: the references mc_init distractors b/c/d map to
// cpp.references.copy_vs_alias.
const WRONG_REF = "cpp.references.references.mc_init.b";
const WRONG_REF_2 = "cpp.references.references.mc_init.c";
const REF_ITEM = "cpp.references.references.mc_init";

describe("remediationRecsFromAttempts (#126)", () => {
  it("does not surface a tag below the observe threshold", () => {
    const recs = remediationRecsFromAttempts([{ learning_item_id: REF_ITEM, selected_choice_id: WRONG_REF }]);
    expect(recs).toEqual([]);
  });

  it("surfaces a misconception once it reaches the threshold, with a reason and item", () => {
    const attempts = Array.from({ length: OBSERVE_THRESHOLD }, () => ({
      learning_item_id: REF_ITEM,
      selected_choice_id: WRONG_REF
    }));
    const recs = remediationRecsFromAttempts(attempts);
    expect(recs.length).toBe(1);
    expect(recs[0].tag).toBe("cpp.references.copy_vs_alias");
    expect(recs[0].reason).toMatch(/missed/i);
    expect(recs[0].itemId).toBe(REF_ITEM);
  });

  it("counts distinct wrong choices of the same tag toward the threshold", () => {
    const recs = remediationRecsFromAttempts([
      { learning_item_id: REF_ITEM, selected_choice_id: WRONG_REF },
      { learning_item_id: REF_ITEM, selected_choice_id: WRONG_REF_2 }
    ]);
    expect(recs.length).toBe(1);
  });

  it("ignores unmapped or null choices", () => {
    const recs = remediationRecsFromAttempts([
      { learning_item_id: "x", selected_choice_id: "not.a.mapped.choice" },
      { learning_item_id: "x", selected_choice_id: null },
      { learning_item_id: "x", selected_choice_id: "another.unmapped" }
    ]);
    expect(recs).toEqual([]);
  });
});
