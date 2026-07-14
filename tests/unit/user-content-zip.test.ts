import { describe, expect, it } from "vitest";
import { createStoreZip, crc32 } from "@/features/user-content/zip";
import { buildUserContentZip } from "@/features/user-content/user-content-export";
import type { UserContentExport } from "@/features/user-content/user-content-export";

// Minimal reader for stored (method 0) ZIP entries — walks local file headers.
function readStoreZip(buf: Uint8Array): Array<{ name: string; text: string }> {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const dec = new TextDecoder();
  const out: Array<{ name: string; text: string }> = [];
  let i = 0;
  while (i + 4 <= buf.length && dv.getUint32(i, true) === 0x04034b50) {
    const size = dv.getUint32(i + 22, true);
    const nameLen = dv.getUint16(i + 26, true);
    const extraLen = dv.getUint16(i + 28, true);
    const name = dec.decode(buf.slice(i + 30, i + 30 + nameLen));
    const dataStart = i + 30 + nameLen + extraLen;
    out.push({ name, text: dec.decode(buf.slice(dataStart, dataStart + size)) });
    i = dataStart + size;
  }
  return out;
}

describe("zip (#487)", () => {
  it("computes the standard CRC-32 check value", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array(0))).toBe(0);
  });

  it("produces a readable stored archive with the ZIP signatures", () => {
    const enc = new TextEncoder();
    const zip = createStoreZip([
      { name: "a.txt", data: enc.encode("alpha") },
      { name: "b.txt", data: enc.encode("beta") }
    ]);
    // local file header signature
    expect([zip[0], zip[1], zip[2], zip[3]]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    // end-of-central-directory signature at the tail
    const tail = zip.slice(zip.length - 22, zip.length - 18);
    expect([...tail]).toEqual([0x50, 0x4b, 0x05, 0x06]);

    const entries = readStoreZip(zip);
    expect(entries.map((e) => e.name)).toEqual(["a.txt", "b.txt"]);
    expect(entries[0].text).toBe("alpha");
    expect(entries[1].text).toBe("beta");
  });
});

describe("buildUserContentZip (#487)", () => {
  it("packages a manifest.json and a lesson.md", () => {
    const data: UserContentExport = {
      exportSchemaVersion: 1,
      exportedAt: "2026-07-14T00:00:00Z",
      item: {
        id: "c1",
        kind: "lesson",
        title: "Refs",
        lifecycleStatus: "published",
        nativeModuleId: null,
        draftRevision: 1,
        updatedAt: "2026-07-14T00:00:00Z",
        publishedAt: "2026-07-14T00:00:00Z"
      },
      draftPayload: null,
      publishedPayload: null,
      markdown: "# Refs\n\nA reference is an alias."
    };
    const entries = readStoreZip(buildUserContentZip(data));
    expect(entries.map((e) => e.name)).toEqual(["manifest.json", "lesson.md"]);
    expect(JSON.parse(entries[0].text).exportSchemaVersion).toBe(1);
    expect(entries[1].text).toContain("A reference is an alias.");
  });
});
