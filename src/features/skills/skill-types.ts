export type SkillDomain = "cpp" | "dsa";
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type SkillPrerequisiteRelationship = "recommended" | "required";

export type Skill = {
  id: string;
  domain: SkillDomain;
  module_id: string;
  title: string;
  description: string;
  learner_goal: string;
  level: SkillLevel;
  item_types: string[];
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SkillPrerequisite = {
  skill_id: string;
  prerequisite_skill_id: string;
  relationship_type: SkillPrerequisiteRelationship;
  created_at?: string;
};

export type SkillModule = {
  id: string;
  title: string;
  description: string;
  order_index: number;
};

export type SkillMapPreviewData = {
  modules: SkillModule[];
  skills: Skill[];
  prerequisites: SkillPrerequisite[];
  source: "seed" | "database";
};
