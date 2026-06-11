import Link from "next/link";
import { ArrowRight, Brain, Code2, GitBranch, LineChart, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LearningLoopDiagram } from "@/components/learning-loop-diagram";

const features = [
  {
    icon: Brain,
    title: "Skill mastery, not just lessons",
    description:
      "Track C++, DSA, review results, hints, and practice attempts as evidence for mastery."
  },
  {
    icon: LineChart,
    title: "FSRS-ready review scheduling",
    description:
      "The scaffold prepares for review cards and logs while keeping mastery as a separate model."
  },
  {
    icon: Code2,
    title: "Practice-first learning",
    description:
      "Designed for quizzes, code-reading, bug-spotting, predict-output, and future coding tasks."
  },
  {
    icon: GitBranch,
    title: "AI-assisted development loop",
    description:
      "Specs, allowed edit zones, tests, CI, and repo maps keep Claude Code focused and safe."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/75 px-5 py-4 shadow-sm backdrop-blur">
        <Link href="/" className="flex items-center gap-3" aria-label="cppFan home">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white">
            C++
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">cppFan</p>
            <p className="text-xs font-medium text-slate-500">Adaptive C++ learning</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <a href="#features">Features</a>
          <a href="#learning-loop">Learning loop</a>
          <a href="#stack">Stack</a>
        </nav>

        <Button asChild>
          <Link href="/dashboard">
            Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </header>

      <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Sparkles className="h-4 w-4" />
            Scaffold ready for Next.js + Supabase + AI development
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Learn C++ and DSA through a <span className="gradient-text">closed feedback loop</span>.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            cppFan is designed for short lessons, immediate practice, FSRS-ready reviews,
            skill-event tracking, and mastery recommendations across Windows PC, iPad, and iPhone.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Open scaffold dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href="#learning-loop">See learning loop</a>
            </Button>
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3 text-center">
            {["Review", "Practice", "Mastery"].map((label) => (
              <div key={label} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
                <p className="text-2xl font-black text-slate-950">✓</p>
                <p className="text-sm font-bold text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <LearningLoopDiagram />
      </section>

      <section id="features" className="grid gap-4 pb-16 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardHeader>
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-700">
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section
        id="learning-loop"
        className="mb-16 rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-xl sm:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-300">Core loop</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Dev-test-feedback for learning</h2>
            <p className="mt-4 text-slate-300">
              The app architecture mirrors the development loop: every action creates feedback,
              and every feedback signal improves the next recommendation.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Learn", "Open a focused concept or skill."],
              ["2", "Practice", "Answer quiz, read code, or spot a bug."],
              ["3", "Review", "Schedule and revisit with FSRS."],
              ["4", "Log", "Record events for mastery evidence."],
              ["5", "Master", "Update skill status from performance."],
              ["6", "Recommend", "Suggest the next best action."]
            ].map(([step, title, body]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-black text-amber-300">{step}</p>
                <h3 className="mt-2 font-black">{title}</h3>
                <p className="mt-1 text-sm text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="pb-20">
        <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
          <CardHeader>
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle>Scaffold stack</CardTitle>
            <CardDescription>
              The app is intentionally scaffolded before learning features are implemented.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Next.js App Router",
                "TypeScript",
                "Supabase placeholders",
                "Tailwind CSS",
                "shadcn/ui-compatible",
                "TanStack Query",
                "Vitest",
                "Playwright"
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
