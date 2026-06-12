import type {
  LearningItem,
  LearningItemChoice,
  LearningItemSkill,
  LearningItemWithDetails,
  PublicLearningItemChoice
} from "./learning-item-types";

/*
 * This seed mirrors supabase/migrations/20260612120000_create_learning_items.sql.
 * It is the source of truth for the learning-item display when the Supabase
 * migration has not been applied yet, and keeps item ids stable (see
 * docs/SKILL_ENGINE.md). Keep this file and the SQL migration in lockstep.
 *
 * `is_correct` lives here for seed-integrity tests and for server-side grading
 * (issue #3). Use toPublicChoice / getLearningItemById to obtain choices that
 * never carry the answer key for client display.
 */

export const learningItems: LearningItem[] = [
  {
    id: "cpp.structs_classes.syntax.lesson",
    type: "lesson",
    title: "Defining a struct or class",
    prompt:
      "A struct or class groups related data (member fields) and behavior (member functions) into one type. `struct` members are public by default; `class` members are private by default. Otherwise they are the same. You create an object (an instance) from the type, and each object has its own copy of the member fields.",
    explanation:
      "Use struct for plain data aggregates and class when you want to control access to internal state. Both define a new type from which objects are created.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 10,
    is_active: true
  },
  {
    id: "cpp.structs_classes.syntax.mc_default_access",
    type: "multiple_choice",
    title: "Default access in a struct",
    prompt: "In C++, what is the default access level for members declared in a `struct`?",
    explanation:
      "In a `struct`, members are public by default. In a `class`, members are private by default. That is the only language-level difference between the two.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 20,
    is_active: true
  },
  {
    id: "cpp.structs_classes.syntax.code_reading_object",
    type: "code_reading",
    title: "Reading a small class",
    prompt:
      "Read this type:\n\n```cpp\nclass Point {\npublic:\n  int x;\n  int y;\n};\n\nPoint p;\np.x = 3;\np.y = 4;\n```\n\nWhat does this code create, and how many independent fields does `p` hold?",
    explanation:
      "It defines a class `Point` with two public int members and creates one object `p`. `p` holds its own `x` and `y`. A second `Point` would have its own separate `x` and `y`.",
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 30,
    is_active: true
  },
  {
    id: "cpp.structs_classes.public_private.concept_access",
    type: "concept_check",
    title: "Why mark members private?",
    prompt: "Why might you make a member field `private` instead of `public`?",
    explanation:
      "Private members can only be touched by the class's own methods, so the class controls how its state changes and can keep that state valid. Public fields can be changed by anyone, which makes invariants hard to guarantee.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 110,
    is_active: true
  },
  {
    id: "cpp.structs_classes.public_private.bug_access",
    type: "bug_spotting",
    title: "Spot the access error",
    prompt:
      "This does not compile:\n\n```cpp\nclass Account {\n  double balance_; // private by default\n};\n\nAccount a;\na.balance_ = 100.0; // error\n```\n\nWhy does the compiler reject the last line?",
    explanation:
      "`balance_` is private (class members are private by default), so code outside the class cannot read or write it directly. A public method such as `deposit(double)` would be the supported way to change it.",
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 120,
    is_active: true
  },
  {
    id: "cpp.structs_classes.const_methods_intro.mc_const_call",
    type: "multiple_choice",
    title: "Calling a method on a const object",
    prompt: "Given `const Widget w;`, which methods of `Widget` can you call on `w`?",
    explanation:
      "On a const object you may only call methods marked `const` (const-qualified member functions), because the compiler must guarantee the call will not modify the object.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 210,
    is_active: true
  },
  {
    id: "cpp.structs_classes.invariants_intro.lesson",
    type: "lesson",
    title: "What is a class invariant?",
    prompt:
      "A class invariant is a rule about an object's state that should always be true after construction and after every public method returns. For example, a `Date` might require that the month is between 1 and 12. Constructors establish the invariant; public methods preserve it. Making fields private is what lets the class enforce its invariants.",
    explanation:
      "Think of an invariant as a promise the object keeps. If a public method could leave the object in a state that breaks the promise, the invariant is not protected.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 310,
    is_active: true
  },
  {
    id: "cpp.structs_classes.invariants_intro.mc_invariant",
    type: "multiple_choice",
    title: "Identifying an invariant",
    prompt:
      "A `Temperature` class stores Kelvin and must never be negative. Which statement is the class invariant?",
    explanation:
      "The invariant is the rule that must always hold: the stored Kelvin value is greater than or equal to zero. Constructors and methods must never leave the object violating it.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 320,
    is_active: true
  },
  {
    id: "cpp.constructors.default_constructor.lesson",
    type: "lesson",
    title: "The default constructor",
    prompt:
      "A default constructor takes no arguments. If you declare no constructors at all, the compiler generates one for you. As soon as you declare any other constructor, that implicit default is no longer generated — you must add it back (for example `Widget() = default;`) if you still want to create objects with no arguments.",
    explanation:
      "The compiler-provided default constructor default-initializes members. Once you write your own constructor, decide explicitly whether a no-argument constructor should still exist.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 410,
    is_active: true
  },
  {
    id: "cpp.constructors.default_constructor.mc_default_needed",
    type: "multiple_choice",
    title: "When the default constructor disappears",
    prompt: "A class declares only `Widget(int x);` and no other constructors. Is `Widget w;` valid?",
    explanation:
      "Declaring any constructor suppresses the implicit default constructor, so `Widget w;` does not compile unless you also provide a default constructor.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 420,
    is_active: true
  },
  {
    id: "cpp.constructors.parameterized_constructor.code_reading",
    type: "code_reading",
    title: "Reading a parameterized constructor",
    prompt:
      "Read this type:\n\n```cpp\nstruct Point {\n  int x;\n  int y;\n  Point(int a, int b) : x(a), y(b) {}\n};\n\nPoint p(3, 4);\n```\n\nWhat are `p.x` and `p.y` after construction?",
    explanation:
      "The parameterized constructor copies the arguments into the members via its initializer list, so `p.x` is 3 and `p.y` is 4.",
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 430,
    is_active: true
  },
  {
    id: "cpp.constructors.parameterized_constructor.mc_benefit",
    type: "multiple_choice",
    title: "Why parameterized constructors",
    prompt: "What is the main benefit of a parameterized constructor?",
    explanation:
      "A parameterized constructor lets the caller create an object that starts in a valid, fully specified state, which makes invalid states harder to construct.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 440,
    is_active: true
  },
  {
    id: "cpp.constructors.member_initializer_list.lesson",
    type: "lesson",
    title: "Member initializer lists",
    prompt:
      "Prefer initializing members in the constructor's initializer list (`Widget(int n) : count_(n) {}`) rather than assigning them in the body. The initializer list direct-initializes each member once. It is also required for `const` members, reference members, and members whose type has no default constructor.",
    explanation:
      "Assignment in the constructor body first default-initializes the member and then overwrites it. The initializer list skips that extra step and is mandatory for const/reference members.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 450,
    is_active: true
  },
  {
    id: "cpp.constructors.member_initializer_list.bug_const_member",
    type: "bug_spotting",
    title: "Spot the const-member bug",
    prompt:
      "This does not compile:\n\n```cpp\nclass Counter {\n  const int start_;\npublic:\n  Counter(int start) {\n    start_ = start; // error\n  }\n};\n```\n\nWhy is the assignment rejected?",
    explanation:
      "A `const` member must be initialized in the constructor's initializer list (`Counter(int start) : start_(start) {}`). It cannot be assigned in the body because it is already const by then.",
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 460,
    is_active: true
  },
  {
    id: "cpp.constructors.destructor_intro.lesson",
    type: "lesson",
    title: "Destructors and object lifetime",
    prompt:
      "A destructor `~Type()` runs automatically when an object's lifetime ends: for a local (stack) object at the end of its enclosing scope, and for a heap object when it is `delete`d. Destructors are where a class releases resources it owns.",
    explanation:
      "Local objects are destroyed in reverse order of construction. You rarely call a destructor directly; the compiler inserts the calls for you.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 470,
    is_active: true
  },
  {
    id: "cpp.constructors.destructor_intro.mc_destruction_order",
    type: "multiple_choice",
    title: "Order of destruction",
    prompt:
      "Inside a function, object `a` is constructed and then object `b`. In what order do their destructors run at the end of the scope?",
    explanation:
      "Local objects are destroyed in reverse order of construction, so `b` is destroyed first, then `a`.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 480,
    is_active: true
  }
];

