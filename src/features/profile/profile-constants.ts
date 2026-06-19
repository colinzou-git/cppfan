export const EXPERIENCE_OPTIONS = [
  {
    value: "beginner",
    label: "Beginner",
    description: "I am still learning basic C++ syntax."
  },
  {
    value: "some_cpp",
    label: "Some C++",
    description: "I know variables, functions, loops, and simple classes."
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "I can read C++ code and want stronger ownership, RAII, and DSA practice."
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "I want targeted practice, interview-style DSA, and deeper C++ design."
  }
] as const;

export const LEARNING_GOAL_OPTIONS = [
  {
    value: "cpp_core",
    label: "Core C++ grammar"
  },
  {
    value: "raii_ownership",
    label: "RAII, ownership, and smart pointers"
  },
  {
    value: "dsa_patterns",
    label: "DSA patterns"
  },
  {
    value: "debugging",
    label: "Debugging and bug spotting"
  },
  {
    value: "interview_prep",
    label: "Interview-style practice"
  },
  {
    value: "personal_projects",
    label: "Useful personal projects"
  }
] as const;

export const PLATFORM_OPTIONS = [
  {
    value: "windows_pc",
    label: "Windows PC"
  },
  {
    value: "ipad",
    label: "iPad"
  },
  {
    value: "iphone",
    label: "iPhone"
  }
] as const;

export const INTERVIEW_TARGET_OPTIONS = [
  {
    value: "google_staff_systems",
    label: "Google Staff systems coding refresh",
    description:
      "For an experienced systems engineer refreshing timed C++ algorithms, communication, testing, and follow-up adaptability."
  }
] as const;

export const INTERVIEW_CPP_STANDARD_OPTIONS = [
  { value: "cpp17", label: "C++17" },
  { value: "cpp20", label: "C++20" },
  { value: "cpp23", label: "C++23" }
] as const;

export const RECENT_INTERVIEW_PRACTICE_OPTIONS = [
  { value: "none", label: "No recent coding-interview practice" },
  { value: "within_month", label: "Within the past month" },
  { value: "within_three_months", label: "Within the past 3 months" },
  { value: "within_year", label: "Within the past year" },
  { value: "over_year", label: "More than a year ago" }
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_OPTIONS)[number]["value"];
export type LearningGoal = (typeof LEARNING_GOAL_OPTIONS)[number]["value"];
export type PreferredPlatform = (typeof PLATFORM_OPTIONS)[number]["value"];
export type InterviewTargetProfile = (typeof INTERVIEW_TARGET_OPTIONS)[number]["value"];
export type InterviewCppStandard = (typeof INTERVIEW_CPP_STANDARD_OPTIONS)[number]["value"];
export type RecentInterviewPractice = (typeof RECENT_INTERVIEW_PRACTICE_OPTIONS)[number]["value"];

export const DEFAULT_EXPERIENCE_LEVEL: ExperienceLevel = "beginner";
export const DEFAULT_DAILY_NEW_SKILLS_GOAL = 1;
export const DEFAULT_DAILY_REVIEW_MINUTES = 15;
export const DEFAULT_INTERVIEW_CPP_STANDARD: InterviewCppStandard = "cpp20";
