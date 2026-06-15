-- Roadmap #72 / #123 (adaptive practice): worked-example and completion item
-- types, completing the loop-sum progression (worked example -> completion ->
-- Parsons). worked_example is content-only; completion adds answer-locked blanks
-- and a SECURITY DEFINER grading function that returns only structural feedback,
-- never the answers. Idempotent; mirrored in
-- src/features/learning-items/learning-item-seed.ts.

-- 1. Allow the two new item types alongside the existing ones (incl. parsons).
alter table public.learning_items drop constraint if exists learning_items_type_check;
alter table public.learning_items add constraint learning_items_type_check
  check (type in ('lesson', 'concept_check', 'multiple_choice', 'code_reading', 'bug_spotting', 'parsons', 'worked_example', 'completion'));

-- 2. Completion blank bank. position is learner-facing; answer is the answer key.
create table if not exists public.learning_item_completion_blanks (
  id text primary key,
  learning_item_id text not null references public.learning_items(id) on delete cascade,
  position integer not null,
  answer text not null,
  created_at timestamptz not null default now()
);

alter table public.learning_item_completion_blanks enable row level security;

create index if not exists learning_item_completion_blanks_item_idx
  on public.learning_item_completion_blanks (learning_item_id, position);

drop policy if exists "completion_blanks_read_all" on public.learning_item_completion_blanks;
create policy "completion_blanks_read_all"
on public.learning_item_completion_blanks
for select
to anon, authenticated
using (true);

-- Column lockdown: hide the answer. RLS still governs which rows are visible.
revoke select on public.learning_item_completion_blanks from anon, authenticated;
grant select (id, learning_item_id, position) on public.learning_item_completion_blanks to anon, authenticated;

-- 3. Seed the worked example (content-only) and completion items.
insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.control_flow.loops.worked_sum',
    'worked_example',
    'Worked example: sum 1..n with a loop',
    E'Follow the reasoning to build a function that returns 1 + 2 + ... + n.\n\nStep 1 — declare an accumulator and start it at the additive identity: int sum = 0;\nStep 2 — visit each value once with a for loop from 1 to n inclusive.\nStep 3 — add the current value inside the loop: sum += i;\nStep 4 — return the total after the loop.\n\nint sumTo(int n) {\n  int sum = 0;\n  for (int i = 1; i <= n; ++i) {\n    sum += i;\n  }\n  return sum;\n}',
    'The shape is initialize-before, accumulate-inside, return-after — the standard accumulator loop. Start sum at 0 for addition; for a product you would start at 1 and multiply.',
    'beginner',
    4,
    4406
  ),
  (
    'cpp.control_flow.loops.completion_sum',
    'completion',
    'Complete the sum loop',
    E'Fill in the three blanks to finish a function that returns 1 + 2 + ... + n:\n\nint sumTo(int n) {\n  int sum = ___(1)___;\n  for (int i = 1; i <= n; ++i) {\n    sum ___(2)___ i;\n  }\n  return ___(3)___;\n}\n\nBlank 1: the starting value of the accumulator. Blank 2: the compound operator that adds i to sum. Blank 3: the variable to return.',
    'Blank 1 is 0 (start the accumulator at the additive identity), blank 2 is += (add i into the running total), blank 3 is sum (return the accumulated total).',
    'beginner',
    3,
    4408
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
  ('cpp.control_flow.loops.worked_sum', 'cpp.control_flow.loops', true),
  ('cpp.control_flow.loops.completion_sum', 'cpp.control_flow.loops', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

-- 4. Completion blanks (answer key).
insert into public.learning_item_completion_blanks (id, learning_item_id, position, answer)
values
  ('cpp.control_flow.loops.completion_sum.k1', 'cpp.control_flow.loops.completion_sum', 1, '0'),
  ('cpp.control_flow.loops.completion_sum.k2', 'cpp.control_flow.loops.completion_sum', 2, '+='),
  ('cpp.control_flow.loops.completion_sum.k3', 'cpp.control_flow.loops.completion_sum', 3, 'sum')
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  position = excluded.position,
  answer = excluded.answer;

-- 5. Server-side grading. Runs as the function owner (bypasses the column
-- lockdown). Compares trimmed, case-folded answers position by position and
-- returns the correctly-filled count (partial feedback), never the answers.
create or replace function public.grade_completion_attempt(p_item_id text, p_answers text[])
returns table (is_correct boolean, correct_count integer, total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_solution text[];
  v_total integer;
  v_correct_count integer := 0;
  v_submitted_len integer := coalesce(array_length(p_answers, 1), 0);
  i integer;
begin
  select array_agg(b.answer order by b.position)
    into v_solution
    from public.learning_item_completion_blanks b
    where b.learning_item_id = p_item_id;

  if v_solution is null then
    return; -- ungradeable: caller falls back / treats as invalid
  end if;

  v_total := array_length(v_solution, 1);

  for i in 1 .. least(v_total, v_submitted_len) loop
    if lower(btrim(p_answers[i])) = lower(btrim(v_solution[i])) then
      v_correct_count := v_correct_count + 1;
    end if;
  end loop;

  return query select
    (v_submitted_len = v_total and v_correct_count = v_total),
    v_correct_count,
    v_total;
end;
$$;

revoke all on function public.grade_completion_attempt(text, text[]) from public;
grant execute on function public.grade_completion_attempt(text, text[]) to anon, authenticated;