export const learningItemSkills: LearningItemSkill[] = [
  { learning_item_id: "cpp.structs_classes.syntax.lesson", skill_id: "cpp.structs_classes.syntax", is_primary: true },
  { learning_item_id: "cpp.structs_classes.syntax.mc_default_access", skill_id: "cpp.structs_classes.syntax", is_primary: true },
  { learning_item_id: "cpp.structs_classes.syntax.code_reading_object", skill_id: "cpp.structs_classes.syntax", is_primary: true },
  { learning_item_id: "cpp.structs_classes.public_private.concept_access", skill_id: "cpp.structs_classes.public_private", is_primary: true },
  { learning_item_id: "cpp.structs_classes.public_private.bug_access", skill_id: "cpp.structs_classes.public_private", is_primary: true },
  { learning_item_id: "cpp.structs_classes.public_private.bug_access", skill_id: "cpp.structs_classes.syntax", is_primary: false },
  { learning_item_id: "cpp.structs_classes.const_methods_intro.mc_const_call", skill_id: "cpp.structs_classes.const_methods_intro", is_primary: true },
  { learning_item_id: "cpp.structs_classes.invariants_intro.lesson", skill_id: "cpp.structs_classes.invariants_intro", is_primary: true },
  { learning_item_id: "cpp.structs_classes.invariants_intro.mc_invariant", skill_id: "cpp.structs_classes.invariants_intro", is_primary: true },
  { learning_item_id: "cpp.structs_classes.invariants_intro.mc_invariant", skill_id: "cpp.structs_classes.public_private", is_primary: false },
  { learning_item_id: "cpp.constructors.default_constructor.lesson", skill_id: "cpp.constructors.default_constructor", is_primary: true },
  { learning_item_id: "cpp.constructors.default_constructor.mc_default_needed", skill_id: "cpp.constructors.default_constructor", is_primary: true },
  { learning_item_id: "cpp.constructors.parameterized_constructor.code_reading", skill_id: "cpp.constructors.parameterized_constructor", is_primary: true },
  { learning_item_id: "cpp.constructors.parameterized_constructor.mc_benefit", skill_id: "cpp.constructors.parameterized_constructor", is_primary: true },
  { learning_item_id: "cpp.constructors.member_initializer_list.lesson", skill_id: "cpp.constructors.member_initializer_list", is_primary: true },
  { learning_item_id: "cpp.constructors.member_initializer_list.bug_const_member", skill_id: "cpp.constructors.member_initializer_list", is_primary: true },
  { learning_item_id: "cpp.constructors.member_initializer_list.bug_const_member", skill_id: "cpp.constructors.default_constructor", is_primary: false },
  { learning_item_id: "cpp.constructors.destructor_intro.lesson", skill_id: "cpp.constructors.destructor_intro", is_primary: true },
  { learning_item_id: "cpp.constructors.destructor_intro.mc_destruction_order", skill_id: "cpp.constructors.destructor_intro", is_primary: true }
];

