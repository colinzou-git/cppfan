-- cppFan skill map and prerequisite seed data.
--
-- This migration adds the first real learning-content foundation.
-- It intentionally does not add review cards, quiz attempts, FSRS state, or mastery scoring.

create table if not exists public.skills (
  id text primary key,
  domain text not null check (domain in ('cpp', 'dsa')),
  module_id text not null,
  title text not null,
  description text not null,
  learner_goal text not null,
  level text not null default 'beginner'
    check (level in ('beginner', 'intermediate', 'advanced')),
  item_types text[] not null default '{}',
  order_index integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_prerequisites (
  skill_id text not null references public.skills(id) on delete cascade,
  prerequisite_skill_id text not null references public.skills(id) on delete cascade,
  relationship_type text not null default 'recommended'
    check (relationship_type in ('recommended', 'required')),
  created_at timestamptz not null default now(),
  primary key (skill_id, prerequisite_skill_id),
  check (skill_id <> prerequisite_skill_id)
);

alter table public.skills enable row level security;
alter table public.skill_prerequisites enable row level security;

create index if not exists skills_module_order_idx
  on public.skills (module_id, order_index);

create index if not exists skills_domain_order_idx
  on public.skills (domain, order_index);

create index if not exists skill_prerequisites_prerequisite_idx
  on public.skill_prerequisites (prerequisite_skill_id);

drop trigger if exists set_skills_updated_at on public.skills;

create trigger set_skills_updated_at
before update on public.skills
for each row
execute function public.set_updated_at();

drop policy if exists "skills_read_all" on public.skills;
drop policy if exists "skill_prerequisites_read_all" on public.skill_prerequisites;

create policy "skills_read_all"
on public.skills
for select
to anon, authenticated
using (is_active = true);

create policy "skill_prerequisites_read_all"
on public.skill_prerequisites
for select
to anon, authenticated
using (true);

insert into public.skills (
  id,
  domain,
  module_id,
  title,
  description,
  learner_goal,
  level,
  item_types,
  order_index
)
values
  (
    'cpp.structs_classes.syntax',
    'cpp',
    'cpp.structs_classes',
    'Struct/class syntax',
    'Define simple structs and classes with member fields and methods.',
    'Write a small type and explain how objects are created from it.',
    'beginner',
    array['lesson', 'fill_blank', 'code_reading'],
    10
  ),
  (
    'cpp.structs_classes.public_private',
    'cpp',
    'cpp.structs_classes',
    'Public and private access',
    'Use access control to protect object state and understand compiler access errors.',
    'Decide which members should be public or private and fix simple access mistakes.',
    'beginner',
    array['quiz', 'bug_spotting', 'code_reading'],
    20
  ),
  (
    'cpp.structs_classes.const_methods_intro',
    'cpp',
    'cpp.structs_classes',
    'Const methods intro',
    'Read const method declarations and understand why const objects need const-safe methods.',
    'Predict whether a method call on a const object should compile.',
    'beginner',
    array['quiz', 'bug_spotting'],
    30
  ),
  (
    'cpp.structs_classes.invariants_intro',
    'cpp',
    'cpp.structs_classes',
    'Class invariants intro',
    'Explain how classes maintain valid state through constructors and member functions.',
    'Describe the rule that must stay true for an object after every public method.',
    'beginner',
    array['lesson', 'concept_check'],
    40
  ),
  (
    'cpp.constructors.default_constructor',
    'cpp',
    'cpp.constructors',
    'Default constructor',
    'Explain and write a constructor with no arguments.',
    'Create an object with safe default state.',
    'beginner',
    array['lesson', 'fill_blank'],
    110
  ),
  (
    'cpp.constructors.parameterized_constructor',
    'cpp',
    'cpp.constructors',
    'Parameterized constructor',
    'Initialize object state through constructor arguments.',
    'Use constructor parameters to make invalid states harder to create.',
    'beginner',
    array['lesson', 'code_reading'],
    120
  ),
  (
    'cpp.constructors.member_initializer_list',
    'cpp',
    'cpp.constructors',
    'Member initializer list',
    'Use initializer lists and explain why they are preferred for direct initialization.',
    'Choose an initializer list over assignment inside the constructor body.',
    'beginner',
    array['quiz', 'bug_spotting'],
    130
  ),
  (
    'cpp.constructors.destructor_intro',
    'cpp',
    'cpp.constructors',
    'Destructor intro',
    'Explain when destructors run and why they matter for resources.',
    'Predict the lifetime order of simple stack objects.',
    'beginner',
    array['lesson', 'predict_output'],
    140
  ),
  (
    'cpp.raii.resource_lifetime',
    'cpp',
    'cpp.raii',
    'Resource lifetime',
    'Connect resource acquisition to object lifetime.',
    'Explain why the object that owns a resource should release it automatically.',
    'intermediate',
    array['lesson', 'concept_check'],
    210
  ),
  (
    'cpp.raii.destructor_cleanup',
    'cpp',
    'cpp.raii',
    'Destructor cleanup',
    'Use destructors to release resources when ownership is manual.',
    'Read a wrapper type and identify the cleanup point.',
    'intermediate',
    array['lesson', 'code_reading'],
    220
  ),
  (
    'cpp.raii.exception_safety_intro',
    'cpp',
    'cpp.raii',
    'Exception safety intro',
    'Explain why RAII helps when code exits early because of return or exception.',
    'Recognize why cleanup should not depend on reaching the last line of a function.',
    'intermediate',
    array['quiz', 'code_reading'],
    230
  ),
  (
    'cpp.raii.ownership_boundary',
    'cpp',
    'cpp.raii',
    'Ownership boundary',
    'Identify which object owns a resource and which code only observes it.',
    'Draw the boundary between owner and non-owner in small examples.',
    'intermediate',
    array['quiz', 'bug_spotting'],
    240
  ),
  (
    'cpp.smart_pointers.unique_ptr',
    'cpp',
    'cpp.smart_pointers',
    'unique_ptr',
    'Use unique ownership and explain why unique_ptr cannot be copied.',
    'Transfer ownership with move and avoid accidental shared ownership.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    310
  ),
  (
    'cpp.smart_pointers.shared_ptr',
    'cpp',
    'cpp.smart_pointers',
    'shared_ptr',
    'Explain shared ownership and reference counting at a beginner-friendly level.',
    'Identify when multiple objects intentionally share ownership.',
    'intermediate',
    array['lesson', 'quiz'],
    320
  ),
  (
    'cpp.smart_pointers.weak_ptr',
    'cpp',
    'cpp.smart_pointers',
    'weak_ptr',
    'Explain non-owning observation and cyclic-reference prevention.',
    'Recognize when a pointer should observe without extending lifetime.',
    'intermediate',
    array['lesson', 'code_reading'],
    330
  ),
  (
    'cpp.smart_pointers.cyclic_reference',
    'cpp',
    'cpp.smart_pointers',
    'Cyclic references',
    'Spot a shared_ptr cycle and explain why it leaks.',
    'Break a cycle by changing one side to weak_ptr.',
    'intermediate',
    array['bug_spotting', 'code_reading'],
    340
  )
on conflict (id) do update
set
  domain = excluded.domain,
  module_id = excluded.module_id,
  title = excluded.title,
  description = excluded.description,
  learner_goal = excluded.learner_goal,
  level = excluded.level,
  item_types = excluded.item_types,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.skill_prerequisites (
  skill_id,
  prerequisite_skill_id,
  relationship_type
)
values
  ('cpp.structs_classes.public_private', 'cpp.structs_classes.syntax', 'recommended'),
  ('cpp.structs_classes.const_methods_intro', 'cpp.structs_classes.public_private', 'recommended'),
  ('cpp.structs_classes.invariants_intro', 'cpp.structs_classes.public_private', 'recommended'),
  ('cpp.constructors.default_constructor', 'cpp.structs_classes.syntax', 'recommended'),
  ('cpp.constructors.parameterized_constructor', 'cpp.constructors.default_constructor', 'recommended'),
  ('cpp.constructors.member_initializer_list', 'cpp.constructors.parameterized_constructor', 'recommended'),
  ('cpp.constructors.destructor_intro', 'cpp.constructors.default_constructor', 'recommended'),
  ('cpp.raii.resource_lifetime', 'cpp.constructors.destructor_intro', 'recommended'),
  ('cpp.raii.destructor_cleanup', 'cpp.raii.resource_lifetime', 'recommended'),
  ('cpp.raii.exception_safety_intro', 'cpp.raii.destructor_cleanup', 'recommended'),
  ('cpp.raii.ownership_boundary', 'cpp.raii.resource_lifetime', 'recommended'),
  ('cpp.smart_pointers.unique_ptr', 'cpp.raii.ownership_boundary', 'recommended'),
  ('cpp.smart_pointers.shared_ptr', 'cpp.raii.ownership_boundary', 'recommended'),
  ('cpp.smart_pointers.weak_ptr', 'cpp.smart_pointers.shared_ptr', 'recommended'),
  ('cpp.smart_pointers.cyclic_reference', 'cpp.smart_pointers.weak_ptr', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
