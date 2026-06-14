-- Roadmap #73 / #126 (wrong-answer remediation): map distractor choices to stable
-- instructional error tags. Like learning_item_choices.is_correct, this is
-- PROTECTED grading metadata: the table is not readable by clients, and the tag
-- for a selected choice is returned only through a SECURITY DEFINER function
-- (after the learner has submitted). Mirrors src/features/remediation/error-tags.ts.
-- Idempotent.

create table if not exists public.choice_error_tags (
  choice_id text primary key references public.learning_item_choices(id) on delete cascade,
  instructional_tag text not null,
  created_at timestamptz not null default now()
);

alter table public.choice_error_tags enable row level security;

-- Protected metadata: no client read policy, and revoke table privileges so
-- neither anon nor authenticated can read the mapping directly. Only the
-- SECURITY DEFINER function below (running as the owner) may read it.
revoke all on public.choice_error_tags from anon, authenticated;

insert into public.choice_error_tags (choice_id, instructional_tag)
values
  ('cpp.references.references.mc_init.b', 'cpp.references.copy_vs_alias'),
  ('cpp.references.references.mc_init.c', 'cpp.references.copy_vs_alias'),
  ('cpp.references.references.mc_init.d', 'cpp.references.copy_vs_alias'),
  ('cpp.structs_classes.syntax.mc_default_access.b', 'cpp.structs_classes.struct_default_access'),
  ('cpp.structs_classes.syntax.mc_default_access.c', 'cpp.structs_classes.struct_default_access'),
  ('cpp.structs_classes.syntax.mc_default_access.d', 'cpp.structs_classes.struct_default_access'),
  ('dsa.complexity.big_o.mc_single_loop.b', 'dsa.complexity.loop_cost'),
  ('dsa.complexity.big_o.mc_single_loop.c', 'dsa.complexity.loop_cost'),
  ('dsa.complexity.big_o.mc_single_loop.d', 'dsa.complexity.loop_cost')
on conflict (choice_id) do update
set instructional_tag = excluded.instructional_tag;

-- Return the instructional tag for a submitted choice (or null). Runs as the
-- function owner so it can read the protected table; safe to call only after the
-- learner has chosen, so it never leaks tags before submission.
create or replace function public.get_choice_error_tag(p_choice_id text)
returns text
language sql
security definer
set search_path = public
as $$
  select t.instructional_tag
    from public.choice_error_tags t
    where t.choice_id = p_choice_id;
$$;

revoke all on function public.get_choice_error_tag(text) from public;
grant execute on function public.get_choice_error_tag(text) to anon, authenticated;
