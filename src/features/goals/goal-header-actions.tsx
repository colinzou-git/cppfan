import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GoalHeaderActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild><Link href="/goals/evaluation">Run Evaluation</Link></Button>
      <Button asChild variant="secondary"><Link href="/placement">Run placement</Link></Button>
    </div>
  );
}
