# cppFan Skill Engine

The skill engine is the learning intelligence layer of cppFan. It connects the curriculum, skill graph, learning items, review scheduling, event logging, mastery scoring, and next-action recommendations.

This document is intended to replace `docs/SKILL_ENGINE.md`.

## Core principle

FSRS review scheduling and skill mastery are related but separate.

| System | Main question | Primary data source | Output |
|---|---|---|---|
| FSRS review scheduling | When should this review item appear again? | `review_cards`, `review_logs` | next due date, stability, difficulty, retrievability |
| Skill mastery | How well does the learner understand this skill? | `skill_events`, quiz results, review logs, practice attempts, hint usage | skill status and mastery score |
| Recommendation engine | What should the learner do next? | due reviews, weak skills, prerequisites, goals, mastery | next review, next lesson, weak-skill practice |

Do not treat an FSRS card state as the same thing as skill mastery.

A learner may have a high FSRS stability for one card but still be weak in the broader skill. For example, the learner may remember the definition of RAII but still fail bug-spotting tasks involving destructor ownership or move semantics.

## Design goals

The skill engine should:

- Represent C++ and DSA as a skill graph, not just a linear course.
- Use prerequisites as recommendations, not hard locks.
- Support short lessons, quizzes, code-reading tasks, bug-spotting tasks, and future coding exercises.
- Track fine-grained evidence for mastery.
- Keep the first implementation rule-based and explainable.
- Leave room for future adaptive algorithms.

## Initial skill hierarchy

Skill ids should be stable, readable, and safe to use in seed data, URLs, tests, and analytics.

Recommended id format:

```text
domain.topic.subtopic
```

Examples:

```text
cpp.structs_classes.public_private
cpp.raii.destructor_cleanup
dsa.arrays.two_pointers
dsa.dp.state_definition
```

## C++ skill tree

### `cpp.basics` — C++ basics

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `cpp.basics.program_structure` | Program structure | Explain includes, `main`, statements, compilation units at a beginner level | lesson, quiz |
| `cpp.basics.variables_types` | Variables and types | Choose appropriate primitive types and understand declarations | lesson, quiz, predict output |
| `cpp.basics.expressions_operators` | Expressions and operators | Predict expression results and operator precedence in common cases | quiz, predict output |
| `cpp.basics.control_flow` | Control flow | Use `if`, `for`, `while`, and `switch` correctly | lesson, code reading |
| `cpp.basics.functions` | Functions | Define and call functions, understand parameters and return values | lesson, quiz, fill blank |
| `cpp.basics.scope_lifetime_intro` | Scope and lifetime intro | Explain block scope and local variable lifetime | lesson, quiz |
| `cpp.basics.references_intro` | References intro | Use references as parameters and distinguish from copies | lesson, code reading |
| `cpp.basics.const_intro` | Const intro | Read and write simple `const` declarations | lesson, quiz |

### `cpp.structs_classes` — Structs and classes

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `cpp.structs_classes.syntax` | Struct/class syntax | Define a simple `struct` or `class` with members | lesson, fill blank |
| `cpp.structs_classes.member_variables` | Member variables | Identify and use object fields correctly | lesson, code reading |
| `cpp.structs_classes.member_functions` | Member functions | Define and call methods on objects | lesson, code reading |
| `cpp.structs_classes.public_private` | Public and private access | Explain access control and fix access errors | quiz, bug spotting |
| `cpp.structs_classes.object_creation` | Object creation | Create stack objects and access members | lesson, predict output |
| `cpp.structs_classes.this_pointer_intro` | `this` pointer intro | Explain when `this` is implied and when it helps | quiz, code reading |
| `cpp.structs_classes.const_methods_intro` | Const methods intro | Understand why a const object can call only const-safe methods | quiz, bug spotting |
| `cpp.structs_classes.invariants_intro` | Class invariants intro | Explain how classes protect valid state | lesson, concept check |
| `cpp.structs_classes.common_mistakes` | Common class mistakes | Spot missing semicolons, access mistakes, accidental copies, and uninitialized fields | bug spotting |

