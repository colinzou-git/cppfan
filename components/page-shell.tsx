import { type PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable page shell (#430). Centralises the outer `<main>` width/padding so
 * pages stop repeating narrow `max-w-*` values. Mobile-first: padding and the
 * mobile layout are unchanged; `size` only widens the max width on large screens.
 */
type PageShellProps = PropsWithChildren<{
  className?: string;
  size?: "reading" | "wide" | "full";
}>;

const SIZE_CLASS = {
  reading: "max-w-4xl",
  wide: "max-w-screen-2xl",
  full: "max-w-none"
} as const;

export function PageShell({ children, className, size = "wide" }: PageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto min-h-screen w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-10",
        SIZE_CLASS[size],
        className
      )}
    >
      {children}
    </main>
  );
}
