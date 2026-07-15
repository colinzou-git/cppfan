"use client";

import { EXERCISE_LIMITS, type ExerciseTest } from "./exercise-content-types";

/**
 * Manual authoring for an exercise's automated tests (#488). Each test has a
 * name, stdin input, expected stdout, and a hidden flag. Hidden tests and their
 * expected output stay server-side once published; here the owner authors both.
 */
export function ExerciseTestsEditor({
  tests,
  onChange
}: {
  tests: ExerciseTest[];
  onChange: (next: ExerciseTest[]) => void;
}) {
  function patch(index: number, part: Partial<ExerciseTest>) {
    onChange(tests.map((test, i) => (i === index ? { ...test, ...part } : test)));
  }
  function remove(index: number) {
    onChange(tests.filter((_, i) => i !== index));
  }
  function add() {
    if (tests.length < EXERCISE_LIMITS.maxTests) {
      onChange([...tests, { name: `Test ${tests.length + 1}`, input: "", expectedOutput: "", hidden: false }]);
    }
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
      <div className="text-sm font-bold text-emerald-900">Automated tests</div>
      <p className="text-xs text-slate-500">Optional. Required for automated evaluation. Hidden tests stay server-side after publishing.</p>
      {tests.map((test, index) => (
        <div key={index} className="grid gap-2 rounded-xl border border-white bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <input
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-sm font-semibold"
              value={test.name}
              onChange={(e) => patch(index, { name: e.target.value })}
              placeholder={`Test ${index + 1} name`}
              aria-label={`Test ${index + 1} name`}
            />
            <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <input type="checkbox" checked={test.hidden} onChange={() => patch(index, { hidden: !test.hidden })} aria-label={`Test ${index + 1} hidden`} />
              hidden
            </label>
            <button type="button" className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700 hover:border-rose-300" onClick={() => remove(index)} aria-label={`Remove test ${index + 1}`}>
              Remove
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <textarea
              className="min-h-16 rounded-lg border border-slate-300 px-2.5 py-1 font-mono text-sm"
              value={test.input}
              onChange={(e) => patch(index, { input: e.target.value })}
              placeholder="stdin"
              aria-label={`Test ${index + 1} input`}
            />
            <textarea
              className="min-h-16 rounded-lg border border-slate-300 px-2.5 py-1 font-mono text-sm"
              value={test.expectedOutput}
              onChange={(e) => patch(index, { expectedOutput: e.target.value })}
              placeholder="expected stdout"
              aria-label={`Test ${index + 1} expected output`}
            />
          </div>
        </div>
      ))}
      <div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50"
          onClick={add}
          disabled={tests.length >= EXERCISE_LIMITS.maxTests}
        >
          Add test
        </button>
      </div>
    </div>
  );
}