### `cpp.constructors` — Constructors and object lifetime

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `cpp.constructors.default_constructor` | Default constructor | Explain and write a constructor with no arguments | lesson, fill blank |
| `cpp.constructors.parameterized_constructor` | Parameterized constructor | Initialize object state through constructor arguments | lesson, code reading |
| `cpp.constructors.member_initializer_list` | Member initializer list | Use initializer lists and explain why they matter | quiz, bug spotting |
| `cpp.constructors.default_member_initializers` | Default member initializers | Use safe defaults for fields | lesson, quiz |
| `cpp.constructors.copy_constructor_intro` | Copy constructor intro | Recognize when objects are copied | predict output, code reading |
| `cpp.constructors.copy_assignment_intro` | Copy assignment intro | Distinguish copy construction from copy assignment | quiz, code reading |
| `cpp.constructors.move_constructor_intro` | Move constructor intro | Recognize move construction and ownership transfer at a high level | lesson, quiz |
| `cpp.constructors.destructor_intro` | Destructor intro | Explain when destructors run | lesson, predict output |
| `cpp.constructors.rule_of_zero_intro` | Rule of Zero intro | Prefer standard library ownership over manual resource management | lesson, quiz |

### `cpp.raii` — RAII

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `cpp.raii.resource_lifetime` | Resource lifetime | Connect resource acquisition to object lifetime | lesson, concept check |
| `cpp.raii.destructor_cleanup` | Destructor cleanup | Explain how destructors release resources | lesson, code reading |
| `cpp.raii.exception_safety_intro` | Exception safety intro | Explain why RAII helps when code exits early | quiz, code reading |
| `cpp.raii.file_handle_example` | File handle RAII | Understand a wrapper that closes a file or handle | code reading, bug spotting |
| `cpp.raii.lock_guard_example` | Lock guard RAII | Understand scoped locking at a beginner level | lesson, code reading |
| `cpp.raii.ownership_boundary` | Ownership boundary | Identify which object owns a resource | quiz, bug spotting |
| `cpp.raii.double_free_mistake` | Double-free mistake | Spot code that may release the same resource twice | bug spotting |
| `cpp.raii.rule_of_five_intro` | Rule of Five intro | Understand why manual ownership needs copy/move/destructor rules | lesson, quiz |

### `cpp.smart_pointers` — Smart pointers

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `cpp.smart_pointers.unique_ptr` | `unique_ptr` | Use unique ownership and explain non-copyability | lesson, quiz, code reading |
| `cpp.smart_pointers.shared_ptr` | `shared_ptr` | Explain shared ownership and reference counting at a high level | lesson, quiz |
| `cpp.smart_pointers.weak_ptr` | `weak_ptr` | Explain non-owning observation and cyclic-reference prevention | lesson, code reading |
| `cpp.smart_pointers.ownership_transfer` | Ownership transfer | Use move semantics to transfer `unique_ptr` ownership | quiz, fill blank |
| `cpp.smart_pointers.cyclic_reference` | Cyclic references | Spot a `shared_ptr` cycle and explain why it leaks | bug spotting |
| `cpp.smart_pointers.make_unique_make_shared` | Factory helpers | Prefer `make_unique` and `make_shared` in normal code | lesson, quiz |
| `cpp.smart_pointers.raw_pointer_non_owner` | Raw pointer as non-owner | Distinguish owning and non-owning raw pointers | quiz, code reading |

### `cpp.templates_intro` — Templates intro, later module

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `cpp.templates_intro.function_templates` | Function templates | Read and write simple function templates | lesson, fill blank |
| `cpp.templates_intro.class_templates` | Class templates | Read simple class templates such as containers | lesson, code reading |
| `cpp.templates_intro.type_parameters` | Type parameters | Explain what a template parameter represents | quiz |
| `cpp.templates_intro.error_reading` | Template error reading | Extract the useful part of a template error message | debugging task |

## DSA skill tree

### `dsa.arrays` — Arrays and sequences

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `dsa.arrays.indexing` | Indexing | Access elements safely and avoid off-by-one errors | quiz, bug spotting |
| `dsa.arrays.traversal` | Traversal | Iterate through arrays and vectors correctly | code reading, fill blank |
| `dsa.arrays.prefix_sum` | Prefix sums | Use cumulative sums for range queries | lesson, practice |
| `dsa.arrays.two_pointers` | Two pointers | Use two indices to solve pair/window problems | walkthrough, practice |
| `dsa.arrays.sliding_window` | Sliding window | Maintain a moving range and update state efficiently | walkthrough, practice |
| `dsa.arrays.binary_search_on_array` | Binary search on array | Implement binary search and reason about boundaries | bug spotting, practice |
| `dsa.arrays.invariants` | Loop invariants | State what remains true during an array algorithm | concept check |

