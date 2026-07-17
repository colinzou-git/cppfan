import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PersonalMockPacks } from "@/features/interview/personal-mock-packs";
import type { ReconciledPersonalMockPack } from "@/features/interview/personal-mock-pack-store";

function pack(over: Partial<ReconciledPersonalMockPack>): ReconciledPersonalMockPack {
  return {
    id: "p1",
    title: "My pack",
    items: [],
    reconciliation: { ok: [], unavailable: [], versionChanged: [] },
    ...over
  };
}

describe("PersonalMockPacks (#613)", () => {
  it("renders nothing when there are no packs", () => {
    const { container } = render(<PersonalMockPacks packs={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("lists ok items with a source badge and a problem-specific link", () => {
    render(
      <PersonalMockPacks
        packs={[
          pack({
            reconciliation: {
              ok: [
                { problemId: "native-1", source: "native", title: "Native One" },
                { problemId: "user.item.a", source: "user", title: "Custom A", contentVersionId: "v2" }
              ],
              unavailable: [],
              versionChanged: []
            }
          })
        ]}
      />
    );
    expect(screen.getByText("Native One").getAttribute("href")).toBe("/interview/session?problem=native-1");
    expect(screen.getByText("Custom A").getAttribute("href")).toBe("/interview/session?problem=user.item.a");
    expect(screen.getByText("Custom")).toBeTruthy();
    expect(screen.queryByTestId("personal-mock-pack-attention")).toBeNull();
  });

  it("flags unavailable + version-changed items as needing attention", () => {
    render(
      <PersonalMockPacks
        packs={[
          pack({
            reconciliation: {
              ok: [],
              unavailable: [{ problemId: "user.item.gone", source: "user", contentVersionId: "v1" }],
              versionChanged: [
                { selection: { problemId: "user.item.a", source: "user", contentVersionId: "v1" }, currentVersionId: "v2", title: "Custom A" }
              ]
            }
          })
        ]}
      />
    );
    expect(screen.getByTestId("personal-mock-pack-attention").textContent).toMatch(/2 item\(s\) need attention/i);
  });
});