export const learningItemChoices: LearningItemChoice[] = [
  { id: "cpp.structs_classes.syntax.mc_default_access.a", learning_item_id: "cpp.structs_classes.syntax.mc_default_access", content: "Public", is_correct: true, order_index: 10 },
  { id: "cpp.structs_classes.syntax.mc_default_access.b", learning_item_id: "cpp.structs_classes.syntax.mc_default_access", content: "Private", is_correct: false, order_index: 20 },
  { id: "cpp.structs_classes.syntax.mc_default_access.c", learning_item_id: "cpp.structs_classes.syntax.mc_default_access", content: "Protected", is_correct: false, order_index: 30 },
  { id: "cpp.structs_classes.syntax.mc_default_access.d", learning_item_id: "cpp.structs_classes.syntax.mc_default_access", content: "It depends on the compiler", is_correct: false, order_index: 40 },

  { id: "cpp.structs_classes.const_methods_intro.mc_const_call.a", learning_item_id: "cpp.structs_classes.const_methods_intro.mc_const_call", content: "Only methods marked const", is_correct: true, order_index: 10 },
  { id: "cpp.structs_classes.const_methods_intro.mc_const_call.b", learning_item_id: "cpp.structs_classes.const_methods_intro.mc_const_call", content: "Any method at all", is_correct: false, order_index: 20 },
  { id: "cpp.structs_classes.const_methods_intro.mc_const_call.c", learning_item_id: "cpp.structs_classes.const_methods_intro.mc_const_call", content: "Only methods that take no arguments", is_correct: false, order_index: 30 },
  { id: "cpp.structs_classes.const_methods_intro.mc_const_call.d", learning_item_id: "cpp.structs_classes.const_methods_intro.mc_const_call", content: "Only private methods", is_correct: false, order_index: 40 },

  { id: "cpp.structs_classes.invariants_intro.mc_invariant.a", learning_item_id: "cpp.structs_classes.invariants_intro.mc_invariant", content: "The stored Kelvin value is always >= 0", is_correct: true, order_index: 10 },
  { id: "cpp.structs_classes.invariants_intro.mc_invariant.b", learning_item_id: "cpp.structs_classes.invariants_intro.mc_invariant", content: "The class has a constructor", is_correct: false, order_index: 20 },
  { id: "cpp.structs_classes.invariants_intro.mc_invariant.c", learning_item_id: "cpp.structs_classes.invariants_intro.mc_invariant", content: "The Kelvin field is public", is_correct: false, order_index: 30 },
  { id: "cpp.structs_classes.invariants_intro.mc_invariant.d", learning_item_id: "cpp.structs_classes.invariants_intro.mc_invariant", content: "Temperatures are stored as integers", is_correct: false, order_index: 40 },

  { id: "cpp.constructors.default_constructor.mc_default_needed.a", learning_item_id: "cpp.constructors.default_constructor.mc_default_needed", content: "No — there is no default constructor, so it does not compile", is_correct: true, order_index: 10 },
  { id: "cpp.constructors.default_constructor.mc_default_needed.b", learning_item_id: "cpp.constructors.default_constructor.mc_default_needed", content: "Yes — the compiler always provides a default constructor", is_correct: false, order_index: 20 },
  { id: "cpp.constructors.default_constructor.mc_default_needed.c", learning_item_id: "cpp.constructors.default_constructor.mc_default_needed", content: "Yes — it calls Widget(int) with x set to 0", is_correct: false, order_index: 30 },
  { id: "cpp.constructors.default_constructor.mc_default_needed.d", learning_item_id: "cpp.constructors.default_constructor.mc_default_needed", content: "Only if Widget has no member variables", is_correct: false, order_index: 40 },

  { id: "cpp.constructors.parameterized_constructor.mc_benefit.a", learning_item_id: "cpp.constructors.parameterized_constructor.mc_benefit", content: "It lets an object start in a valid, caller-specified state", is_correct: true, order_index: 10 },
  { id: "cpp.constructors.parameterized_constructor.mc_benefit.b", learning_item_id: "cpp.constructors.parameterized_constructor.mc_benefit", content: "It makes the class run faster at runtime", is_correct: false, order_index: 20 },
  { id: "cpp.constructors.parameterized_constructor.mc_benefit.c", learning_item_id: "cpp.constructors.parameterized_constructor.mc_benefit", content: "It removes the need for member variables", is_correct: false, order_index: 30 },
  { id: "cpp.constructors.parameterized_constructor.mc_benefit.d", learning_item_id: "cpp.constructors.parameterized_constructor.mc_benefit", content: "It is required before a class can be copied", is_correct: false, order_index: 40 },

  { id: "cpp.constructors.destructor_intro.mc_destruction_order.a", learning_item_id: "cpp.constructors.destructor_intro.mc_destruction_order", content: "b is destroyed first, then a (reverse of construction)", is_correct: true, order_index: 10 },
  { id: "cpp.constructors.destructor_intro.mc_destruction_order.b", learning_item_id: "cpp.constructors.destructor_intro.mc_destruction_order", content: "a is destroyed first, then b (same as construction)", is_correct: false, order_index: 20 },
  { id: "cpp.constructors.destructor_intro.mc_destruction_order.c", learning_item_id: "cpp.constructors.destructor_intro.mc_destruction_order", content: "Both are destroyed at the same time", is_correct: false, order_index: 30 },
  { id: "cpp.constructors.destructor_intro.mc_destruction_order.d", learning_item_id: "cpp.constructors.destructor_intro.mc_destruction_order", content: "The order is unspecified by the language", is_correct: false, order_index: 40 }
];

