export const INTERVIEW_TARGET_PROFILES = [
  {
    id: "google_staff_systems",
    label: "Google Staff systems coding refresh",
    description:
      "Refresh timed C++ algorithms, explanation, testing, and follow-up adaptability without repeating beginner C++."
  }
] as const;

export const INTERVIEW_CPP_STANDARDS = [
  { id: "cpp17", label: "C++17" },
  { id: "cpp20", label: "C++20" },
  { id: "cpp23", label: "C++23" }
] as const;

export const RECENT_INTERVIEW_PRACTICE = [
  { id: "none", label: "No recent practice" },
  { id: "within_month", label: "Within the past month" },
  { id: "within_three_months", label: "Within the past 3 months" },
  { id: "within_year", label: "Within the past year" },
  { id: "over_year", label: "More than a year ago" }
] as const;

export type InterviewTargetProfileId = (typeof INTERVIEW_TARGET_PROFILES)[number]["id"];
export type InterviewCppStandard = (typeof INTERVIEW_CPP_STANDARDS)[number]["id"];
export type RecentInterviewPractice = (typeof RECENT_INTERVIEW_PRACTICE)[number]["id"];

export type InterviewTarget = {
  targetProfile: InterviewTargetProfileId;
  cppStandard: InterviewCppStandard;
  targetDate: string | null;
  recentPractice: RecentInterviewPractice;
  updatedAt: string;
};

export const DIAGNOSTIC_RETAKE_INTERVAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type DiagnosticRetakeAvailability = {
  allowed: boolean;
  nextAllowedAtMs: number | null;
  daysRemaining: number;
};

export function diagnosticRetakeAvailability(
  lastCompletedAtMs: number | null,
  nowMs: number,
  intervalDays: number = DIAGNOSTIC_RETAKE_INTERVAL_DAYS
): DiagnosticRetakeAvailability {
  if (lastCompletedAtMs === null) {
    return { allowed: true, nextAllowedAtMs: null, daysRemaining: 0 };
  }
  const nextAllowedAtMs = lastCompletedAtMs + intervalDays * DAY_MS;
  const remainingMs = Math.max(0, nextAllowedAtMs - nowMs);
  return {
    allowed: remainingMs === 0,
    nextAllowedAtMs,
    daysRemaining: Math.ceil(remainingMs / DAY_MS)
  };
}
