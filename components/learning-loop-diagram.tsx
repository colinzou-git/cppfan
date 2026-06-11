const nodes = [
  ["Choose skill", "Skill map suggests the next focus."],
  ["Learn", "Short explanation or visual walkthrough."],
  ["Practice", "Quiz, code reading, or bug spotting."],
  ["Review", "FSRS-ready scheduling for durable memory."],
  ["Mastery", "Events update weak/strong/mastered status."]
];

export function LearningLoopDiagram() {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-xl backdrop-blur">
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-300">
          Learning loop
        </p>
        <div className="mt-5 grid gap-3">
          {nodes.map(([title, body], index) => (
            <div key={title} className="relative rounded-2xl border border-white/10 bg-white/10 p-4">
              <div className="flex items-start gap-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-300 font-black text-slate-950">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{body}</p>
                </div>
              </div>
              {index < nodes.length - 1 ? (
                <div className="ml-4 mt-3 h-4 w-px bg-white/20" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
