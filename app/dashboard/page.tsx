import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/features/dashboard/dashboard-data";
import { DashboardSections } from "@/features/dashboard/dashboard-sections";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/login?message=signed-out");
}

export default async function DashboardPage(props: { searchParams: Promise<{ extra?: string }> }) {
  const query = await props.searchParams;
  const data = await getDashboardData();
  return <DashboardSections data={data} signOut={signOut} extraResult={query.extra} />;
}