### `dsa.linked_lists` — Linked lists

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `dsa.linked_lists.node_structure` | Node structure | Explain node value and next pointer | lesson, diagram |
| `dsa.linked_lists.traversal` | Traversal | Walk through a list safely | code reading |
| `dsa.linked_lists.insert_delete` | Insert and delete | Update links without losing nodes | bug spotting, practice |
| `dsa.linked_lists.fast_slow_pointers` | Fast/slow pointers | Use two speeds for middle/cycle problems | walkthrough |
| `dsa.linked_lists.reverse_list` | Reverse list | Reverse links iteratively or recursively | practice |
| `dsa.linked_lists.cycle_detection` | Cycle detection | Detect cycles with fast/slow pointers | practice |
| `dsa.linked_lists.dummy_node` | Dummy node pattern | Simplify edge cases with a sentinel node | code reading, practice |

### `dsa.stacks` — Stacks

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `dsa.stacks.basic_stack` | Basic stack | Use LIFO behavior for simple problems | lesson, quiz |
| `dsa.stacks.parentheses_matching` | Parentheses matching | Validate nested structure with a stack | practice |
| `dsa.stacks.monotonic_stack` | Monotonic stack | Maintain increasing/decreasing candidates | walkthrough, practice |
| `dsa.stacks.expression_evaluation_intro` | Expression evaluation intro | Trace simple stack-based expression logic | code reading |

### `dsa.queues` — Queues and priority queues

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `dsa.queues.basic_queue` | Basic queue | Use FIFO behavior for ordering | lesson, quiz |
| `dsa.queues.deque` | Deque | Use both ends for window and BFS patterns | code reading |
| `dsa.queues.priority_queue` | Priority queue | Use heap behavior for min/max priority problems | lesson, practice |
| `dsa.queues.bfs_queue` | BFS queue pattern | Use a queue to expand states level by level | walkthrough, practice |

### `dsa.trees` — Trees

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `dsa.trees.node_structure` | Tree node structure | Explain value, left child, and right child | lesson, diagram |
| `dsa.trees.recursion_patterns` | Tree recursion patterns | Write base case and combine child results | walkthrough |
| `dsa.trees.dfs_preorder` | Preorder DFS | Trace root-left-right traversal | code reading |
| `dsa.trees.dfs_inorder` | Inorder DFS | Trace left-root-right traversal | code reading |
| `dsa.trees.dfs_postorder` | Postorder DFS | Trace left-right-root traversal | code reading |
| `dsa.trees.bfs_level_order` | Level-order BFS | Traverse tree by levels | practice |
| `dsa.trees.binary_search_tree` | Binary search tree | Use BST ordering for search/insert reasoning | lesson, practice |
| `dsa.trees.height_depth` | Height and depth | Compute height/depth and avoid off-by-one definitions | quiz, practice |

### `dsa.graphs` — Graphs

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `dsa.graphs.representation` | Graph representation | Choose adjacency list/matrix for a problem | lesson, quiz |
| `dsa.graphs.bfs` | Graph BFS | Use queue and visited set correctly | walkthrough, practice |
| `dsa.graphs.dfs` | Graph DFS | Use recursion or stack and avoid infinite loops | walkthrough, practice |
| `dsa.graphs.visited_state` | Visited state | Track unvisited/visiting/visited when needed | bug spotting |
| `dsa.graphs.connected_components` | Connected components | Count or collect components | practice |
| `dsa.graphs.topological_sort` | Topological sort | Order DAG nodes by dependencies | walkthrough |
| `dsa.graphs.shortest_path_intro` | Shortest path intro | Distinguish unweighted BFS from weighted shortest path | lesson |
| `dsa.graphs.union_find` | Union-find | Use parent/rank/path compression ideas | walkthrough, practice |

### `dsa.sorting` — Sorting

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `dsa.sorting.selection_insertion` | Selection/insertion sort | Trace simple quadratic sorts | code reading |
| `dsa.sorting.merge_sort` | Merge sort | Explain divide, sort halves, merge | walkthrough |
| `dsa.sorting.quick_sort` | Quicksort | Explain partitioning and average/worst cases | walkthrough |
| `dsa.sorting.comparator` | Comparators | Sort by custom key or order | quiz, code reading |
| `dsa.sorting.stability` | Sort stability | Explain when equal elements keep order | concept check |

### `dsa.searching` — Searching

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `dsa.searching.linear_search` | Linear search | Search simple collections | quiz |
| `dsa.searching.binary_search` | Binary search | Implement standard binary search safely | bug spotting, practice |
| `dsa.searching.boundary_search` | Boundary search | Find first/last valid position | walkthrough, practice |
| `dsa.searching.search_space_design` | Search-space design | Convert answer search into binary search on answer | practice |
| `dsa.searching.invariant_reasoning` | Search invariants | Explain why `lo` and `hi` updates are correct | concept check |

