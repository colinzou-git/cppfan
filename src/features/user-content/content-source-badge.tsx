import { cn } from "@/lib/utils";
import { SOURCE_LABELS, type ContentSource } from "./user-content-types";

/**
 * The visible source badge shown wherever native and user-created items mix
 * (#487). Uses the exact approved labels — "Native cppFan" / "User-Created" —
 * from SOURCE_LABELS so they stay consistent everywhere.
 */
export function ContentSourceBadge({ source, className }: { source: ContentSource; className?: string }) {
  const isUser = source === "user";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
        isUser ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-700",
        className
      )}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
}
