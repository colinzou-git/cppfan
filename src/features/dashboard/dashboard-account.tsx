import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  email: string;
  name: string | null;
  newSkills: number | null;
  reviewMinutes: number | null;
  signOut: () => Promise<void>;
};

export function DashboardAccount({ email, name, newSkills, reviewMinutes, signOut }: Props) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/90 shadow-sm">
      <CardHeader>
        <UserCircle className="mb-3 h-6 w-6 text-emerald-700" />
        <CardTitle>Welcome{name ? `, ${name}` : ""}</CardTitle>
        <CardDescription>Signed in as <strong>{email}</strong></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-semibold text-emerald-950">Daily new skills: {newSkills} · Review minutes: {reviewMinutes}</p>
        <form action={signOut}><Button type="submit" variant="secondary">Sign out</Button></form>
      </CardContent>
    </Card>
  );
}
