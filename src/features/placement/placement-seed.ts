// Optional placement assessment definitions (#125, ADR 0005). A short, optional
// assessment assembled from EXISTING learning items (reuse, never duplicate) that
// suggests where a learner should start. Typed seed first, mirrored by an
// idempotent migration in the same seed<->migration lockstep as the curriculum.
// This is suggestion-only: it never locks content or writes durable mastery.

export type PlacementModule = {
  module_id: string;
  title: string;
  order_index: number;
  /** Existing learning_item ids used to gauge familiarity with this module. */
  item_ids: string[];
};

export const INITIAL_PLACEMENT_QUESTION_COUNT = 7;
export const PLACEMENT_QUESTION_BATCH_SIZE = 7;
export const MAX_PLACEMENT_QUESTION_COUNT = 60;

export const placementModules: PlacementModule[] = [
  {
    module_id: "cpp.values_types",
    title: "C++ values and types",
    order_index: 10,
    item_ids: [
      "cpp.values_types.variables.mc_auto",
      "cpp.program_basics.structure.mc_entry",
      "cpp.program_basics.io.mc_read",
      "cpp.program_basics.statements_comments.mc_terminate",
      "cpp.program_basics.exit_status.mc_success",
      "cpp.program_basics.error_kinds.mc_classify",
      "cpp.values_types.conversions.mc_static_cast",
      "cpp.values_types.fundamental_types.mc_money",
      "cpp.values_types.signed_unsigned.mc_compare",
      "cpp.values_types.literals.mc_intdiv",
      "cpp.control_flow.conditionals.mc_fallthrough",
      "cpp.control_flow.loops.mc_offbyone",
      "cpp.control_flow.logical_operators.mc_shortcircuit",
      "cpp.control_flow.switch_statement.mc_nobreak",
      "cpp.control_flow.loop_invariants.mc_halfopen"
    ]
  },
  {
    module_id: "cpp.functions",
    title: "Functions",
    order_index: 20,
    item_ids: ["cpp.functions.basics.mc_scope", "cpp.functions.decomposition.mc_why"]
  },
  {
    module_id: "cpp.references",
    title: "References and pointers",
    order_index: 30,
    item_ids: [
      "cpp.references.references.mc_init",
      "cpp.references.pointers.mc_null",
      "cpp.references.const_correctness.mc_constref",
      "cpp.references.parameter_passing.mc_large",
      "cpp.references.lvalue_rvalue.mc_classify",
      "cpp.references.return_semantics.mc_local",
      "cpp.references.dangling.mc_extension",
      "cpp.references.pointer_const.mc_which",
      "cpp.references.non_owning.mc_select",
      "cpp.references.views.mc_use"
    ]
  },
  {
    module_id: "cpp.structs_classes",
    title: "Structs and classes",
    order_index: 40,
    item_ids: [
      "cpp.structs_classes.syntax.mc_default_access",
      "cpp.structs_classes.syntax.code_reading_object",
      "cpp.structs_classes.public_private.concept_access",
      "cpp.structs_classes.public_private.bug_access",
      "cpp.structs_classes.const_methods_intro.mc_const_call",
      "cpp.structs_classes.invariants_intro.mc_invariant",
      "cpp.constructors.default_constructor.mc_default_needed",
      "cpp.constructors.parameterized_constructor.code_reading",
      "cpp.constructors.parameterized_constructor.mc_benefit",
      "cpp.constructors.member_initializer_list.bug_const_member",
      "cpp.constructors.destructor_intro.mc_destruction_order",
      "cpp.value_semantics.copy.mc_shallow",
      "cpp.value_semantics.move.mc_source",
      "cpp.value_semantics.rule_of_zero_five.mc_zero",
      "cpp.value_semantics.special_members.mc_which",
      "cpp.value_semantics.copy_elision.mc_return",
      "cpp.value_semantics.operators.mc_explicit",
      "cpp.value_semantics.self_assignment.mc_guard",
      "cpp.raii.resource_lifetime.mc_ties",
      "cpp.smart_pointers.unique_ptr.mc_no_copy"
    ]
  },
  {
    module_id: "cpp.stl",
    title: "The standard library",
    order_index: 50,
    item_ids: [
      "cpp.stl.algorithms.mc_sort",
      "cpp.stl.vector.mc_at",
      "cpp.stl.string.code_reading",
      "cpp.stl.string.mc_size",
      "cpp.stl.map.mc_check_key",
      "cpp.stl.set.mc_insert_dup",
      "cpp.stl.iterators.mc_end",
      "cpp.stl.adapters.mc_lifo",
      "cpp.stl.lambdas.mc_capture",
      "cpp.templates.function_templates.mc_purpose",
      "cpp.templates.class_templates.mc_vector",
      "cpp.templates.concepts.mc_role",
      "cpp.templates.ranges.mc_views",
      "cpp.templates.constexpr.mc_eval",
      "cpp.templates.if_constexpr.mc_discarded",
      "cpp.templates.static_assert.mc_when",
      "cpp.templates.multiple_params.mc_nttp",
      "cpp.templates.deduction.mc_headers",
      "cpp.templates.aliases_specialization.mc_alias",
      "cpp.tooling.testing.mc_regression"
    ]
  },
  {
    module_id: "dsa.complexity",
    title: "Complexity",
    order_index: 60,
    item_ids: [
      "dsa.complexity.big_o.mc_single_loop",
      "dsa.complexity.problem_solving.mc_first_step",
      "dsa.complexity.growth_rates.mc_order",
      "dsa.complexity.amortized.mc_pushback",
      "dsa.complexity.constraints.mc_feasible",
      "dsa.complexity.pattern_recognition.mc_window",
      "dsa.complexity.container_selection.mc_membership",
      "dsa.complexity.recursion_choice.mc_backtracking",
      "dsa.complexity.problem_framing.mc_clarify",
      "dsa.complexity.test_examples.mc_why",
      "dsa.complexity.bruteforce_then_optimize.mc_step"
    ]
  },
  {
    module_id: "dsa.arrays",
    title: "Arrays and DSA foundations",
    order_index: 70,
    item_ids: [
      "dsa.arrays.indexing.mc_last_index",
      "dsa.arrays.traversal.code_reading",
      "dsa.arrays.traversal.mc_safe_loop",
      "dsa.searching.binary_search.mc_precondition",
      "dsa.sorting.comparator.mc_descending",
      "dsa.stacks.basic_stack.mc_parens",
      "dsa.hashing.lookup.mc_advantage",
      "dsa.arrays.two_pointers.mc_complexity",
      "dsa.recursion.base_case.mc_no_base",
      "dsa.trees.linked_list.mc_access",
      "dsa.trees.tree_terminology.mc_height",
      "dsa.graphs.representation.mc_sparse",
      "dsa.graphs.bfs.mc_shortest",
      "dsa.techniques.prefix_sums.mc_query",
      "dsa.techniques.sliding_window.mc_complexity",
      "dsa.strings.searching.mc_kmp",
      "dsa.strings.parsing.mc_delim"
    ]
  }
];

/** Placement modules in display order. */
export function getPlacementModules(): PlacementModule[] {
  return [...placementModules].sort((a, b) => a.order_index - b.order_index);
}

/** Every distinct learning item used by the assessment, in module/display order. */
export function getPlacementItemIds(): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const module of getPlacementModules()) {
    for (const id of module.item_ids) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
}
