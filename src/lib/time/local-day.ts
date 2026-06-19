type LocalDateParts = { year: number; month: number; day: number };
type LocalDateTimeParts = LocalDateParts & { hour: number; minute: number; second: number };

function partsAt(date: Date, timezone: string): LocalDateTimeParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second")
  };
}

export function localDateKey(date: Date, timezone: string): string {
  const { year, month, day } = partsAt(date, timezone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addLocalDays(parts: LocalDateParts, days: number): LocalDateParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function zonedDateTimeToUtc(target: LocalDateTimeParts, timezone: string): Date {
  const targetValue = Date.UTC(target.year, target.month - 1, target.day, target.hour, target.minute, target.second);
  let guess = targetValue;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = partsAt(new Date(guess), timezone);
    const actualValue = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    guess += targetValue - actualValue;
  }
  return new Date(guess);
}

/** Exclusive upper bound for the learner's current local calendar day. */
export function nextLocalMidnight(date: Date, timezone: string): Date {
  const current = partsAt(date, timezone);
  const next = addLocalDays(current, 1);
  return zonedDateTimeToUtc({ ...next, hour: 0, minute: 0, second: 0 }, timezone);
}
