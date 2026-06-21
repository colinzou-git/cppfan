import Link from "next/link";
import { CalendarClock, Code2, FlaskConical, Library, ListChecks, Settings, Target, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  ["/resources", "Resources", Library],
  ["/labs", "Labs", FlaskConical],
  ["/placement", "Placement", ListChecks],
  ["/exercises", "Exercises", Code2],
  ["/interview", "Interview", Target],
  ["/profile", "Profile", UserCircle],
  ["/settings", "Settings", Settings],
  ["/login", "Auth setup", Settings]
] as const;

export function DashboardHeader() {
  return (
    <header className="grid gap-4 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div>
        <Link href="/" className="text-sm font-bold text-blue-700">← cppFan</Link>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Your learning dashboard</h1>
        <p className="mt-1 text-slate-600">Daily Review, goal learning, mastery, goals, and the skill map.</p>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button asChild><Link href="/review"><CalendarClock className="h-4 w-4" />Review</Link></Button>
        {links.map(([href, label, Icon]) => (
          <Button asChild variant="secondary" key={href}>
            <Link href={href}><Icon className="h-4 w-4" />{label}</Link>
          </Button>
        ))}
      </div>
    </header>
  );
}
