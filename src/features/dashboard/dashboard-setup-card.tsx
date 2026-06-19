import { ShieldAlert } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardSetupCard() {
  return (
    <Card className="border-amber-200 bg-amber-50/90 shadow-sm">
      <CardHeader>
        <ShieldAlert className="mb-3 h-6 w-6 text-amber-700" />
        <CardTitle>Supabase is not configured yet</CardTitle>
        <CardDescription>Complete project setup to enable saved learner data.</CardDescription>
      </CardHeader>
    </Card>
  );
}
