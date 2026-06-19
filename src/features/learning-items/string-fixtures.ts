export type StringTraceFixture = {
  id: string;
  title: string;
  table: string;
  textDescription: string;
};

export const stringTraceFixtures = {
  naiveSearch: {
    id: "naive-search-adversarial",
    title: "Naive search mismatch trace",
    table:
      "text:    a a a a b\npattern: a a a b\nstarts:  0 1",
    textDescription:
      "Naive search tries each start. At start 0 it matches a, a, a, then mismatches pattern b against text a. It then shifts by one and repeats most comparisons at start 1."
  },
  prefixTable: {
    id: "prefix-table-ababc",
    title: "KMP prefix table for ABABC",
    table:
      "i:      0 1 2 3 4\ns[i]:   A B A B C\npi[i]:  0 0 1 2 0",
    textDescription:
      "For ABABC, the prefix table is 0, 0, 1, 2, 0. At index 3, AB is both a proper prefix and suffix of ABAB; index 4 resets to 0 because C breaks that border."
  },
  zTable: {
    id: "z-table-aabxaab",
    title: "Z-array for aabxaab",
    table:
      "i:     0 1 2 3 4 5 6\ns[i]:  a a b x a a b\nz[i]:  0 1 0 0 3 1 0",
    textDescription:
      "For aabxaab, z[4] is 3 because the substring starting at index 4 is aab, which matches the string prefix aab."
  }
} satisfies Record<string, StringTraceFixture>;

export function stringFixtureText(id: keyof typeof stringTraceFixtures): string {
  const fixture = stringTraceFixtures[id];
  return `Trace table:\n\n\`\`\`text\n${fixture.table}\n\`\`\`\n\nText equivalent: ${fixture.textDescription}`;
}
