-- Roadmap #73 / #125 (optional placement): placement assessment DEFINITIONS.
-- A short, optional assessment assembled from existing learning items that
-- suggests where a learner should start. These are shared curriculum tables
-- (read-only for everyone), mirroring src/features/placement/placement-seed.ts.
--
-- Per-learner placement attempts/results (RLS-protected) and the onboarding flow
-- are a follow-up slice; this migration only adds the reusable definitions.
-- Idempotent.

create table if not exists public.placement_modules (
  module_id text primary key,
  title text not null,
  order_index integer not null
);

create table if not exists public.placement_module_items (
  module_id text not null references public.placement_modules(module_id) on delete cascade,
  learning_item_id text not null references public.learning_items(id) on delete cascade,
  order_index integer not null default 0,
  primary key (module_id, learning_item_id)
);

alter table public.placement_modules enable row level security;
alter table public.placement_module_items enable row level security;

create index if not exists placement_module_items_module_idx
  on public.placement_module_items (module_id, order_index);

-- Shared curriculum content: read-only for anon and authenticated users.
drop policy if exists "placement_modules_read_all" on public.placement_modules;
drop policy if exists "placement_module_items_read_all" on public.placement_module_items;

create policy "placement_modules_read_all"
on public.placement_modules
for select
to anon, authenticated
using (true);

create policy "placement_module_items_read_all"
on public.placement_module_items
for select
to anon, authenticated
using (true);

insert into public.placement_modules (module_id, title, order_index)
values
  ('cpp.values_types', 'C++ values and types', 10),
  ('cpp.functions', 'Functions', 20),
  ('cpp.references', 'References and pointers', 30),
  ('cpp.structs_classes', 'Structs and classes', 40),
  ('cpp.stl', 'The standard library', 50),
  ('dsa.complexity', 'Complexity', 60),
  ('dsa.arrays', 'Arrays and DSA foundations', 70)
on conflict (module_id) do update
set
  title = excluded.title,
  order_index = excluded.order_index;

insert into public.placement_module_items (module_id, learning_item_id, order_index)
values
  ('cpp.values_types', 'cpp.values_types.variables.mc_auto', 10),
  ('cpp.functions', 'cpp.functions.basics.mc_scope', 10),
  ('cpp.references', 'cpp.references.references.mc_init', 10),
  ('cpp.structs_classes', 'cpp.structs_classes.syntax.mc_default_access', 10),
  ('cpp.stl', 'cpp.stl.algorithms.mc_sort', 10),
  ('dsa.complexity', 'dsa.complexity.big_o.mc_single_loop', 10),
  ('dsa.arrays', 'dsa.arrays.indexing.mc_last_index', 10)
on conflict (module_id, learning_item_id) do update
set order_index = excluded.order_index;
