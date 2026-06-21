-- Roadmap #72 / #123 (adaptive practice): first Parsons progression. Adds the
-- `parsons` learning-item type, an answer-locked block table, one seeded Parsons
-- problem (order a loop that sums 1..n), and a SECURITY DEFINER grading function.
--
-- Like learning_item_choices.is_correct, the answer-bearing columns
-- (correct_order, is_distractor) are never readable by clients: grading runs
-- server-side and returns only structural feedback, never the full solution.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

-- 1. Allow the new item type. The original CHECK is the unnamed column check
-- (default name learning_items_type_check); replace it with the extended list.
-- Include later additive item types too so re-running the full migration folder
-- against an already-migrated production database does not temporarily narrow
-- the constraint and fail on existing worked_example/completion rows.
alter table public.learning_items drop constraint if exists learning_items_type_check;
alter table public.learning_items add constraint learning_items_type_check
  check (type in ('lesson', 'concept_check', 'multiple_choice', 'code_reading', 'bug_spotting', 'parsons', 'worked_example', 'completion'));

-- 2. Parsons block bank. content is learner-facing; correct_order and
-- is_distractor are the answer key.
create table if not exists public.learning_item_parsons_blocks (
  id text primary key,
  learning_item_id text not null references public.learning_items(id) on delete cascade,
  content text not null,
  correct_order integer not null default 0,
  is_distractor boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.learning_item_parsons_blocks enable row level security;

create index if not exists learning_item_parsons_blocks_item_idx
  on public.learning_item_parsons_blocks (learning_item_id, correct_order);

drop policy if exists "parsons_blocks_read_all" on public.learning_item_parsons_blocks;
create policy "parsons_blocks_read_all"
on public.learning_item_parsons_blocks
for select
to anon, authenticated
using (true);

-- Column lockdown: hide the answer key. RLS still governs which rows are visible.
revoke select on public.learning_item_parsons_blocks from anon, authenticated;
grant select (id, learning_item_id, content) on public.learning_item_parsons_blocks to anon, authenticated;

-- 3. Seed one progression (loop that sums 1..n).
insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.control_flow.loops.parsons_sum',
    'parsons',
    'Arrange a loop that sums 1..n',
    'Drag the lines into the correct order to build a function that returns the sum 1 + 2 + ... + n with a for loop. One line does not belong — leave it out.',
    'Initialize an accumulator before the loop, iterate i from 1 through n adding i each time, then return the accumulator. Subtracting i would compute the wrong total, so that line is a distractor.',
    'beginner',
    3,
    4410
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
  ('cpp.control_flow.loops.parsons_sum', 'cpp.control_flow.loops', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_parsons_blocks (id, learning_item_id, content, correct_order, is_distractor)
values
  ('cpp.control_flow.loops.parsons_sum.b1', 'cpp.control_flow.loops.parsons_sum', 'int sum = 0;', 1, false),
  ('cpp.control_flow.loops.parsons_sum.b2', 'cpp.control_flow.loops.parsons_sum', 'for (int i = 1; i <= n; ++i) {', 2, false),
  ('cpp.control_flow.loops.parsons_sum.b3', 'cpp.control_flow.loops.parsons_sum', '  sum += i;', 3, false),
  ('cpp.control_flow.loops.parsons_sum.b4', 'cpp.control_flow.loops.parsons_sum', '}', 4, false),
  ('cpp.control_flow.loops.parsons_sum.b5', 'cpp.control_flow.loops.parsons_sum', 'return sum;', 5, false),
  ('cpp.control_flow.loops.parsons_sum.d1', 'cpp.control_flow.loops.parsons_sum', '  sum -= i;', 0, true)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  correct_order = excluded.correct_order,
  is_distractor = excluded.is_distractor;

-- 4. Server-side grading. Runs as the function owner (bypasses the column
-- lockdown). Returns whether the submitted order is exactly correct plus the
-- count of correctly-placed blocks (partial feedback), never the solution.
create or replace function public.grade_parsons_attempt(p_item_id text, p_block_ids text[])
returns table (is_correct boolean, correct_count integer, total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_solution text[];
  v_total integer;
  v_correct_count integer := 0;
  v_submitted_len integer := coalesce(array_length(p_block_ids, 1), 0);
  i integer;
begin
  select array_agg(b.id order by b.correct_order)
    into v_solution
    from public.learning_item_parsons_blocks b
    where b.learning_item_id = p_item_id and not b.is_distractor;

  if v_solution is null then
    return; -- ungradeable: caller falls back / treats as invalid
  end if;

  v_total := array_length(v_solution, 1);

  for i in 1 .. least(v_total, v_submitted_len) loop
    if p_block_ids[i] = v_solution[i] then
      v_correct_count := v_correct_count + 1;
    end if;
  end loop;

  return query select
    (v_submitted_len = v_total and v_correct_count = v_total),
    v_correct_count,
    v_total;
end;
$$;

revoke all on function public.grade_parsons_attempt(text, text[]) from public;
grant execute on function public.grade_parsons_attempt(text, text[]) to anon, authenticated;
