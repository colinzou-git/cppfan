"use client";

export type CodeFields = {
  sampleCode: string;
  starterCode: string;
  referenceSolution: string;
  expectedOutput: string;
  solutionExplanation: string;
};

export const EMPTY_CODE_FIELDS: CodeFields = {
  sampleCode: "",
  starterCode: "",
  referenceSolution: "",
  expectedOutput: "",
  solutionExplanation: ""
};

const FIELDS: Array<{ key: keyof CodeFields; label: string; placeholder: string; mono: boolean }> = [
  { key: "sampleCode", label: "Sample code", placeholder: "Code shown to the learner…", mono: true },
  { key: "starterCode", label: "Starter code", placeholder: "Editable starting point…", mono: true },
  { key: "referenceSolution", label: "Reference solution", placeholder: "The intended solution…", mono: true },
  { key: "expectedOutput", label: "Expected output", placeholder: "Program output…", mono: true },
  { key: "solutionExplanation", label: "Solution explanation", placeholder: "Why the solution works…", mono: false }
];

/**
 * Manual authoring for the code-bearing fields (#487): sample/starter code,
 * reference solution, expected output, and the solution explanation. Used by
 * code_reading / bug_spotting / worked_example. Reference solution and expected
 * output stay in the authoring payload and are gated on the learner side.
 */
export function CodeFieldsEditor({
  values,
  onChange
}: {
  values: CodeFields;
  onChange: (patch: Partial<CodeFields>) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4">
      <div className="text-sm font-bold text-cyan-900">Code</div>
      {FIELDS.map((field) => (
        <label key={field.key} className="grid gap-1 text-sm font-semibold text-slate-700">
          {field.label}
          <textarea
            className={`min-h-20 rounded-xl border border-slate-300 px-3 py-2 font-normal ${field.mono ? "font-mono text-sm" : ""}`}
            value={values[field.key]}
            onChange={(e) => onChange({ [field.key]: e.target.value })}
            placeholder={field.placeholder}
            aria-label={field.label}
          />
        </label>
      ))}
    </div>
  );
}
