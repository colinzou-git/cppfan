import Link from "next/link";
import {
  CalendarClock,
  Code2,
  FlaskConical,
  KeyRound,
  Library,
  ListChecks,
  Settings,
  Target,
  UserCircle,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dark left-navigation shell for the redesigned Exercises page (#447). The nav
 * order mirrors the dashboard's phase-safe destinations; Exercises is the active
 * item. The header keeps the title "Exercises" with a clean (empty) top-right.
 */
const NAV: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/review", label: "Review", Icon: CalendarClock },
  { href: "/resources", label: "Resources", Icon: Library },
  { href: "/labs", label: "Labs", Icon: FlaskConical },
  { href: "/placement", label: "Placement", Icon: ListChecks },
  { href: "/exercises", label: "Exercises", Icon: Code2 },
  { href: "/interview", label: "Interview", Icon: Target },
  { href: "/profile", label: "Profile", Icon: UserCircle },
  { href: "/settings", label: "Settings", Icon: Settings },
  { href: "/login", label: "Auth Setup", Icon: KeyRound }
];

const ACTIVE = "/exercises";

export function ExercisesPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[14rem_1fr]">
      <nav
        className="hidden flex-col gap-1 bg-slate-900 p-4 text-slate-200 lg:flex"
        aria-label="Primary"
        data-testid="exercises-nav"
      >
        <Link href="/dashboard" className="mb-4 px-2 text-sm font-bold text-slate-400 hover:text-white">
          ← cppFan
        </Link>
        {NAV.map(({ href, label, Icon }) => {
          const active = href === ACTIVE;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              data-testid={active ? "exercises-nav-active" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold",
                active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <main className="min-w-0 bg-slate-50 p-4 xl:p-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
            <Code2 className="h-7 w-7 text-blue-700" />
            Exercises
          </h1>
          <Link
            href="/my-content/exercises/new"
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            Create an exercise
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
