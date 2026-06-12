-- cppFan learning items: the first real learning-content layer on top of the
-- skill map (see docs/SKILL_ENGINE.md).
--
-- This migration intentionally does NOT add quiz attempts, grading history,
-- FSRS review cards, mastery scoring, or code execution. Those arrive in later
-- focused migrations.

create table if not exists public.learning_items (
  id text primary key,
  type text not null
    check (type in ('lesson', 'concept_check', 'multiple_choice', 'code_reading', 'bug_spotting')),
  title text not null,
  prompt text not null,
  explanation text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_minutes integer not null default 3
    check (estimated_minutes > 0 and estimated_minutes <= 120),
  order_index integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Each learning item maps to one or more skills. Exactly one mapping per item
-- should be primary.
create table if not exists public.learning_item_skills (
  learning_item_id text not null references public.learning_items(id) on delete cascade,
  skill_id text not null references public.skills(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (learning_item_id, skill_id)
);

-- Choices back multiple_choice and concept_check items. is_correct is the
-- answer key; the client display query never selects it, and grading (issue #3)
-- runs server-side.
create table if not exists public.learning_item_choices (
  id text primary key,
  learning_item_id text not null references public.learning_items(id) on delete cascade,
  content text not null,
  is_correct boolean not null default false,
  order_index integer not null,
  created_at timestamptz not null default now()
);

alter table public.learning_items enable row level security;
alter table public.learning_item_skills enable row level security;
alter table public.learning_item_choices enable row level security;

create index if not exists learning_items_type_order_idx
  on public.learning_items (type, order_index);

create index if not exists learning_item_skills_skill_idx
  on public.learning_item_skills (skill_id);

create index if not exists learning_item_choices_item_order_idx
  on public.learning_item_choices (learning_item_id, order_index);

drop trigger if exists set_learning_items_updated_at on public.learning_items;

create trigger set_learning_items_updated_at
before update on public.learning_items
for each row
execute function public.set_updated_at();

-- Shared curriculum content: read-only for anon and authenticated users.
-- Writes are reserved for service-role/admin tooling.
drop policy if exists "learning_items_read_all" on public.learning_items;
drop policy if exists "learning_item_skills_read_all" on public.learning_item_skills;
drop policy if exists "learning_item_choices_read_all" on public.learning_item_choices;

create policy "learning_items_read_all"
on public.learning_items
for select
to anon, authenticated
using (is_active = true);

create policy "learning_item_skills_read_all"
on public.learning_item_skills
for select
to anon, authenticated
using (true);

create policy "learning_item_choices_read_all"
on public.learning_item_choices
for select
to anon, authenticated
using (true);

-- Seed: first C++ module (cpp.structs_classes). Idempotent upserts keep this
-- migration safe to re-run.
insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.structs_classes.syntax.lesson',
    'lesson',
    'Defining a struct or class',
    'A struct or class groups related data (member fields) and behavior (member functions) into one type. `struct` members are public by default; `class` members are private by default. Otherwise they are the same. You create an object (an instance) from the type, and each object has its own copy of the member fields.',
    'Use struct for plain data aggregates and class when you want to control access to internal state. Both define a new type from which objects are created.',
    'beginner',
    4,
    10
  ),
  (
    'cpp.structs_classes.syntax.mc_default_access',
    'multiple_choice',
    'Default access in a struct',
    'In C++, what is the default access level for members declared in a `struct`?',
    'In a `struct`, members are public by default. In a `class`, members are private by default. That is the only language-level difference between the two.',
    'beginner',
    2,
    20
  ),
  (
    'cpp.structs_classes.syntax.code_reading_object',
    'code_reading',
    'Reading a small class',
    'Read this type:\n\n```cpp\nclass Point {\npublic:\n  int x;\n  int y;\n};\n\nPoint p;\np.x = 3;\np.y = 4;\n```\n\nWhat does this code create, and how many independent fields does `p` hold?',
    'It defines a class `Point` with two public int members and creates one object `p`. `p` holds its own `x` and `y`. A second `Point` would have its own separate `x` and `y`.',
    'beginner',
    3,
    30
  ),
  (
    'cpp.structs_classes.public_private.concept_access',
    'concept_check',
    'Why mark members private?',
    'Why might you make a member field `private` instead of `public`?',
    'Private members can only be touched by the class''s own methods, so the class controls how its state changes and can keep that state valid. Public fields can be changed by anyone, which makes invariants hard to guarantee.',
    'beginner',
    2,
    110
  ),
  (
    'cpp.structs_classes.public_private.bug_access',
    'bug_spotting',
    'Spot the access error',
    'This does not compile:\n\n```cpp\nclass Account {\n  double balance_; // private by default\n};\n\nAccount a;\na.balance_ = 100.0; // error\n```\n\nWhy does the compiler reject the last line?',
    '`balance_` is private (class members are private by default), so code outside the class cannot read or write it directly. A public method such as `deposit(double)` would be the supported way to change it.',
    'beginner',
    3,
    120
  ),
  (
    'cpp.structs_classes.const_methods_intro.mc_const_call',
    'multiple_choice',
    'Calling a method on a const object',
    'Given `const Widget w;`, which methods of `Widget` can you call on `w`?',
    'On a const object you may only call methods marked `const` (const-qualified member functions), because the compiler must guarantee the call will not modify the object.',
    'beginner',
    2,
    210
  ),
  (
    'cpp.structs_classes.invariants_intro.lesson',
    'lesson',
    'What is a class invariant?',
    'A class invariant is a rule about an object''s state that should always be true after construction and after every public method returns. For example, a `Date` might require that the month is between 1 and 12. Constructors establish the invariant; public methods preserve it. Making fields private is what lets the class enforce its invariants.',
    'Think of an invariant as a promise the object keeps. If a public method could leave the object in a state that breaks the promise, the invariant is not protected.',
    'beginner',
    4,
    310
  ),
  (
    'cpp.structs_classes.invariants_intro.mc_invariant',
    'multiple_choice',
    'Identifying an invariant',
    'A `Temperature` class stores Kelvin and must never be negative. Which statement is the class invariant?',
    'The invariant is the rule that must always hold: the stored Kelvin value is greater than or equal to zero. Constructors and methods must never leave the object violating it.',
    'beginner',
    2,
    320
  )
on conflict (id) do update
set
  type = excluded.type,
  title = excluded.title,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.learning_item_skills (learning_item_id, skill_id, is_primary)
values
  ('cpp.structs_classes.syntax.lesson', 'cpp.structs_classes.syntax', true),
  ('cpp.structs_classes.syntax.mc_default_access', 'cpp.structs_classes.syntax', true),
  ('cpp.structs_classes.syntax.code_reading_object', 'cpp.structs_classes.syntax', true),
  ('cpp.structs_classes.public_private.concept_access', 'cpp.structs_classes.public_private', true),
  ('cpp.structs_classes.public_private.bug_access', 'cpp.structs_classes.public_private', true),
  ('cpp.structs_classes.public_private.bug_access', 'cpp.structs_classes.syntax', false),
  ('cpp.structs_classes.const_methods_intro.mc_const_call', 'cpp.structs_classes.const_methods_intro', true),
  ('cpp.structs_classes.invariants_intro.lesson', 'cpp.structs_classes.invariants_intro', true),
  ('cpp.structs_classes.invariants_intro.mc_invariant', 'cpp.structs_classes.invariants_intro', true),
  ('cpp.structs_classes.invariants_intro.mc_invariant', 'cpp.structs_classes.public_private', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.structs_classes.syntax.mc_default_access.a', 'cpp.structs_classes.syntax.mc_default_access', 'Public', true, 10),
  ('cpp.structs_classes.syntax.mc_default_access.b', 'cpp.structs_classes.syntax.mc_default_access', 'Private', false, 20),
  ('cpp.structs_classes.syntax.mc_default_access.c', 'cpp.structs_classes.syntax.mc_default_access', 'Protected', false, 30),
  ('cpp.structs_classes.syntax.mc_default_access.d', 'cpp.structs_classes.syntax.mc_default_access', 'It depends on the compiler', false, 40),

  ('cpp.structs_classes.const_methods_intro.mc_const_call.a', 'cpp.structs_classes.const_methods_intro.mc_const_call', 'Only methods marked const', true, 10),
  ('cpp.structs_classes.const_methods_intro.mc_const_call.b', 'cpp.structs_classes.const_methods_intro.mc_const_call', 'Any method at all', false, 20),
  ('cpp.structs_classes.const_methods_intro.mc_const_call.c', 'cpp.structs_classes.const_methods_intro.mc_const_call', 'Only methods that take no arguments', false, 30),
  ('cpp.structs_classes.const_methods_intro.mc_const_call.d', 'cpp.structs_classes.const_methods_intro.mc_const_call', 'Only private methods', false, 40),

  ('cpp.structs_classes.invariants_intro.mc_invariant.a', 'cpp.structs_classes.invariants_intro.mc_invariant', 'The stored Kelvin value is always >= 0', true, 10),
  ('cpp.structs_classes.invariants_intro.mc_invariant.b', 'cpp.structs_classes.invariants_intro.mc_invariant', 'The class has a constructor', false, 20),
  ('cpp.structs_classes.invariants_intro.mc_invariant.c', 'cpp.structs_classes.invariants_intro.mc_invariant', 'The Kelvin field is public', false, 30),
  ('cpp.structs_classes.invariants_intro.mc_invariant.d', 'cpp.structs_classes.invariants_intro.mc_invariant', 'Temperatures are stored as integers', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
