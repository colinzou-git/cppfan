with diagnostic_seed(module_id, learning_item_id, module_position) as (
  values
  ('cpp.values_types', 'cpp.values_types.variables.mc_auto', 1),
  ('cpp.functions', 'cpp.functions.basics.mc_scope', 1),
  ('cpp.references', 'cpp.references.references.mc_init', 1),
  ('cpp.structs_classes', 'cpp.structs_classes.syntax.mc_default_access', 1),
  ('cpp.stl', 'cpp.stl.algorithms.mc_sort', 1),
  ('dsa.complexity', 'dsa.complexity.big_o.mc_single_loop', 1),
  ('dsa.arrays', 'dsa.arrays.indexing.mc_last_index', 1),
  ('cpp.values_types', 'cpp.program_basics.structure.mc_entry', 2),
  ('cpp.functions', 'cpp.functions.decomposition.mc_why', 2),
  ('cpp.references', 'cpp.references.pointers.mc_null', 2),
  ('cpp.structs_classes', 'cpp.structs_classes.syntax.code_reading_object', 2),
  ('cpp.stl', 'cpp.stl.vector.mc_at', 2),
  ('dsa.complexity', 'dsa.complexity.problem_solving.mc_first_step', 2),
  ('dsa.arrays', 'dsa.arrays.traversal.code_reading', 2),
  ('cpp.values_types', 'cpp.program_basics.io.mc_read', 3),
  ('cpp.references', 'cpp.references.const_correctness.mc_constref', 3),
  ('cpp.structs_classes', 'cpp.structs_classes.public_private.concept_access', 3),
  ('cpp.stl', 'cpp.stl.string.code_reading', 3),
  ('dsa.complexity', 'dsa.complexity.growth_rates.mc_order', 3),
  ('dsa.arrays', 'dsa.arrays.traversal.mc_safe_loop', 3),
  ('cpp.values_types', 'cpp.program_basics.statements_comments.mc_terminate', 4),
  ('cpp.references', 'cpp.references.parameter_passing.mc_large', 4),
  ('cpp.structs_classes', 'cpp.structs_classes.public_private.bug_access', 4),
  ('cpp.stl', 'cpp.stl.string.mc_size', 4),
  ('dsa.complexity', 'dsa.complexity.amortized.mc_pushback', 4),
  ('dsa.arrays', 'dsa.searching.binary_search.mc_precondition', 4),
  ('cpp.values_types', 'cpp.program_basics.exit_status.mc_success', 5),
  ('cpp.references', 'cpp.references.lvalue_rvalue.mc_classify', 5),
  ('cpp.structs_classes', 'cpp.structs_classes.const_methods_intro.mc_const_call', 5),
  ('cpp.stl', 'cpp.stl.map.mc_check_key', 5),
  ('dsa.complexity', 'dsa.complexity.constraints.mc_feasible', 5),
  ('dsa.arrays', 'dsa.sorting.comparator.mc_descending', 5),
  ('cpp.values_types', 'cpp.program_basics.error_kinds.mc_classify', 6),
  ('cpp.references', 'cpp.references.return_semantics.mc_local', 6),
  ('cpp.structs_classes', 'cpp.structs_classes.invariants_intro.mc_invariant', 6),
  ('cpp.stl', 'cpp.stl.set.mc_insert_dup', 6),
  ('dsa.complexity', 'dsa.complexity.pattern_recognition.mc_window', 6),
  ('dsa.arrays', 'dsa.stacks.basic_stack.mc_parens', 6),
  ('cpp.values_types', 'cpp.values_types.conversions.mc_static_cast', 7),
  ('cpp.references', 'cpp.references.dangling.mc_extension', 7),
  ('cpp.structs_classes', 'cpp.constructors.default_constructor.mc_default_needed', 7),
  ('cpp.stl', 'cpp.stl.iterators.mc_end', 7),
  ('dsa.complexity', 'dsa.complexity.container_selection.mc_membership', 7),
  ('dsa.arrays', 'dsa.hashing.lookup.mc_advantage', 7),
  ('cpp.values_types', 'cpp.values_types.fundamental_types.mc_money', 8),
  ('cpp.references', 'cpp.references.pointer_const.mc_which', 8),
  ('cpp.structs_classes', 'cpp.constructors.parameterized_constructor.code_reading', 8),
  ('cpp.stl', 'cpp.stl.adapters.mc_lifo', 8),
  ('dsa.complexity', 'dsa.complexity.recursion_choice.mc_backtracking', 8),
  ('dsa.arrays', 'dsa.arrays.two_pointers.mc_complexity', 8),
  ('cpp.values_types', 'cpp.values_types.signed_unsigned.mc_compare', 9),
  ('cpp.references', 'cpp.references.non_owning.mc_select', 9),
  ('cpp.structs_classes', 'cpp.constructors.parameterized_constructor.mc_benefit', 9),
  ('cpp.stl', 'cpp.stl.lambdas.mc_capture', 9),
  ('dsa.complexity', 'dsa.complexity.problem_framing.mc_clarify', 9),
  ('dsa.arrays', 'dsa.recursion.base_case.mc_no_base', 9),
  ('cpp.values_types', 'cpp.values_types.literals.mc_intdiv', 10),
  ('cpp.references', 'cpp.references.views.mc_use', 10),
  ('cpp.structs_classes', 'cpp.constructors.member_initializer_list.bug_const_member', 10),
  ('cpp.stl', 'cpp.templates.function_templates.mc_purpose', 10)
), inserted_placement as (
  insert into public.placement_module_items (module_id, learning_item_id, order_index)
  select module_id, learning_item_id, module_position * 10
  from diagnostic_seed
  on conflict (module_id, learning_item_id) do update
  set order_index = excluded.order_index
  returning learning_item_id
)
insert into public.goal_evaluation_items (
  learning_item_id,
  primary_skill_id,
  module_id,
  difficulty_band,
  diagnostic_weight,
  prerequisite_level,
  item_type,
  estimated_minutes,
  placement_eligible,
  goal_evaluation_eligible,
  pool_version,
  retired_at
)
select
  seed.learning_item_id,
  skill.skill_id,
  seed.module_id,
  case item.difficulty when 'beginner' then 2 when 'advanced' then 4 else 3 end,
  case when item.type = 'multiple_choice' then 2 else 3 end,
  least(5, greatest(1, ((seed.module_position - 1) / 2) + 1)),
  item.type,
  item.estimated_minutes,
  true,
  true,
  1,
  null
from diagnostic_seed seed
join public.learning_items item on item.id = seed.learning_item_id and item.is_active = true
join lateral (
  select lis.skill_id
  from public.learning_item_skills lis
  where lis.learning_item_id = seed.learning_item_id
  order by lis.is_primary desc, lis.skill_id
  limit 1
) skill on true
where exists (
  select 1 from public.learning_item_choices choice
  where choice.learning_item_id = seed.learning_item_id
)
on conflict (learning_item_id) do update
set
  primary_skill_id = excluded.primary_skill_id,
  module_id = excluded.module_id,
  difficulty_band = excluded.difficulty_band,
  diagnostic_weight = excluded.diagnostic_weight,
  prerequisite_level = excluded.prerequisite_level,
  item_type = excluded.item_type,
  estimated_minutes = excluded.estimated_minutes,
  placement_eligible = excluded.placement_eligible,
  goal_evaluation_eligible = excluded.goal_evaluation_eligible,
  pool_version = excluded.pool_version,
  retired_at = null,
  updated_at = now();
