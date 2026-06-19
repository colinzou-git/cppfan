export type BitTraceFixture = {
  id: string;
  title: string;
  expression: string;
  rows: Array<{
    label: string;
    bits: string;
    note: string;
  }>;
  textDescription: string;
};

export type CoordinatePoint = {
  label: string;
  x: number;
  y: number;
};

export type CoordinateDiagramFixture = {
  id: string;
  title: string;
  ascii: string;
  points: CoordinatePoint[];
  textDescription: string;
  result: string;
};

export const bitTraceFixtures = {
  testBit: {
    id: "test-bit-44",
    title: "Testing bit 3 of x = 44",
    expression: "(x >> 3) & 1",
    rows: [
      { label: "x", bits: "0 0 1 0 1 1 0 0", note: "44 in 8-bit binary" },
      { label: "x >> 3", bits: "0 0 0 0 0 1 0 1", note: "shift bit 3 down to bit 0" },
      { label: "& 1", bits: "0 0 0 0 0 0 0 1", note: "mask all but the lowest bit" }
    ],
    textDescription:
      "44 is 00101100 in binary. Shifting right by 3 gives 00000101, and masking with 1 isolates the low bit, so bit 3 is set."
  },
  xorToggle: {
    id: "xor-toggle-flag",
    title: "Toggling a flag with XOR",
    expression: "mask ^ (1 << 2)",
    rows: [
      { label: "mask", bits: "0 0 0 0 1 0 1 1", note: "flags 0, 1, and 3 are on" },
      { label: "1 << 2", bits: "0 0 0 0 0 1 0 0", note: "target only flag 2" },
      { label: "result", bits: "0 0 0 0 1 1 1 1", note: "XOR flips flag 2 and leaves the rest" }
    ],
    textDescription:
      "XOR with a one-bit mask flips only that bit. Here flag 2 changes from 0 to 1 while flags 0, 1, and 3 stay on."
  }
} satisfies Record<string, BitTraceFixture>;

export const coordinateDiagramFixtures = {
  orientation: {
    id: "orientation-left-turn",
    title: "Orientation from a coordinate diagram",
    ascii: "y\n4 |        C(2,3)\n3 |      *\n2 |\n1 | A(0,0) ---- B(4,1)\n0 | *              *\n  +-------------------- x",
    points: [
      { label: "A", x: 0, y: 0 },
      { label: "B", x: 4, y: 1 },
      { label: "C", x: 2, y: 3 }
    ],
    textDescription:
      "Point A is at (0,0), B is at (4,1), and C is above the directed segment from A to B at (2,3).",
    result: "cross(B - A, C - A) = 4*3 - 1*2 = 10, so C is a counter-clockwise left turn."
  },
  segmentIntersection: {
    id: "segment-intersection-crossing",
    title: "Two segments that properly cross",
    ascii: "D(4,0) *------* C(4,4)\n        \\    /\n         \\  /\n          \\/\n          /\\\n         /  \\\nA(0,0) *------* B(0,4)",
    points: [
      { label: "A", x: 0, y: 0 },
      { label: "B", x: 0, y: 4 },
      { label: "C", x: 4, y: 4 },
      { label: "D", x: 4, y: 0 }
    ],
    textDescription:
      "Segment AC runs from the lower-left point to the upper-right point; segment DB runs from the lower-right point to the upper-left point. They cross in the middle.",
    result:
      "The orientation signs differ for each segment's endpoints relative to the other segment, so this is a proper intersection."
  }
} satisfies Record<string, CoordinateDiagramFixture>;

export function bitFixtureText(id: keyof typeof bitTraceFixtures): string {
  const fixture = bitTraceFixtures[id];
  const rows = fixture.rows.map((row) => `${row.label.padEnd(8)} ${row.bits}  ${row.note}`).join("\n");
  return `Bit row:\n\n\`\`\`text\n${rows}\n\`\`\`\n\nText equivalent: ${fixture.textDescription}`;
}

export function coordinateFixtureText(id: keyof typeof coordinateDiagramFixtures): string {
  const fixture = coordinateDiagramFixtures[id];
  return `Coordinate diagram:\n\n\`\`\`text\n${fixture.ascii}\n\`\`\`\n\nText equivalent: ${fixture.textDescription}\n\nResult: ${fixture.result}`;
}
