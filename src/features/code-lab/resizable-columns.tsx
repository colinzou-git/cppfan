"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_COLUMN_SIZES,
  resizeLeftDivider,
  resizeRightDivider,
  type ColumnSizes
} from "./column-sizes";

type Divider = "left" | "right";

/**
 * Three-column container with user-draggable dividers (#431). Widths persist to
 * localStorage under `storageKey`. No external dependency — pointer events drive
 * the pure resize math in column-sizes.ts. Falls back to a stacked layout below
 * `xl` (handled by the caller passing responsive children); here we only own the
 * horizontal split on wide screens.
 */
export function ResizableColumns({
  left,
  center,
  right,
  storageKey
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  storageKey: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sizes, setSizes] = useState<ColumnSizes>(DEFAULT_COLUMN_SIZES);
  const dragging = useRef<Divider | null>(null);

  // Load persisted sizes after mount to avoid a hydration mismatch.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<ColumnSizes>;
      if (
        typeof parsed.left === "number" &&
        typeof parsed.center === "number" &&
        typeof parsed.right === "number"
      ) {
        setSizes({ left: parsed.left, center: parsed.center, right: parsed.right });
      }
    } catch {
      // Ignore unreadable/corrupt persisted state and keep defaults.
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: ColumnSizes) => {
      setSizes(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Persisting is best-effort; ignore quota/availability errors.
      }
    },
    [storageKey]
  );

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const which = dragging.current;
      const el = containerRef.current;
      if (!which || !el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const fraction = (event.clientX - rect.left) / rect.width;
      setSizes((prev) =>
        which === "left" ? resizeLeftDivider(fraction, prev) : resizeRightDivider(fraction, prev)
      );
    }
    function onUp() {
      if (!dragging.current) return;
      dragging.current = null;
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
      // Persist the final position once the drag ends.
      setSizes((final) => {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(final));
        } catch {
          // best-effort
        }
        return final;
      });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [storageKey]);

  function startDrag(which: Divider) {
    dragging.current = which;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function nudge(which: Divider, deltaPct: number) {
    persist(
      which === "left"
        ? resizeLeftDivider((sizes.left + deltaPct) / 100, sizes)
        : resizeRightDivider(1 - (sizes.right + deltaPct) / 100, sizes)
    );
  }

  return (
    <div ref={containerRef} className="flex h-full w-full min-w-0 items-stretch">
      <div className="h-full min-w-0 overflow-auto" style={{ width: `${sizes.left}%` }}>
        {left}
      </div>
      <Handle
        label="Resize problem panel"
        onPointerDown={() => startDrag("left")}
        onKeyDown={(e) => handleKey(e, (d) => nudge("left", d))}
      />
      <div className="h-full min-w-0 overflow-hidden" style={{ width: `${sizes.center}%` }}>
        {center}
      </div>
      <Handle
        label="Resize output panel"
        onPointerDown={() => startDrag("right")}
        onKeyDown={(e) => handleKey(e, (d) => nudge("right", -d))}
      />
      <div className="h-full min-w-0 overflow-auto" style={{ width: `${sizes.right}%` }}>
        {right}
      </div>
    </div>
  );
}

function handleKey(event: React.KeyboardEvent, move: (deltaPct: number) => void) {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    move(-2);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    move(2);
  }
}

function Handle({
  label,
  onPointerDown,
  onKeyDown
}: {
  label: string;
  onPointerDown: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className="group relative w-1.5 shrink-0 cursor-col-resize bg-slate-200 transition-colors hover:bg-blue-400 focus:bg-blue-500 focus:outline-none"
      data-testid="code-lab-resizer"
    >
      <span className="absolute inset-y-0 -left-1 -right-1" aria-hidden="true" />
    </div>
  );
}
