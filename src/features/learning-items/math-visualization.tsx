import { bitTraceFixtures, coordinateDiagramFixtures } from "./math-fixtures";

type MathVisualizationProps = {
  itemId: string;
};

const ITEM_VISUALS: Record<
  string,
  | { kind: "bit"; fixtureId: keyof typeof bitTraceFixtures }
  | { kind: "coordinate"; fixtureId: keyof typeof coordinateDiagramFixtures }
> = {
  "dsa.math.bit_manipulation.code_bit_row_trace": { kind: "bit", fixtureId: "testBit" },
  "dsa.math.vectors_dot_cross.code_coordinate_trace": { kind: "coordinate", fixtureId: "orientation" }
};

export function MathVisualization({ itemId }: MathVisualizationProps) {
  const visual = ITEM_VISUALS[itemId];
  if (!visual) {
    return null;
  }

  if (visual.kind === "bit") {
    const fixture = bitTraceFixtures[visual.fixtureId];
    return (
      <section
        aria-label={`${fixture.title}: ${fixture.textDescription}`}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        data-testid="math-bit-visualization"
      >
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{fixture.expression}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <tbody>
              {fixture.rows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-0">
                  <th className="w-24 whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">
                    {row.label}
                  </th>
                  <td className="px-4 py-3 font-mono text-slate-950" aria-label={`${row.label} bits ${row.bits}`}>
                    {row.bits.split(" ").map((bit, index) => (
                      <span
                        key={`${row.label}-${index}`}
                        className="mr-1 inline-grid h-7 w-7 place-items-center rounded border border-slate-300 bg-slate-50"
                      >
                        {bit}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  const fixture = coordinateDiagramFixtures[visual.fixtureId];
  return (
    <section
      aria-label={`${fixture.title}: ${fixture.textDescription} ${fixture.result}`}
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4"
      data-testid="math-coordinate-visualization"
    >
      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-50">
        <code>{fixture.ascii}</code>
      </pre>
      <div className="grid gap-2 sm:grid-cols-3">
        {fixture.points.map((point) => (
          <div key={point.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <span className="font-semibold text-slate-800">{point.label}</span>
            <span className="ml-2 font-mono text-slate-700">
              ({point.x}, {point.y})
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
