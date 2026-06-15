import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PlacementAssessment } from "@/features/placement/placement-assessment";
import { getPlacementAssessment, getPlacementResults } from "@/features/placement/placement-queries";

export const metadata = {
  title: "Placement check — cppFan"
};

export default async function PlacementPage() {
  const questions = getPlacementAssessment();
  const results = await getPlacementResults();

  let authenticated = false;
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    authenticated = Boolean(user);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="grid gap-1">
        <Link href="/dashboard" className="text-sm font-bold text-blue-700">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-black text-slate-900">Optional placement check</h1>
        <p className="text-sm text-slate-600">
          A short, optional check to suggest where to start. It is reversible and never locks content.
        </p>
      </header>

      <PlacementAssessment questions={questions} initialResults={results} authenticated={authenticated} />
    </main>
  );
}
