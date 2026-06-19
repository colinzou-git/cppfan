export type GraphFixture = {
  id: string;
  title: string;
  ascii: string;
  textDescription: string;
  nodes: string[];
  edges: Array<readonly [string, string, number?]>;
};

export const graphTraceFixtures = {
  messageRoute: {
    id: "message-route",
    title: "Unweighted message route",
    ascii: "0 -- 1 -- 3 -- 4\n|         /\n2 -------",
    textDescription:
      "Undirected unweighted graph: 0 connects to 1 and 2; 1 connects to 3; 2 connects to 3; 3 connects to 4.",
    nodes: ["0", "1", "2", "3", "4"],
    edges: [
      ["0", "1"],
      ["0", "2"],
      ["1", "3"],
      ["2", "3"],
      ["3", "4"]
    ],
    start: "0",
    target: "4",
    expectedPath: ["0", "1", "3", "4"]
  },
  weightedRoads: {
    id: "weighted-roads",
    title: "Weighted road network",
    ascii: "A --2-- B --1-- C\n \\      |       \n  5     2       \n   \\    |       \n      D --1-- C",
    textDescription:
      "Undirected weighted graph: A-B has weight 2, A-D has weight 5, B-D has weight 2, B-C has weight 1, and D-C has weight 1.",
    nodes: ["A", "B", "C", "D"],
    edges: [
      ["A", "B", 2],
      ["A", "D", 5],
      ["B", "D", 2],
      ["B", "C", 1],
      ["D", "C", 1]
    ],
    mstEdges: [
      ["B", "C"],
      ["D", "C"],
      ["A", "B"]
    ],
    mstTotal: 4
  }
} satisfies Record<string, GraphFixture & Record<string, unknown>>;

export function graphFixtureText(id: keyof typeof graphTraceFixtures): string {
  const fixture = graphTraceFixtures[id];
  return `Diagram:\n\n\`\`\`text\n${fixture.ascii}\n\`\`\`\n\nText equivalent: ${fixture.textDescription}`;
}
