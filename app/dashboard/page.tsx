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

export default async function DashboardPage() {
  return <DashboardSections data={await getDashboardData()} signOut={signOut} />;
}
