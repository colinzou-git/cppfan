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

export type ExperienceLevel = (typeof EXPERIENCE_OPTIONS)[number]["value"];
export type LearningGoal = (typeof LEARNING_GOAL_OPTIONS)[number]["value"];
export type PreferredPlatform = (typeof PLATFORM_OPTIONS)[number]["value"];

export const DEFAULT_EXPERIENCE_LEVEL: ExperienceLevel = "beginner";
export const DEFAULT_DAILY_NEW_SKILLS_GOAL = 1;
export const DEFAULT_DAILY_REVIEW_MINUTES = 15;