export function toPublicChoice(choice: LearningItemChoice): PublicLearningItemChoice {
  const { is_correct: _ignored, ...rest } = choice;
  return rest;
}

export function getChoicesForItem(itemId: string): LearningItemChoice[] {
  return learningItemChoices
    .filter((choice) => choice.learning_item_id === itemId)
    .sort((a, b) => a.order_index - b.order_index);
}

export function getLearningItemById(itemId: string): LearningItemWithDetails | null {
  const item = learningItems.find((entry) => entry.id === itemId && entry.is_active);

  if (!item) {
    return null;
  }

  return {
    item,
    skills: learningItemSkills.filter((mapping) => mapping.learning_item_id === itemId),
    choices: getChoicesForItem(itemId).map(toPublicChoice)
  };
}

export function getLearningItemsForSkill(skillId: string): LearningItem[] {
  const itemIds = new Set(
    learningItemSkills.filter((mapping) => mapping.skill_id === skillId).map((mapping) => mapping.learning_item_id)
  );

  return learningItems
    .filter((item) => item.is_active && itemIds.has(item.id))
    .sort((a, b) => a.order_index - b.order_index);
}

/**
 * The first learning item to open for a skill, used to link the dashboard skill
 * map preview to real content.
 */
export function getFirstLearningItemIdForSkill(skillId: string): string | null {
  return getLearningItemsForSkill(skillId)[0]?.id ?? null;
}

export function getPrimarySkillId(itemId: string): string | null {
  const primary = learningItemSkills.find(
    (mapping) => mapping.learning_item_id === itemId && mapping.is_primary
  );
  return primary?.skill_id ?? null;
}

/**
 * Active learning items that can seed a review card, each paired with its
 * primary skill. Used to create review cards from eligible items.
 */
export function getEligibleReviewItems(): { item: LearningItem; skillId: string }[] {
  return learningItems
    .filter((item) => item.is_active)
    .map((item) => ({ item, skillId: getPrimarySkillId(item.id) }))
    .filter((entry): entry is { item: LearningItem; skillId: string } => entry.skillId !== null)
    .sort((a, b) => a.item.order_index - b.item.order_index);
}

/** Map of skill id -> first learning item id, for preview links. */
export function getItemLinksBySkill(): Record<string, string> {
  const links: Record<string, string> = {};

  for (const skillId of new Set(learningItemSkills.map((mapping) => mapping.skill_id))) {
    const firstItem = getFirstLearningItemIdForSkill(skillId);
    if (firstItem) {
      links[skillId] = firstItem;
    }
  }

  return links;
}