### `dsa.dynamic_programming` — Dynamic programming

| Skill id | Title | Learner should be able to... | Suggested item types |
|---|---|---|---|
| `dsa.dp.state_definition` | State definition | Define what each DP state means | concept check, practice |
| `dsa.dp.transition` | Transition | Derive recurrence from choices | walkthrough |
| `dsa.dp.base_case` | Base case | Set correct initial values | bug spotting |
| `dsa.dp.memoization` | Memoization | Add cache to recursive solution | code reading, practice |
| `dsa.dp.tabulation` | Tabulation | Fill table in valid order | walkthrough |
| `dsa.dp.knapsack_intro` | Knapsack intro | Choose or skip item and track capacity/state | walkthrough |
| `dsa.dp.sequence_dp_intro` | Sequence DP intro | Solve simple subsequence/string DP patterns | practice |
| `dsa.dp.space_optimization_intro` | Space optimization intro | Reduce table memory when only recent states are needed | concept check |

## Suggested prerequisite graph

Prerequisites should guide recommendations, not hard-lock learning.

Examples:

| Skill | Recommended prerequisites |
|---|---|
| `cpp.structs_classes.member_functions` | `cpp.structs_classes.member_variables`, `cpp.basics.functions` |
| `cpp.structs_classes.const_methods_intro` | `cpp.basics.const_intro`, `cpp.structs_classes.member_functions` |
| `cpp.constructors.member_initializer_list` | `cpp.constructors.parameterized_constructor`, `cpp.structs_classes.member_variables` |
| `cpp.raii.destructor_cleanup` | `cpp.constructors.destructor_intro`, `cpp.raii.resource_lifetime` |
| `cpp.smart_pointers.unique_ptr` | `cpp.raii.ownership_boundary`, `cpp.constructors.move_constructor_intro` |
| `dsa.arrays.sliding_window` | `dsa.arrays.traversal`, `dsa.arrays.two_pointers` |
| `dsa.linked_lists.reverse_list` | `dsa.linked_lists.traversal`, `dsa.linked_lists.insert_delete` |
| `dsa.trees.recursion_patterns` | `cpp.basics.functions` |
| `dsa.graphs.bfs` | `dsa.queues.basic_queue`, `dsa.graphs.representation` |
| `dsa.dp.transition` | `dsa.dp.state_definition`, `dsa.dp.base_case` |

## Learning item model

A learning item is anything the learner can study or practice.

Recommended types:

- `lesson`
- `concept_check`
- `quiz`
- `code_reading`
- `bug_spotting`
- `fill_blank`
- `predict_output`
- `walkthrough`
- `mini_project`
- `review_prompt`

