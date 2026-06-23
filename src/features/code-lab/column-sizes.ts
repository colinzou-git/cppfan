/**
 * Pure layout math for the full-page Code Lab's three resizable columns (#431).
 * Sizes are percentages of the container width and always sum to 100. Kept free
 * of React so the clamping rules are unit-testable.
 */

export type ColumnSizes = { left: number; center: number; right: number };
export type ColumnMins = { left: number; center: number; right: number };

/** Default split requested in #431: left 1/6, editor 1/2, right the remainder. */
export const DEFAULT_COLUMN_SIZES: ColumnSizes = {
  left: 100 / 6,
  center: 50,
  right: 100 - 100 / 6 - 50
};

/** Minimum widths (percent) so no panel can be dragged to an unusable sliver. */
export const DEFAULT_COLUMN_MINS: ColumnMins = { left: 10, center: 28, right: 16 };

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Resolve left/right panel widths into a valid three-column split. `left` is
 * clamped first, then `right` is clamped against the space `left` leaves, so the
 * center always keeps at least its minimum and the three widths sum to 100.
 */
export function resolveColumnSizes(
  left: number,
  right: number,
  mins: ColumnMins = DEFAULT_COLUMN_MINS
): ColumnSizes {
  const total = 100;
  const l = clamp(left, mins.left, total - mins.center - mins.right);
  const r = clamp(right, mins.right, total - mins.center - l);
  const center = total - l - r;
  return { left: round(l), center: round(center), right: round(r) };
}

/** New sizes after dragging the left/center divider to `fraction` of the width. */
export function resizeLeftDivider(
  fraction: number,
  current: ColumnSizes,
  mins: ColumnMins = DEFAULT_COLUMN_MINS
): ColumnSizes {
  return resolveColumnSizes(fraction * 100, current.right, mins);
}

/** New sizes after dragging the center/right divider to `fraction` of the width. */
export function resizeRightDivider(
  fraction: number,
  current: ColumnSizes,
  mins: ColumnMins = DEFAULT_COLUMN_MINS
): ColumnSizes {
  return resolveColumnSizes(current.left, (1 - fraction) * 100, mins);
}