Any item type can additionally opt into an in-app **Code Lab** (#407) by carrying
Code Lab metadata (starter code, mode, visible/hidden tests, skill tags). The
shared `MaybeCodeLab` mount renders the editor/runner only for items that opt in;
no debugger is involved. See [CODE_LAB.md](CODE_LAB.md). Code Lab AI Review/Trace
emit a stable, machine-validated error-tag schema marked `weak_ai_inference` —
future remediation/mastery work may consume these tags as **weak evidence only**,
never overriding deterministic compile/test outcomes.

Each learning item should link to one or more skills.

Suggested fields:

| Field | Purpose |
|---|---|
| `id` | Stable item id |
| `type` | Lesson, quiz, bug spotting, etc. |
| `title` | Human-readable title |
| `primary_skill_id` | Main skill |
| `secondary_skill_ids` | Related skills |
| `difficulty` | Beginner/intermediate/advanced or numeric |
| `estimated_minutes` | Useful for daily planning |
| `content` | Markdown/MDX/JSON content |
| `answer_key` | For quizzes/tasks, stored carefully |
| `reviewable` | Whether FSRS review card can be generated |
| `created_at` | Metadata |
| `updated_at` | Metadata |

## Review card model

A review card represents an FSRS-scheduled unit.

A review card may point to:

- A quiz question
- A concept explanation
- A common mistake
- A code-reading prompt
- A bug-spotting prompt
- A short recall task

Suggested fields:

| Field | Purpose |
|---|---|
| `id` | Card id |
| `user_id` | Owner |
| `learning_item_id` | Source item |
| `skill_id` | Main skill |
| `state` | FSRS state |
| `due_at` | Next due time |
| `stability` | FSRS stability |
| `difficulty` | FSRS difficulty |
| `elapsed_days` | FSRS input |
| `scheduled_days` | FSRS output |
| `reps` | Review count |
| `lapses` | Forget count |
| `last_reviewed_at` | Last review time |
| `created_at` | Created time |

## Skill events

Skill events should capture learning evidence beyond the FSRS card.

Required event names are documented in `docs/EVENT_SCHEMA_STABLE_NAMES.md`.

Events should be generated from:

- Starting a lesson
- Viewing a concept
- Answering a quiz
- Using a hint
- Completing a review
- Attempting a practice task
- Completing a practice task
- System mastery status updates

## Mastery scoring

Start with a simple rule-based score. Keep it explainable.

Suggested input categories:

| Category | Weight | Examples |
|---|---:|---|
| Correctness | 40% | quiz correctness, task correctness |
| Review stability | 25% | FSRS stability, successful reviews |
| Recency | 15% | recent success matters more than old success |
| Independence | 10% | less hint usage means stronger mastery |
| Difficulty/context | 10% | harder tasks and varied contexts count more |

Suggested statuses:

| Status | Meaning |
|---|---|
| `new` | Learner has not started the skill |
| `learning` | Learner has seen or attempted the skill |
| `reviewing` | Skill has active review cards |
| `weak` | Mistakes or hints show low confidence |
| `strong` | Recent performance is good |
| `mastered` | Strong performance across time and contexts |
| `regressed` | Previously strong/mastered skill now shows weakness |

Example status logic:

- `new`: no events
- `learning`: lesson or quiz attempted
- `weak`: recent wrong answers or repeated hint usage
- `reviewing`: review cards exist and are active
- `strong`: recent correct answers and successful reviews
- `mastered`: stable success across multiple sessions and item types
- `regressed`: recent failures after `strong` or `mastered`

## Recommendation logic

The dashboard should recommend work in this order:

1. Due reviews
2. Regressed skills
3. Weak skills
4. Current learning path
5. Recommended prerequisites
6. Optional exploration

Example recommendation outputs:

| Condition | Recommendation |
|---|---|
| Due review cards exist | Start review queue |
| A mastered skill regressed | Practice that skill with bug spotting or code reading |
| Current skill has weak prerequisites | Review prerequisite first |
| User completed current lesson | Do immediate quiz |
| User did well today | Suggest next skill or stop with positive feedback |

## Daily goals and FSRS review load

The user may set a target number of new items per day. The app should calculate or estimate review load from FSRS due items.

Goal design:

- User chooses daily new learning target.
- App shows expected review count.
- App warns if the total load is too high.
- App recommends a balanced plan: new items + reviews + weak-skill practice.

Example daily dashboard sections:

- Due now
- New lesson suggestion
- Weak skill focus
- Optional challenge
- Progress summary

## Implementation guidance

### Keep modules isolated

Recommended future module layout:

```text
src/features/skills/
src/features/learning-items/
src/features/review/
src/features/events/
src/features/mastery/
src/lib/fsrs/
```

### Keep ids stable

Skill ids and learning item ids should not change casually because they may appear in:

- User progress
- Events
- Review cards
- Tests
- Analytics
- URLs

### Prefer seedable curriculum

Initial curriculum should be stored as seed data or content files that can be repeatedly loaded into development databases.

### Avoid hard locks

The app may show prerequisite warnings, but should not prevent exploration unless a future mode explicitly requires a guided path.

## First content modules

The first real modules should validate the whole learning loop:

1. Structs/classes
2. Constructors
3. RAII
4. Smart pointers

Each module should include:

- Short concept lesson
- Concept check quiz
- Code-reading task
- Bug-spotting task
- Reviewable cards
- Skill events
- Mastery update

## Testing requirements

The skill engine should have tests for:

- Skill tree helper functions
- Prerequisite recommendations
- Quiz-to-event mapping
- FSRS wrapper behavior
- Mastery scoring
- Status transitions
- Dashboard recommendation ordering

Playwright should eventually cover:

- Open skill map
- Start a lesson
- Answer quiz
- Use hint
- Complete review
- See weak-skill recommendation
- Mobile viewport smoke test

## Future improvements

After the first learning loop works, consider:

- Bayesian knowledge tracing
- Item difficulty estimation
- Adaptive quiz generation
- Personalized review load forecasting
- Weakness clustering
- Skill graph visualization
- Project-based learning recommendations
- Browser-based algorithm visualization
- WebAssembly-based C++ demos
- Sandboxed C++ execution
