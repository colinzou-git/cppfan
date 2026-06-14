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
    id: "cpp.program_basics.structure.lesson",
    type: "lesson",
    title: "A minimal C++ program",
    prompt:
      'A C++ program is built from functions, and execution begins in `int main()`. `main` returns an `int` to the operating system, where `0` means success. Statements end with a semicolon, and `#include <...>` brings in library facilities such as `<iostream>`. Example:\n\n```cpp\n#include <iostream>\nint main() {\n  std::cout << "Hello";\n  return 0;\n}\n```',
    explanation:
      "Every standard C++ program has exactly one main(). Returning 0 signals success; the compiler even lets you omit the return in main (it defaults to 0).",
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 1,
    is_active: true
  },
  {
    id: "cpp.program_basics.structure.mc_entry",
    type: "multiple_choice",
    title: "Where a program starts",
    prompt: "Where does a standard C++ program begin executing?",
    explanation:
      "Execution begins in the `main` function regardless of where it appears in the file. #include lines and other functions do not run on their own.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 2,
    is_active: true
  },
  {
    id: "cpp.program_basics.io.lesson",
    type: "lesson",
    title: "Console input and output",
    prompt:
      'The `<iostream>` header provides `std::cout` for output and `std::cin` for input. `std::cout << value;` prints a value, and `<<` chains: `std::cout << "x = " << x << "\\n";`. `std::cin >> x;` reads a value from the keyboard into `x`. Use `"\\n"` or `std::endl` to end a line.',
    explanation:
      'Think of << as "send to output" and >> as "read from input". They can be chained to handle several values in one statement.',
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 3,
    is_active: true
  },
  {
    id: "cpp.program_basics.io.mc_read",
    type: "multiple_choice",
    title: "Reading input",
    prompt: "Which statement reads a value typed by the user into an `int x`?",
    explanation:
      "`std::cin >> x;` extracts input into x. `std::cout << x;` prints x instead of reading it.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 4,
    is_active: true
  },
  {
    id: "cpp.program_basics.statements_comments.lesson",
    type: "lesson",
    title: "Statements, comments, and naming",
    prompt:
      "A C++ statement is a single instruction and ends with a semicolon `;` — forgetting it is one of the most common beginner compile errors. Comments document intent and are ignored by the compiler: `//` starts a line comment that runs to the end of the line, and `/* ... */` is a block comment that can span lines. Names should be descriptive and follow a consistent convention (e.g. `snake_case` or `camelCase` for variables and functions, `PascalCase` for types). Avoid names that start with an underscore followed by a capital, or that contain a double underscore — those are reserved for the implementation. Good names plus comments explaining *why* (not *what*) keep code readable.",
    explanation:
      "Statements end with `;`; `//` and `/* */` write comments; names should be descriptive and follow one consistent convention, avoiding reserved underscore patterns.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 2810,
    is_active: true
  },
  {
    id: "cpp.program_basics.statements_comments.mc_terminate",
    type: "multiple_choice",
    title: "Ending a statement",
    prompt: "What punctuation ends a normal C++ statement?",
    explanation:
      "A semicolon `;` terminates a statement. Leaving it off is a frequent compile error reported on or near the following line.",
    difficulty: "beginner",
    estimated_minutes: 1,
    order_index: 2820,
    is_active: true
  },
  {
    id: "cpp.program_basics.exit_status.lesson",
    type: "lesson",
    title: "main() return value and exit status",
    prompt:
      "`main()` returns an `int` that becomes the program's *exit status* — the value the operating system (and shells, scripts, and CI) use to tell whether the program succeeded. By convention `return 0;` means success and any non-zero value signals an error (you can use `EXIT_SUCCESS`/`EXIT_FAILURE` from `<cstdlib>`). `main` is special: if you omit the `return`, the compiler treats it as `return 0;`. So a program that finishes normally reports success even without an explicit return, while returning a non-zero code lets callers detect and react to failures.",
    explanation:
      "main() returns an int exit status: 0 (or EXIT_SUCCESS) means success, non-zero means failure. Omitting return in main implies return 0.",
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 2830,
    is_active: true
  },
  {
    id: "cpp.program_basics.exit_status.mc_success",
    type: "multiple_choice",
    title: "What return 0 means",
    prompt: "What does `return 0;` at the end of `main()` communicate?",
    explanation:
      "Returning 0 from main reports successful completion to the operating system. A non-zero value signals that something went wrong.",
    difficulty: "beginner",
    estimated_minutes: 1,
    order_index: 2840,
    is_active: true
  },
  {
    id: "cpp.program_basics.error_kinds.lesson",
    type: "lesson",
    title: "Compile-time, link-time, and run-time errors",
    prompt:
      "Errors surface at three different stages. **Compile-time** errors are caught by the compiler while translating one source file — syntax mistakes, type errors, and undeclared names; the program never builds. **Link-time** errors happen after compiling, when the linker combines object files and can't resolve a symbol — typically a function that is declared and called but never defined, or defined twice. **Run-time** errors occur while the built program executes — crashes like dereferencing a null pointer or dividing by zero, and logic errors that produce wrong output. Knowing which stage failed tells you where to look: the compiler message, the linker message, or the program's behavior.",
    explanation:
      "Compile-time: the compiler rejects one file (syntax/type/undeclared). Link-time: the linker can't resolve/duplicate a symbol. Run-time: the built program misbehaves while running.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 2850,
    is_active: true
  },
  {
    id: "cpp.program_basics.error_kinds.mc_classify",
    type: "multiple_choice",
    title: "Classify the error",
    prompt: "A function is declared and called, the file compiles, but the function is never defined anywhere. When does this fail?",
    explanation:
      "Each file compiles fine because the declaration satisfies the compiler. The failure appears at link time, when the linker looks for the missing definition and reports an unresolved symbol.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 2860,
    is_active: true
  },
  {
    id: "cpp.values_types.variables.lesson",
    type: "lesson",
    title: "Variables and fundamental types",
    prompt:
      "A variable has a type and a name, and should be initialized when declared: `int count = 0;`. Fundamental types include `int` (whole numbers), `double` (floating point), `bool` (true/false), and `char` (a single character). `auto` deduces the type from the initializer (`auto n = 0;` is an int), `const` marks a value that must not change, and `constexpr` marks a compile-time constant.",
    explanation:
      "Prefer initializing on declaration to avoid using an indeterminate value. Use auto when the type is obvious from the right-hand side.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 5,
    is_active: true
  },
  {
    id: "cpp.values_types.variables.mc_auto",
    type: "multiple_choice",
    title: "Type deduced by auto",
    prompt: "What type does `auto x = 3.0;` give `x`?",
    explanation:
      "The initializer `3.0` is a double literal, so `auto` deduces `x` as `double`. `3` (no dot) would deduce `int`.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 6,
    is_active: true
  },
  {
    id: "cpp.values_types.conversions.lesson",
    type: "lesson",
    title: "Conversions, truncation, and static_cast",
    prompt:
      "Converting between numeric types can lose information. Assigning a `double` to an `int` truncates toward zero (drops the fractional part). A *narrowing* conversion inside braces (`int x{3.9};`) is rejected by the compiler. Use `static_cast<int>(d)` to convert explicitly and signal intent. Mixing signed and unsigned values in comparisons can also give surprising results.",
    explanation:
      "Make lossy conversions explicit with static_cast so the intent is clear and the compiler stops warning. Watch for signed/unsigned mixing.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 7,
    is_active: true
  },
  {
    id: "cpp.values_types.conversions.mc_static_cast",
    type: "multiple_choice",
    title: "Result of a cast",
    prompt: "What value does `static_cast<int>(3.9)` produce?",
    explanation:
      "Converting a double to an int truncates toward zero, discarding the fractional part, so the result is 3 (not rounded to 4).",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 8,
    is_active: true
  },
  {
    id: "cpp.values_types.fundamental_types.lesson",
    type: "lesson",
    title: "Choosing a fundamental type",
    prompt:
      "C++ gives you a few fundamental types, and picking the right one matters. Use `int` for whole numbers (counts, indices) — it is exact, but has a limited range, so use a wider type like `long long` for very large values. Use `double` for real numbers and measurements; it is approximate, so equality comparisons like `0.1 + 0.2 == 0.3` can be false and money is better stored in integer cents than in `double`. Use `bool` for true/false flags rather than an `int` 0/1. Use `char` for a single character/byte. The guiding questions: does the value need a fractional part (then `double`), is it a yes/no (then `bool`), how large can it get (size the integer accordingly)? Choosing by intent makes code clearer and avoids precision and overflow surprises.",
    explanation:
      "int for exact whole numbers (widen to long long for big values), double for approximate reals (avoid == and money), bool for flags, char for one character. Choose by range and intent.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 3270,
    is_active: true
  },
  {
    id: "cpp.values_types.fundamental_types.mc_money",
    type: "multiple_choice",
    title: "Picking a type for money",
    prompt: "Why is `double` a poor choice for storing exact money amounts like $0.10?",
    explanation:
      "double is binary floating point and cannot represent most decimal fractions exactly, so values like 0.10 are approximate and sums drift. Store money as integer cents (an exact int) instead.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 3280,
    is_active: true
  },
  {
    id: "cpp.values_types.signed_unsigned.lesson",
    type: "lesson",
    title: "Signed and unsigned pitfalls",
    prompt:
      "Mixing signed and unsigned integers is a classic bug source. Unsigned types cannot represent negatives: `unsigned int u = 0; u - 1` does not give -1, it wraps around to a huge value (modular arithmetic). When you compare a signed and an unsigned value, the signed one is converted to unsigned first, so `int i = -1; unsigned u = 1; i < u` is *false* — because -1 becomes a large unsigned number. This bites most often with container sizes: `v.size()` returns an unsigned `size_t`, so a loop like `for (int i = 0; i <= v.size() - 1; ++i)` breaks when `v` is empty (`0u - 1` is huge). Prefer signed indices, range-based for loops, or cast deliberately, and enable `-Wsign-compare` so the compiler flags risky mixes.",
    explanation:
      "Unsigned can't be negative and wraps (0u - 1 is huge); signed/unsigned comparisons convert the signed value to unsigned, so -1 < 1u is false. Beware loops using container .size().",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3290,
    is_active: true
  },
  {
    id: "cpp.values_types.signed_unsigned.mc_compare",
    type: "multiple_choice",
    title: "A signed/unsigned comparison",
    prompt: "With `int i = -1; unsigned u = 1;`, what does `i < u` evaluate to in C++?",
    explanation:
      "false. The signed -1 is converted to unsigned for the comparison, becoming a very large value, so it is not less than 1. This surprising result is the core signed/unsigned pitfall.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3300,
    is_active: true
  },
  {
    id: "cpp.values_types.literals.lesson",
    type: "lesson",
    title: "Literals and expression evaluation",
    prompt:
      "A literal is a value written directly in code: `42` (int), `42LL` (long long), `3.14` (double), `3.14f` (float), `'A'` (char), `true` (bool), `\"hi\"` (string literal). The literal's form determines its type, which then drives how an expression evaluates. The biggest beginner trap is **integer division**: `7 / 2` is `3`, not `3.5`, because both operands are `int` — the fractional part is discarded and `%` gives the remainder (`7 % 2 == 1`). To get `3.5` you make an operand floating point: `7.0 / 2` or `7 / 2.0`. Operator precedence also matters: `2 + 3 * 4` is `14`, not `20`, because `*` binds tighter than `+`; use parentheses when in doubt. Reading the literal types first makes an expression's result predictable.",
    explanation:
      "A literal's form sets its type. Integer division truncates (7 / 2 == 3); make an operand floating point (7.0 / 2) for a real result. Respect precedence (* before +) or parenthesize.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 3310,
    is_active: true
  },
  {
    id: "cpp.values_types.literals.mc_intdiv",
    type: "multiple_choice",
    title: "Integer division",
    prompt: "In C++, what is the value of the expression `7 / 2`?",
    explanation:
      "Both operands are int, so this is integer division: the result is 3 (the fractional part is discarded). Use 7.0 / 2 to get 3.5.",
    difficulty: "beginner",
    estimated_minutes: 1,
    order_index: 3320,
    is_active: true
  },
  {
    id: "cpp.control_flow.conditionals.lesson",
    type: "lesson",
    title: "Conditionals: if, else, and switch",
    prompt:
      "An `if (condition) { ... } else { ... }` runs one branch based on a `bool` condition built from comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`) and logical operators (`&&`, `||`, `!`). Chain choices with `else if`. A `switch` selects among integer or enum cases; put a `break` at the end of each case, or execution falls through into the next case.",
    explanation:
      "Use == for comparison (not =, which assigns). In a switch, missing break causes fall-through, which is a common bug.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 9,
    is_active: true
  },
  {
    id: "cpp.control_flow.conditionals.mc_fallthrough",
    type: "multiple_choice",
    title: "Forgetting break in a switch",
    prompt: "In a `switch`, what happens if a case does not end with `break`?",
    explanation:
      "Without break, execution falls through and continues running the statements of the following case(s) until a break or the end of the switch.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 10,
    is_active: true
  },
  {
    id: "cpp.control_flow.loops.lesson",
    type: "lesson",
    title: "Loops: for, while, break, continue",
    prompt:
      "A `for (init; condition; step)` loop is ideal for counting; a `while (condition)` loop repeats until the condition is false. `break` exits the loop immediately; `continue` skips to the next iteration. To visit indices `0` to `n - 1` exactly once, use `for (int i = 0; i < n; ++i)`. Using `<=` or starting at the wrong index causes off-by-one errors.",
    explanation:
      "The condition `i < n` (with i starting at 0) visits each of the n elements once. `i <= n` runs one time too many.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 11,
    is_active: true
  },
  {
    id: "cpp.control_flow.loops.mc_offbyone",
    type: "multiple_choice",
    title: "Looping over n elements",
    prompt:
      "To visit indices `0` through `n - 1` exactly once with `for (int i = 0; <cond>; ++i)`, what should `<cond>` be?",
    explanation:
      "`i < n` runs for i = 0..n-1, visiting each of the n elements once. `i <= n` overruns by one (out of bounds); `i < n - 1` skips the last element.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 12,
    is_active: true
  },
  {
    id: "cpp.control_flow.logical_operators.lesson",
    type: "lesson",
    title: "Logical operators and compound conditions",
    prompt:
      "Three logical operators combine boolean conditions: `&&` (and) is true only when both sides are true, `||` (or) is true when at least one side is true, and `!` (not) flips a boolean. They evaluate **left to right with short-circuiting**: `&&` stops at the first false operand and `||` stops at the first true one, so the right-hand side may never run. That is not just an optimization — it is a safety tool: `if (p != nullptr && p->ready)` only dereferences `p` when it is non-null, and `if (i < v.size() && v[i] == x)` only indexes within bounds. Beware side effects on the right of a short-circuit (they may not happen), and remember `&&` binds tighter than `||`, so parenthesize mixed conditions like `(a || b) && c` to say what you mean.",
    explanation:
      "&& is true iff both sides are; || iff at least one; ! negates. Both short-circuit left-to-right, so the right operand can guard the left (e.g. null/bounds checks). Parenthesize mixed && / ||.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 3330,
    is_active: true
  },
  {
    id: "cpp.control_flow.logical_operators.mc_shortcircuit",
    type: "multiple_choice",
    title: "Short-circuit safety",
    prompt: "Why is `if (p != nullptr && p->ready)` safe even when `p` is null?",
    explanation:
      "`&&` short-circuits: when `p != nullptr` is false the right operand `p->ready` is never evaluated, so the null pointer is never dereferenced.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 3340,
    is_active: true
  },
  {
    id: "cpp.control_flow.switch_statement.lesson",
    type: "lesson",
    title: "switch and break",
    prompt:
      "A `switch` branches on an integral or enum value, matching it against `case` labels with an optional `default`. Each case that should stand alone must end with `break`; otherwise execution **falls through** into the next case — a frequent bug when the `break` is forgotten, though intentional fallthrough is sometimes used to share code between cases (mark it with `[[fallthrough]]` in modern C++). A `switch` is clearer than a long `if/else if` chain when comparing one value against many constants. Note that variables declared inside a case may need their own `{ }` block scope. Use `default` to handle unexpected values explicitly.",
    explanation:
      "switch matches a value against case labels; each standalone case needs break or it falls through into the next. Prefer switch over long if/else-if on one value; handle default.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 3350,
    is_active: true
  },
  {
    id: "cpp.control_flow.switch_statement.mc_nobreak",
    type: "multiple_choice",
    title: "Forgetting break",
    prompt: "What happens in a `switch` when a matched `case` has no `break` (and no `[[fallthrough]]`)?",
    explanation:
      "Execution falls through and runs the statements of the following case(s) until a break or the end of the switch — usually a bug when the break was simply forgotten.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 3360,
    is_active: true
  },
  {
    id: "cpp.control_flow.loop_invariants.lesson",
    type: "lesson",
    title: "Loop invariants and off-by-one",
    prompt:
      "A loop invariant is a condition that is true before the loop and stays true after every iteration; using it to reason about a loop is the most reliable way to get the bounds right. For summing an array, the invariant might be \"`sum` holds the total of the first `i` elements\" — which tells you `i` runs from 0 while `i < n` and that `sum` is complete when `i == n`. Off-by-one errors come from the boundary: `<` vs `<=`, starting at 0 vs 1, and whether the range is half-open `[0, n)` (the C++ convention, length `n`) or closed `[0, n]` (length `n + 1`, usually wrong for an n-element array). `break` exits the loop immediately; `continue` skips to the next iteration — both can interact with an invariant, so check it still holds at each exit point.",
    explanation:
      "A loop invariant holds before and after every iteration; reason with it to pick bounds. Most off-by-one bugs are < vs <= and half-open [0, n) vs closed [0, n]. break exits; continue skips.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3370,
    is_active: true
  },
  {
    id: "cpp.control_flow.loop_invariants.mc_halfopen",
    type: "multiple_choice",
    title: "Half-open ranges",
    prompt: "For an array of length `n`, which half-open range `[start, end)` covers exactly its valid indices?",
    explanation:
      "Valid indices are 0..n-1. The half-open range `[0, n)` includes 0 up to but not including n — exactly those n indices. `[0, n]` and `[1, n]` overrun or skip.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3380,
    is_active: true
  },
  {
    id: "cpp.functions.basics.lesson",
    type: "lesson",
    title: "Function basics",
    prompt:
      "A function has a return type, a name, parameters, and a body: `int add(int a, int b) { return a + b; }`. By default parameters are copies of the arguments, so changing them does not affect the caller. Variables declared inside a function are local to it and disappear when it returns. A function must be declared (or defined) before the line that calls it.",
    explanation:
      "Parameters are local copies unless you take them by reference. Local variables exist only during the call.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 13,
    is_active: true
  },
  {
    id: "cpp.functions.basics.mc_scope",
    type: "multiple_choice",
    title: "Scope of a local variable",
    prompt: "What is the scope of a variable declared inside a function body?",
    explanation:
      "A variable declared in a function body is local: it is visible only within that function (and the block it is declared in) and does not exist outside the call.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 14,
    is_active: true
  },
  {
    id: "cpp.functions.decomposition.lesson",
    type: "lesson",
    title: "Decomposition and headers",
    prompt:
      "Break a large task into small, well-named functions that each do one thing — this makes code easier to read, test, and reuse. In larger projects, put function declarations in a header file (`.h`) and their definitions in a source file (`.cpp`), so other files can include the header and call the functions. Avoid giant functions that do many unrelated things.",
    explanation:
      "Small functions with clear names are the building blocks of readable C++. Headers share declarations; source files hold the definitions.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 15,
    is_active: true
  },
  {
    id: "cpp.functions.decomposition.mc_why",
    type: "multiple_choice",
    title: "Why decompose into functions",
    prompt: "What is the main reason to split a large function into several smaller ones?",
    explanation:
      "Smaller, single-purpose functions are easier to read, test, and reuse. It is a design/clarity benefit, not a performance trick or a language requirement.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 16,
    is_active: true
  },
  {
    id: "cpp.references.references.lesson",
    type: "lesson",
    title: "References as aliases",
    prompt:
      "A reference (`T&`) is another name for an existing object. It must be initialized when declared and cannot later be made to refer to a different object. Passing a parameter by reference lets a function read and modify the caller's variable without copying it: `void inc(int& n) { ++n; }` changes the argument in place.",
    explanation:
      "A reference is an alias, not a separate object. Because it cannot be null or reseated, it is often safer than a pointer when an object is guaranteed to exist.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 17,
    is_active: true
  },
  {
    id: "cpp.references.references.mc_init",
    type: "multiple_choice",
    title: "Declaring a reference",
    prompt: "What is required when you declare a reference such as `int& r`?",
    explanation:
      "A reference must be bound to an existing object when it is declared (`int& r = x;`). It cannot be left unbound or reseated later.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 18,
    is_active: true
  },
  {
    id: "cpp.references.pointers.lesson",
    type: "lesson",
    title: "Pointers and nullptr",
    prompt:
      'A pointer (`T*`) stores the address of an object, or `nullptr` for "points to nothing". `&x` takes the address of `x`, and `*p` dereferences the pointer to reach the object. Unlike references, a pointer can be null and can be reassigned to point elsewhere. Dereferencing a `nullptr` (or a dangling pointer) is undefined behavior, so check before dereferencing.',
    explanation:
      "Use a pointer when \"no object\" is a valid state (nullptr) or when you need to repoint it. Always ensure it is non-null before dereferencing.",
    difficulty: "beginner",
    estimated_minutes: 4,
    order_index: 19,
    is_active: true
  },
  {
    id: "cpp.references.pointers.mc_null",
    type: "multiple_choice",
    title: "Dereferencing nullptr",
    prompt: "What happens if you dereference a `nullptr` with `*p`?",
    explanation:
      "Dereferencing a null pointer is undefined behavior — typically a crash. Guard with a null check before dereferencing.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 20,
    is_active: true
  },
  {
    id: "cpp.references.const_correctness.lesson",
    type: "lesson",
    title: "Const correctness",
    prompt:
      "`const` marks something that will not be modified. A `const T&` parameter lets a function read a value without copying it and promises not to change it. Marking a member function `const` (`int size() const;`) says it does not modify the object, so it can be called on const objects. Const-correctness documents intent and lets the compiler catch accidental mutation.",
    explanation:
      "Add const wherever you do not intend to modify: parameters, member functions, and local references. It is a compile-time safety net, not a runtime cost.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 21,
    is_active: true
  },
  {
    id: "cpp.references.const_correctness.mc_constref",
    type: "multiple_choice",
    title: "What a const reference parameter allows",
    prompt: "What does a `const std::string& s` parameter allow a function to do?",
    explanation:
      "A const reference binds without copying and forbids modification, so the function can read `s` efficiently but cannot change the caller's string.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 22,
    is_active: true
  },
  {
    id: "cpp.references.parameter_passing.lesson",
    type: "lesson",
    title: "Choosing how to pass parameters",
    prompt:
      "Pass small, cheap-to-copy types (like `int` or `double`) by value. Pass large objects you only read by `const T&` to avoid an expensive copy. Pass by non-const `T&` when the function must modify the caller's object (an output parameter). Returning by value is fine — the compiler elides or moves the result.",
    explanation:
      "Default to const& for big read-only inputs, value for small inputs, and non-const reference only when you truly need to write back.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 23,
    is_active: true
  },
  {
    id: "cpp.references.parameter_passing.mc_large",
    type: "multiple_choice",
    title: "Passing a large read-only object",
    prompt: "How should you pass a large `std::vector<int>` that a function only reads?",
    explanation:
      "By const reference (`const std::vector<int>&`): it avoids copying the whole vector and signals that the function will not modify it.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 24,
    is_active: true
  },
  {
    id: "cpp.references.lvalue_rvalue.lesson",
    type: "lesson",
    title: "Lvalues and rvalues",
    prompt:
      "Every expression is either an lvalue or an rvalue. An **lvalue** names a persistent object you can take the address of — a variable like `x`, or `arr[i]`. An **rvalue** is a temporary value with no lasting identity — a literal like `42`, or the result of `a + b`. The distinction drives reference binding: a non-const lvalue reference (`int&`) binds only to a modifiable lvalue, which is why `int& r = 42;` is an error but `const int& r = 42;` is fine (a const lvalue reference may bind to a temporary, extending its lifetime to the reference's scope). An rvalue reference (`int&&`) binds to temporaries and is the basis of move semantics. A quick test: if you can assign to it or take its address, it's an lvalue.",
    explanation:
      "Lvalues name persistent, addressable objects; rvalues are temporaries. `int&` binds only to modifiable lvalues; `const int&` and `int&&` can bind to temporaries.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 2910,
    is_active: true
  },
  {
    id: "cpp.references.lvalue_rvalue.mc_classify",
    type: "multiple_choice",
    title: "Lvalue or rvalue?",
    prompt: "In `int x = 1; int y = x + 2;`, which is an rvalue?",
    explanation:
      "`x + 2` is a temporary computed value with no address — an rvalue. `x` and `y` are named, addressable objects, so they are lvalues.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2920,
    is_active: true
  },
  {
    id: "cpp.references.return_semantics.lesson",
    type: "lesson",
    title: "Return by value vs by reference",
    prompt:
      "Returning **by value** is the safe default: the caller gets its own copy (and modern compilers elide the copy, so it's cheap). Return **by reference** only when the referent outlives the call — for example a member function returning a reference to a data member of `*this`, or `operator[]` returning a reference into a container that the caller still owns. Returning a reference (or pointer) to a **local** variable is a bug: the local is destroyed when the function returns, leaving the caller with a dangling reference. So: return by value unless you have a specific, lifetime-safe reason to hand back a reference to storage the caller can rely on.",
    explanation:
      "Return by value by default. Return a reference only to storage that outlives the call (a member, or a container element); never to a local.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 2930,
    is_active: true
  },
  {
    id: "cpp.references.return_semantics.mc_local",
    type: "multiple_choice",
    title: "Returning a reference to a local",
    prompt: "What is wrong with `int& f() { int n = 5; return n; }`?",
    explanation:
      "`n` is a local destroyed when `f` returns, so the returned reference dangles — using it is undefined behavior. Return by value (`int f()`) instead.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2940,
    is_active: true
  },
  {
    id: "cpp.references.dangling.lesson",
    type: "lesson",
    title: "Dangling references and lifetimes",
    prompt:
      "A reference is **dangling** when the object it refers to has been destroyed; reading or writing through it is undefined behavior. The classic cases: returning a reference to a local, keeping a reference to an element of a `std::vector` across a reallocating `push_back`, or binding a reference to a temporary that then expires. Binding a `const` reference to a temporary *extends* that temporary's lifetime — but only to the lifetime of the reference, and **lifetime extension does not apply across a function return**: `const std::string& bad() { return std::string(\"hi\"); }` still dangles. The fix is almost always to return or store by value, or to ensure the referent's owner outlives every reference to it.",
    explanation:
      "A dangling reference points at a destroyed object (UB). `const&` lifetime-extends a temporary only to the reference's own scope — not across a return; prefer by-value there.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2950,
    is_active: true
  },
  {
    id: "cpp.references.dangling.mc_extension",
    type: "multiple_choice",
    title: "Limits of lifetime extension",
    prompt: "Does `const std::string& f() { return std::string(\"hi\"); }` return a usable reference?",
    explanation:
      "No — lifetime extension of a temporary by a const reference does not survive the function return, so the returned reference dangles. Return `std::string` by value instead.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2960,
    is_active: true
  },
  {
    id: "cpp.references.pointer_const.lesson",
    type: "lesson",
    title: "Pointer-to-const vs const pointer",
    prompt:
      "`const` on a pointer can lock the data, the pointer, or both — read it right-to-left around the `*`. `const int* p` (same as `int const* p`) is a **pointer to const**: you may repoint `p`, but you cannot modify `*p` through it. `int* const p` is a **const pointer**: you may modify `*p`, but `p` must always point at the same object. `const int* const p` locks both. The common case for parameters is pointer-to-const (`const T*`), which says \"I will read what you point at, not change it,\" mirroring `const T&`. A quick trick: whatever is immediately left of `const` is what is constant (or the thing to its right if `const` is leftmost).",
    explanation:
      "Read const around the *: `const int*` = pointer to const (data locked, pointer movable); `int* const` = const pointer (pointer fixed, data writable); `const int* const` locks both.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 3390,
    is_active: true
  },
  {
    id: "cpp.references.pointer_const.mc_which",
    type: "multiple_choice",
    title: "What is const here?",
    prompt: "Given `const int* p;`, what does `const` apply to?",
    explanation:
      "`const int* p` is a pointer to const int: the pointed-to value cannot be changed through `p`, but `p` itself can be reassigned to point elsewhere. (A const pointer would be `int* const p`.)",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3400,
    is_active: true
  },
  {
    id: "cpp.references.non_owning.lesson",
    type: "lesson",
    title: "Non-owning pointers and selection",
    prompt:
      "A raw pointer in modern C++ should mean \"I observe this object but do not own it\" — ownership belongs to a value, a container, or a smart pointer (`unique_ptr`/`shared_ptr`). A non-owning raw pointer must never be `delete`d by the observer and must not outlive what it points at. Choosing between a reference and a pointer comes down to nullability and rebinding: use a **reference** (`T&`/`const T&`) when the thing is always present and fixed, and a **pointer** (`T*`) when it may be absent (`nullptr`) or needs to be repointed. So an optional, observe-only parameter is `const T*`; a required one is `const T&`. Document the contract — a `T*` parameter that can be null should check for null before dereferencing.",
    explanation:
      "Raw pointers = non-owning observers (never delete, don't outlive the target). Pick a reference when always-present and fixed; a pointer when it can be null or must be repointed.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3410,
    is_active: true
  },
  {
    id: "cpp.references.non_owning.mc_select",
    type: "multiple_choice",
    title: "Reference or pointer?",
    prompt: "A function parameter refers to an object that is always present and never repointed. What should it be?",
    explanation:
      "A reference (`T&` / `const T&`): it cannot be null and always binds the same object, expressing \"always present\" directly. Use a pointer only when the argument can be absent (nullable) or needs to be repointed.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3420,
    is_active: true
  },
  {
    id: "cpp.references.views.lesson",
    type: "lesson",
    title: "Non-owning views: span and string_view",
    prompt:
      "A **view** borrows a contiguous range without owning it. `std::span<T>` is a non-owning (pointer, length) pair over an array, `std::vector`, or C array; `std::string_view` is the same for character data. Taking `std::span<const int>` or `std::string_view` as a parameter replaces the error-prone `(const T* ptr, size_t len)` idiom and raw pointer arithmetic with a bounds-aware object you can range-for, `.size()`, and `.subspan()`/`.substr()` safely. The one rule: a view does **not** extend the lifetime of what it points at, so never return a view to a local and never keep a `string_view` to a temporary string — that dangles just like a raw pointer. Use views for read-only/borrowing parameters; use owning types (`std::string`, `std::vector`) for storage.",
    explanation:
      "std::span / std::string_view are non-owning (pointer+length) views that replace raw pointer+length APIs and arithmetic with bounds-aware borrowing. They don't extend lifetime — never return or store a view of a temporary/local.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3430,
    is_active: true
  },
  {
    id: "cpp.references.views.mc_use",
    type: "multiple_choice",
    title: "Choosing a view parameter",
    prompt: "What is the idiomatic modern C++ way for a function to read a sequence of characters it does not own?",
    explanation:
      "Take a `std::string_view`: a non-owning, bounds-aware view that accepts `std::string`, string literals, and substrings without copying — replacing the `(const char*, size_t)` pair. Just don't store it beyond the argument's lifetime.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3440,
    is_active: true
  },
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
  },
  {
    id: "cpp.value_semantics.copy.lesson",
    type: "lesson",
    title: "Copy semantics",
    prompt:
      "Copying an object makes an independent duplicate. The copy constructor `T(const T&)` and copy assignment `operator=(const T&)` define how. By default the compiler copies each member, which is fine for values but wrong when the class holds a raw owning pointer: a member-wise (shallow) copy leaves two objects pointing at the same resource, so both try to free it. A deep copy duplicates the owned resource instead.",
    explanation:
      "Default copies are member-wise. For a class that owns a raw resource you must implement a deep copy (or, better, use a member that copies correctly on its own).",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 145,
    is_active: true
  },
  {
    id: "cpp.value_semantics.copy.mc_shallow",
    type: "multiple_choice",
    title: "Danger of a shallow copy",
    prompt: "A class stores a raw owning `T* p` and uses the default copy. What goes wrong when an object is copied?",
    explanation:
      "The default member-wise copy duplicates the pointer value, so both objects point at the same T and each destructor deletes it — a double free.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 146,
    is_active: true
  },
  {
    id: "cpp.value_semantics.move.lesson",
    type: "lesson",
    title: "Move semantics",
    prompt:
      "Moving transfers resources from an expendable source instead of copying them. The move constructor `T(T&&)` and move assignment take an rvalue reference and steal the source's internals (for example, take its pointer and null the source), leaving it valid but empty. `std::move` casts an lvalue to an rvalue so it can be moved from. Moving a unique_ptr or a large vector avoids a deep copy.",
    explanation:
      "A move leaves the source in a valid but unspecified (usually empty) state. Use std::move to hand off ownership when you no longer need the source.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 147,
    is_active: true
  },
  {
    id: "cpp.value_semantics.move.mc_source",
    type: "multiple_choice",
    title: "State of a moved-from object",
    prompt: "What does a correct move constructor do with the source object?",
    explanation:
      "It transfers (steals) the source's resources and leaves the source valid but empty, so destroying it later is safe.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 148,
    is_active: true
  },
  {
    id: "cpp.value_semantics.rule_of_zero_five.lesson",
    type: "lesson",
    title: "Rule of Zero and Rule of Five",
    prompt:
      "Rule of Zero: design classes so their members manage their own resources (use `std::vector`, `std::string`, `std::unique_ptr`), so you need no custom destructor, copy, or move — the compiler-generated ones are correct. Rule of Five: if you must write any one of the five special members (destructor, copy constructor, copy assignment, move constructor, move assignment), you almost always need to consider all five, because the defaults will then be wrong.",
    explanation:
      "Prefer Rule of Zero. Only reach for the Rule of Five when a class directly manages a raw resource, which is rare in modern C++.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 149,
    is_active: true
  },
  {
    id: "cpp.value_semantics.rule_of_zero_five.mc_zero",
    type: "multiple_choice",
    title: "What the Rule of Zero recommends",
    prompt: "What does the Rule of Zero recommend?",
    explanation:
      "Design classes from members that manage their own resources, so the class needs no custom copy/move/destructor and the compiler defaults are correct.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 150,
    is_active: true
  },
  {
    id: "cpp.value_semantics.special_members.lesson",
    type: "lesson",
    title: "Which special member runs",
    prompt:
      "Four special members move and copy objects, and *construction* differs from *assignment*. `T b = a;` and `T b(a);` run the **copy constructor** (building a new object); `b = a;` on an existing `b` runs the **copy assignment** operator. With an rvalue source, `T b = std::move(a);` runs the **move constructor** and `b = std::move(a);` the **move assignment** operator. You can ask for the compiler's version with `= default` or forbid one with `= delete` (e.g. delete the copy operations to make a type move-only). After a move, the source object is left in a *valid but unspecified* state — you may destroy it or assign it a new value, but you must not assume what it holds. Move operations should be marked `noexcept` so containers like `std::vector` can move (not copy) elements when they grow.",
    explanation:
      "Construction (T b = a / T b(a)) builds a new object; assignment (b = a) updates an existing one. =default/=delete control the members; a moved-from object is valid but unspecified; mark moves noexcept.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3030,
    is_active: true
  },
  {
    id: "cpp.value_semantics.special_members.mc_which",
    type: "multiple_choice",
    title: "Construction or assignment?",
    prompt: "Given an already-constructed `Widget b;`, which special member does `b = a;` invoke (where `a` is an lvalue `Widget`)?",
    explanation:
      "`b` already exists, so `b = a;` is assignment, and `a` is an lvalue, so it is the copy assignment operator. A move would need an rvalue source (e.g. `std::move(a)`); constructing a new object would run a constructor instead.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3040,
    is_active: true
  },
  {
    id: "cpp.value_semantics.copy_elision.lesson",
    type: "lesson",
    title: "Copy elision and return by value",
    prompt:
      "Returning a big object by value is not the performance problem beginners fear. Under copy elision the compiler constructs the returned object directly in the caller's storage, skipping any copy or move — for a local returned by value this is mandatory in C++17 for a pure prvalue and routine (NRVO) otherwise. So `std::string make()` that builds and returns a local string does not copy it out. Returning by value also gives the caller a clean, independent object, avoiding the dangling-reference traps of returning a reference to a local. Deep vs shallow still matters for the object's *members*: a class holding a pointer needs a deep copy (or, better, a self-managing member) so two copies do not share and double-free the same buffer. Rule of thumb: return by value, and let elision and move semantics make it cheap.",
    explanation:
      "Copy elision builds the returned value directly in the caller, so return-by-value is cheap and safe. Deep copy still matters for pointer-owning members to avoid shared/double-freed buffers.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3050,
    is_active: true
  },
  {
    id: "cpp.value_semantics.copy_elision.mc_return",
    type: "multiple_choice",
    title: "Returning a local by value",
    prompt: "Why is returning a large local `std::string` by value usually NOT an expensive copy?",
    explanation:
      "Copy elision (and NRVO) lets the compiler construct the returned string directly in the caller's storage, eliding the copy/move entirely. Returning by value is both efficient and safe.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3060,
    is_active: true
  },
  {
    id: "cpp.value_semantics.operators.lesson",
    type: "lesson",
    title: "Operator overloading and conversions",
    prompt:
      "Overloaded operators should mean what callers expect. `operator==` must be an equivalence (reflexive, symmetric, transitive) and is usually paired with `!=`; in C++20 a defaulted `operator<=>` (the three-way \"spaceship\") generates the ordering and comparison operators consistently for you. Define `operator<<(std::ostream&, const T&)` as a non-member to print a type. Be careful with conversions: a single-argument constructor like `Money(int)` doubles as an *implicit* conversion, so `Money m = 5;` silently compiles — often surprising. Mark such constructors `explicit` unless the implicit conversion is genuinely desirable, and prefer named functions over conversion operators when intent could be ambiguous. The design test is whether a reader can predict an operator's behavior without reading its body.",
    explanation:
      "Give operators conventional meaning (== as equivalence; C++20 <=> for ordering; non-member << for printing). Mark single-arg constructors explicit to avoid surprising implicit conversions.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3070,
    is_active: true
  },
  {
    id: "cpp.value_semantics.operators.mc_explicit",
    type: "multiple_choice",
    title: "Avoiding surprising conversions",
    prompt: "How do you stop a single-argument constructor `Money(int)` from allowing the implicit conversion `Money m = 5;`?",
    explanation:
      "Mark the constructor `explicit`. Then `Money m = 5;` no longer compiles, while the intended `Money m(5);` still works — preventing silent, surprising conversions.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3080,
    is_active: true
  },
  {
    id: "cpp.value_semantics.self_assignment.lesson",
    type: "lesson",
    title: "Self-assignment safety",
    prompt:
      "A hand-written copy-assignment operator must still work when an object is assigned to itself (`a = a;`, or aliased through references/pointers). The danger is the classic \"release then copy\" order: if you `delete[] data_;` first and then copy from `other.data_`, a self-assignment has already freed the very buffer you are about to read — use-after-free. Two robust fixes: (1) a self-check guard, `if (this == &other) return *this;` before doing the work; or, better, (2) the **copy-and-swap** idiom — take the parameter by value (a copy), then `swap` your members with it and let the old state be destroyed with the temporary. Copy-and-swap is self-assignment-safe and exception-safe by construction. Best of all, follow the Rule of Zero so members manage themselves and you write no assignment operator at all.",
    explanation:
      "Hand-written operator= must survive a = a. Guard with `if (this == &other) return *this;`, or use copy-and-swap (by-value param + swap), which is self-assignment- and exception-safe. Better: Rule of Zero.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3510,
    is_active: true
  },
  {
    id: "cpp.value_semantics.self_assignment.mc_guard",
    type: "multiple_choice",
    title: "Why self-assignment matters",
    prompt: "In a hand-written `operator=` that does `delete[] data_;` then copies from `other`, what breaks on `a = a;`?",
    explanation:
      "`this` and `&other` are the same object, so `delete[] data_;` frees the buffer that is then read from `other.data_` — a use-after-free. A self-check or copy-and-swap avoids it.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3520,
    is_active: true
  },
  {
    id: "cpp.value_semantics.deep_copy.lesson",
    type: "lesson",
    title: "Shallow vs deep copy",
    prompt:
      "When a class owns a resource through a raw pointer, the compiler-generated copy is a **shallow** copy: it copies the pointer value, so two objects end up owning the same buffer. When both destructors run, the buffer is `delete`d twice (a double free / crash), and a write through one object is unexpectedly visible through the other. A **deep** copy allocates a new buffer and copies the contents, giving each object independent state. The modern fix is almost always to stop managing the raw pointer yourself: hold a `std::vector`/`std::string`/`std::unique_ptr` member so the correct copy (or move-only) behavior comes for free (Rule of Zero). Reach for a hand-written deep copy only when you truly must own a raw resource.",
    explanation:
      "A shallow copy duplicates a pointer (two owners → double free / shared writes). A deep copy duplicates the pointee. Prefer self-managing members (vector/string/unique_ptr) so copies are correct automatically.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3530,
    is_active: true
  },
  {
    id: "cpp.value_semantics.deep_copy.bug_double_free",
    type: "bug_spotting",
    title: "Spot the shallow-copy bug",
    prompt:
      "```cpp\nstruct Buffer {\n  int* data;\n  int size;\n  Buffer(int n) : data(new int[n]), size(n) {}\n  ~Buffer() { delete[] data; }\n  // uses the compiler-generated copy constructor and copy assignment\n};\n\nvoid use() {\n  Buffer a(10);\n  Buffer b = a;   // <-- what goes wrong here and at scope exit?\n}\n```\nWhat is the defect, and how would you fix it?",
    explanation:
      "`Buffer b = a;` uses the implicit copy constructor, which copies the `data` pointer (shallow), so `a.data` and `b.data` point at the same array. At scope exit both destructors run `delete[] data` on it — a double free (undefined behavior). Fix it by giving Buffer value semantics: store `std::vector<int>` (Rule of Zero), or write a deep-copy copy constructor and assignment that allocate and copy the elements (and handle self-assignment).",
    difficulty: "advanced",
    estimated_minutes: 4,
    order_index: 3540,
    is_active: true
  },
  {
    id: "cpp.value_semantics.stream_insertion.lesson",
    type: "lesson",
    title: "Stream insertion (operator<<)",
    prompt:
      "To make your type printable with `std::cout << x`, overload the stream-insertion operator as a **non-member** function: `std::ostream& operator<<(std::ostream& os, const T& value) { os << ...; return os; }`. It must be a non-member because the left operand is the stream, not your type; take the stream by non-const reference and your value by `const&`, write the fields to `os`, and **return `os`** so calls can chain (`cout << a << b`). If it needs private data, declare it a `friend` of the class. Keep formatting minimal and side-effect-free. The symmetric `operator>>` reads from an `std::istream&` the same way.",
    explanation:
      "Overload `std::ostream& operator<<(std::ostream& os, const T&)` as a non-member, write fields to os, and return os so `<<` chains. Use friend if it needs private members.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 3550,
    is_active: true
  },
  {
    id: "cpp.value_semantics.stream_insertion.mc_signature",
    type: "multiple_choice",
    title: "operator<< signature",
    prompt: "What is the correct signature to make `std::cout << p` work for a type `Point`?",
    explanation:
      "`std::ostream& operator<<(std::ostream& os, const Point& p)` — a non-member taking the stream by reference and the value by const reference, returning the stream so calls chain. A member `operator<<` would put the stream on the wrong side.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3560,
    is_active: true
  },
  {
    id: "cpp.raii.resource_lifetime.lesson",
    type: "lesson",
    title: "RAII: tie a resource to an object",
    prompt:
      "RAII stands for Resource Acquisition Is Initialization. The idea: acquire a resource (memory, a file, a lock) in an object's constructor and release it in that object's destructor. The resource's lifetime is then bound to the object's lifetime, so when the object goes out of scope the cleanup happens automatically.",
    explanation:
      "RAII turns \"remember to release this\" into \"the object releases it for you when it dies\". It is the foundation for smart pointers and lock guards.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 510,
    is_active: true
  },
  {
    id: "cpp.raii.resource_lifetime.mc_ties",
    type: "multiple_choice",
    title: "What RAII binds a resource to",
    prompt: "Under RAII, a resource's lifetime is tied to what?",
    explanation:
      "RAII binds the resource to the lifetime of an object: the constructor acquires it and the destructor releases it, so scope exit cleans up automatically.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 520,
    is_active: true
  },
  {
    id: "cpp.raii.destructor_cleanup.code_reading",
    type: "code_reading",
    title: "Reading a RAII wrapper",
    prompt:
      "Read this wrapper:\n\n```cpp\nclass FileHandle {\n  FILE* f_;\npublic:\n  explicit FileHandle(const char* path) : f_(fopen(path, \"r\")) {}\n  ~FileHandle() { if (f_) fclose(f_); }\n};\n```\n\nWhere and when is the file closed?",
    explanation:
      "The file is closed in the destructor `~FileHandle`, which runs automatically when the `FileHandle` object goes out of scope — no explicit close call is needed at the call site.",
    difficulty: "intermediate",
    estimated_minutes: 3,
    order_index: 530,
    is_active: true
  },
  {
    id: "cpp.raii.destructor_cleanup.mc_where",
    type: "multiple_choice",
    title: "Where a RAII wrapper releases its resource",
    prompt: "In a RAII wrapper that owns a resource, where should the resource be released?",
    explanation:
      "The destructor is the release point: it runs deterministically when the object is destroyed, so the resource is always freed exactly once.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 540,
    is_active: true
  },
  {
    id: "cpp.raii.exception_safety_intro.concept",
    type: "concept_check",
    title: "RAII and early exits",
    prompt:
      "A function acquires a resource, does some work that may throw an exception, and then releases the resource on its last line. Why is RAII safer than this manual approach?",
    explanation:
      "If the work throws, the function never reaches its last line, so the manual release is skipped and the resource leaks. With RAII, the owning object's destructor runs during stack unwinding, releasing the resource even on the exceptional path.",
    difficulty: "intermediate",
    estimated_minutes: 3,
    order_index: 550,
    is_active: true
  },
  {
    id: "cpp.raii.exception_safety_intro.mc_unwind",
    type: "multiple_choice",
    title: "Exceptions and local RAII objects",
    prompt:
      "An exception is thrown partway through a function. What happens to the local RAII objects that were already fully constructed?",
    explanation:
      "During stack unwinding, destructors of already-constructed local objects run, so their resources are released even though the function did not finish normally.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 560,
    is_active: true
  },
  {
    id: "cpp.raii.ownership_boundary.bug_double_free",
    type: "bug_spotting",
    title: "Spot the double free",
    prompt:
      "This crashes:\n\n```cpp\nclass Owner {\n  Widget* p_;\npublic:\n  Owner(Widget* p) : p_(p) {}\n  ~Owner() { delete p_; }\n};\n\nOwner a(new Widget());\nOwner b = a; // copies the raw pointer\n```\n\nWhy does this lead to undefined behavior?",
    explanation:
      "The default copy makes `a.p_` and `b.p_` point at the same Widget, so both destructors `delete` it — a double free. A resource should have a single owner; use unique ownership (or delete the copy) so only one object frees it.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 570,
    is_active: true
  },
  {
    id: "cpp.raii.ownership_boundary.mc_owners",
    type: "multiple_choice",
    title: "How many owners a resource should have",
    prompt: "In a clear ownership model, how many objects should own (and ultimately free) a given resource?",
    explanation:
      "Exactly one owner should be responsible for releasing the resource. Other code may observe or use it via non-owning references, but must not free it.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 580,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.unique_ptr.lesson",
    type: "lesson",
    title: "unique_ptr: unique ownership",
    prompt:
      "A `std::unique_ptr<T>` owns a single heap object and frees it automatically when the unique_ptr goes out of scope. It models *unique* ownership, so it cannot be copied — only one unique_ptr may own the object at a time. Ownership can be transferred with `std::move`. Create one with `std::make_unique<T>(...)`.",
    explanation:
      "unique_ptr is the default smart pointer: zero-overhead, automatic cleanup, and the type system prevents accidental shared ownership.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 610,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.unique_ptr.mc_no_copy",
    type: "multiple_choice",
    title: "Why unique_ptr cannot be copied",
    prompt: "Why is `std::unique_ptr` not copyable?",
    explanation:
      "Copying would create two owners of the same object, and both would try to free it. unique_ptr models unique ownership, so the copy operations are deleted; you transfer ownership with std::move instead.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 620,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.shared_ptr.lesson",
    type: "lesson",
    title: "shared_ptr: shared ownership",
    prompt:
      "A `std::shared_ptr<T>` lets several owners share one object. It keeps a reference count: each new shared_ptr that owns the object increases the count, and each one destroyed decreases it. When the count reaches zero, the object is freed. Create one with `std::make_shared<T>(...)`.",
    explanation:
      "Use shared_ptr only when ownership is genuinely shared. It costs a reference count and atomic updates, so prefer unique_ptr when one owner is enough.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 630,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.shared_ptr.mc_free",
    type: "multiple_choice",
    title: "When shared_ptr frees its object",
    prompt: "When does a `std::shared_ptr` free the object it manages?",
    explanation:
      "The object is freed when the last shared_ptr that owns it is destroyed — that is, when the reference count drops to zero.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 640,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.weak_ptr.code_reading",
    type: "code_reading",
    title: "Reading a weak_ptr",
    prompt:
      "Read this code:\n\n```cpp\nstd::shared_ptr<int> sp = std::make_shared<int>(42);\nstd::weak_ptr<int> wp = sp; // observes, does not own\n\nif (auto locked = wp.lock()) {\n  // use *locked\n}\n```\n\nDoes `wp` keep the int alive, and what does `wp.lock()` return?",
    explanation:
      "A weak_ptr observes a shared_ptr without owning it, so `wp` does not keep the int alive. `wp.lock()` returns a shared_ptr to the object if it is still alive, or an empty shared_ptr if it has already been freed.",
    difficulty: "intermediate",
    estimated_minutes: 3,
    order_index: 650,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.weak_ptr.mc_count",
    type: "multiple_choice",
    title: "weak_ptr and the reference count",
    prompt: "What effect does a `std::weak_ptr` have on the shared_ptr reference count?",
    explanation:
      "None. A weak_ptr is a non-owning observer: it does not change the reference count and does not keep the object alive. Call lock() to safely access the object if it still exists.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 660,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.cyclic_reference.bug_cycle",
    type: "bug_spotting",
    title: "Spot the reference cycle",
    prompt:
      "These objects are never freed:\n\n```cpp\nstruct Node { std::shared_ptr<Node> other; };\n\nauto a = std::make_shared<Node>();\nauto b = std::make_shared<Node>();\na->other = b;\nb->other = a;\n```\n\nWhy do `a` and `b` leak?",
    explanation:
      "Each node holds a shared_ptr to the other, so neither reference count can reach zero — a reference cycle. The fix is to make one side a `std::weak_ptr`, which observes without keeping the other alive.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 670,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.cyclic_reference.mc_break",
    type: "multiple_choice",
    title: "Breaking a reference cycle",
    prompt: "How do you break a `std::shared_ptr` reference cycle?",
    explanation:
      "Replace one of the shared_ptrs in the cycle with a weak_ptr. The weak_ptr does not contribute to the reference count, so the objects can be freed.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 680,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.ownership_choice.lesson",
    type: "lesson",
    title: "Choosing how to own a value",
    prompt:
      "Prefer the simplest ownership that works. If an object can live as a value member or a local stack variable with a clear lifetime, do that — no smart pointer needed. Use a non-owning reference or raw pointer when code only observes a value it does not own. Reach for `std::unique_ptr` or `std::shared_ptr` only when you need heap allocation with automatic cleanup, runtime polymorphism, or a genuinely shared lifetime.",
    explanation:
      "A common beginner habit is wrapping everything in shared_ptr. Start with values and references, and add a smart pointer only when ownership truly requires the heap.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 710,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.ownership_choice.mc_simplest",
    type: "multiple_choice",
    title: "The simplest ownership",
    prompt:
      "You need a member that always lives exactly as long as its containing object and is never shared. What is the simplest choice?",
    explanation:
      "When the member shares the owner lifetime and is not shared or polymorphic, a plain value member is simplest and safest — no heap and no smart pointer needed.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 720,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.ownership_transfer.mc_moved_from",
    type: "multiple_choice",
    title: "State after std::move",
    prompt: "After `auto b = std::move(a);` where `a` is a `std::unique_ptr`, what is the state of `a`?",
    explanation:
      "std::move transfers ownership: b takes the object and a is left empty (null). a may be reassigned later, but dereferencing it before that is undefined behavior.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 730,
    is_active: true
  },
  {
    id: "cpp.smart_pointers.ownership_transfer.bug_use_after_move",
    type: "bug_spotting",
    title: "Spot the use-after-move",
    prompt:
      "This is undefined behavior:\n\n```cpp\nauto a = std::make_unique<Widget>();\nauto b = std::move(a);\na->use(); // here\n```\n\nWhy is the marked line wrong?",
    explanation:
      "After `std::move(a)`, ownership moved to b and a is empty (null). Dereferencing a with `a->use()` is undefined behavior. Use b, which now owns the Widget.",
    difficulty: "intermediate",
    estimated_minutes: 3,
    order_index: 740,
    is_active: true
  },
  {
    id: "cpp.stl.vector.lesson",
    type: "lesson",
    title: "std::vector basics",
    prompt:
      "A `std::vector<T>` is a resizable array that owns its elements and frees them automatically. `push_back` appends to the end, `size()` returns the count, and elements are accessed with `v[i]` or `v.at(i)`. `at(i)` checks bounds and throws on an invalid index, while `v[i]` does not. Prefer vector over a raw `new[]` array.",
    explanation:
      "vector handles growth and cleanup for you, so you rarely need manual arrays. Use at() when an index might be out of range.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 810,
    is_active: true
  },
  {
    id: "cpp.stl.vector.mc_at",
    type: "multiple_choice",
    title: "Bounds-checked vector access",
    prompt: "Which `std::vector` access checks the index and throws if it is out of range?",
    explanation:
      "`v.at(i)` performs bounds checking and throws std::out_of_range for an invalid index. `v[i]` does not check and is undefined behavior when out of range.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 820,
    is_active: true
  },
  {
    id: "cpp.stl.string.code_reading",
    type: "code_reading",
    title: "Reading std::string operations",
    prompt:
      "Read this code:\n\n```cpp\nstd::string s = \"cpp\";\ns += \"Fan\";\nstd::size_t n = s.size();\n```\n\nWhat are the value of `s` and the value of `n`?",
    explanation:
      "`+=` appends, so `s` becomes \"cppFan\", and `size()` returns the number of characters, so `n` is 6.",
    difficulty: "intermediate",
    estimated_minutes: 3,
    order_index: 830,
    is_active: true
  },
  {
    id: "cpp.stl.string.mc_size",
    type: "multiple_choice",
    title: "Length of a std::string",
    prompt: "Which member returns the number of characters in a `std::string`?",
    explanation:
      "`size()` (equivalently `length()`) returns the character count. std::string manages its own storage, so you never compute length manually.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 840,
    is_active: true
  },
  {
    id: "cpp.stl.map.lesson",
    type: "lesson",
    title: "std::map and unordered_map",
    prompt:
      "A `std::map<K, V>` stores key-value pairs with unique keys, kept sorted by key (operations are O(log n)). A `std::unordered_map<K, V>` is a hash table: average O(1) lookups but no ordering. `m[k]` reads or inserts a default value when the key is missing, `m.at(k)` throws if the key is missing, and `m.contains(k)` (or `m.find(k) != m.end()`) checks for a key without inserting it.",
    explanation:
      "Reach for unordered_map when you just need fast lookup, and map when you need keys in sorted order. Beware that operator[] inserts.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1010,
    is_active: true
  },
  {
    id: "cpp.stl.map.mc_check_key",
    type: "multiple_choice",
    title: "Checking a key without inserting",
    prompt: "How do you check whether key `k` is present in a `std::map m` WITHOUT inserting it?",
    explanation:
      "`m.contains(k)` (or `m.find(k) != m.end()`) checks for the key without modifying the map. `m[k]` inserts a default value when the key is missing, which is the classic accidental-insert bug.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1020,
    is_active: true
  },
  {
    id: "cpp.stl.set.lesson",
    type: "lesson",
    title: "std::set and unordered_set",
    prompt:
      "A `std::set<T>` stores unique elements kept in sorted order; a `std::unordered_set<T>` stores unique elements with hashing and no order. `insert` adds an element (and is ignored if it is already present), `contains`/`count` tests membership, and `erase` removes. Sets are ideal for deduplicating values and for fast membership checks.",
    explanation:
      "Use a set when you care about uniqueness or membership. Choose unordered_set for speed and set when you also need sorted iteration.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1030,
    is_active: true
  },
  {
    id: "cpp.stl.set.mc_insert_dup",
    type: "multiple_choice",
    title: "Inserting a duplicate into a set",
    prompt: "What happens when you `insert` a value that is already present in a `std::set`?",
    explanation:
      "Sets store unique elements, so inserting a value that is already present leaves the set unchanged (the insert reports that nothing new was added).",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1040,
    is_active: true
  },
  {
    id: "cpp.stl.algorithms.lesson",
    type: "lesson",
    title: "Standard algorithms",
    prompt:
      "The `<algorithm>` and `<numeric>` headers provide reusable operations that take iterator ranges. `std::sort(v.begin(), v.end())` sorts in place; `std::find(v.begin(), v.end(), value)` returns an iterator (or `end()` if not found); `std::count` counts matches; `std::accumulate(v.begin(), v.end(), 0)` sums; `std::min_element` and `std::max_element` return iterators to the smallest and largest elements. Prefer these over writing the loop by hand.",
    explanation:
      "Standard algorithms are tested, expressive, and hard to get wrong. Pass a custom comparator or lambda when you need ordering other than the default.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1110,
    is_active: true
  },
  {
    id: "cpp.stl.algorithms.mc_sort",
    type: "multiple_choice",
    title: "Sorting a vector",
    prompt: "Which expression sorts a `std::vector<int> v` into ascending order in place?",
    explanation:
      "`std::sort(v.begin(), v.end())` sorts the range in place using `<` by default. vector has no `.sort()` member (that is std::list); the others are not real functions.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1120,
    is_active: true
  },
  {
    id: "cpp.stl.iterators.lesson",
    type: "lesson",
    title: "Iterators and range-based for",
    prompt:
      'An iterator points into a container. `begin()` refers to the first element and `end()` refers to one position past the last, so a range is the half-open interval `[begin, end)`. Range-based for (`for (auto& x : v)`) walks every element without manual iterators. Algorithms operate on `[begin, end)` ranges, and search functions like `find` return `end()` to mean "not found".',
    explanation:
      "end() is a sentinel, not a real element — never dereference it. Compare an iterator to end() to test whether a search succeeded.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1130,
    is_active: true
  },
  {
    id: "cpp.stl.iterators.mc_end",
    type: "multiple_choice",
    title: "What end() refers to",
    prompt: "In a standard container, what does `container.end()` refer to?",
    explanation:
      "`end()` is a sentinel one position past the last element. It is not a real element and must not be dereferenced; it marks the end of the `[begin, end)` range.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1140,
    is_active: true
  },
  {
    id: "cpp.stl.adapters.lesson",
    type: "lesson",
    title: "Container adapters",
    prompt:
      "Container adapters wrap an underlying container to give a restricted interface. `std::stack<T>` is LIFO (`push`, `pop`, `top`); `std::queue<T>` is FIFO (`push`, `pop`, `front`); `std::priority_queue<T>` always exposes the largest element first by default (`push`, `pop`, `top`). Use a stack for depth-first/undo work, a queue for breadth-first/ordering, and a priority_queue when you repeatedly need the max (or min).",
    explanation:
      "Adapters express intent: reach for the one whose ordering matches the problem instead of managing a raw container by hand.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1410,
    is_active: true
  },
  {
    id: "cpp.stl.adapters.mc_lifo",
    type: "multiple_choice",
    title: "Which adapter is LIFO",
    prompt: "Which container adapter gives Last-In-First-Out (LIFO) order?",
    explanation:
      "`std::stack` is LIFO: the most recently pushed element is the first popped. `std::queue` is FIFO, and `std::priority_queue` pops by priority.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1420,
    is_active: true
  },
  {
    id: "cpp.stl.lambdas.lesson",
    type: "lesson",
    title: "Lambdas",
    prompt:
      "A lambda is an inline anonymous function, for example `[](int x){ return x * 2; }`. The leading `[]` is the capture list: it controls which surrounding variables the lambda can use and how — `[=]` captures by value, `[&]` by reference, and `[x]` captures just `x`. Lambdas are most often passed to algorithms, such as a comparator for `std::sort` or a predicate for `std::find_if`.",
    explanation:
      "Capture only what you need. Prefer capturing by value unless you must observe or modify the original, and be careful with [&] capturing locals that outlive the lambda.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1430,
    is_active: true
  },
  {
    id: "cpp.stl.lambdas.mc_capture",
    type: "multiple_choice",
    title: "What the capture list controls",
    prompt: "In a lambda, what does the capture list `[]` control?",
    explanation:
      "The capture list controls which surrounding variables the lambda can use and whether they are captured by value or by reference. It does not declare the parameters or the return type.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1440,
    is_active: true
  },
  {
    id: "cpp.templates.function_templates.lesson",
    type: "lesson",
    title: "Function templates",
    prompt:
      "A function template lets one definition work for many types. `template <typename T> T maxOf(T a, T b) { return a > b ? a : b; }` works for ints, doubles, and any type with `>`. The compiler deduces `T` from the call arguments and generates a concrete function for each type actually used.",
    explanation:
      "You usually do not write the type explicitly; the compiler deduces T from the arguments. Each distinct T produces its own instantiation.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1810,
    is_active: true
  },
  {
    id: "cpp.templates.function_templates.mc_purpose",
    type: "multiple_choice",
    title: "What a function template provides",
    prompt: "What does writing `template <typename T>` before a function let you do?",
    explanation:
      "It defines one function that works for many types, with T deduced from the call. The compiler instantiates a concrete version per type used.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1820,
    is_active: true
  },
  {
    id: "cpp.templates.class_templates.lesson",
    type: "lesson",
    title: "Class templates",
    prompt:
      "A class template parameterizes a class by one or more types: `template <typename T> class Box { T value; public: T get() const { return value; } };`, used as `Box<int> b;`. The standard containers (`std::vector<T>`, `std::map<K,V>`) are class templates. Each instantiation (`Box<int>`, `Box<std::string>`) is a separate type.",
    explanation:
      "Class templates are how the standard library provides type-safe containers. You supply the type argument in angle brackets.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1830,
    is_active: true
  },
  {
    id: "cpp.templates.class_templates.mc_vector",
    type: "multiple_choice",
    title: "Recognizing a class template",
    prompt: "`std::vector<int>` is an example of what?",
    explanation:
      "`std::vector` is a class template; `std::vector<int>` is that template instantiated with the type int.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1840,
    is_active: true
  },
  {
    id: "cpp.templates.concepts.lesson",
    type: "lesson",
    title: "Concepts",
    prompt:
      "A concept (C++20) constrains a template parameter to types that meet stated requirements, e.g. `template <std::integral T> T twice(T x) { return x + x; }` only accepts integer types. Concepts make intent explicit and produce much clearer error messages than unconstrained templates, replacing most older SFINAE tricks.",
    explanation:
      'Concepts say "this template only works for types like X". They turn confusing template errors into a clear "constraint not satisfied" message.',
    difficulty: "advanced",
    estimated_minutes: 4,
    order_index: 1850,
    is_active: true
  },
  {
    id: "cpp.templates.concepts.mc_role",
    type: "multiple_choice",
    title: "What a concept does",
    prompt: "What does applying a concept to a template parameter do?",
    explanation:
      "It constrains the parameter to types that satisfy the concept's requirements, giving clearer errors and documenting intent.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 1860,
    is_active: true
  },
  {
    id: "cpp.templates.ranges.lesson",
    type: "lesson",
    title: "Ranges and views",
    prompt:
      "C++20 ranges let you call algorithms on a whole range without spelling out `begin`/`end`: `std::ranges::sort(v);`. Views compose lazy pipelines: `auto evens = v | std::views::filter([](int x){ return x % 2 == 0; });` produces elements on demand without copying the container.",
    explanation:
      "Range algorithms take the container directly; views are lazy and non-owning, so they compose cheaply.",
    difficulty: "advanced",
    estimated_minutes: 4,
    order_index: 1870,
    is_active: true
  },
  {
    id: "cpp.templates.ranges.mc_views",
    type: "multiple_choice",
    title: "Advantage of ranges and views",
    prompt: "What is an advantage of C++20 ranges and views?",
    explanation:
      "They let you operate on whole ranges directly and compose lazy views that transform/filter without copying the underlying data.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 1880,
    is_active: true
  },
  {
    id: "cpp.templates.constexpr.lesson",
    type: "lesson",
    title: "constexpr functions and values",
    prompt:
      "`constexpr` marks something that *can* be evaluated at compile time. A `constexpr` variable is a true compile-time constant — usable as an array size or template argument. A `constexpr` function may run at compile time when all its arguments are constant expressions, and otherwise runs normally at run time; the same definition serves both. For example `constexpr int square(int n) { return n * n; }` lets `constexpr int n = square(5);` be computed by the compiler, while `square(x)` for a runtime `x` just runs at run time. Use it to move work to compile time and to define real constants instead of macros. (`consteval`, by contrast, *requires* compile-time evaluation.) A `constexpr` function is limited to operations valid in constant evaluation, but those rules have relaxed a lot in modern C++.",
    explanation:
      "constexpr means \"usable at compile time\": a constexpr value is a compile-time constant; a constexpr function runs at compile time when its inputs are constant, else at run time.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3090,
    is_active: true
  },
  {
    id: "cpp.templates.constexpr.mc_eval",
    type: "multiple_choice",
    title: "When constexpr runs at compile time",
    prompt: "When is a call to a `constexpr` function evaluated at compile time?",
    explanation:
      "When it appears in a constant-expression context and all its arguments are themselves constant expressions (e.g. initializing a constexpr variable or an array bound). With runtime arguments the same function simply runs at run time.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3100,
    is_active: true
  },
  {
    id: "cpp.templates.if_constexpr.lesson",
    type: "lesson",
    title: "if constexpr",
    prompt:
      "`if constexpr (cond)` chooses a branch at *compile time*: the condition must be a constant expression, and the branch not taken is **discarded** — not instantiated for that template instantiation. This is what lets a single function template handle types that would make the other branch ill-formed. For example, in a template `print(T v)`, `if constexpr (std::is_pointer_v<T>) { std::cout << *v; } else { std::cout << v; }` compiles for both pointers and non-pointers, because the `*v` branch is discarded when `T` is not a pointer. With a plain runtime `if`, both branches must compile for every `T`, so `*v` on a non-pointer would be an error. Reach for `if constexpr` when the right code depends on a compile-time property of a type.",
    explanation:
      "if constexpr picks a branch at compile time and discards the other (it is not instantiated), so a template can contain branches that would be ill-formed for some types.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3110,
    is_active: true
  },
  {
    id: "cpp.templates.if_constexpr.mc_discarded",
    type: "multiple_choice",
    title: "What if constexpr does",
    prompt: "In a function template, what is special about the branch NOT taken by `if constexpr`?",
    explanation:
      "The discarded branch is not instantiated for that template specialization, so it may contain code that would be ill-formed for the current type. A runtime `if` would require every branch to compile for every type.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3120,
    is_active: true
  },
  {
    id: "cpp.templates.static_assert.lesson",
    type: "lesson",
    title: "static_assert",
    prompt:
      "`static_assert(condition, \"message\")` checks a compile-time condition and, if it is false, stops the build with your message — no run-time cost, no run-time path. It is ideal for enforcing assumptions a template or type relies on: `static_assert(sizeof(int) >= 4, \"needs 32-bit int\");` or, with type traits, `static_assert(std::is_trivially_copyable_v<T>, \"T must be trivially copyable\");`. Because it fires during compilation, it catches violations before the program ever runs and documents the requirement right where it matters. The condition must be a constant expression; pair it with `constexpr` values and type traits. Prefer a clear message — it becomes the diagnostic the next developer reads.",
    explanation:
      "static_assert(cond, \"msg\") fails the build at compile time with your message when cond is false. Use it to enforce and document type/size/trait assumptions with zero runtime cost.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 3130,
    is_active: true
  },
  {
    id: "cpp.templates.static_assert.mc_when",
    type: "multiple_choice",
    title: "What static_assert does",
    prompt: "What happens when a `static_assert` condition is false?",
    explanation:
      "Compilation fails with the supplied message. static_assert is a compile-time check, so the violation is caught during the build and never reaches run time.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3140,
    is_active: true
  },
  {
    id: "cpp.templates.multiple_params.lesson",
    type: "lesson",
    title: "Multiple and non-type template parameters",
    prompt:
      "A template can take more than one parameter, and they need not all be types. Multiple type parameters look like `template <typename K, typename V> struct Pair { K key; V value; };`. A **non-type template parameter (NTTP)** is a compile-time *value* rather than a type — most often an integer: `template <typename T, std::size_t N> struct Array { T data[N]; };` makes `N` part of the type, so `Array<int, 4>` and `Array<int, 8>` are distinct types with the size baked in at compile time (this is exactly how `std::array<T, N>` works). NTTPs must be constant expressions known at compile time (integers, enums, pointers/refs to objects with static storage, and in C++20 some literal class types). Use multiple type params when a template relates several types, and an NTTP when a compile-time size or constant should be part of the type.",
    explanation:
      "Templates can take several type params and non-type (value) params like `std::size_t N` (as in std::array<T, N>). An NTTP must be a compile-time constant and becomes part of the type.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3570,
    is_active: true
  },
  {
    id: "cpp.templates.multiple_params.mc_nttp",
    type: "multiple_choice",
    title: "What is a non-type template parameter",
    prompt: "In `template <typename T, std::size_t N> struct Array { T data[N]; };`, what is `N`?",
    explanation:
      "`N` is a non-type template parameter — a compile-time value (here a size) that becomes part of the type, so Array<int,4> and Array<int,8> are different types. `T` is the type parameter.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3580,
    is_active: true
  },
  {
    id: "cpp.templates.deduction.lesson",
    type: "lesson",
    title: "Type deduction and instantiation",
    prompt:
      "When you call a function template, the compiler usually **deduces** the type arguments from the call: `template <typename T> T max(T a, T b);` called as `max(3, 4)` deduces `T = int`. Deduction has edge cases: `max(3, 4.0)` fails because the two arguments deduce conflicting `T` (int vs double) — you must cast or specify `max<double>(3, 4.0)`; and deduction strips top-level references/const, so plain-by-value params deduce the bare type. A template is also only **instantiated** (code generated) for the specific argument types you actually use, and that instantiation happens where it is used — which is why template definitions must be visible there, i.e. they live in **headers** rather than a .cpp. (Without that visibility you get linker errors for the missing instantiation.) So: let deduction work, disambiguate conflicting arguments, and keep template definitions header-visible.",
    explanation:
      "The compiler deduces template type args from the call (max(3,4) -> T=int); conflicting args (int vs double) fail to deduce. Templates instantiate per used type at the use site, so definitions must be header-visible.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3590,
    is_active: true
  },
  {
    id: "cpp.templates.deduction.mc_headers",
    type: "multiple_choice",
    title: "Why templates live in headers",
    prompt: "Why are template definitions usually placed in headers rather than a single .cpp file?",
    explanation:
      "A template is instantiated for each type at its point of use, so the full definition must be visible in every translation unit that uses it. Hiding it in one .cpp causes unresolved-symbol linker errors.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3600,
    is_active: true
  },
  {
    id: "cpp.templates.aliases_specialization.lesson",
    type: "lesson",
    title: "Alias templates and specialization",
    prompt:
      "A **type alias** names an existing type: `using Index = std::size_t;`. An **alias template** parameterizes that: `template <typename T> using Vec = std::vector<T>;` lets you write `Vec<int>`, and the standard library uses this for traits shortcuts like `std::remove_const_t<T>` (an alias for `typename std::remove_const<T>::type`). Aliases are the modern replacement for `typedef` and never introduce a new distinct type — just a name. **Specialization** is different: it provides an alternative implementation of a template for specific arguments. A full specialization like `template <> struct Hash<bool> { ... };` customizes behavior for `bool` only, while the primary template serves everything else; partial specialization customizes a family (e.g. all pointer types `T*`). Reach for an alias to simplify a type name, and for a specialization when one type genuinely needs different behavior.",
    explanation:
      "Alias templates (template<...> using X = ...;) give a parameterized name for a type (e.g. remove_const_t) and never make a new type. Specialization provides a different implementation for specific template arguments.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3610,
    is_active: true
  },
  {
    id: "cpp.templates.aliases_specialization.mc_alias",
    type: "multiple_choice",
    title: "What an alias template does",
    prompt: "What does `template <typename T> using Vec = std::vector<T>;` create?",
    explanation:
      "It creates an alias template: `Vec<int>` is just another name for `std::vector<int>` — the same type, not a new one. It does not copy or specialize std::vector.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3620,
    is_active: true
  },
  {
    id: "cpp.tooling.error_handling.lesson",
    type: "lesson",
    title: "Error handling",
    prompt:
      'C++ reports failures in two main ways. Exceptions (`throw std::runtime_error("...")` caught by `try { ... } catch (const std::exception& e) { ... }`) unwind the stack to a handler and run destructors along the way (RAII makes this safe). Error returns (a status code or `std::optional`/`std::expected`) make failure part of the value. Use exceptions for exceptional, hard-to-handle-locally errors; use return values for expected, routine failures.',
    explanation:
      "Exceptions unwind to a handler and run destructors (so RAII cleans up). Prefer return-value errors for expected outcomes and exceptions for truly exceptional ones.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1910,
    is_active: true
  },
  {
    id: "cpp.tooling.error_handling.mc_unwind",
    type: "multiple_choice",
    title: "What happens when an exception is thrown",
    prompt: "When an exception is thrown and caught higher up, what happens to local objects in between?",
    explanation:
      "Stack unwinding destroys the local objects between the throw and the handler, running their destructors — which is why RAII makes exception handling safe.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1920,
    is_active: true
  },
  {
    id: "cpp.tooling.testing.lesson",
    type: "lesson",
    title: "Testing",
    prompt:
      "A unit test calls your code with known inputs and checks the output against the expected result, failing loudly when they differ. A good bug-fix workflow writes a test that fails before the fix and passes after, locking the bug out for good. Frameworks like GoogleTest or Catch2 structure tests and assertions; even a few `assert`-style checks are far better than manual inspection.",
    explanation:
      'Tests turn "I think it works" into "it is verified". Write a failing test first, then make it pass.',
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1930,
    is_active: true
  },
  {
    id: "cpp.tooling.testing.mc_regression",
    type: "multiple_choice",
    title: "A good bug-fix workflow",
    prompt: "What is the recommended way to fix a bug so it stays fixed?",
    explanation:
      "Write a test that reproduces the bug (fails before the fix) and passes after the fix. The test guards against the bug returning.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1940,
    is_active: true
  },
  {
    id: "cpp.tooling.debugging.lesson",
    type: "lesson",
    title: "Debugging",
    prompt:
      "When code misbehaves, reproduce it reliably with the smallest input you can, then narrow down where the actual differs from the expected. A debugger (gdb/lldb or an IDE) lets you set breakpoints, step line by line, and inspect variables; targeted print/log statements work too. Change one thing at a time and re-check, rather than guessing broadly.",
    explanation:
      "Reproduce small, then bisect: find the first point where state goes wrong. A debugger and a minimal repro beat random edits.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1950,
    is_active: true
  },
  {
    id: "cpp.tooling.debugging.mc_firststep",
    type: "multiple_choice",
    title: "First step when debugging",
    prompt: "What is a good first step when investigating a bug?",
    explanation:
      "Get a small, reliable reproduction. Once you can trigger the bug consistently with minimal input, you can bisect to the cause.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1960,
    is_active: true
  },
  {
    id: "cpp.tooling.build.lesson",
    type: "lesson",
    title: "Compiling and building",
    prompt:
      'Building a C++ program has two key stages: compiling each source file into an object file (syntax/type checks happen here), then linking the object files and libraries into an executable (unresolved symbols are errors here). A build system like CMake describes targets and dependencies so the right files are compiled and linked with one command, instead of typing compiler invocations by hand.',
    explanation:
      'A "compile error" is in one file; an "undefined reference" is usually a link error (a definition is missing). Build systems automate the compile+link steps.',
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1970,
    is_active: true
  },
  {
    id: "cpp.tooling.build.mc_linkstage",
    type: "multiple_choice",
    title: "Compile vs link",
    prompt: 'An "undefined reference to foo()" error most likely comes from which stage?',
    explanation:
      "That is a linker error: the code compiled, but no definition of foo() was found to link against. Compile errors are about syntax/types within a single translation unit.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1980,
    is_active: true
  },
  {
    id: "cpp.tooling.warnings.lesson",
    type: "lesson",
    title: "Warnings and warnings-as-errors",
    prompt:
      "Compiler warnings flag code that compiles but is probably wrong — an unused variable, a signed/unsigned comparison, a function that falls off the end without returning. Turn them on: `-Wall -Wextra` (and often `-Wpedantic`) on GCC/Clang surface the common mistakes, and many real bugs show up first as a warning you would otherwise ignore. The discipline that keeps them useful is `-Werror`, which makes any warning fail the build. Without it, warnings accumulate until nobody reads them; with it, the codebase stays clean because a new warning stops CI immediately. In practice teams enable a strong warning set plus `-Werror` in CI, and treat a warning as a defect to fix, not noise to scroll past.",
    explanation:
      "-Wall -Wextra enable strong warnings that catch likely bugs; -Werror promotes them to build failures so warnings never pile up unread.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 3150,
    is_active: true
  },
  {
    id: "cpp.tooling.warnings.mc_werror",
    type: "multiple_choice",
    title: "Why -Werror",
    prompt: "What does compiling with `-Werror` do, and why is it useful?",
    explanation:
      "-Werror turns warnings into errors that fail the build, so warnings can't accumulate unnoticed — every new one must be fixed (or explicitly suppressed) before the code merges.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3160,
    is_active: true
  },
  {
    id: "cpp.tooling.sanitizers.lesson",
    type: "lesson",
    title: "Address and UB sanitizers",
    prompt:
      "Sanitizers are compiler instrumentation that catch bugs while the program runs, with a clear report instead of silent corruption. **AddressSanitizer** (`-fsanitize=address`) detects heap/stack buffer overflows, use-after-free, and leaks. **UndefinedBehaviorSanitizer** (`-fsanitize=undefined`) flags signed overflow, invalid casts, null dereferences, and other UB. You enable them at build time — `g++ -fsanitize=address,undefined -g` — and run your tests; on a violation the program aborts with the faulting line and a stack trace. They add run-time overhead, so they are used in debug/test/CI builds rather than shipped in Release. (ThreadSanitizer similarly finds data races but runs in a separate build.) Sanitizer-backed tests turn 'works on my machine' UB into a reproducible, located failure.",
    explanation:
      "ASan (-fsanitize=address) catches memory errors (overflow/use-after-free/leaks); UBSan (-fsanitize=undefined) catches undefined behavior. Use them in debug/test/CI builds, not Release.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3170,
    is_active: true
  },
  {
    id: "cpp.tooling.sanitizers.mc_asan",
    type: "multiple_choice",
    title: "What AddressSanitizer catches",
    prompt: "Which kind of bug is AddressSanitizer (`-fsanitize=address`) designed to catch?",
    explanation:
      "ASan targets memory errors — heap/stack buffer overflows, use-after-free, and leaks — reporting the faulting access and a stack trace instead of letting the program corrupt memory silently.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3180,
    is_active: true
  },
  {
    id: "cpp.tooling.cmake.lesson",
    type: "lesson",
    title: "CMake builds",
    prompt:
      "CMake describes a build in `CMakeLists.txt` so the same project compiles across compilers and IDEs. The essentials: `add_executable(app main.cpp)` (or `add_library(...)`) defines a *target*; `target_include_directories(app PRIVATE include)` adds header search paths; `target_link_libraries(app PRIVATE fmt)` links dependencies. You configure once (`cmake -S . -B build`) then build (`cmake --build build`). Choose a build type with `-DCMAKE_BUILD_TYPE=Debug` (no optimization, full debug info, assertions) or `Release` (optimized, `NDEBUG`); Debug is for developing and sanitizer runs, Release for shipping. Thinking in targets — each with its own includes, definitions, and links — keeps large projects modular instead of relying on one global flag soup.",
    explanation:
      "CMake builds around targets: add_executable/add_library, then target_include_directories/target_link_libraries. Pick CMAKE_BUILD_TYPE=Debug for development/sanitizers, Release for shipping.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3190,
    is_active: true
  },
  {
    id: "cpp.tooling.cmake.mc_link",
    type: "multiple_choice",
    title: "Linking a library in CMake",
    prompt: "Which CMake command links an external library into your executable target?",
    explanation:
      "target_link_libraries(<target> PRIVATE <lib>) links a dependency to a target. add_executable defines the target; target_include_directories adds header paths.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3200,
    is_active: true
  },
  {
    id: "cpp.tooling.preconditions.lesson",
    type: "lesson",
    title: "Preconditions and input validation",
    prompt:
      "Distinguish two kinds of checks. **Input validation** handles untrusted data crossing a real boundary — user input, files, network, parsing — where bad data is *expected*; validate it and return/report a recoverable error (or throw). **Preconditions** are the contract a function requires of its caller — e.g. \"index must be in range,\" \"pointer must be non-null.\" Those describe a *programming bug* if violated, so the right tool is an `assert` (active in debug builds, compiled out in release) rather than runtime validation in every call, which would be slow and would mask the bug. Rule of thumb: validate at the edges of your program; `assert` internal invariants you control. Don't trust external input, but don't defensively re-check things your own code already guarantees — that is the \"only validate at real boundaries\" principle.",
    explanation:
      "Validate untrusted input at real boundaries (user/file/network) and report recoverable errors; use assert for caller-contract preconditions (a bug if violated), not runtime checks on every call.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3630,
    is_active: true
  },
  {
    id: "cpp.tooling.preconditions.mc_assert",
    type: "multiple_choice",
    title: "Validate or assert?",
    prompt: "A private helper requires its caller to pass a non-null pointer (a contract your own code guarantees). How should it enforce that?",
    explanation:
      "Use an assert: a violated internal precondition is a programming bug, caught in debug builds and compiled out of release. Full runtime validation is for untrusted input crossing a boundary, not contracts your own code already guarantees.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3640,
    is_active: true
  },
  {
    id: "cpp.tooling.optional_expected.lesson",
    type: "lesson",
    title: "Signaling failure with optional and expected",
    prompt:
      "Two return-based ways to report failure without exceptions. `std::optional<T>` says \"a `T` or nothing\" — perfect when absence is normal and the reason doesn't matter (a lookup miss, a parse that found no value). `std::expected<T, E>` (C++23) says \"a `T` or an error of type `E`\" — use it when the caller needs to know *why* it failed (an error code, message, or enum). Both make failure part of the type, so the caller must handle it (check `has_value()` / `if (opt)` before using `*`), unlike a bare sentinel that's easy to ignore. They cost nothing when there's no exception machinery and read linearly. Reach for `optional` when \"missing\" is enough information, and `expected` when you must carry an error value back.",
    explanation:
      "std::optional<T> = value or nothing (absence, reason irrelevant). std::expected<T,E> = value or an error E (caller needs the reason). Both put failure in the type so it can't be silently ignored.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3650,
    is_active: true
  },
  {
    id: "cpp.tooling.optional_expected.mc_choose",
    type: "multiple_choice",
    title: "optional or expected?",
    prompt: "A function can fail and the caller needs to know the specific reason it failed. Which return type fits best?",
    explanation:
      "std::expected<T, E> carries either the value or an error E describing why it failed. std::optional<T> only signals presence/absence with no reason.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3660,
    is_active: true
  },
  {
    id: "cpp.tooling.error_strategy.lesson",
    type: "lesson",
    title: "Choosing an error-handling strategy",
    prompt:
      "Match the mechanism to the failure. Use **exceptions** for genuinely exceptional, hard-to-handle-locally failures (constructor failure, out-of-memory, deep call stacks) — they unwind cleanly with RAII and keep the happy path uncluttered, but shouldn't drive ordinary control flow because throwing is costly and hides flow. Use **`std::optional`/`std::expected`** for expected, recoverable outcomes a caller will handle right away (lookup miss, parse failure) — failure is in the return type and there's no unwinding cost. Use **error codes** (or `std::error_code`) at C-style or performance-critical boundaries and when interoperating with C. The deciding questions: is the failure expected or truly exceptional? Must every caller handle it now, or can it propagate far up? Is throwing on the hot path? Avoid using exceptions for normal branching like \"not found,\" which is better expressed as `optional`.",
    explanation:
      "Exceptions for truly exceptional failures that unwind far (with RAII); optional/expected for expected, locally-handled outcomes; error codes at C/perf boundaries. Don't use exceptions for ordinary control flow.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 3670,
    is_active: true
  },
  {
    id: "cpp.tooling.error_strategy.mc_controlflow",
    type: "multiple_choice",
    title: "Not-found is not exceptional",
    prompt: "A lookup that frequently finds nothing should report \"not found\" how?",
    explanation:
      "Return a std::optional (or expected) — \"not found\" is an expected, recoverable outcome the caller handles immediately. Throwing an exception for ordinary, frequent control flow is costly and obscures the logic.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3680,
    is_active: true
  },
  {
    id: "dsa.complexity.big_o.lesson",
    type: "lesson",
    title: "Big-O notation",
    prompt:
      "Big-O describes how an algorithm's running time grows as the input size `n` grows, ignoring constant factors and lower-order terms. Common classes from fastest to slowest: O(1) constant, O(log n) (binary search), O(n) (one scan), O(n log n) (efficient sorts), O(n^2) (nested loops over the data). For large inputs, only the dominant term matters.",
    explanation:
      "Count how the number of basic operations scales with n, then keep the biggest term. Constants and small terms are dropped.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1710,
    is_active: true
  },
  {
    id: "dsa.complexity.big_o.mc_single_loop",
    type: "multiple_choice",
    title: "Complexity of one loop",
    prompt: "A single loop that does constant work for each of `n` elements has what time complexity?",
    explanation:
      "One pass over n elements with O(1) work per element is O(n). A loop nested inside another over the same data would be O(n^2).",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1720,
    is_active: true
  },
  {
    id: "dsa.complexity.problem_solving.lesson",
    type: "lesson",
    title: "A systematic solving process",
    prompt:
      "A reliable approach to a new problem: (1) understand the problem and its constraints; (2) work a small example by hand; (3) write a correct brute-force solution; (4) look for a better approach (sorting, hashing, two pointers, dynamic programming); (5) test edge cases (empty input, one element, duplicates, the maximum size). Optimize only after you have something correct.",
    explanation:
      "Correct-then-fast: a working brute force plus good tests beats a clever solution you cannot verify.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1730,
    is_active: true
  },
  {
    id: "dsa.complexity.problem_solving.mc_first_step",
    type: "multiple_choice",
    title: "Before optimizing",
    prompt: "What is the best first step before trying to optimize a solution?",
    explanation:
      "Get a correct brute-force solution working and tested first. That gives a baseline and a reference to check any faster version against.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1740,
    is_active: true
  },
  {
    id: "dsa.complexity.growth_rates.lesson",
    type: "lesson",
    title: "Comparing growth rates",
    prompt:
      "Big-O describes how work grows with input size n, keeping only the dominant term and dropping constants: a loop doing `3n + 5` steps is O(n). The common rates, from fastest-growing-slowest to fastest, are O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n). To estimate, count how many times the innermost work runs: a single pass is O(n); a loop inside a loop over the same n is O(n^2); repeatedly halving the search space is O(log n); sorting then one pass is O(n log n). When you add phases you keep the biggest (`O(n) + O(n log n) = O(n log n)`); when you nest them you multiply. Big-Theta pins the growth from both sides; in everyday use we say Big-O but usually mean the tight bound.",
    explanation:
      "Drop constants and lower-order terms; rank O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n). Sequential phases keep the max; nested loops multiply.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2970,
    is_active: true
  },
  {
    id: "dsa.complexity.growth_rates.mc_order",
    type: "multiple_choice",
    title: "Ordering complexities",
    prompt: "Which list orders these from slowest-growing to fastest-growing?",
    explanation:
      "From slowest to fastest growth: O(log n), O(n), O(n log n), O(n^2). Logarithmic grows slowest; the quadratic term dominates for large n.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2980,
    is_active: true
  },
  {
    id: "dsa.complexity.amortized.lesson",
    type: "lesson",
    title: "Amortized analysis",
    prompt:
      "Amortized analysis asks for the average cost per operation across a whole sequence, not the worst single step. `std::vector::push_back` is the classic example: most pushes are O(1), but when the buffer is full the vector allocates a bigger block (typically doubling) and copies all existing elements — an O(n) step. Because capacity doubles, those expensive copies happen rarely and geometrically less often, and the total copying work across n pushes sums to O(n). Spread over n operations that is O(1) *amortized* per push. The lesson: an occasional costly step does not make the operation O(n) if its cost is paid down across many cheap steps. (Note this differs from average-case analysis over random inputs — amortized bounds hold for any sequence.)",
    explanation:
      "Amortized cost averages an operation over a sequence. vector::push_back doubles capacity, so rare O(n) resizes sum to O(n) total across n pushes — O(1) amortized each.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2990,
    is_active: true
  },
  {
    id: "dsa.complexity.amortized.mc_pushback",
    type: "multiple_choice",
    title: "Cost of push_back",
    prompt: "What is the amortized time complexity of a single `std::vector::push_back`?",
    explanation:
      "O(1) amortized: most pushes are constant time, and the occasional O(n) reallocation is rare enough (capacity doubles) that the total over n pushes is O(n).",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3000,
    is_active: true
  },
  {
    id: "dsa.complexity.constraints.lesson",
    type: "lesson",
    title: "Reading input constraints",
    prompt:
      "Input bounds tell you which complexities are feasible before you write code. A rough rule for a ~1-second limit: n up to ~10^8 needs O(n); ~10^6 allows O(n log n); n up to a few thousand tolerates O(n^2); n up to ~20 may permit O(2^n) brute force. So if the problem says n can be 10^5, an O(n^2) plan (~10^10 operations) is almost certainly too slow and you should look for O(n log n) or better. Constraints also expose *hidden* costs: a loop that calls `s.substr()` or scans a string each iteration hides an extra O(n) factor, turning an apparent O(n) loop into O(n^2). Read the limits first, pick a target complexity, then design to it.",
    explanation:
      "Use n's upper bound to pick a feasible target (n~1e8 -> O(n); ~1e6 -> O(n log n); ~1e3 -> O(n^2)); and watch for per-iteration work that hides an extra factor.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3010,
    is_active: true
  },
  {
    id: "dsa.complexity.constraints.mc_feasible",
    type: "multiple_choice",
    title: "Using constraints",
    prompt: "If n can be up to 100,000 and the time limit is about one second, which approach is most likely too slow?",
    explanation:
      "An O(n^2) approach is ~10^10 operations at n = 100,000 — far beyond a one-second budget. O(n), O(n log n), and O(log n) all stay feasible.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3020,
    is_active: true
  },
  {
    id: "dsa.complexity.pattern_recognition.lesson",
    type: "lesson",
    title: "Recognizing the right pattern",
    prompt:
      "Most interview/competitive problems map to a small set of standard patterns; learning to read the cues saves you from reinventing one each time. \"How many times does X appear / are there duplicates / group by key\" points to a **frequency map / counting** (hash map). \"Find a pair/subarray in a sorted array\" or \"longest/shortest window satisfying a condition\" points to **two pointers / sliding window**. \"Many range-sum queries\" points to **prefix sums**. \"Find pairs/closest/overlaps\" often becomes easy after **sorting then scanning** once. The skill is matching the problem's wording and structure to the pattern *before* coding — then you only need to recall how that one pattern works.",
    explanation:
      "Map cues to patterns: counting/duplicates/group-by -> frequency map; sorted-pair or longest/shortest window -> two pointers/sliding window; many range sums -> prefix sums; pairs/overlaps -> sort then scan.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3450,
    is_active: true
  },
  {
    id: "dsa.complexity.pattern_recognition.mc_window",
    type: "multiple_choice",
    title: "Spotting a sliding window",
    prompt: "\"Find the length of the longest contiguous subarray whose sum is at most K\" most directly suggests which pattern?",
    explanation:
      "A longest/shortest contiguous-subarray-under-a-constraint problem is the canonical sliding-window cue: grow/shrink a window in O(n) rather than checking every subarray.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3460,
    is_active: true
  },
  {
    id: "dsa.complexity.container_selection.lesson",
    type: "lesson",
    title: "Choosing a container from operations",
    prompt:
      "Pick the container from the operations a task actually needs, not by habit. Need indexed access and append at the back? `std::vector` (contiguous, cache-friendly). Need fast membership or keying by value with no order? `std::unordered_set`/`std::unordered_map` (average O(1)). Need keys kept in sorted order or range queries? `std::map`/`std::set` (O(log n), ordered). Need last-in-first-out? `std::stack`; first-in-first-out? `std::queue`; always pull the min/max? `std::priority_queue` (a heap). Write down the operations and their required complexity, then choose: \"membership in O(1)\" → hash set; \"ordered iteration\" → map/set; \"LIFO\" → stack. The right container often makes the algorithm obvious.",
    explanation:
      "Match container to required ops: vector (index/append), unordered_map/set (O(1) membership), map/set (ordered/range, O(log n)), stack (LIFO), queue (FIFO), priority_queue (min/max).",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3470,
    is_active: true
  },
  {
    id: "dsa.complexity.container_selection.mc_membership",
    type: "multiple_choice",
    title: "Container for fast membership",
    prompt: "You need to repeatedly check whether a value has been seen, with no ordering requirement. Which container fits best?",
    explanation:
      "std::unordered_set gives average O(1) insert and membership checks. std::set is O(log n) and only needed when you also want sorted order; a vector would be O(n) per check.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3480,
    is_active: true
  },
  {
    id: "dsa.complexity.recursion_choice.lesson",
    type: "lesson",
    title: "Recursion, iteration, and backtracking",
    prompt:
      "Reach for recursion when a problem is naturally defined in terms of smaller instances of itself: trees, divide-and-conquer (merge/quick sort, binary search), and \"try each choice then recurse\" search. **Backtracking** is recursion that builds a candidate incrementally and undoes the last choice when it can't lead to a solution — the pattern behind permutations, subsets, N-queens, and maze/path search. Plain **iteration** is simpler and avoids call-stack overhead for linear scans and simple accumulation, and any recursion can be rewritten iteratively (sometimes with an explicit stack). The decision: if the structure or the set of choices is recursive, recursion/backtracking expresses it most clearly; if you're just walking a sequence once, a loop is better. Watch recursion depth — deep recursion on large inputs can overflow the stack.",
    explanation:
      "Use recursion for self-similar structure (trees, divide-and-conquer); backtracking for incremental choose/undo search (permutations, subsets, N-queens). Prefer iteration for linear scans; mind stack depth.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3490,
    is_active: true
  },
  {
    id: "dsa.complexity.recursion_choice.mc_backtracking",
    type: "multiple_choice",
    title: "When backtracking fits",
    prompt: "Generating all permutations of a set by choosing an element, recursing, then undoing the choice is an example of which technique?",
    explanation:
      "That choose / recurse / undo structure is backtracking — recursion that builds candidates incrementally and reverts a choice when exploring the next branch.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3500,
    is_active: true
  },
  {
    id: "dsa.arrays.indexing.lesson",
    type: "lesson",
    title: "Zero-based indexing",
    prompt:
      "Arrays and vectors are zero-indexed: for a sequence of size `n`, the valid indices are `0` through `n - 1`. Reading or writing index `n` (or a negative index) is out of bounds and is undefined behavior with `operator[]`. Most off-by-one bugs come from looping while `i <= n` instead of `i < n`.",
    explanation:
      "Always reason about the half-open range [0, n): the first valid index is 0 and the last is n - 1.",
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 910,
    is_active: true
  },
  {
    id: "dsa.arrays.indexing.mc_last_index",
    type: "multiple_choice",
    title: "Last valid index",
    prompt: "For a vector with `n` elements, what is the last valid index?",
    explanation:
      "Indices run from 0 to n - 1, so the last valid index is n - 1. Index n is one past the end and is out of bounds.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 920,
    is_active: true
  },
  {
    id: "dsa.arrays.traversal.code_reading",
    type: "code_reading",
    title: "Reading a traversal loop",
    prompt:
      "Read this code:\n\n```cpp\nint sum = 0;\nfor (int x : v) {\n  sum += x;\n}\n```\n\nWhat does `sum` hold after the loop, for a vector `v`?",
    explanation:
      "The range-based for loop visits every element of `v` once, so `sum` holds the total of all elements in `v`.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 930,
    is_active: true
  },
  {
    id: "dsa.arrays.traversal.mc_safe_loop",
    type: "multiple_choice",
    title: "A correct traversal",
    prompt: "Which loop visits every element of a vector `v` exactly once, with no out-of-bounds access?",
    explanation:
      "A range-based for loop (`for (int x : v)`) visits each element exactly once and cannot run off the end. The index loop must use `i < v.size()` (not `<=`) and start at 0.",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 940,
    is_active: true
  },
  {
    id: "dsa.searching.binary_search.lesson",
    type: "lesson",
    title: "Binary search",
    prompt:
      "Binary search finds a target in a sorted sequence in O(log n) by repeatedly halving the search range: compare the middle element, then keep the left or right half. It only works when the data is sorted. In C++, `std::binary_search(begin, end, value)` returns a bool, and `std::lower_bound(begin, end, value)` returns the first position not less than value.",
    explanation:
      "The key precondition is sorted input. On unsorted data, binary search gives wrong answers.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1310,
    is_active: true
  },
  {
    id: "dsa.searching.binary_search.mc_precondition",
    type: "multiple_choice",
    title: "Binary search precondition",
    prompt: "What must be true about the data for binary search to work correctly?",
    explanation:
      "Binary search relies on order: each comparison discards half the range, which is only valid when the sequence is sorted.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1320,
    is_active: true
  },
  {
    id: "dsa.sorting.comparator.lesson",
    type: "lesson",
    title: "Sorting with a comparator",
    prompt:
      "`std::sort` orders elements with `<` by default (ascending). To sort by a custom order, pass a comparator: `std::sort(v.begin(), v.end(), [](int a, int b){ return a > b; })` sorts descending. The comparator returns `true` when `a` should come before `b`. The same idea sorts structs by a chosen field.",
    explanation:
      "A comparator is a small function or lambda. Keep it a strict weak ordering: it must return false when a and b are equivalent.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1330,
    is_active: true
  },
  {
    id: "dsa.sorting.comparator.mc_descending",
    type: "multiple_choice",
    title: "Sorting descending",
    prompt: "Which comparator passed to `std::sort` orders a `std::vector<int>` from largest to smallest?",
    explanation:
      "A comparator returns true when its first argument should come first. `a > b` puts larger values first, giving descending order.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1340,
    is_active: true
  },
  {
    id: "dsa.stacks.basic_stack.lesson",
    type: "lesson",
    title: "When to use a stack or a queue",
    prompt:
      "A stack (LIFO) fits problems with nested or reversible structure: matching brackets, undo, depth-first search, and expression evaluation — push when you enter something, pop when you resolve it. A queue (FIFO) fits processing in arrival order and breadth-first search, where you handle items level by level. Choosing the structure that matches the order of work usually makes the algorithm simple.",
    explanation:
      "Ask: do I resolve the most recent thing first (stack) or the oldest thing first (queue)? The answer picks the structure.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1510,
    is_active: true
  },
  {
    id: "dsa.stacks.basic_stack.mc_parens",
    type: "multiple_choice",
    title: "Checking balanced brackets",
    prompt: "Which data structure most naturally checks whether brackets like `(()())` are balanced?",
    explanation:
      "A stack matches nested structure: push each opening bracket and pop when a closing bracket matches the top. A leftover or mismatched bracket means it is unbalanced.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1520,
    is_active: true
  },
  {
    id: "dsa.hashing.lookup.lesson",
    type: "lesson",
    title: "Hashing for fast lookup",
    prompt:
      'A hash map (`std::unordered_map`) gives average O(1) lookup by key, and a hash set (`std::unordered_set`) gives average O(1) membership tests. Common patterns: count how often values appear, detect duplicates, or check "have I seen this before?" in a single pass. You trade extra memory for speed compared with repeatedly scanning a list.',
    explanation:
      "When a brute-force solution does repeated linear searches, a hash set/map often turns an O(n^2) scan into O(n).",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1530,
    is_active: true
  },
  {
    id: "dsa.hashing.lookup.mc_advantage",
    type: "multiple_choice",
    title: "Why hashing for lookups",
    prompt: "What is the main advantage of `std::unordered_set` over scanning a `std::vector` to test membership?",
    explanation:
      "A hash set tests membership in average O(1), versus O(n) for scanning a vector. That speedup is the reason to use hashing for lookups and duplicate detection.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1540,
    is_active: true
  },
  {
    id: "dsa.arrays.two_pointers.lesson",
    type: "lesson",
    title: "Two pointers and sliding window",
    prompt:
      'The two-pointer technique uses two indices moving through a sequence to solve pair and window problems in O(n) instead of O(n^2). On a sorted array you can find a pair summing to a target by starting one pointer at each end and moving inward based on the current sum. A sliding window keeps a moving range [left, right) and updates a running result as it grows and shrinks, which suits "longest/shortest subarray" style problems.',
    explanation:
      "Two pointers turn many nested-loop scans into a single linear pass. The array often needs to be sorted for the pair variant.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1610,
    is_active: true
  },
  {
    id: "dsa.arrays.two_pointers.mc_complexity",
    type: "multiple_choice",
    title: "Two-pointer time complexity",
    prompt:
      "On a sorted array, finding a pair that sums to a target using two pointers from both ends runs in what time?",
    explanation:
      "Each step moves one pointer inward, so the pointers meet after at most n steps: O(n). A brute-force double loop would be O(n^2).",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1620,
    is_active: true
  },
  {
    id: "dsa.recursion.base_case.lesson",
    type: "lesson",
    title: "Recursion and base cases",
    prompt:
      "A recursive function solves a problem by calling itself on a smaller input. It needs a base case that stops the recursion (for example `n == 0`) and a recursive case that makes progress toward that base case. For example, `factorial(n)` returns 1 when `n == 0`, otherwise `n * factorial(n - 1)`. Without a reachable base case the calls never stop and the call stack overflows.",
    explanation:
      "Every recursion needs two things: a base case to stop, and a step that moves strictly toward it.",
    difficulty: "intermediate",
    estimated_minutes: 4,
    order_index: 1630,
    is_active: true
  },
  {
    id: "dsa.recursion.base_case.mc_no_base",
    type: "multiple_choice",
    title: "Missing base case",
    prompt: "What happens if a recursive function never reaches a base case?",
    explanation:
      "With no reachable base case the function calls itself forever, growing the call stack until it overflows (a crash), rather than returning a value.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 1640,
    is_active: true
  },
  {
    id: "dsa.trees.linked_list.lesson",
    type: "lesson",
    title: "Singly linked lists",
    prompt:
      "A singly linked list is a chain of nodes, each holding a value and a pointer to the next node; the last node's next is null. Unlike an array, the elements are not contiguous — you reach the k-th element by following k pointers from the head, so indexed access is O(n). Its strength is O(1) insertion or deletion *once you already hold the node before the spot*: you splice by rewiring `prev->next`. Traverse with `for (Node* p = head; p != nullptr; p = p->next)`. The safety traps are real: to delete a node you must keep a handle to its predecessor and free the removed node, and after freeing you must not touch it (dangling). In modern C++ you would own nodes with `std::unique_ptr<Node>` so the chain cleans itself up, avoiding manual `delete` and leaks.",
    explanation:
      "A singly linked list chains value+next nodes ending in null. Indexed access is O(n); splice insert/delete is O(1) with the predecessor in hand. Own nodes (e.g. unique_ptr) to avoid leaks/dangling.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3210,
    is_active: true
  },
  {
    id: "dsa.trees.linked_list.mc_access",
    type: "multiple_choice",
    title: "Indexed access cost",
    prompt: "What is the time complexity of reaching the k-th element of a singly linked list?",
    explanation:
      "Nodes are not contiguous, so you must follow next pointers from the head k times — O(n) in the worst case. Arrays/vectors give O(1) indexed access instead.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3220,
    is_active: true
  },
  {
    id: "dsa.trees.list_vs_vector.lesson",
    type: "lesson",
    title: "List vs vector tradeoffs",
    prompt:
      "`std::vector` is the right default container and `std::list` (a doubly linked list) is rarely worth it. The reason is memory locality: a vector stores elements contiguously, so iterating it streams through cache and is dramatically faster than chasing a linked list's scattered node pointers — even for workloads with mid-sequence inserts, the vector's cheap traversal usually wins. A linked list's theoretical advantage is O(1) insertion/deletion *given an iterator to the position* and stable references that survive insertions elsewhere; it pays off only when you frequently splice in the middle while holding that position, or must keep node addresses stable. For appends and scans, `vector::push_back` (amortized O(1)) plus contiguous storage beats it. Rule of thumb: reach for `vector` first; justify `list` with a concrete locality-or-stability reason.",
    explanation:
      "Prefer std::vector: contiguous storage gives cache-friendly traversal that usually beats a linked list. std::list only helps for frequent mid-sequence splicing with a held position or stable node references.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3230,
    is_active: true
  },
  {
    id: "dsa.trees.list_vs_vector.mc_default",
    type: "multiple_choice",
    title: "Why vector is the default",
    prompt: "Why is `std::vector` usually preferred over `std::list` even when there are some insertions?",
    explanation:
      "Vector stores elements contiguously, so it is cache-friendly and fast to traverse, whereas a linked list chases scattered pointers. That locality advantage usually outweighs list's O(1) mid-sequence splice.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3240,
    is_active: true
  },
  {
    id: "dsa.trees.tree_terminology.lesson",
    type: "lesson",
    title: "Tree terminology and shape",
    prompt:
      "A tree is a hierarchy of nodes with one **root** (no parent); every other node has exactly one parent, and nodes with no children are **leaves**. An **edge** connects a parent and child. Any node plus all its descendants form a **subtree** — which is why trees are naturally *recursive*: a tree is a root whose children are themselves trees. Two measures matter: the **depth** of a node is the number of edges from the root down to it (the root has depth 0), and the **height** of a node is the number of edges on the longest path down to a leaf (a leaf has height 0); the height of the tree is the height of its root. This recursive view is what lets traversals and most tree algorithms be written as a base case (null/leaf) plus a combination of the results on each child subtree.",
    explanation:
      "Root (no parent), leaves (no children), subtree (a node + its descendants). Depth counts edges from the root down; height counts edges down to the farthest leaf. Trees are recursive: children are subtrees.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3250,
    is_active: true
  },
  {
    id: "dsa.trees.tree_terminology.mc_height",
    type: "multiple_choice",
    title: "Height of a leaf",
    prompt: "Using the convention that height counts edges to the farthest leaf, what is the height of a leaf node?",
    explanation:
      "A leaf has no children, so the longest downward path from it has zero edges — height 0. Its depth, by contrast, is however many edges separate it from the root.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3260,
    is_active: true
  },
  {
    id: "dsa.trees.traversal.lesson",
    type: "lesson",
    title: "Binary tree traversal",
    prompt:
      "A binary tree node holds a value and links to a left and right child. Depth-first traversals visit nodes recursively in one of three orders: preorder (node, left, right), inorder (left, node, right), and postorder (left, right, node). Breadth-first (level-order) traversal visits nodes level by level using a queue. On a binary search tree, an inorder traversal visits values in sorted ascending order, which is why inorder is the go-to for printing or validating a BST.",
    explanation:
      "Preorder, inorder, and postorder differ only in when the node itself is visited relative to its children; inorder on a BST yields sorted order.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2010,
    is_active: true
  },
  {
    id: "dsa.trees.traversal.mc_inorder_bst",
    type: "multiple_choice",
    title: "Inorder on a BST",
    prompt: "On a binary search tree, what order does an inorder traversal visit the values in?",
    explanation:
      "Inorder visits left subtree, then the node, then the right subtree. Because a BST keeps smaller values left and larger values right, this produces ascending sorted order.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2020,
    is_active: true
  },
  {
    id: "dsa.trees.heap.lesson",
    type: "lesson",
    title: "Heaps and priority queues",
    prompt:
      "A binary heap is a complete binary tree stored in an array where every parent compares ahead of its children: a max-heap keeps the largest value at the root, a min-heap the smallest. This makes reading the top element O(1), while pushing or popping reshuffles the heap in O(log n). In C++ the `std::priority_queue` adapter is a heap, and `std::make_heap`/`push_heap`/`pop_heap` operate on a range directly. Reach for a heap when you repeatedly need the current best element, such as in Dijkstra's algorithm or merging sorted streams.",
    explanation:
      "A heap gives O(1) access to the min or max and O(log n) insert/remove, which is ideal when you keep pulling the best remaining element.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2030,
    is_active: true
  },
  {
    id: "dsa.trees.heap.mc_top_cost",
    type: "multiple_choice",
    title: "Reading the heap top",
    prompt: "What is the time complexity of reading the maximum element from a max-heap?",
    explanation:
      "The largest element is always at the root of a max-heap, so reading it (the `top()` of a priority_queue) is O(1). Removing it costs O(log n) to restore the heap.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2040,
    is_active: true
  },
  {
    id: "dsa.trees.disjoint_set.lesson",
    type: "lesson",
    title: "Disjoint set (union-find)",
    prompt:
      "A disjoint-set (union-find) structure tracks elements partitioned into non-overlapping groups. It supports two operations: `find(x)` returns a representative for x's group, and `union(a, b)` merges the two groups. With path compression and union by rank, both run in near-constant amortized time. Union-find shines for connected-components questions and cycle detection — for example, Kruskal's minimum spanning tree algorithm uses it to reject an edge whose endpoints already share a group.",
    explanation:
      "Union-find answers \"are these two elements in the same group?\" and merges groups in near-constant time, which is why it powers connectivity and cycle-detection problems.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2050,
    is_active: true
  },
  {
    id: "dsa.trees.disjoint_set.mc_use_case",
    type: "multiple_choice",
    title: "When to use union-find",
    prompt: "Which task is union-find (disjoint set) best suited for?",
    explanation:
      "Union-find is built for grouping and connectivity: detecting whether adding an edge connects two already-connected vertices (a cycle), tracking connected components, and merging groups efficiently.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2060,
    is_active: true
  },
  {
    id: "dsa.trees.bst_search.lesson",
    type: "lesson",
    title: "Binary search tree search",
    prompt:
      "A binary search tree keeps an ordering invariant at every node: all keys in the left subtree are smaller, all keys in the right subtree are larger. That lets you search like binary search on a sorted array: compare the target to the current node, go left if smaller or right if larger, and stop when you match or hit null. Each step drops a level, so search, insert, and delete cost O(h) where h is the height. The catch is balance: a BST built from already-sorted inputs degenerates into a linked list with h = n, making operations O(n). Self-balancing trees (`std::map`/`std::set` use red-black trees) keep h ~ O(log n) automatically, which is why you rarely hand-roll a raw BST in production. An inorder traversal of a BST visits keys in sorted order.",
    explanation:
      "A BST keeps smaller keys left, larger right, so search/insert/delete are O(h) by comparing and descending. Unbalanced (e.g. sorted input) degenerates to O(n); std::map/std::set stay balanced at O(log n).",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3690,
    is_active: true
  },
  {
    id: "dsa.trees.bst_search.mc_cost",
    type: "multiple_choice",
    title: "BST search cost",
    prompt: "What is the time complexity of searching a binary search tree of height h?",
    explanation:
      "Each comparison descends one level, so search is O(h). For a balanced tree h is O(log n); for a degenerate (list-like) tree h is n, giving O(n).",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3700,
    is_active: true
  },
  {
    id: "dsa.trees.heap_applications.lesson",
    type: "lesson",
    title: "Heap applications and selection",
    prompt:
      "A heap (`std::priority_queue`) shines whenever you repeatedly need the current best element. **Top-k**: to keep the k largest of a stream, maintain a min-heap of size k — push each element and pop the smallest when the size exceeds k, giving O(n log k) and O(k) space instead of sorting everything. **Scheduling / merging**: a heap keyed by next-available-time or next-smallest-element drives event simulation, Dijkstra, and merging sorted streams. Choose a heap over the alternatives by the operations: if you need the min/max repeatedly but not full ordering, a heap's O(log n) push/pop and O(1) peek beat re-sorting a `std::vector` each time; if you need keys kept fully sorted or range queries, use a `std::map`/`std::set`; if you only sort once and then read, a sorted vector is simplest. The cue is \"repeatedly extract the best.\"",
    explanation:
      "Use a heap when you repeatedly need the best element: top-k with a size-k min-heap (O(n log k)), scheduling/merging, Dijkstra. Prefer it over re-sorting a vector; use map/set for full ordering/range queries.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3710,
    is_active: true
  },
  {
    id: "dsa.trees.heap_applications.mc_topk",
    type: "multiple_choice",
    title: "Top-k with a heap",
    prompt: "To keep the k largest elements of a large stream efficiently, what should you maintain?",
    explanation:
      "A min-heap of size k: push each element and pop the smallest whenever the size exceeds k, so the heap always holds the k largest seen — O(n log k) time and O(k) space, without sorting the whole stream.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3720,
    is_active: true
  },
  {
    id: "dsa.trees.dsu_internals.lesson",
    type: "lesson",
    title: "Union-find internals",
    prompt:
      "Union-find stores each element's parent; the representative of a set is the root you reach by following parents. Two optimizations make it nearly free. **Union by rank/size** always attaches the smaller (or shallower) tree under the larger root, keeping trees shallow instead of letting them grow into chains. **Path compression** points every node visited during a `find` directly at the root, so future finds are flat. Used together, m operations on n elements run in O(m * α(n)), where α is the inverse Ackermann function — effectively a small constant (< 5) for any realistic n, so each operation is \"near-constant amortized.\" Without these, naive union-find can degrade to O(n) per operation. This is what makes union-find the tool of choice for connected components and Kruskal's MST.",
    explanation:
      "Union by rank/size keeps trees shallow; path compression flattens the path to the root on each find. Together they give O(α(n)) ~ near-constant amortized per operation, vs O(n) for naive union-find.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3730,
    is_active: true
  },
  {
    id: "dsa.trees.dsu_internals.mc_compression",
    type: "multiple_choice",
    title: "What path compression does",
    prompt: "What does path compression do during a union-find `find` operation?",
    explanation:
      "It repoints the nodes visited on the way to the root directly at the root, flattening the tree so subsequent finds on those nodes are nearly O(1). Combined with union by rank it yields near-constant amortized cost.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3740,
    is_active: true
  },
  {
    id: "dsa.graphs.representation.lesson",
    type: "lesson",
    title: "Graph representation",
    prompt:
      "A graph is a set of vertices connected by edges. Two common representations trade space for speed. An adjacency list stores, for each vertex, a list of its neighbors — compact at O(V + E) space and ideal for sparse graphs and iterating a vertex's neighbors. An adjacency matrix is a V-by-V grid where cell [i][j] marks an edge from i to j — it uses O(V^2) space but answers \"is there an edge between i and j?\" in O(1), which suits dense graphs. Most competitive and interview graph code uses adjacency lists (for example `vector<vector<int>>`).",
    explanation:
      "Adjacency lists cost O(V + E) and favor sparse graphs and neighbor iteration; adjacency matrices cost O(V^2) but give O(1) edge lookup, favoring dense graphs.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2110,
    is_active: true
  },
  {
    id: "dsa.graphs.representation.mc_sparse",
    type: "multiple_choice",
    title: "Choosing a representation",
    prompt: "Which representation uses the least memory for a large, sparse graph (few edges per vertex)?",
    explanation:
      "An adjacency list stores only the edges that exist, so it uses O(V + E) space. For a sparse graph E is small, making the list far more memory-efficient than an O(V^2) adjacency matrix.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2120,
    is_active: true
  },
  {
    id: "dsa.graphs.bfs.lesson",
    type: "lesson",
    title: "Breadth-first search",
    prompt:
      "Breadth-first search explores a graph in expanding rings: it visits the start vertex, then all neighbors at distance 1, then distance 2, and so on. It uses a FIFO queue and a visited set to avoid revisiting nodes. Because BFS reaches nodes in nondecreasing distance order, it finds the shortest path (fewest edges) in an unweighted graph. The whole traversal runs in O(V + E) time with an adjacency list.",
    explanation:
      "BFS visits vertices in order of distance from the start using a queue, so it finds shortest paths by edge count in unweighted graphs in O(V + E).",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2130,
    is_active: true
  },
  {
    id: "dsa.graphs.bfs.mc_shortest",
    type: "multiple_choice",
    title: "What BFS finds",
    prompt: "In an unweighted graph, what does BFS from a source vertex give you?",
    explanation:
      "BFS expands by distance, so the first time it reaches a vertex is along a path with the fewest edges — the shortest path in an unweighted graph.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2140,
    is_active: true
  },
  {
    id: "dsa.graphs.dfs.lesson",
    type: "lesson",
    title: "Depth-first search",
    prompt:
      "Depth-first search follows one path as far as it can, then backtracks to the most recent vertex with unexplored neighbors. It is naturally written with recursion (the call stack does the bookkeeping) or with an explicit stack, plus a visited set. DFS runs in O(V + E) and underpins reachability, connected-component counting, cycle detection, and topological sorting of a DAG. Unlike BFS, DFS does not generally find shortest paths.",
    explanation:
      "DFS dives deep then backtracks (via recursion or a stack); it powers reachability, cycle detection, and topological sort, but does not find shortest paths in general.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2150,
    is_active: true
  },
  {
    id: "dsa.graphs.dfs.mc_structure",
    type: "multiple_choice",
    title: "How DFS is implemented",
    prompt: "Which data structure naturally backs a depth-first search?",
    explanation:
      "DFS explores the most recently discovered vertex first, which is LIFO behavior — a stack. Recursion uses the call stack implicitly; an iterative DFS uses an explicit stack.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2160,
    is_active: true
  },
  {
    id: "dsa.graphs.shortest_path.lesson",
    type: "lesson",
    title: "Shortest paths",
    prompt:
      "The right shortest-path algorithm depends on the edge weights. On an unweighted graph, plain BFS gives shortest paths in O(V + E). With non-negative weights, Dijkstra's algorithm uses a min-priority queue to always expand the closest unsettled vertex, running in O((V + E) log V). When edges can be negative, Dijkstra breaks and Bellman-Ford applies, relaxing every edge V-1 times in O(V * E) and also detecting negative cycles. Matching the algorithm to the weight model is the key decision.",
    explanation:
      "Use BFS for unweighted graphs, Dijkstra for non-negative weights, and Bellman-Ford when negative edges are possible (it also detects negative cycles).",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 2170,
    is_active: true
  },
  {
    id: "dsa.graphs.shortest_path.mc_dijkstra",
    type: "multiple_choice",
    title: "When Dijkstra fails",
    prompt: "Why can Dijkstra's algorithm give wrong answers when a graph has negative edge weights?",
    explanation:
      "Dijkstra finalizes a vertex's distance once it is popped as the closest unsettled node, assuming no later path can be shorter. A negative edge can make a later path shorter, violating that assumption — so Bellman-Ford is used instead.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2180,
    is_active: true
  },
  {
    id: "dsa.graphs.connected_components.lesson",
    type: "lesson",
    title: "Connected components",
    prompt:
      "A connected component is a maximal set of vertices reachable from one another. To label all components, keep a `visited` array and loop over every vertex: each time you find an unvisited one, run a BFS or DFS from it, marking everything it reaches as the next component id. That is O(V + E) total because each vertex and edge is touched once. A grid is an *implicit* graph — treat each cell as a vertex with edges to its 4 (or 8) neighbors — so counting islands, flood fill, and region problems are just connected-components in disguise; you don't build an explicit adjacency list, you compute neighbors from `(row, col)`. The count of BFS/DFS launches is the number of components.",
    explanation:
      "Components = maximal mutually-reachable vertex sets. Loop all vertices; from each unvisited one run BFS/DFS marking its component — O(V + E). A grid is an implicit graph (cells = vertices, neighbors = edges), so island/flood-fill is connected-components.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3750,
    is_active: true
  },
  {
    id: "dsa.graphs.connected_components.mc_count",
    type: "multiple_choice",
    title: "Counting components",
    prompt: "How do you count the connected components of a graph with BFS/DFS?",
    explanation:
      "Loop over all vertices; each time you start a BFS/DFS from an unvisited vertex you have found a new component, so the number of launches equals the component count.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 3760,
    is_active: true
  },
  {
    id: "dsa.graphs.cycle_detection.lesson",
    type: "lesson",
    title: "Cycle detection",
    prompt:
      "Detecting a cycle depends on whether the graph is directed. In a **directed** graph, run DFS with three colors: white (unvisited), gray (on the current recursion stack), black (finished). If DFS reaches a gray node, you found a back edge — a cycle. (A directed graph with no cycle is a DAG, which is exactly what makes topological sort possible.) In an **undirected** graph, a cycle shows up during DFS as an edge to an already-visited vertex that is not the immediate parent; equivalently, process edges with **union-find** and a cycle exists the moment an edge connects two vertices already in the same set. Watch the undirected subtlety: the edge back to your parent is not a cycle, so track and skip the parent.",
    explanation:
      "Directed: DFS 3-color — an edge to a gray (on-stack) node is a back edge = cycle (no cycle ⇒ DAG). Undirected: an edge to a visited non-parent vertex, or a union-find edge within one set, signals a cycle.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3770,
    is_active: true
  },
  {
    id: "dsa.graphs.cycle_detection.mc_directed",
    type: "multiple_choice",
    title: "Cycle in a directed graph",
    prompt: "Using DFS with white/gray/black coloring on a directed graph, which edge indicates a cycle?",
    explanation:
      "An edge to a gray vertex — one still on the current recursion stack — is a back edge and proves a cycle. Edges to black (finished) vertices are cross/forward edges and do not.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3780,
    is_active: true
  },
  {
    id: "dsa.graphs.topological_sort.lesson",
    type: "lesson",
    title: "Topological sort and DAGs",
    prompt:
      "A topological sort linearly orders the vertices of a **directed acyclic graph (DAG)** so that for every edge u→v, u comes before v — exactly what you need to schedule tasks with dependencies, order build targets, or resolve prerequisites. Two standard methods: **Kahn's algorithm** repeatedly removes a vertex with in-degree 0 and decrements its neighbors' in-degrees (BFS-style), and **DFS** pushes each vertex onto a stack as it finishes, then reverses it. Both run in O(V + E). A topological order exists **iff** the graph is acyclic: if a cycle is present, no valid ordering exists — Kahn's leaves vertices with nonzero in-degree, and DFS finds a back edge. So topological sort and directed-cycle detection are two sides of the same coin.",
    explanation:
      "A topological sort orders a DAG so every edge points forward (Kahn's in-degree BFS, or reverse DFS-finish order), in O(V + E). It exists iff the graph is acyclic; a cycle makes it impossible.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3790,
    is_active: true
  },
  {
    id: "dsa.graphs.topological_sort.mc_exists",
    type: "multiple_choice",
    title: "When a topological order exists",
    prompt: "A directed graph has a valid topological ordering exactly when it is...?",
    explanation:
      "...acyclic (a DAG). If the graph contains a directed cycle, the mutual dependency makes any linear ordering impossible, so no topological sort exists.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3800,
    is_active: true
  },
  {
    id: "dsa.techniques.prefix_sums.lesson",
    type: "lesson",
    title: "Prefix sums",
    prompt:
      "A prefix-sum array stores the running total of a sequence: `prefix[i]` is the sum of the first i elements, with `prefix[0] = 0`. Building it takes one O(n) pass. Once built, the sum of any subarray from index l to r (inclusive) is `prefix[r + 1] - prefix[l]` in O(1) — no re-scanning. This turns many repeated range-sum queries from O(n) each into O(1) each after O(n) preprocessing. The same idea extends to 2D grids and to difference arrays for range updates.",
    explanation:
      "Precomputing cumulative sums lets each range-sum query be answered as a subtraction of two prefix values in O(1), after an O(n) build.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2210,
    is_active: true
  },
  {
    id: "dsa.techniques.prefix_sums.mc_query",
    type: "multiple_choice",
    title: "Range-sum query cost",
    prompt: "After building a prefix-sum array, what is the cost of answering one subarray-sum query?",
    explanation:
      "The subarray sum equals prefix[r + 1] - prefix[l], a single subtraction, so each query is O(1) once the prefix array is built.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2220,
    is_active: true
  },
  {
    id: "dsa.techniques.sliding_window.lesson",
    type: "lesson",
    title: "Sliding window",
    prompt:
      "A sliding window keeps two indices that bound a contiguous range of a sequence. As the right edge advances to include new elements, the left edge advances to drop elements that violate a constraint (a fixed length, a sum limit, or a uniqueness rule). Because each element enters and leaves the window at most once, the whole scan is O(n) instead of the O(n^2) you'd get from re-examining every subarray. It is the go-to pattern for \"longest/shortest subarray that satisfies X\" problems.",
    explanation:
      "A sliding window advances two pointers so each element is added and removed at most once, scanning all relevant subarrays in O(n).",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2230,
    is_active: true
  },
  {
    id: "dsa.techniques.sliding_window.mc_complexity",
    type: "multiple_choice",
    title: "Why the window is fast",
    prompt: "What makes the sliding-window technique run in O(n) rather than O(n^2)?",
    explanation:
      "Each element is added to the window once (when the right pointer passes it) and removed at most once (when the left pointer passes it), so total work is linear.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2240,
    is_active: true
  },
  {
    id: "dsa.techniques.greedy.lesson",
    type: "lesson",
    title: "Greedy algorithms",
    prompt:
      "A greedy algorithm builds a solution by always taking the choice that looks best right now, never reconsidering. It is fast and simple, but only correct when the problem has the greedy-choice property — a locally optimal choice leads to a globally optimal solution — usually backed by an exchange argument. Activity selection (always pick the next-finishing compatible interval) and Huffman coding are classic greedy wins. But for problems like the 0/1 knapsack, greedy fails and you need dynamic programming. Always justify why the greedy choice is safe before trusting it.",
    explanation:
      "Greedy takes the best immediate choice and never backtracks; it is correct only when a locally optimal choice provably leads to a global optimum.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2250,
    is_active: true
  },
  {
    id: "dsa.techniques.greedy.mc_fails",
    type: "multiple_choice",
    title: "When greedy is wrong",
    prompt: "For which problem does a greedy strategy generally fail to give the optimal answer?",
    explanation:
      "The 0/1 knapsack (each item taken whole or not at all) is not solved optimally by greedy; it needs dynamic programming. The fractional knapsack, by contrast, is solvable greedily.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2260,
    is_active: true
  },
  {
    id: "dsa.techniques.dynamic_programming.lesson",
    type: "lesson",
    title: "Dynamic programming",
    prompt:
      "Dynamic programming solves a problem by combining solutions to overlapping subproblems, computing each subproblem once and reusing the result. It applies when a problem has optimal substructure (an optimal solution is built from optimal solutions to subproblems) and overlapping subproblems (the same subproblem recurs). Two styles: top-down memoization caches recursive results; bottom-up tabulation fills a table in dependency order. For example, naive Fibonacci is exponential, but memoizing it makes it O(n). Many DP problems then optimize space by keeping only the rows the recurrence depends on.",
    explanation:
      "DP applies when there is optimal substructure and overlapping subproblems; caching each subproblem once (memoization or tabulation) avoids exponential recomputation.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 2270,
    is_active: true
  },
  {
    id: "dsa.techniques.dynamic_programming.mc_when",
    type: "multiple_choice",
    title: "When DP applies",
    prompt: "Which pair of properties signals that dynamic programming is the right approach?",
    explanation:
      "DP is the right tool when a problem has both optimal substructure (optimal solutions built from optimal subproblem solutions) and overlapping subproblems (the same subproblems recur and can be cached).",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2280,
    is_active: true
  },
  {
    id: "dsa.techniques.range_structures.lesson",
    type: "lesson",
    title: "Range query structures",
    prompt:
      "Pick the range-query structure by whether the data changes. If the array is **static** (no updates between queries), a precomputed **prefix-sum** array answers range sums in O(1) after O(n) build — nothing beats it. If values **update** between queries, a prefix sum would need an O(n) rebuild each time, so use a **Fenwick (binary indexed) tree**: O(log n) point update and O(log n) prefix query, compact and simple, ideal for sums. For more general range operations (range min/max, range assignment, lazy range updates) use a **segment tree**: O(log n) per query/update with O(n) space, more flexible but more code. A **sparse table** is an enrichment for *idempotent*, immutable queries like range-min: O(n log n) build, O(1) query, but no updates. The decision rule: static → prefix sum (or sparse table for min/max); dynamic → Fenwick for sums, segment tree for general/lazy operations.",
    explanation:
      "Static data: prefix sums (O(1) query after O(n) build); sparse table for immutable range-min (O(1)). With updates: Fenwick tree for sums (O(log n) update/query), segment tree for general/lazy range ops.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 3810,
    is_active: true
  },
  {
    id: "dsa.techniques.range_structures.mc_dynamic",
    type: "multiple_choice",
    title: "Choosing for dynamic range sums",
    prompt: "You need range-sum queries on an array whose values are frequently updated between queries. Which structure fits best?",
    explanation:
      "A Fenwick (binary indexed) tree gives O(log n) point updates and O(log n) prefix/range-sum queries. A plain prefix-sum array would need an O(n) rebuild after each update.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3820,
    is_active: true
  },
  {
    id: "dsa.techniques.greedy_proof.lesson",
    type: "lesson",
    title: "Greedy proofs and counterexamples",
    prompt:
      "A greedy algorithm is only correct if the locally optimal choice provably leads to a global optimum — so you must justify it, not just trust it. The standard tool is an **exchange argument**: assume an optimal solution differs from the greedy one, then show you can swap in the greedy choice without making the solution worse, proving greedy is at least as good. Classic wins: **interval scheduling** (pick the interval that finishes earliest to leave the most room) and Huffman coding, often after **sorting** the input to expose the greedy order. Equally important is recognizing when greedy *fails*: the 0/1 knapsack defeats \"take the highest value-per-weight first,\" and \"largest coin first\" makes change incorrectly for coin systems like {1, 3, 4} (greedy gives 6 = 4+1+1 but 3+3 is better). When you can't find an exchange argument and a small counterexample exists, switch to dynamic programming.",
    explanation:
      "Prove greedy with an exchange argument (swapping in the greedy choice never worsens an optimal solution); sorting often sets up the greedy order. If a small counterexample exists (0/1 knapsack, coins {1,3,4} for 6), use DP instead.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 3830,
    is_active: true
  },
  {
    id: "dsa.techniques.greedy_proof.mc_exchange",
    type: "multiple_choice",
    title: "Justifying a greedy algorithm",
    prompt: "What is the standard way to prove a greedy choice yields a globally optimal solution?",
    explanation:
      "An exchange argument: assume an optimal solution and show you can swap in the greedy choice without making it worse, so greedy is at least as good. Testing a few inputs is not a proof.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3840,
    is_active: true
  },
  {
    id: "dsa.techniques.dp_design.lesson",
    type: "lesson",
    title: "Designing a DP",
    prompt:
      "Designing a DP is mostly about naming things precisely. Define the **state** (what a subproblem is, e.g. `dp[i]` = longest increasing subsequence ending at i), the **transition** (how a state is computed from smaller ones), the **base case(s)**, and the **evaluation order** so every state's dependencies are ready before it. With that, you can implement it two equivalent ways: **top-down memoization** writes the recurrence naturally and caches results (easy to derive, recursion overhead), or **bottom-up tabulation** fills a table in dependency order (no recursion, easy to space-optimize). Get correctness first; only then apply **space optimization** (e.g. keep just the previous row of a grid DP) — optimizing a wrong recurrence wastes effort. To recover the actual solution (not just its value), store choices or backtrack through the table. Classic forms to recognize: 1-D (Fibonacci, climbing stairs, LIS), grid DP, and knapsack.",
    explanation:
      "A DP = state + transition + base case + evaluation order. Implement via memoization (top-down) or tabulation (bottom-up). Establish correctness before space optimization; store choices to reconstruct the solution.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 3850,
    is_active: true
  },
  {
    id: "dsa.techniques.dp_design.mc_order",
    type: "multiple_choice",
    title: "When to optimize DP space",
    prompt: "When should you apply space optimization (e.g. keeping only the previous row) to a DP?",
    explanation:
      "Only after the recurrence is correct. Space optimization rewrites a working DP to use less memory; doing it before correctness just makes a wrong solution harder to debug.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3860,
    is_active: true
  },
  {
    id: "dsa.strings.manipulation.lesson",
    type: "lesson",
    title: "String manipulation",
    prompt:
      "A C++ `std::string` is a growable array of characters with size, `operator[]`, `substr`, `append`, and `+=`. The key performance trap is building a long string with repeated `result = result + piece` inside a loop: each `+` may allocate and copy the whole accumulated string, giving O(n^2) total work. Prefer `+=` (append in place) or reserve capacity up front. Use `substr(pos, len)` to slice and remember it returns a new string (a copy). For read-only views that avoid copies, `std::string_view` refers to existing characters without owning them.",
    explanation:
      "Repeated `s = s + piece` is O(n^2) because each concatenation copies the whole string; append in place with `+=` (or reserve) for linear cost.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2310,
    is_active: true
  },
  {
    id: "dsa.strings.manipulation.mc_concat",
    type: "multiple_choice",
    title: "Concatenation cost",
    prompt: "Why can building a long string with `result = result + piece` inside a loop be O(n^2)?",
    explanation:
      "Each `result + piece` builds a brand-new string by copying all characters accumulated so far, so over n iterations the copying work grows quadratically. Appending in place with `+=` avoids the repeated full copies.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2320,
    is_active: true
  },
  {
    id: "dsa.strings.searching.lesson",
    type: "lesson",
    title: "Substring search",
    prompt:
      "Finding a pattern of length m inside text of length n can be done naively by trying every start position and comparing characters, which is O(n*m) in the worst case (think \"aaaa...a\" searched for \"aaab\"). The Knuth-Morris-Pratt (KMP) algorithm precomputes a failure table from the pattern so that after a mismatch it never re-examines already-matched text characters, giving O(n + m) time. For most everyday cases `std::string::find` is fine; KMP matters when the text is huge or worst-case inputs are adversarial.",
    explanation:
      "Naive substring search is O(n*m) worst case; KMP uses a precomputed failure table to avoid re-scanning matched characters and runs in O(n + m).",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 2330,
    is_active: true
  },
  {
    id: "dsa.strings.searching.mc_kmp",
    type: "multiple_choice",
    title: "KMP complexity",
    prompt: "What is the time complexity of KMP substring search on text length n and pattern length m?",
    explanation:
      "KMP precomputes a failure table in O(m) and scans the text once without backtracking, so the total is O(n + m) — better than naive O(n*m) on adversarial inputs.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2340,
    is_active: true
  },
  {
    id: "dsa.strings.palindrome.lesson",
    type: "lesson",
    title: "Palindromes and anagrams",
    prompt:
      "To check whether a string is a palindrome, put one pointer at the start and one at the end, compare the characters, and step both inward until they meet — O(n) time and O(1) extra space. To check whether two strings are anagrams (same letters, any order), count the frequency of each character in both and compare the counts (an array of 26 for lowercase letters, or a hash map for arbitrary characters), also O(n). Both problems are about structure of characters rather than order of comparison, so counting and two pointers beat sorting.",
    explanation:
      "Palindrome checks use two pointers moving inward (O(n), O(1) space); anagram checks compare per-character frequency counts (O(n)).",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2350,
    is_active: true
  },
  {
    id: "dsa.strings.palindrome.mc_anagram",
    type: "multiple_choice",
    title: "Detecting an anagram",
    prompt: "What is an O(n) way to decide whether two strings are anagrams of each other?",
    explanation:
      "Count how many times each character appears in each string and compare the counts. If every character's count matches, the strings are anagrams — this is O(n), faster than sorting both strings.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2360,
    is_active: true
  },
  {
    id: "dsa.strings.parsing.lesson",
    type: "lesson",
    title: "Tokenizing and parsing",
    prompt:
      "Parsing turns raw text into meaningful pieces. The simplest step is tokenizing: splitting a line into tokens on a delimiter. In C++ you can feed a line into a `std::istringstream` and read tokens with `>>` (whitespace-separated) or use `std::getline(stream, token, ',')` to split on a custom delimiter such as a comma. Reading numbers with `>>` into an `int` or `double` does the conversion for you. Watch the edge cases: empty fields, trailing delimiters, and leading/trailing whitespace all change how many tokens you get.",
    explanation:
      "Tokenize by streaming a line through `istringstream` and extracting with `>>` or `getline(.., delim)`; mind empty fields and trailing delimiters.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2370,
    is_active: true
  },
  {
    id: "dsa.strings.parsing.mc_delim",
    type: "multiple_choice",
    title: "Splitting on a delimiter",
    prompt: "Which standard tool splits a string into fields on a custom delimiter such as a comma?",
    explanation:
      "`std::getline(stream, token, ',')` reads up to each comma, making it the idiomatic way to split a line into comma-separated fields. Plain `>>` only splits on whitespace.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2380,
    is_active: true
  },
  {
    id: "dsa.strings.prefix_function.lesson",
    type: "lesson",
    title: "Prefix function and the KMP table",
    prompt:
      "The prefix function of a string is the engine behind KMP. For each position i, pi[i] is the length of the longest proper prefix of the substring s[0..i] that is also a suffix of it — \"proper\" meaning it is not the whole substring. For the pattern \"ABABC\" the table is [0, 0, 1, 2, 0]: at \"ABAB\" the prefix \"AB\" reappears as the suffix, so pi = 2; the final C breaks the match, resetting to 0. You build it in O(m) by extending the previous longest match and, on a mismatch, falling back to pi[k-1] instead of starting over. KMP then scans the text once: when a character mismatches after matching k pattern characters, it jumps the pattern forward using pi[k-1] rather than rewinding the text pointer, giving O(n + m) total. The intuition to remember: the prefix function tells you how much of the pattern you have already effectively matched, so you never re-examine text you have already cleared.",
    explanation:
      "pi[i] = length of the longest proper prefix of s[0..i] that is also a suffix. KMP uses it to skip back to pi[k-1] on a mismatch instead of rescanning the text, giving O(n + m) search.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 3930,
    is_active: true
  },
  {
    id: "dsa.strings.prefix_function.mc_value",
    type: "multiple_choice",
    title: "Reading a prefix-function value",
    prompt: "In the prefix function (KMP failure table), what does the value pi[i] represent for the substring s[0..i]?",
    explanation:
      "pi[i] is the length of the longest proper prefix of s[0..i] that is also a suffix of it. KMP uses this length to decide how far to shift the pattern after a mismatch.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3940,
    is_active: true
  },
  {
    id: "dsa.strings.trie.lesson",
    type: "lesson",
    title: "Tries (prefix trees)",
    prompt:
      "A trie stores a set of strings as a tree of characters: the root is empty, each edge is one character, and each path from the root spells a prefix shared by every word below it. A node flagged as end-of-word marks a complete string. Insert and lookup of a word of length L take O(L), independent of how many words the trie holds, and — unlike a hash set — a trie answers prefix questions directly: \"how many words start with 'pre'?\" or \"give me all completions of this prefix\" just walk to the prefix node and explore its subtree. That makes tries the natural structure for autocomplete, dictionary/spell-check, and longest-prefix routing. The tradeoff is memory: every node carries child pointers (up to the alphabet size), so for sparse or few keys a hash map is lighter; choose a trie when prefix queries or ordered traversal matter, a hash map when you only need exact-key membership.",
    explanation:
      "A trie stores strings by shared character prefixes; insert/lookup is O(L) and prefix/autocomplete queries are direct. It costs more memory than a hash map, so prefer it when prefix queries (not just exact membership) matter.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 3950,
    is_active: true
  },
  {
    id: "dsa.strings.trie.mc_usecase",
    type: "multiple_choice",
    title: "When a trie beats a hash map",
    prompt: "For which task does a trie have a clear advantage over a hash set of the same strings?",
    explanation:
      "A trie answers prefix queries (autocomplete: all words starting with a given prefix) by walking to the prefix node and exploring its subtree. A hash set only supports exact-key membership, not prefix enumeration.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3960,
    is_active: true
  },
  {
    id: "dsa.strings.hashing.lesson",
    type: "lesson",
    title: "String hashing and rolling hash",
    prompt:
      "A polynomial string hash maps a string to a number: treat the characters as digits in base b and compute the value modulo a large prime m, e.g. hash = (s[0]*b^(k-1) + s[1]*b^(k-2) + ... + s[k-1]) mod m. The payoff is a rolling hash: once you have the hash of one window of length k, you get the next window in O(1) by removing the leading character's contribution, multiplying by b, and adding the new trailing character. This powers Rabin-Karp substring search and lets you compare two substrings for equality in O(1) after O(n) preprocessing. The catch is collisions: two different strings can share a hash, so a hash match is only probable equality, not proof. Safeguards are essential — verify a candidate match character-by-character, or use double hashing (two independent moduli) to make a false positive astronomically unlikely. Treat single-hash equality as a fast filter, never as the final answer when correctness matters.",
    explanation:
      "A polynomial rolling hash compares substrings in O(1) after O(n) setup (Rabin-Karp). Hashes can collide, so a match is only probable equality — verify directly or use double hashing.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 3970,
    is_active: true
  },
  {
    id: "dsa.strings.hashing.mc_collision",
    type: "multiple_choice",
    title: "Trusting a hash match",
    prompt: "Two substrings have the same rolling-hash value. What can you correctly conclude?",
    explanation:
      "Equal hashes mean the substrings are *probably* equal, not certainly — different strings can collide to the same hash. Confirm by comparing characters directly, or reduce the risk with double hashing.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3980,
    is_active: true
  },
  {
    id: "cpp.oop.composition.lesson",
    type: "lesson",
    title: "Composition",
    prompt:
      "Composition models a \"has-a\" relationship: a class owns other objects as data members and delegates work to them. A `Car` has-an `Engine` and has-a set of `Wheel`s; a `Logger` member gives a class logging without the class being a logger. Composition is the default reuse mechanism in modern C++ because it keeps coupling loose — you depend on a member's public interface, not its internals — and it sidesteps the fragility of deep inheritance hierarchies. The guideline \"prefer composition over inheritance\" means: reach for a member first, and only inherit when there is a genuine is-a relationship plus a need for polymorphism.",
    explanation:
      "Composition is a has-a relationship: hold other objects as members and delegate to them. Prefer it over inheritance for reuse because coupling stays loose.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2410,
    is_active: true
  },
  {
    id: "cpp.oop.composition.mc_relationship",
    type: "multiple_choice",
    title: "Composition vs inheritance",
    prompt: "Which relationship is best modeled by composition (holding an object as a member)?",
    explanation:
      "Composition expresses \"has-a\": a Car has-an Engine. \"Is-a\" relationships (a Car is-a Vehicle) are what inheritance models. Prefer composition unless you genuinely need an is-a relationship with polymorphism.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2420,
    is_active: true
  },
  {
    id: "cpp.oop.inheritance.lesson",
    type: "lesson",
    title: "Inheritance",
    prompt:
      "Inheritance models an \"is-a\" relationship: a derived class extends a base class, inheriting its public and protected members. Writing `class Dog : public Animal { ... }` means a `Dog` is-an `Animal` and can be used wherever an `Animal` is expected. The derived class adds its own members and can reuse base behavior. Use public inheritance only when the derived type truly is a kind of the base and honors the base's contract (the Liskov substitution principle). Private/protected inheritance exists but is rare; when you only want to reuse code, composition is usually the better tool.",
    explanation:
      "Public inheritance models is-a: a derived class extends a base and can stand in for it. Use it only when the derived type genuinely is a kind of the base.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2430,
    is_active: true
  },
  {
    id: "cpp.oop.inheritance.mc_access",
    type: "multiple_choice",
    title: "What a derived class inherits",
    prompt: "With `class Dog : public Animal`, which members of Animal can Dog's own methods access directly?",
    explanation:
      "A derived class can access the public and protected members of its base, but not the base's private members. Private members remain encapsulated within the base class.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2440,
    is_active: true
  },
  {
    id: "cpp.oop.virtual_polymorphism.lesson",
    type: "lesson",
    title: "Virtual functions and polymorphism",
    prompt:
      "Runtime polymorphism lets a call through a base pointer or reference run the derived class's version of a function. Declare the function `virtual` in the base; the override runs based on the object's actual type, resolved at run time via the vtable. This is what makes `Animal* a = new Dog(); a->speak();` print the dog's sound. One rule is non-negotiable: a base class meant to be deleted through a base pointer must have a `virtual` destructor, otherwise `delete a;` only runs the base destructor and leaks the derived part. Mark overrides with `override` so the compiler catches signature mistakes.",
    explanation:
      "A `virtual` function dispatches on the object's real type at run time. A polymorphic base class needs a virtual destructor, or deleting through a base pointer leaks the derived part.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 2450,
    is_active: true
  },
  {
    id: "cpp.oop.virtual_polymorphism.mc_destructor",
    type: "multiple_choice",
    title: "Why a virtual destructor",
    prompt: "Why must a base class deleted through a base-class pointer have a virtual destructor?",
    explanation:
      "Without a virtual destructor, `delete basePtr;` runs only the base destructor, skipping the derived destructor — leaking the derived part's resources. A virtual destructor ensures the full chain runs.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2460,
    is_active: true
  },
  {
    id: "cpp.oop.abstract_interfaces.lesson",
    type: "lesson",
    title: "Abstract classes and interfaces",
    prompt:
      "A pure virtual function — declared `virtual void draw() = 0;` — has no implementation in the base and makes the class abstract: you cannot instantiate it directly. A class made entirely of pure virtual functions (plus a virtual destructor) acts as an interface: it specifies what derived classes must do without saying how. Concrete derived classes must override every pure virtual function before they can be instantiated. Interfaces let code depend on an abstraction — `void render(Shape& s) { s.draw(); }` works for any shape — which is the backbone of dependency inversion and testable, swappable designs.",
    explanation:
      "A pure virtual function (`= 0`) makes a class abstract and can't be instantiated; a class of only pure virtuals is an interface that derived classes must fully implement.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2470,
    is_active: true
  },
  {
    id: "cpp.oop.abstract_interfaces.mc_pure_virtual",
    type: "multiple_choice",
    title: "Effect of a pure virtual function",
    prompt: "What does declaring `virtual void draw() = 0;` in a class do?",
    explanation:
      "The `= 0` makes draw a pure virtual function, which makes the class abstract: it cannot be instantiated, and any concrete derived class must override draw.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2480,
    is_active: true
  },
  {
    id: "cpp.oop.slicing.lesson",
    type: "lesson",
    title: "Object slicing and upcasting",
    prompt:
      "When you copy a derived object into a base-class *value*, C++ keeps only the base part and discards everything the derived class added — this is object slicing. `Base b = derived;` (or passing `Base b` by value, or `std::vector<Base>`) slices: the derived overrides and extra members are gone, and virtual dispatch reverts to the base version. The fix is to handle polymorphic objects through references or pointers: `Base& r = derived;` or `Base* p = &derived;` keep the full object and dispatch virtually. Upcasting — treating a `Derived` as a `Base&`/`Base*` — is safe and implicit, because every Derived *is* a Base. So the rule is: pass and store polymorphic objects by reference or pointer (`Base&`, `Base*`, smart pointers), never by base value.",
    explanation:
      "Copying a derived object into a base value slices off the derived part and loses virtual dispatch. Use Base&/Base* (upcasting is safe) to keep the whole object and polymorphic behavior.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2490,
    is_active: true
  },
  {
    id: "cpp.oop.slicing.mc_slice",
    type: "multiple_choice",
    title: "What object slicing does",
    prompt: "You have `Derived d;` and write `Base b = d;`. What happens to the derived-specific parts of `d`?",
    explanation:
      "Assigning a derived object to a base *value* copies only the base sub-object — the derived members and overrides are sliced off, so b behaves as a plain Base. Use a Base& or Base* to preserve the full object.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2500,
    is_active: true
  },
  {
    id: "cpp.oop.override_final.lesson",
    type: "lesson",
    title: "override and final",
    prompt:
      "Writing `override` on a derived function — `void draw() override;` — tells the compiler you intend to override a base virtual function. If the signature does not exactly match a base virtual (a typo, a wrong parameter type, a missing `const`), the compiler errors instead of silently creating a brand-new, unrelated function that never gets called. Without `override`, such mistakes compile and fail mysteriously at runtime, so mark every override. `final` does the opposite: `void draw() final;` stops any further class from overriding this function, and `class Widget final { ... };` stops any class from deriving from Widget. Use `final` to seal a hierarchy where further specialization would be wrong, and to let the compiler devirtualize calls.",
    explanation:
      "override makes the compiler verify the function really overrides a base virtual (catching signature typos); final seals a virtual function or class against further overriding/derivation.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2510,
    is_active: true
  },
  {
    id: "cpp.oop.override_final.mc_override",
    type: "multiple_choice",
    title: "What override catches",
    prompt: "What does adding `override` to a derived class member function let the compiler do?",
    explanation:
      "override makes the compiler check that the function actually overrides a base virtual with a matching signature; if it does not (e.g. a typo or wrong const), it errors instead of silently creating a new function that is never called.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2520,
    is_active: true
  },
  {
    id: "cpp.oop.polymorphic_ownership.lesson",
    type: "lesson",
    title: "Owning polymorphic objects",
    prompt:
      "To own a polymorphic object whose concrete type is chosen at runtime, store it in a `std::unique_ptr<Base>`: `std::unique_ptr<Shape> s = std::make_unique<Circle>(r);`. This keeps the full derived object on the heap, dispatches virtually through the base pointer, and frees it automatically — but only correctly if `Base` has a `virtual` destructor, otherwise `delete` through the base pointer skips the derived destructor and leaks. Use `std::vector<std::unique_ptr<Base>>` for heterogeneous collections, and `std::unique_ptr<Base>` as a factory return type. Code that merely *uses* a polymorphic object should not own it: take a non-owning `Base&` (or `Base*` if it can be null) parameter, e.g. `void render(const Shape& s)`. Reserve `shared_ptr<Base>` for genuinely shared ownership.",
    explanation:
      "Own polymorphic objects via unique_ptr<Base> (requires a virtual destructor) — good for factories and heterogeneous vectors. Functions that only use the object should take a non-owning Base&/Base*.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2530,
    is_active: true
  },
  {
    id: "cpp.oop.polymorphic_ownership.mc_unique",
    type: "multiple_choice",
    title: "Owning a runtime-chosen type",
    prompt: "A factory returns an object whose concrete derived type is decided at runtime, and the caller should own it. What return type fits best?",
    explanation:
      "std::unique_ptr<Base> transfers sole ownership of the heap-allocated derived object, dispatches virtually, and frees it automatically (with a virtual destructor on Base). Returning Base by value would slice it.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2540,
    is_active: true
  },
  {
    id: "cpp.concurrency.threads.lesson",
    type: "lesson",
    title: "Threads",
    prompt:
      "A thread runs a function concurrently with the rest of the program. `std::thread t(work);` starts `work` immediately on a new thread; `t.join()` blocks until that thread finishes. Every `std::thread` must be either joined or detached before it is destroyed — otherwise its destructor calls `std::terminate` and the program aborts. `detach()` lets the thread run independently, but then you can no longer wait for it, so joining is the safe default. Threads let you overlap I/O or use multiple cores, but any data shared between threads now needs careful synchronization.",
    explanation:
      "A std::thread must be joined or detached before destruction or the program terminates; join() waits for the thread to finish.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2510,
    is_active: true
  },
  {
    id: "cpp.concurrency.threads.mc_join",
    type: "multiple_choice",
    title: "Joining a thread",
    prompt: "What happens if a joinable std::thread is destroyed without being joined or detached?",
    explanation:
      "Destroying a still-joinable std::thread calls std::terminate, aborting the program. You must join() (wait for it) or detach() (let it run free) before the thread object goes out of scope.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2520,
    is_active: true
  },
  {
    id: "cpp.concurrency.data_races.lesson",
    type: "lesson",
    title: "Data races",
    prompt:
      "A data race occurs when two or more threads access the same memory location concurrently, at least one of them writes, and there is no synchronization ordering the accesses. In C++ a data race is undefined behavior — the program may produce wrong results, crash, or appear to work until it doesn't. Even a simple `counter++` is a read-modify-write that can interleave badly across threads, losing increments. The fix is to establish a happens-before ordering: protect the shared data with a mutex, or use `std::atomic` for simple values. Read-only sharing (no writers) is safe without synchronization.",
    explanation:
      "A data race is concurrent access to the same memory with at least one writer and no synchronization — undefined behavior in C++. Guard shared mutable data with a mutex or atomic.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2530,
    is_active: true
  },
  {
    id: "cpp.concurrency.data_races.mc_define",
    type: "multiple_choice",
    title: "What is a data race",
    prompt: "Which situation is a data race?",
    explanation:
      "A data race needs concurrent access to the same location with at least one writer and no synchronization. Multiple threads only reading shared data is not a race; writes guarded by a mutex are not a race either.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2540,
    is_active: true
  },
  {
    id: "cpp.concurrency.mutexes.lesson",
    type: "lesson",
    title: "Mutexes and locks",
    prompt:
      "A `std::mutex` enforces mutual exclusion: only one thread can hold it at a time, so the code between locking and unlocking — the critical section — runs without interference. Rather than calling `lock()`/`unlock()` by hand (and risking a leak if an exception is thrown in between), wrap it in an RAII guard: `std::lock_guard<std::mutex> guard(m);` locks on construction and unlocks when the guard goes out of scope. `std::unique_lock` is a more flexible variant that can defer locking or be unlocked early. Keep critical sections short, and always acquire multiple mutexes in a consistent order to avoid deadlock.",
    explanation:
      "A mutex serializes access to shared data; std::lock_guard locks it via RAII and releases it automatically, even if an exception is thrown.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 2550,
    is_active: true
  },
  {
    id: "cpp.concurrency.mutexes.mc_lock_guard",
    type: "multiple_choice",
    title: "Why use lock_guard",
    prompt: "What is the main advantage of std::lock_guard over manual mutex lock()/unlock() calls?",
    explanation:
      "std::lock_guard releases the mutex in its destructor, so the lock is freed even if the critical section throws or returns early — avoiding the leaked-lock and deadlock bugs that manual unlock() invites.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2560,
    is_active: true
  },
  {
    id: "cpp.concurrency.async.lesson",
    type: "lesson",
    title: "Async tasks and futures",
    prompt:
      "`std::async` runs a function and hands you a `std::future` that will eventually hold its result. Calling `fut.get()` blocks until the task finishes and returns the value (or rethrows an exception it threw). With the `std::launch::async` policy the task runs on a new thread; the default policy may instead run it lazily when you call `get()`. Futures are a higher-level alternative to managing threads by hand: no manual join, and results and exceptions flow back to you cleanly. Note that `get()` may only be called once per future.",
    explanation:
      "std::async returns a future; future::get() blocks until the result is ready and returns it (or rethrows). It is a higher-level alternative to manual thread management.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2570,
    is_active: true
  },
  {
    id: "cpp.concurrency.async.mc_get",
    type: "multiple_choice",
    title: "Getting an async result",
    prompt: "What does calling get() on the std::future returned by std::async do?",
    explanation:
      "future::get() blocks until the async task has finished, then returns its result (or rethrows any exception the task threw). It can only be called once.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2580,
    is_active: true
  },
  {
    id: "cpp.concurrency.deadlock.lesson",
    type: "lesson",
    title: "Deadlock and lock ordering",
    prompt:
      "Deadlock happens when two threads each hold one lock and wait forever for the other's: thread A locks `m1` then wants `m2`, while thread B locks `m2` then wants `m1`. Neither can proceed. The classic cure is a consistent lock order — every thread always acquires `m1` before `m2` — so the cycle of waiting can never form. C++ gives you tools so you do not have to hand-order locks: `std::scoped_lock lk(m1, m2);` (C++17) locks several mutexes at once using a deadlock-avoidance algorithm, and `std::lock(m1, m2)` does the same for pre-existing lock objects. Holding only one lock at a time, keeping critical sections short, and never calling unknown code while holding a lock also reduce the risk. Deadlock is one of the four Coffman conditions (mutual exclusion, hold-and-wait, no preemption, circular wait); breaking any one — usually circular wait via ordering — prevents it.",
    explanation:
      "Deadlock is a circular wait for locks held in different orders. Prevent it with a consistent global lock order, or acquire multiple locks atomically with std::scoped_lock / std::lock.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3870,
    is_active: true
  },
  {
    id: "cpp.concurrency.deadlock.mc_order",
    type: "multiple_choice",
    title: "Preventing deadlock",
    prompt: "Two threads each need to hold mutexes m1 and m2 at the same time. What reliably prevents deadlock between them?",
    explanation:
      "Always acquiring the mutexes in the same order (or taking both atomically with std::scoped_lock/std::lock) makes a circular wait impossible. Adding sleeps or retries does not remove the race.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3880,
    is_active: true
  },
  {
    id: "cpp.concurrency.condition_variables.lesson",
    type: "lesson",
    title: "Condition variables",
    prompt:
      "A condition variable lets a thread sleep until another thread signals that some shared state changed — without busy-waiting. The waiter holds a `std::unique_lock` on the mutex guarding the state and calls `cv.wait(lock, [&]{ return ready; });`; `wait` atomically releases the lock and sleeps, then re-acquires the lock and re-checks the predicate when woken. Always pass a predicate (or loop on `while (!ready) cv.wait(lock);`) because a thread can wake spuriously or after the condition was already consumed. The signalling side modifies the state under the same mutex, then calls `cv.notify_one()` (wake one waiter) or `cv.notify_all()`. This is the backbone of a producer-consumer queue: producers push an item under the lock and notify; consumers wait for the queue to be non-empty, then pop. Condition variables replace timing-based polling with deterministic hand-off.",
    explanation:
      "A condition variable blocks a thread until shared state changes, avoiding busy-waiting. Wait with a predicate (guards against spurious wakeups), modify state under the mutex, then notify_one/notify_all.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 3890,
    is_active: true
  },
  {
    id: "cpp.concurrency.condition_variables.mc_predicate",
    type: "multiple_choice",
    title: "Why wait takes a predicate",
    prompt: "Why should condition_variable::wait be given a predicate (or be called inside a while loop checking the condition)?",
    explanation:
      "A waiting thread can wake spuriously or after the condition has already been handled by another thread. Re-checking a predicate ensures it only proceeds when the state is actually ready.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3900,
    is_active: true
  },
  {
    id: "cpp.concurrency.atomics.lesson",
    type: "lesson",
    title: "Atomics and the memory model",
    prompt:
      "`std::atomic<T>` makes individual operations on a shared value indivisible, so a `std::atomic<int>` counter incremented from many threads with `counter.fetch_add(1)` (or `++counter`) never loses updates — no mutex needed. Atomics are ideal for simple shared counters and flags (e.g. a `std::atomic<bool> stop`). But atomicity is per-operation, not per-transaction: `if (counter > 0) counter--;` is still a race because the check and the decrement are two separate atomic steps — higher-level invariants spanning multiple variables still need a mutex. Crucially, `volatile` is NOT a synchronization tool: it prevents some compiler optimizations for memory-mapped I/O but provides no atomicity and no cross-thread ordering guarantees — use `std::atomic` instead. By default atomic operations use sequentially-consistent ordering (`memory_order_seq_cst`), the easiest to reason about; relaxed/acquire-release orderings trade guarantees for speed and should be left until you truly need them.",
    explanation:
      "std::atomic gives indivisible per-operation access for counters/flags without a mutex; multi-step invariants still need a lock. volatile is not synchronization. Default seq_cst ordering is the safe choice.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 3910,
    is_active: true
  },
  {
    id: "cpp.concurrency.atomics.mc_volatile",
    type: "multiple_choice",
    title: "volatile vs atomic",
    prompt: "A shared flag is read and written by multiple threads. Why is declaring it `volatile` not enough for correct synchronization?",
    explanation:
      "volatile only stops certain compiler optimizations (for memory-mapped I/O); it gives no atomicity and no cross-thread ordering guarantees. Use std::atomic for thread-safe shared access.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 3920,
    is_active: true
  },
  {
    id: "cpp.concurrency.jthread.lesson",
    type: "lesson",
    title: "jthread and cooperative cancellation",
    prompt:
      "`std::jthread` (C++20) fixes two sharp edges of `std::thread`. First, it joins automatically in its destructor, so you can no longer forget to join and crash the program — it is RAII for threads. Second, it has built-in cooperative cancellation: a `jthread` carries a `std::stop_source`, and if your thread function takes a `std::stop_token` as its first parameter, the runtime passes it in. Your loop checks `while (!token.stop_requested()) { ... }`, and another thread calls `jt.request_stop()` (or the destructor calls it for you) to ask it to finish. Cancellation is *cooperative*: there is no way to forcibly kill a running thread in C++, so the worker must poll the token (or use `std::condition_variable_any::wait` overloads that take a stop_token to wake on a stop request). The pattern: long-running workers take a stop_token, check it at safe points, and exit their loop when a stop is requested — clean shutdown with no detached-thread leaks or abrupt termination.",
    explanation:
      "std::jthread auto-joins in its destructor (RAII) and supports cooperative cancellation: the worker takes a std::stop_token and polls stop_requested(); another thread calls request_stop(). C++ cannot forcibly kill a thread, so the worker must check the token.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 4110,
    is_active: true
  },
  {
    id: "cpp.concurrency.jthread.mc_stop",
    type: "multiple_choice",
    title: "How jthread cancellation works",
    prompt: "How does a std::jthread worker get cancelled when another thread calls request_stop()?",
    explanation:
      "Cancellation is cooperative: request_stop() sets the shared stop state, and the worker must poll its std::stop_token (stop_requested()) and exit on its own. C++ cannot forcibly terminate a running thread.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 4120,
    is_active: true
  },
  {
    id: "cpp.concurrency.promise_future.lesson",
    type: "lesson",
    title: "Promises and packaged tasks",
    prompt:
      "`std::async` is the easy button, but sometimes you need to hand a result across threads more explicitly. A `std::promise<T>` is the producing end of a one-shot channel and its paired `std::future<T>` (from `promise.get_future()`) is the consuming end: one thread calls `promise.set_value(x)` (or `set_exception(...)`), and whatever thread holds the future blocks on `future.get()` until the value arrives. This decouples *who computes* from *who started the work* — useful when the producer is an existing thread, a callback, or an event handler rather than a function you launch. `std::packaged_task<R(Args...)>` wraps a callable so that invoking it stores its return value into an associated future; you hand the task to a thread or a thread pool and keep the future. Rule of thumb: reach for `std::async` for fire-and-forget compute, `packaged_task` to schedule callables on your own threads/pool, and a bare `promise` when the result is produced by code you do not call directly. Each future result can be retrieved only once.",
    explanation:
      "std::promise/std::future form a one-shot cross-thread channel: producer calls set_value/set_exception, consumer blocks on future.get(). std::packaged_task wraps a callable to feed a future. Use async for fire-and-forget, packaged_task for your own threads/pool, promise when another agent produces the value.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 4130,
    is_active: true
  },
  {
    id: "cpp.concurrency.promise_future.mc_promise",
    type: "multiple_choice",
    title: "Delivering a value through a promise",
    prompt: "One thread holds a std::promise<int> and another holds the paired std::future<int>. How does the value get from producer to consumer?",
    explanation:
      "The producer calls promise.set_value(x); the consumer's future.get() blocks until then and returns x. The promise and future are the two ends of a single one-shot channel created by promise.get_future().",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 4140,
    is_active: true
  },
  {
    id: "cpp.concurrency.task_selection.lesson",
    type: "lesson",
    title: "Choosing threads vs tasks",
    prompt:
      "Concurrency and parallelism are different goals. Concurrency is structuring a program as independent tasks that can make progress in overlapping time windows (e.g. handling many connections), and it helps even on one core — especially for I/O-bound work that spends time waiting. Parallelism is actually running computations at the same instant on multiple cores to go faster, which only helps CPU-bound work and only up to the core count. Pick your tool accordingly. Higher-level *tasks* — `std::async`, futures, `packaged_task`, or a thread pool — let you express \"compute this, give me the result later\" without owning thread lifetimes, handle exceptions through the future, and avoid oversubscription; prefer them for request/response compute and divide-and-conquer work. Drop to a raw `std::thread`/`std::jthread` when you need a long-lived dedicated thread (an event loop, a background poller) or fine control over the thread itself. And remember Amdahl's law: the serial fraction caps your speedup, so more threads is not automatically faster — measure, and watch for contention and the cost of synchronization.",
    explanation:
      "Concurrency = overlapping independent tasks (helps I/O-bound work, even on one core); parallelism = simultaneous execution on multiple cores (helps CPU-bound work). Prefer high-level tasks (async/futures/pool) for compute-and-return work; use raw threads for long-lived dedicated work. Amdahl's law caps speedup.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 4150,
    is_active: true
  },
  {
    id: "cpp.concurrency.task_selection.mc_concurrency",
    type: "multiple_choice",
    title: "Concurrency vs parallelism",
    prompt: "A program is I/O-bound (it mostly waits on network responses) and runs on a single core. Which idea most directly helps it?",
    explanation:
      "Concurrency — overlapping independent tasks so one can progress while another waits — helps I/O-bound work even on a single core. Parallelism (simultaneous execution on multiple cores) only speeds up CPU-bound work and needs more than one core.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 4160,
    is_active: true
  },
  {
    id: "cpp.utilities.file_io.lesson",
    type: "lesson",
    title: "File I/O and filesystem",
    prompt:
      "C++ file streams mirror console I/O: `std::ofstream out(\"data.txt\");` opens a file for writing and you use `out << value;` just like `std::cout`; `std::ifstream in(\"data.txt\");` reads with `in >> value` or `std::getline`. Always check the stream is open and good before trusting reads. Files close automatically when the stream object is destroyed (RAII). For paths and metadata, `std::filesystem` (since C++17) provides `fs::path`, `fs::exists(p)`, `fs::create_directory(p)`, and iteration over directory entries — portable across operating systems so you avoid hand-built path strings.",
    explanation:
      "ofstream/ifstream do file I/O with the same << / >> as console streams and close via RAII; std::filesystem gives portable path, existence, and directory operations.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2610,
    is_active: true
  },
  {
    id: "cpp.utilities.file_io.mc_exists",
    type: "multiple_choice",
    title: "Checking a file exists",
    prompt: "Which standard facility portably checks whether a file or directory exists?",
    explanation:
      "std::filesystem::exists(path) reports whether a path exists, portably across operating systems. It replaces ad-hoc tricks like trying to open the file just to test for it.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2620,
    is_active: true
  },
  {
    id: "cpp.utilities.chrono.lesson",
    type: "lesson",
    title: "Time with chrono",
    prompt:
      "`std::chrono` represents time with strong types instead of bare numbers. A `duration` is a span (e.g. `std::chrono::milliseconds(5)`); a `time_point` is a moment read from a clock. To measure elapsed time, capture `auto start = std::chrono::steady_clock::now();`, run the work, then subtract: `auto elapsed = std::chrono::steady_clock::now() - start;` and convert with `std::chrono::duration_cast<std::chrono::milliseconds>(elapsed).count()`. Use `steady_clock` for measuring intervals (it never jumps backward), and `system_clock` only for wall-clock calendar time. The type system prevents accidentally mixing seconds with milliseconds.",
    explanation:
      "Use steady_clock::now() before and after a block and subtract to get a duration; duration_cast converts it to the units you want. steady_clock is the right clock for measuring intervals.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2630,
    is_active: true
  },
  {
    id: "cpp.utilities.chrono.mc_clock",
    type: "multiple_choice",
    title: "Which clock for timing",
    prompt: "Which chrono clock is the right choice for measuring how long a code block takes?",
    explanation:
      "steady_clock is monotonic — it never jumps backward when the system time is adjusted — so it is the correct clock for measuring elapsed intervals. system_clock can shift and is for calendar time.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2640,
    is_active: true
  },
  {
    id: "cpp.utilities.random.lesson",
    type: "lesson",
    title: "Random numbers",
    prompt:
      "Modern C++ separates the source of randomness from how it is shaped. A random engine such as `std::mt19937` produces raw random bits; a distribution such as `std::uniform_int_distribution<int> dist(1, 6)` maps those bits to the range and shape you want. You seed the engine once (often from `std::random_device`) and then call `dist(engine)` to draw values. This beats the old `rand() % n` idiom, which has modulo bias (some outcomes are slightly more likely) and a low-quality generator. For a fair die roll, `uniform_int_distribution(1, 6)` is correct and unbiased.",
    explanation:
      "Pair a random engine (e.g. mt19937) with a distribution (e.g. uniform_int_distribution) for unbiased values; this replaces the biased rand() % n idiom.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 2650,
    is_active: true
  },
  {
    id: "cpp.utilities.random.mc_bias",
    type: "multiple_choice",
    title: "Avoiding modulo bias",
    prompt: "What is the recommended way to generate an unbiased random integer in a range like 1 to 6?",
    explanation:
      "Use a random engine with std::uniform_int_distribution<int>(1, 6). The classic rand() % 6 + 1 introduces modulo bias and relies on a weaker generator.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 2660,
    is_active: true
  },
  {
    id: "cpp.utilities.variant.lesson",
    type: "lesson",
    title: "Variant and optional",
    prompt:
      "`std::optional<T>` models a value that might be absent: it either holds a T or nothing, replacing sentinel values like -1 or null pointers. Check it with `if (opt)` and read it with `*opt` or `opt.value()`. `std::variant<A, B, C>` is a type-safe union that holds exactly one of several alternative types at a time; you query the active type and access it safely with `std::visit` or `std::get_if`. Together they let you express \"maybe a value\" and \"one of these types\" without unsafe casts or out-of-band flags, with the compiler enforcing that you handle the cases.",
    explanation:
      "std::optional<T> represents a maybe-present value (no sentinels); std::variant holds exactly one of several types and is accessed safely with std::visit/std::get_if.",
    difficulty: "advanced",
    estimated_minutes: 5,
    order_index: 2670,
    is_active: true
  },
  {
    id: "cpp.utilities.variant.mc_optional",
    type: "multiple_choice",
    title: "Representing a maybe-value",
    prompt: "What is std::optional<int> best used for?",
    explanation:
      "std::optional<int> represents an int that may or may not be present, replacing magic sentinel values (like -1) or nullable pointers with an explicit, type-safe maybe-value.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2680,
    is_active: true
  },
  {
    id: "cpp.utilities.stream_validation.lesson",
    type: "lesson",
    title: "Robust stream input",
    prompt:
      "Reading input with `>>` can fail, and ignoring that is a common source of bugs. When `std::cin >> n` cannot parse an int (the user typed `abc`), the stream enters a failed state: `n` is left unchanged, the bad characters stay in the buffer, and every later extraction silently fails too. So always test the stream — `if (std::cin >> n) { ... }` or check `std::cin.fail()` — before trusting the value. To recover, call `std::cin.clear()` to reset the error flags, then `std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n')` to discard the rest of the bad line, and prompt again. Mixing `>>` with `std::getline` needs the same care: `>>` leaves the trailing newline in the buffer, so a following `getline` reads an empty line unless you `ignore()` that newline first. The rule: extraction is not validation — check the stream state, recover deliberately, and loop until the input is valid.",
    explanation:
      "Extraction can fail and leave the stream in an error state; check the stream (`if (cin >> n)`) before trusting input. Recover with clear() then ignore() to discard the bad line. After >>, ignore the leftover newline before getline.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 3990,
    is_active: true
  },
  {
    id: "cpp.utilities.stream_validation.mc_recover",
    type: "multiple_choice",
    title: "Recovering from bad input",
    prompt: "`std::cin >> n` failed because the user typed letters. What must you do before reading again?",
    explanation:
      "After a failed extraction you must cin.clear() to reset the error flags and cin.ignore(...) to discard the leftover bad characters; otherwise every subsequent read fails too.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 4000,
    is_active: true
  },
  {
    id: "cpp.utilities.tuples.lesson",
    type: "lesson",
    title: "Pairs, tuples, and structured bindings",
    prompt:
      "`std::pair<A, B>` groups two related values and `std::tuple<A, B, C, ...>` groups any fixed number — handy for returning several results from one function without defining a struct. You build them with `std::make_pair`/`std::make_tuple` (or brace init) and historically read them with `.first`/`.second` or `std::get<0>(t)`, which is clumsy. Structured bindings (C++17) fix that: `auto [quotient, remainder] = divmod(a, b);` unpacks the returned pair/tuple into named variables, and the same syntax destructures structs and elements when iterating a map (`for (auto& [key, value] : m)`). Prefer a small named struct when the group is a meaningful entity you pass around a lot (its fields document themselves); reach for pair/tuple for quick, local, ad-hoc grouping like multiple return values.",
    explanation:
      "std::pair/std::tuple group a fixed number of values (e.g. multiple return values); structured bindings (auto [a, b] = ...) unpack them into named variables. Prefer a named struct when the group is a meaningful, reused entity.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 4010,
    is_active: true
  },
  {
    id: "cpp.utilities.tuples.mc_bind",
    type: "multiple_choice",
    title: "Unpacking a returned pair",
    prompt: "A function returns `std::pair<int, int>`. What is the idiomatic C++17 way to read both values into named variables?",
    explanation:
      "Structured bindings — `auto [lo, hi] = f();` — unpack the pair into named variables in one line, far clearer than calling .first/.second or std::get separately.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 4020,
    is_active: true
  },
  {
    id: "cpp.utilities.enums.lesson",
    type: "lesson",
    title: "Scoped enums for finite states",
    prompt:
      "When a value can only be one of a small, fixed set of named states — `Pending`, `Active`, `Closed` — model it with a scoped enum: `enum class Status { Pending, Active, Closed };`. Scoped enums (`enum class`) are safer than old plain enums: their names are scoped (`Status::Active`, no clashes), they do not implicitly convert to int, and you can give them an explicit underlying type. The compiler can warn when a `switch` over the enum misses a case, so adding a new state surfaces every place that must handle it. Choose the right tool by what varies: an `enum class` when the alternatives are just *labels* with no data; a `std::variant` when each alternative carries a *different type of data*; and runtime polymorphism (virtual functions) when the set of alternatives is *open* and extended by new classes. Enum for a closed set of plain states, variant for a closed set of typed payloads, polymorphism for an open set.",
    explanation:
      "Use enum class for a closed set of named states (scoped, no implicit int conversion, switch-exhaustiveness warnings). Pick enum for plain labels, variant for typed payloads, polymorphism for an open/extensible set.",
    difficulty: "intermediate",
    estimated_minutes: 5,
    order_index: 4030,
    is_active: true
  },
  {
    id: "cpp.utilities.enums.mc_choose",
    type: "multiple_choice",
    title: "enum class vs variant",
    prompt: "You have a closed set of states that are just names with no associated data of their own. Which type models this best?",
    explanation:
      "An enum class fits a closed set of plain named states: scoped, type-safe, and switch-exhaustiveness-checkable. std::variant is for alternatives that each carry a different data type; polymorphism is for an open, extensible set.",
    difficulty: "intermediate",
    estimated_minutes: 2,
    order_index: 4040,
    is_active: true
  },
  {
    id: "dsa.math.bit_manipulation.lesson",
    type: "lesson",
    title: "Bit manipulation",
    prompt:
      "Integers are sequences of bits, and bitwise operators let you work with them directly. AND (`&`) masks bits, OR (`|`) sets them, XOR (`^`) toggles them, and the shifts `<<`/`>>` multiply or divide by powers of two. Common one-liners: test bit i with `(x >> i) & 1`; set it with `x | (1 << i)`; clear it with `x & ~(1 << i)`; toggle it with `x ^ (1 << i)`. A neat trick, `x & (x - 1)`, clears the lowest set bit, which makes counting set bits easy. Bit masks also encode small sets compactly — a single `int` can represent a subset of up to 32 elements.",
    explanation:
      "Use & to test/mask, | to set, ^ to toggle, and shifts to move bits; `(x >> i) & 1` reads bit i and `x | (1 << i)` sets it.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 2710,
    is_active: true
  },
  {
    id: "dsa.math.bit_manipulation.mc_test_bit",
    type: "multiple_choice",
    title: "Testing a bit",
    prompt: "Which expression checks whether bit i of an integer x is set (equal to 1)?",
    explanation:
      "Shifting x right by i brings bit i to the lowest position, and `& 1` isolates it: `(x >> i) & 1` is 1 when the bit is set, 0 otherwise.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2720,
    is_active: true
  },
  {
    id: "dsa.math.number_theory.lesson",
    type: "lesson",
    title: "Number theory",
    prompt:
      "A few number-theory tools recur constantly. The greatest common divisor is computed with Euclid's algorithm: `gcd(a, b) = gcd(b, a % b)` until b is 0, running in O(log min(a, b)); `std::gcd` provides it directly. Primality of n can be tested by trial division up to sqrt(n). Modular arithmetic keeps numbers in range: `(a + b) % m` and `(a * b) % m` let you compute large results without overflow, which is why competitive problems ask for answers \"modulo 1e9+7\". Remember that in C++ the `%` operator can return a negative result for negative operands, so normalize when needed.",
    explanation:
      "Euclid's algorithm computes gcd in O(log n); test primality by trial division to sqrt(n); use modular arithmetic to keep large products in range.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 2730,
    is_active: true
  },
  {
    id: "dsa.math.number_theory.mc_gcd",
    type: "multiple_choice",
    title: "Euclid's algorithm",
    prompt: "Euclid's algorithm computes gcd(a, b) by repeatedly applying which step?",
    explanation:
      "Euclid's algorithm replaces (a, b) with (b, a % b) until the second value is 0; the remaining first value is the gcd. This runs in O(log min(a, b)).",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2740,
    is_active: true
  },
  {
    id: "dsa.math.combinatorics.lesson",
    type: "lesson",
    title: "Combinatorics",
    prompt:
      "Combinatorics counts how many ways things can happen. A permutation counts ordered arrangements: the number of ways to order r of n distinct items is P(n, r) = n! / (n - r)!. A combination counts unordered selections: C(n, r) = n! / (r! (n - r)!), often read \"n choose r\". The deciding question is whether order matters — picking a 3-person committee from 10 people is a combination (order irrelevant), while awarding gold/silver/bronze to 3 of 10 runners is a permutation (order matters). For repeated counting, Pascal's rule C(n, r) = C(n-1, r-1) + C(n-1, r) builds a table that avoids recomputing factorials.",
    explanation:
      "Permutations count ordered arrangements (order matters); combinations count unordered selections (order does not). C(n, r) = n! / (r!(n-r)!).",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 2750,
    is_active: true
  },
  {
    id: "dsa.math.combinatorics.mc_committee",
    type: "multiple_choice",
    title: "Permutation or combination",
    prompt: "Counting how many 3-person committees can be formed from 10 people uses which?",
    explanation:
      "A committee has no internal order — the same three people are one committee regardless of who is named first — so it is a combination, C(10, 3). If order mattered (e.g. president/VP/secretary) it would be a permutation.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2760,
    is_active: true
  },
  {
    id: "dsa.math.geometry.lesson",
    type: "lesson",
    title: "Computational geometry",
    prompt:
      "Geometry problems start with points in the plane, often as a pair of coordinates. The Euclidean distance between (x1, y1) and (x2, y2) is sqrt((x2-x1)^2 + (y2-y1)^2); when you only need to compare distances, skip the sqrt and compare squared distances to avoid floating-point error. The cross product of vectors AB and AC, (Bx-Ax)(Cy-Ay) - (By-Ay)(Cx-Ax), is a workhorse: its sign tells you whether C is to the left of AB (positive, counter-clockwise turn), to the right (negative, clockwise), or collinear (zero). That orientation test underlies convex-hull and segment-intersection algorithms.",
    explanation:
      "Compare squared distances to avoid sqrt error; the sign of the cross product gives orientation (left/right/collinear), the basis of hull and intersection tests.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 2770,
    is_active: true
  },
  {
    id: "dsa.math.geometry.mc_cross",
    type: "multiple_choice",
    title: "What the cross product tells you",
    prompt: "What does the sign of the 2D cross product of vectors AB and AC tell you?",
    explanation:
      "The cross product's sign gives orientation: positive means C is a counter-clockwise (left) turn from AB, negative means clockwise (right), and zero means the three points are collinear.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 2780,
    is_active: true
  },
  {
    id: "dsa.math.bitmask_techniques.lesson",
    type: "lesson",
    title: "Bitmask techniques",
    prompt:
      "An integer can act as a set of up to ~64 boolean flags, one per bit, which is both compact and fast. The core operations on bit i are: test `(mask >> i) & 1`, set `mask |= (1 << i)`, clear `mask &= ~(1 << i)`, and toggle `mask ^= (1 << i)`. Two everyday tricks: `n & (n - 1)` clears the lowest set bit (so `n && !(n & (n - 1))` tests for a power of two), and `__builtin_popcount(mask)` (or `std::popcount` in C++20) counts the set bits. The big payoff is subset enumeration: to iterate every subset of a mask, run `for (int s = mask; s; s = (s - 1) & mask)`, which visits each submask exactly once — the engine behind bitmask DP over subsets. Use `1 << i` carefully: for masks wider than 31 bits use `1LL << i` to avoid int overflow. Bitmasks shine when the universe is small (n ≤ ~20-22 for 2^n subset DP) and you need set operations as single CPU instructions.",
    explanation:
      "Treat an int as flags: test/set/clear/toggle bit i with >>/|/&~/^. n & (n-1) clears the lowest set bit (power-of-two test); popcount counts bits; iterate submasks with for (s = mask; s; s = (s-1) & mask). Use 1LL << i past 31 bits.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 4050,
    is_active: true
  },
  {
    id: "dsa.math.bitmask_techniques.mc_submask",
    type: "multiple_choice",
    title: "Enumerating submasks",
    prompt: "Which loop visits every subset (submask) of the bits set in `mask` exactly once?",
    explanation:
      "`for (int s = mask; s; s = (s - 1) & mask)` walks all non-empty submasks of mask exactly once (add s = 0 separately for the empty set). The (s - 1) & mask step skips bits not in mask.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 4060,
    is_active: true
  },
  {
    id: "dsa.math.sieve.lesson",
    type: "lesson",
    title: "Primes: sieve and factorization",
    prompt:
      "To test one number n for primality, trial division up to sqrt(n) is enough — if n has a factor larger than sqrt(n) it must also have one smaller, so you never look past the square root; this is O(sqrt(n)). To get all primes up to N, the sieve of Eratosthenes is far better: mark multiples of each prime starting from p*p as composite, leaving the primes, in O(N log log N) time and O(N) space. Prime factorization combines the ideas: divide out each prime factor (2, then odd numbers up to sqrt(n)) repeatedly, and whatever remains above 1 at the end is a final prime factor — O(sqrt(n)) per number, or much faster if you precompute a smallest-prime-factor table with a sieve. Pick by workload: sqrt(n) trial division for a few queries, a sieve when you need many primality checks or factorizations over a range. Watch the bound — multiplying near the limit can overflow, so use a 64-bit type when squaring.",
    explanation:
      "Trial division to sqrt(n) tests one number (O(sqrt n)); the sieve of Eratosthenes lists all primes up to N in O(N log log N). Factor by dividing out primes up to sqrt(n); a smallest-prime-factor sieve makes repeated factorization fast.",
    difficulty: "advanced",
    estimated_minutes: 6,
    order_index: 4070,
    is_active: true
  },
  {
    id: "dsa.math.sieve.mc_trial",
    type: "multiple_choice",
    title: "How far to trial divide",
    prompt: "When testing whether a single number n is prime by trial division, up to what value must you check for divisors?",
    explanation:
      "You only need to test divisors up to sqrt(n): any factor larger than sqrt(n) is paired with one smaller than sqrt(n), so if none exist up to the square root, n is prime. This makes the check O(sqrt(n)).",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 4080,
    is_active: true
  },
  {
    id: "dsa.math.modular_arithmetic.lesson",
    type: "lesson",
    title: "Modular arithmetic and fast power",
    prompt:
      "Modular arithmetic keeps numbers small by working with remainders mod m, which is essential when answers would overflow (problems often ask for a result mod 1e9+7). Addition and multiplication distribute over the modulus: `(a + b) % m` and `(a * b) % m` give the right answer, but reduce after every operation, and use a 64-bit type for the product because `a * b` can overflow `int` even when a and b are reduced. Subtraction needs care: `(a - b) % m` can be negative in C++, so write `((a - b) % m + m) % m` to get a value in [0, m). To compute a^b mod m efficiently, use binary exponentiation (exponentiation by squaring): square the base and halve the exponent, multiplying the result in when the current bit is set — O(log b) multiplications instead of O(b). When m is prime, the modular inverse of a is a^(m-2) mod m by Fermat's little theorem, which lets you 'divide' under a modulus. Always state the modulus and use 64-bit intermediates to stay overflow-safe.",
    explanation:
      "Reduce mod m after each + and *, using 64-bit products to avoid overflow; fix negative subtraction with ((a-b)%m+m)%m. Compute a^b mod m in O(log b) by binary exponentiation; for prime m the inverse is a^(m-2) mod m (Fermat).",
    difficulty: "advanced",
    estimated_minutes: 7,
    order_index: 4090,
    is_active: true
  },
  {
    id: "dsa.math.modular_arithmetic.mc_fastpow",
    type: "multiple_choice",
    title: "Computing a^b mod m efficiently",
    prompt: "What is the standard way to compute a^b mod m quickly for a large exponent b?",
    explanation:
      "Binary exponentiation (exponentiation by squaring) computes a^b mod m in O(log b) multiplications by squaring the base and halving the exponent, reducing mod m at each step. A plain loop multiplying b times is O(b) and far too slow for large b.",
    difficulty: "advanced",
    estimated_minutes: 2,
    order_index: 4100,
    is_active: true
  }
];




export const learningItemSkills: LearningItemSkill[] = [
  { learning_item_id: "cpp.program_basics.structure.lesson", skill_id: "cpp.program_basics.structure", is_primary: true },
  { learning_item_id: "cpp.program_basics.structure.mc_entry", skill_id: "cpp.program_basics.structure", is_primary: true },
  { learning_item_id: "cpp.program_basics.io.lesson", skill_id: "cpp.program_basics.io", is_primary: true },
  { learning_item_id: "cpp.program_basics.io.mc_read", skill_id: "cpp.program_basics.io", is_primary: true },
  { learning_item_id: "cpp.program_basics.statements_comments.lesson", skill_id: "cpp.program_basics.statements_comments", is_primary: true },
  { learning_item_id: "cpp.program_basics.statements_comments.mc_terminate", skill_id: "cpp.program_basics.statements_comments", is_primary: true },
  { learning_item_id: "cpp.program_basics.exit_status.lesson", skill_id: "cpp.program_basics.exit_status", is_primary: true },
  { learning_item_id: "cpp.program_basics.exit_status.mc_success", skill_id: "cpp.program_basics.exit_status", is_primary: true },
  { learning_item_id: "cpp.program_basics.error_kinds.lesson", skill_id: "cpp.program_basics.error_kinds", is_primary: true },
  { learning_item_id: "cpp.program_basics.error_kinds.mc_classify", skill_id: "cpp.program_basics.error_kinds", is_primary: true },
  { learning_item_id: "cpp.values_types.variables.lesson", skill_id: "cpp.values_types.variables", is_primary: true },
  { learning_item_id: "cpp.values_types.variables.mc_auto", skill_id: "cpp.values_types.variables", is_primary: true },
  { learning_item_id: "cpp.values_types.conversions.lesson", skill_id: "cpp.values_types.conversions", is_primary: true },
  { learning_item_id: "cpp.values_types.conversions.mc_static_cast", skill_id: "cpp.values_types.conversions", is_primary: true },
  { learning_item_id: "cpp.values_types.fundamental_types.lesson", skill_id: "cpp.values_types.fundamental_types", is_primary: true },
  { learning_item_id: "cpp.values_types.fundamental_types.mc_money", skill_id: "cpp.values_types.fundamental_types", is_primary: true },
  { learning_item_id: "cpp.values_types.signed_unsigned.lesson", skill_id: "cpp.values_types.signed_unsigned", is_primary: true },
  { learning_item_id: "cpp.values_types.signed_unsigned.mc_compare", skill_id: "cpp.values_types.signed_unsigned", is_primary: true },
  { learning_item_id: "cpp.values_types.literals.lesson", skill_id: "cpp.values_types.literals", is_primary: true },
  { learning_item_id: "cpp.values_types.literals.mc_intdiv", skill_id: "cpp.values_types.literals", is_primary: true },
  { learning_item_id: "cpp.control_flow.conditionals.lesson", skill_id: "cpp.control_flow.conditionals", is_primary: true },
  { learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", skill_id: "cpp.control_flow.conditionals", is_primary: true },
  { learning_item_id: "cpp.control_flow.loops.lesson", skill_id: "cpp.control_flow.loops", is_primary: true },
  { learning_item_id: "cpp.control_flow.loops.mc_offbyone", skill_id: "cpp.control_flow.loops", is_primary: true },
  { learning_item_id: "cpp.control_flow.logical_operators.lesson", skill_id: "cpp.control_flow.logical_operators", is_primary: true },
  { learning_item_id: "cpp.control_flow.logical_operators.mc_shortcircuit", skill_id: "cpp.control_flow.logical_operators", is_primary: true },
  { learning_item_id: "cpp.control_flow.switch_statement.lesson", skill_id: "cpp.control_flow.switch_statement", is_primary: true },
  { learning_item_id: "cpp.control_flow.switch_statement.mc_nobreak", skill_id: "cpp.control_flow.switch_statement", is_primary: true },
  { learning_item_id: "cpp.control_flow.loop_invariants.lesson", skill_id: "cpp.control_flow.loop_invariants", is_primary: true },
  { learning_item_id: "cpp.control_flow.loop_invariants.mc_halfopen", skill_id: "cpp.control_flow.loop_invariants", is_primary: true },
  { learning_item_id: "cpp.functions.basics.lesson", skill_id: "cpp.functions.basics", is_primary: true },
  { learning_item_id: "cpp.functions.basics.mc_scope", skill_id: "cpp.functions.basics", is_primary: true },
  { learning_item_id: "cpp.functions.decomposition.lesson", skill_id: "cpp.functions.decomposition", is_primary: true },
  { learning_item_id: "cpp.functions.decomposition.mc_why", skill_id: "cpp.functions.decomposition", is_primary: true },
  { learning_item_id: "cpp.references.references.lesson", skill_id: "cpp.references.references", is_primary: true },
  { learning_item_id: "cpp.references.references.mc_init", skill_id: "cpp.references.references", is_primary: true },
  { learning_item_id: "cpp.references.pointers.lesson", skill_id: "cpp.references.pointers", is_primary: true },
  { learning_item_id: "cpp.references.pointers.mc_null", skill_id: "cpp.references.pointers", is_primary: true },
  { learning_item_id: "cpp.references.const_correctness.lesson", skill_id: "cpp.references.const_correctness", is_primary: true },
  { learning_item_id: "cpp.references.const_correctness.mc_constref", skill_id: "cpp.references.const_correctness", is_primary: true },
  { learning_item_id: "cpp.references.parameter_passing.lesson", skill_id: "cpp.references.parameter_passing", is_primary: true },
  { learning_item_id: "cpp.references.parameter_passing.mc_large", skill_id: "cpp.references.parameter_passing", is_primary: true },
  { learning_item_id: "cpp.references.lvalue_rvalue.lesson", skill_id: "cpp.references.lvalue_rvalue", is_primary: true },
  { learning_item_id: "cpp.references.lvalue_rvalue.mc_classify", skill_id: "cpp.references.lvalue_rvalue", is_primary: true },
  { learning_item_id: "cpp.references.return_semantics.lesson", skill_id: "cpp.references.return_semantics", is_primary: true },
  { learning_item_id: "cpp.references.return_semantics.mc_local", skill_id: "cpp.references.return_semantics", is_primary: true },
  { learning_item_id: "cpp.references.dangling.lesson", skill_id: "cpp.references.dangling", is_primary: true },
  { learning_item_id: "cpp.references.dangling.mc_extension", skill_id: "cpp.references.dangling", is_primary: true },
  { learning_item_id: "cpp.references.pointer_const.lesson", skill_id: "cpp.references.pointer_const", is_primary: true },
  { learning_item_id: "cpp.references.pointer_const.mc_which", skill_id: "cpp.references.pointer_const", is_primary: true },
  { learning_item_id: "cpp.references.non_owning.lesson", skill_id: "cpp.references.non_owning", is_primary: true },
  { learning_item_id: "cpp.references.non_owning.mc_select", skill_id: "cpp.references.non_owning", is_primary: true },
  { learning_item_id: "cpp.references.views.lesson", skill_id: "cpp.references.views", is_primary: true },
  { learning_item_id: "cpp.references.views.mc_use", skill_id: "cpp.references.views", is_primary: true },
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
  { learning_item_id: "cpp.constructors.destructor_intro.mc_destruction_order", skill_id: "cpp.constructors.destructor_intro", is_primary: true },
  { learning_item_id: "cpp.value_semantics.copy.lesson", skill_id: "cpp.value_semantics.copy", is_primary: true },
  { learning_item_id: "cpp.value_semantics.copy.mc_shallow", skill_id: "cpp.value_semantics.copy", is_primary: true },
  { learning_item_id: "cpp.value_semantics.move.lesson", skill_id: "cpp.value_semantics.move", is_primary: true },
  { learning_item_id: "cpp.value_semantics.move.mc_source", skill_id: "cpp.value_semantics.move", is_primary: true },
  { learning_item_id: "cpp.value_semantics.rule_of_zero_five.lesson", skill_id: "cpp.value_semantics.rule_of_zero_five", is_primary: true },
  { learning_item_id: "cpp.value_semantics.rule_of_zero_five.mc_zero", skill_id: "cpp.value_semantics.rule_of_zero_five", is_primary: true },
  { learning_item_id: "cpp.value_semantics.special_members.lesson", skill_id: "cpp.value_semantics.special_members", is_primary: true },
  { learning_item_id: "cpp.value_semantics.special_members.mc_which", skill_id: "cpp.value_semantics.special_members", is_primary: true },
  { learning_item_id: "cpp.value_semantics.copy_elision.lesson", skill_id: "cpp.value_semantics.copy_elision", is_primary: true },
  { learning_item_id: "cpp.value_semantics.copy_elision.mc_return", skill_id: "cpp.value_semantics.copy_elision", is_primary: true },
  { learning_item_id: "cpp.value_semantics.operators.lesson", skill_id: "cpp.value_semantics.operators", is_primary: true },
  { learning_item_id: "cpp.value_semantics.operators.mc_explicit", skill_id: "cpp.value_semantics.operators", is_primary: true },
  { learning_item_id: "cpp.value_semantics.self_assignment.lesson", skill_id: "cpp.value_semantics.self_assignment", is_primary: true },
  { learning_item_id: "cpp.value_semantics.self_assignment.mc_guard", skill_id: "cpp.value_semantics.self_assignment", is_primary: true },
  { learning_item_id: "cpp.value_semantics.deep_copy.lesson", skill_id: "cpp.value_semantics.deep_copy", is_primary: true },
  { learning_item_id: "cpp.value_semantics.deep_copy.bug_double_free", skill_id: "cpp.value_semantics.deep_copy", is_primary: true },
  { learning_item_id: "cpp.value_semantics.stream_insertion.lesson", skill_id: "cpp.value_semantics.stream_insertion", is_primary: true },
  { learning_item_id: "cpp.value_semantics.stream_insertion.mc_signature", skill_id: "cpp.value_semantics.stream_insertion", is_primary: true },
  { learning_item_id: "cpp.value_semantics.move.lesson", skill_id: "cpp.smart_pointers.ownership_transfer", is_primary: false },
  { learning_item_id: "cpp.raii.resource_lifetime.lesson", skill_id: "cpp.raii.resource_lifetime", is_primary: true },
  { learning_item_id: "cpp.raii.resource_lifetime.mc_ties", skill_id: "cpp.raii.resource_lifetime", is_primary: true },
  { learning_item_id: "cpp.raii.destructor_cleanup.code_reading", skill_id: "cpp.raii.destructor_cleanup", is_primary: true },
  { learning_item_id: "cpp.raii.destructor_cleanup.mc_where", skill_id: "cpp.raii.destructor_cleanup", is_primary: true },
  { learning_item_id: "cpp.raii.destructor_cleanup.code_reading", skill_id: "cpp.constructors.destructor_intro", is_primary: false },
  { learning_item_id: "cpp.raii.exception_safety_intro.concept", skill_id: "cpp.raii.exception_safety_intro", is_primary: true },
  { learning_item_id: "cpp.raii.exception_safety_intro.mc_unwind", skill_id: "cpp.raii.exception_safety_intro", is_primary: true },
  { learning_item_id: "cpp.raii.ownership_boundary.bug_double_free", skill_id: "cpp.raii.ownership_boundary", is_primary: true },
  { learning_item_id: "cpp.raii.ownership_boundary.mc_owners", skill_id: "cpp.raii.ownership_boundary", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.unique_ptr.lesson", skill_id: "cpp.smart_pointers.unique_ptr", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.unique_ptr.mc_no_copy", skill_id: "cpp.smart_pointers.unique_ptr", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.shared_ptr.lesson", skill_id: "cpp.smart_pointers.shared_ptr", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.shared_ptr.mc_free", skill_id: "cpp.smart_pointers.shared_ptr", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.weak_ptr.code_reading", skill_id: "cpp.smart_pointers.weak_ptr", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.weak_ptr.mc_count", skill_id: "cpp.smart_pointers.weak_ptr", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.cyclic_reference.bug_cycle", skill_id: "cpp.smart_pointers.cyclic_reference", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.cyclic_reference.bug_cycle", skill_id: "cpp.smart_pointers.weak_ptr", is_primary: false },
  { learning_item_id: "cpp.smart_pointers.cyclic_reference.mc_break", skill_id: "cpp.smart_pointers.cyclic_reference", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.ownership_choice.lesson", skill_id: "cpp.smart_pointers.ownership_choice", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.ownership_choice.mc_simplest", skill_id: "cpp.smart_pointers.ownership_choice", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.ownership_transfer.mc_moved_from", skill_id: "cpp.smart_pointers.ownership_transfer", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.ownership_transfer.bug_use_after_move", skill_id: "cpp.smart_pointers.ownership_transfer", is_primary: true },
  { learning_item_id: "cpp.smart_pointers.ownership_transfer.bug_use_after_move", skill_id: "cpp.smart_pointers.unique_ptr", is_primary: false },
  { learning_item_id: "cpp.stl.vector.lesson", skill_id: "cpp.stl.vector", is_primary: true },
  { learning_item_id: "cpp.stl.vector.mc_at", skill_id: "cpp.stl.vector", is_primary: true },
  { learning_item_id: "cpp.stl.string.code_reading", skill_id: "cpp.stl.string", is_primary: true },
  { learning_item_id: "cpp.stl.string.mc_size", skill_id: "cpp.stl.string", is_primary: true },
  { learning_item_id: "cpp.stl.map.lesson", skill_id: "cpp.stl.map", is_primary: true },
  { learning_item_id: "cpp.stl.map.mc_check_key", skill_id: "cpp.stl.map", is_primary: true },
  { learning_item_id: "cpp.stl.set.lesson", skill_id: "cpp.stl.set", is_primary: true },
  { learning_item_id: "cpp.stl.set.mc_insert_dup", skill_id: "cpp.stl.set", is_primary: true },
  { learning_item_id: "cpp.stl.algorithms.lesson", skill_id: "cpp.stl.algorithms", is_primary: true },
  { learning_item_id: "cpp.stl.algorithms.mc_sort", skill_id: "cpp.stl.algorithms", is_primary: true },
  { learning_item_id: "cpp.stl.iterators.lesson", skill_id: "cpp.stl.iterators", is_primary: true },
  { learning_item_id: "cpp.stl.iterators.mc_end", skill_id: "cpp.stl.iterators", is_primary: true },
  { learning_item_id: "cpp.stl.algorithms.lesson", skill_id: "cpp.stl.iterators", is_primary: false },
  { learning_item_id: "cpp.stl.adapters.lesson", skill_id: "cpp.stl.adapters", is_primary: true },
  { learning_item_id: "cpp.stl.adapters.mc_lifo", skill_id: "cpp.stl.adapters", is_primary: true },
  { learning_item_id: "cpp.stl.lambdas.lesson", skill_id: "cpp.stl.lambdas", is_primary: true },
  { learning_item_id: "cpp.stl.lambdas.mc_capture", skill_id: "cpp.stl.lambdas", is_primary: true },
  { learning_item_id: "cpp.stl.lambdas.lesson", skill_id: "cpp.stl.algorithms", is_primary: false },
  { learning_item_id: "cpp.templates.function_templates.lesson", skill_id: "cpp.templates.function_templates", is_primary: true },
  { learning_item_id: "cpp.templates.function_templates.mc_purpose", skill_id: "cpp.templates.function_templates", is_primary: true },
  { learning_item_id: "cpp.templates.class_templates.lesson", skill_id: "cpp.templates.class_templates", is_primary: true },
  { learning_item_id: "cpp.templates.class_templates.mc_vector", skill_id: "cpp.templates.class_templates", is_primary: true },
  { learning_item_id: "cpp.templates.concepts.lesson", skill_id: "cpp.templates.concepts", is_primary: true },
  { learning_item_id: "cpp.templates.concepts.mc_role", skill_id: "cpp.templates.concepts", is_primary: true },
  { learning_item_id: "cpp.templates.ranges.lesson", skill_id: "cpp.templates.ranges", is_primary: true },
  { learning_item_id: "cpp.templates.ranges.mc_views", skill_id: "cpp.templates.ranges", is_primary: true },
  { learning_item_id: "cpp.templates.constexpr.lesson", skill_id: "cpp.templates.constexpr", is_primary: true },
  { learning_item_id: "cpp.templates.constexpr.mc_eval", skill_id: "cpp.templates.constexpr", is_primary: true },
  { learning_item_id: "cpp.templates.if_constexpr.lesson", skill_id: "cpp.templates.if_constexpr", is_primary: true },
  { learning_item_id: "cpp.templates.if_constexpr.mc_discarded", skill_id: "cpp.templates.if_constexpr", is_primary: true },
  { learning_item_id: "cpp.templates.static_assert.lesson", skill_id: "cpp.templates.static_assert", is_primary: true },
  { learning_item_id: "cpp.templates.static_assert.mc_when", skill_id: "cpp.templates.static_assert", is_primary: true },
  { learning_item_id: "cpp.templates.multiple_params.lesson", skill_id: "cpp.templates.multiple_params", is_primary: true },
  { learning_item_id: "cpp.templates.multiple_params.mc_nttp", skill_id: "cpp.templates.multiple_params", is_primary: true },
  { learning_item_id: "cpp.templates.deduction.lesson", skill_id: "cpp.templates.deduction", is_primary: true },
  { learning_item_id: "cpp.templates.deduction.mc_headers", skill_id: "cpp.templates.deduction", is_primary: true },
  { learning_item_id: "cpp.templates.aliases_specialization.lesson", skill_id: "cpp.templates.aliases_specialization", is_primary: true },
  { learning_item_id: "cpp.templates.aliases_specialization.mc_alias", skill_id: "cpp.templates.aliases_specialization", is_primary: true },
  { learning_item_id: "cpp.templates.class_templates.mc_vector", skill_id: "cpp.stl.vector", is_primary: false },
  { learning_item_id: "cpp.tooling.error_handling.lesson", skill_id: "cpp.tooling.error_handling", is_primary: true },
  { learning_item_id: "cpp.tooling.error_handling.mc_unwind", skill_id: "cpp.tooling.error_handling", is_primary: true },
  { learning_item_id: "cpp.tooling.testing.lesson", skill_id: "cpp.tooling.testing", is_primary: true },
  { learning_item_id: "cpp.tooling.testing.mc_regression", skill_id: "cpp.tooling.testing", is_primary: true },
  { learning_item_id: "cpp.tooling.debugging.lesson", skill_id: "cpp.tooling.debugging", is_primary: true },
  { learning_item_id: "cpp.tooling.debugging.mc_firststep", skill_id: "cpp.tooling.debugging", is_primary: true },
  { learning_item_id: "cpp.tooling.build.lesson", skill_id: "cpp.tooling.build", is_primary: true },
  { learning_item_id: "cpp.tooling.build.mc_linkstage", skill_id: "cpp.tooling.build", is_primary: true },
  { learning_item_id: "cpp.tooling.warnings.lesson", skill_id: "cpp.tooling.warnings", is_primary: true },
  { learning_item_id: "cpp.tooling.warnings.mc_werror", skill_id: "cpp.tooling.warnings", is_primary: true },
  { learning_item_id: "cpp.tooling.sanitizers.lesson", skill_id: "cpp.tooling.sanitizers", is_primary: true },
  { learning_item_id: "cpp.tooling.sanitizers.mc_asan", skill_id: "cpp.tooling.sanitizers", is_primary: true },
  { learning_item_id: "cpp.tooling.cmake.lesson", skill_id: "cpp.tooling.cmake", is_primary: true },
  { learning_item_id: "cpp.tooling.cmake.mc_link", skill_id: "cpp.tooling.cmake", is_primary: true },
  { learning_item_id: "cpp.tooling.preconditions.lesson", skill_id: "cpp.tooling.preconditions", is_primary: true },
  { learning_item_id: "cpp.tooling.preconditions.mc_assert", skill_id: "cpp.tooling.preconditions", is_primary: true },
  { learning_item_id: "cpp.tooling.optional_expected.lesson", skill_id: "cpp.tooling.optional_expected", is_primary: true },
  { learning_item_id: "cpp.tooling.optional_expected.mc_choose", skill_id: "cpp.tooling.optional_expected", is_primary: true },
  { learning_item_id: "cpp.tooling.error_strategy.lesson", skill_id: "cpp.tooling.error_strategy", is_primary: true },
  { learning_item_id: "cpp.tooling.error_strategy.mc_controlflow", skill_id: "cpp.tooling.error_strategy", is_primary: true },
  { learning_item_id: "cpp.tooling.error_handling.lesson", skill_id: "cpp.raii.exception_safety_intro", is_primary: false },
  { learning_item_id: "dsa.complexity.big_o.lesson", skill_id: "dsa.complexity.big_o", is_primary: true },
  { learning_item_id: "dsa.complexity.big_o.mc_single_loop", skill_id: "dsa.complexity.big_o", is_primary: true },
  { learning_item_id: "dsa.complexity.problem_solving.lesson", skill_id: "dsa.complexity.problem_solving", is_primary: true },
  { learning_item_id: "dsa.complexity.problem_solving.mc_first_step", skill_id: "dsa.complexity.problem_solving", is_primary: true },
  { learning_item_id: "dsa.complexity.growth_rates.lesson", skill_id: "dsa.complexity.growth_rates", is_primary: true },
  { learning_item_id: "dsa.complexity.growth_rates.mc_order", skill_id: "dsa.complexity.growth_rates", is_primary: true },
  { learning_item_id: "dsa.complexity.amortized.lesson", skill_id: "dsa.complexity.amortized", is_primary: true },
  { learning_item_id: "dsa.complexity.amortized.mc_pushback", skill_id: "dsa.complexity.amortized", is_primary: true },
  { learning_item_id: "dsa.complexity.constraints.lesson", skill_id: "dsa.complexity.constraints", is_primary: true },
  { learning_item_id: "dsa.complexity.constraints.mc_feasible", skill_id: "dsa.complexity.constraints", is_primary: true },
  { learning_item_id: "dsa.complexity.pattern_recognition.lesson", skill_id: "dsa.complexity.pattern_recognition", is_primary: true },
  { learning_item_id: "dsa.complexity.pattern_recognition.mc_window", skill_id: "dsa.complexity.pattern_recognition", is_primary: true },
  { learning_item_id: "dsa.complexity.container_selection.lesson", skill_id: "dsa.complexity.container_selection", is_primary: true },
  { learning_item_id: "dsa.complexity.container_selection.mc_membership", skill_id: "dsa.complexity.container_selection", is_primary: true },
  { learning_item_id: "dsa.complexity.recursion_choice.lesson", skill_id: "dsa.complexity.recursion_choice", is_primary: true },
  { learning_item_id: "dsa.complexity.recursion_choice.mc_backtracking", skill_id: "dsa.complexity.recursion_choice", is_primary: true },
  { learning_item_id: "dsa.arrays.indexing.lesson", skill_id: "dsa.arrays.indexing", is_primary: true },
  { learning_item_id: "dsa.arrays.indexing.mc_last_index", skill_id: "dsa.arrays.indexing", is_primary: true },
  { learning_item_id: "dsa.arrays.traversal.code_reading", skill_id: "dsa.arrays.traversal", is_primary: true },
  { learning_item_id: "dsa.arrays.traversal.mc_safe_loop", skill_id: "dsa.arrays.traversal", is_primary: true },
  { learning_item_id: "dsa.arrays.traversal.mc_safe_loop", skill_id: "dsa.arrays.indexing", is_primary: false },
  { learning_item_id: "dsa.searching.binary_search.lesson", skill_id: "dsa.searching.binary_search", is_primary: true },
  { learning_item_id: "dsa.searching.binary_search.mc_precondition", skill_id: "dsa.searching.binary_search", is_primary: true },
  { learning_item_id: "dsa.sorting.comparator.lesson", skill_id: "dsa.sorting.comparator", is_primary: true },
  { learning_item_id: "dsa.sorting.comparator.mc_descending", skill_id: "dsa.sorting.comparator", is_primary: true },
  { learning_item_id: "dsa.searching.binary_search.lesson", skill_id: "dsa.sorting.comparator", is_primary: false },
  { learning_item_id: "dsa.stacks.basic_stack.lesson", skill_id: "dsa.stacks.basic_stack", is_primary: true },
  { learning_item_id: "dsa.stacks.basic_stack.mc_parens", skill_id: "dsa.stacks.basic_stack", is_primary: true },
  { learning_item_id: "dsa.hashing.lookup.lesson", skill_id: "dsa.hashing.lookup", is_primary: true },
  { learning_item_id: "dsa.hashing.lookup.mc_advantage", skill_id: "dsa.hashing.lookup", is_primary: true },
  { learning_item_id: "dsa.arrays.two_pointers.lesson", skill_id: "dsa.arrays.two_pointers", is_primary: true },
  { learning_item_id: "dsa.arrays.two_pointers.mc_complexity", skill_id: "dsa.arrays.two_pointers", is_primary: true },
  { learning_item_id: "dsa.recursion.base_case.lesson", skill_id: "dsa.recursion.base_case", is_primary: true },
  { learning_item_id: "dsa.recursion.base_case.mc_no_base", skill_id: "dsa.recursion.base_case", is_primary: true },
  { learning_item_id: "dsa.trees.linked_list.lesson", skill_id: "dsa.trees.linked_list", is_primary: true },
  { learning_item_id: "dsa.trees.linked_list.mc_access", skill_id: "dsa.trees.linked_list", is_primary: true },
  { learning_item_id: "dsa.trees.list_vs_vector.lesson", skill_id: "dsa.trees.list_vs_vector", is_primary: true },
  { learning_item_id: "dsa.trees.list_vs_vector.mc_default", skill_id: "dsa.trees.list_vs_vector", is_primary: true },
  { learning_item_id: "dsa.trees.tree_terminology.lesson", skill_id: "dsa.trees.tree_terminology", is_primary: true },
  { learning_item_id: "dsa.trees.tree_terminology.mc_height", skill_id: "dsa.trees.tree_terminology", is_primary: true },
  { learning_item_id: "dsa.trees.traversal.lesson", skill_id: "dsa.trees.traversal", is_primary: true },
  { learning_item_id: "dsa.trees.traversal.mc_inorder_bst", skill_id: "dsa.trees.traversal", is_primary: true },
  { learning_item_id: "dsa.trees.heap.lesson", skill_id: "dsa.trees.heap", is_primary: true },
  { learning_item_id: "dsa.trees.heap.mc_top_cost", skill_id: "dsa.trees.heap", is_primary: true },
  { learning_item_id: "dsa.trees.disjoint_set.lesson", skill_id: "dsa.trees.disjoint_set", is_primary: true },
  { learning_item_id: "dsa.trees.disjoint_set.mc_use_case", skill_id: "dsa.trees.disjoint_set", is_primary: true },
  { learning_item_id: "dsa.trees.bst_search.lesson", skill_id: "dsa.trees.bst_search", is_primary: true },
  { learning_item_id: "dsa.trees.bst_search.mc_cost", skill_id: "dsa.trees.bst_search", is_primary: true },
  { learning_item_id: "dsa.trees.heap_applications.lesson", skill_id: "dsa.trees.heap_applications", is_primary: true },
  { learning_item_id: "dsa.trees.heap_applications.mc_topk", skill_id: "dsa.trees.heap_applications", is_primary: true },
  { learning_item_id: "dsa.trees.dsu_internals.lesson", skill_id: "dsa.trees.dsu_internals", is_primary: true },
  { learning_item_id: "dsa.trees.dsu_internals.mc_compression", skill_id: "dsa.trees.dsu_internals", is_primary: true },
  { learning_item_id: "dsa.graphs.representation.lesson", skill_id: "dsa.graphs.representation", is_primary: true },
  { learning_item_id: "dsa.graphs.representation.mc_sparse", skill_id: "dsa.graphs.representation", is_primary: true },
  { learning_item_id: "dsa.graphs.bfs.lesson", skill_id: "dsa.graphs.bfs", is_primary: true },
  { learning_item_id: "dsa.graphs.bfs.mc_shortest", skill_id: "dsa.graphs.bfs", is_primary: true },
  { learning_item_id: "dsa.graphs.dfs.lesson", skill_id: "dsa.graphs.dfs", is_primary: true },
  { learning_item_id: "dsa.graphs.dfs.mc_structure", skill_id: "dsa.graphs.dfs", is_primary: true },
  { learning_item_id: "dsa.graphs.shortest_path.lesson", skill_id: "dsa.graphs.shortest_path", is_primary: true },
  { learning_item_id: "dsa.graphs.shortest_path.mc_dijkstra", skill_id: "dsa.graphs.shortest_path", is_primary: true },
  { learning_item_id: "dsa.graphs.connected_components.lesson", skill_id: "dsa.graphs.connected_components", is_primary: true },
  { learning_item_id: "dsa.graphs.connected_components.mc_count", skill_id: "dsa.graphs.connected_components", is_primary: true },
  { learning_item_id: "dsa.graphs.cycle_detection.lesson", skill_id: "dsa.graphs.cycle_detection", is_primary: true },
  { learning_item_id: "dsa.graphs.cycle_detection.mc_directed", skill_id: "dsa.graphs.cycle_detection", is_primary: true },
  { learning_item_id: "dsa.graphs.topological_sort.lesson", skill_id: "dsa.graphs.topological_sort", is_primary: true },
  { learning_item_id: "dsa.graphs.topological_sort.mc_exists", skill_id: "dsa.graphs.topological_sort", is_primary: true },
  { learning_item_id: "dsa.techniques.prefix_sums.lesson", skill_id: "dsa.techniques.prefix_sums", is_primary: true },
  { learning_item_id: "dsa.techniques.prefix_sums.mc_query", skill_id: "dsa.techniques.prefix_sums", is_primary: true },
  { learning_item_id: "dsa.techniques.sliding_window.lesson", skill_id: "dsa.techniques.sliding_window", is_primary: true },
  { learning_item_id: "dsa.techniques.sliding_window.mc_complexity", skill_id: "dsa.techniques.sliding_window", is_primary: true },
  { learning_item_id: "dsa.techniques.greedy.lesson", skill_id: "dsa.techniques.greedy", is_primary: true },
  { learning_item_id: "dsa.techniques.greedy.mc_fails", skill_id: "dsa.techniques.greedy", is_primary: true },
  { learning_item_id: "dsa.techniques.dynamic_programming.lesson", skill_id: "dsa.techniques.dynamic_programming", is_primary: true },
  { learning_item_id: "dsa.techniques.dynamic_programming.mc_when", skill_id: "dsa.techniques.dynamic_programming", is_primary: true },
  { learning_item_id: "dsa.techniques.range_structures.lesson", skill_id: "dsa.techniques.range_structures", is_primary: true },
  { learning_item_id: "dsa.techniques.range_structures.mc_dynamic", skill_id: "dsa.techniques.range_structures", is_primary: true },
  { learning_item_id: "dsa.techniques.greedy_proof.lesson", skill_id: "dsa.techniques.greedy_proof", is_primary: true },
  { learning_item_id: "dsa.techniques.greedy_proof.mc_exchange", skill_id: "dsa.techniques.greedy_proof", is_primary: true },
  { learning_item_id: "dsa.techniques.dp_design.lesson", skill_id: "dsa.techniques.dp_design", is_primary: true },
  { learning_item_id: "dsa.techniques.dp_design.mc_order", skill_id: "dsa.techniques.dp_design", is_primary: true },
  { learning_item_id: "dsa.strings.manipulation.lesson", skill_id: "dsa.strings.manipulation", is_primary: true },
  { learning_item_id: "dsa.strings.manipulation.mc_concat", skill_id: "dsa.strings.manipulation", is_primary: true },
  { learning_item_id: "dsa.strings.searching.lesson", skill_id: "dsa.strings.searching", is_primary: true },
  { learning_item_id: "dsa.strings.searching.mc_kmp", skill_id: "dsa.strings.searching", is_primary: true },
  { learning_item_id: "dsa.strings.palindrome.lesson", skill_id: "dsa.strings.palindrome", is_primary: true },
  { learning_item_id: "dsa.strings.palindrome.mc_anagram", skill_id: "dsa.strings.palindrome", is_primary: true },
  { learning_item_id: "dsa.strings.parsing.lesson", skill_id: "dsa.strings.parsing", is_primary: true },
  { learning_item_id: "dsa.strings.parsing.mc_delim", skill_id: "dsa.strings.parsing", is_primary: true },
  { learning_item_id: "dsa.strings.prefix_function.lesson", skill_id: "dsa.strings.prefix_function", is_primary: true },
  { learning_item_id: "dsa.strings.prefix_function.mc_value", skill_id: "dsa.strings.prefix_function", is_primary: true },
  { learning_item_id: "dsa.strings.trie.lesson", skill_id: "dsa.strings.trie", is_primary: true },
  { learning_item_id: "dsa.strings.trie.mc_usecase", skill_id: "dsa.strings.trie", is_primary: true },
  { learning_item_id: "dsa.strings.hashing.lesson", skill_id: "dsa.strings.hashing", is_primary: true },
  { learning_item_id: "dsa.strings.hashing.mc_collision", skill_id: "dsa.strings.hashing", is_primary: true },
  { learning_item_id: "cpp.oop.composition.lesson", skill_id: "cpp.oop.composition", is_primary: true },
  { learning_item_id: "cpp.oop.composition.mc_relationship", skill_id: "cpp.oop.composition", is_primary: true },
  { learning_item_id: "cpp.oop.inheritance.lesson", skill_id: "cpp.oop.inheritance", is_primary: true },
  { learning_item_id: "cpp.oop.inheritance.mc_access", skill_id: "cpp.oop.inheritance", is_primary: true },
  { learning_item_id: "cpp.oop.virtual_polymorphism.lesson", skill_id: "cpp.oop.virtual_polymorphism", is_primary: true },
  { learning_item_id: "cpp.oop.virtual_polymorphism.mc_destructor", skill_id: "cpp.oop.virtual_polymorphism", is_primary: true },
  { learning_item_id: "cpp.oop.abstract_interfaces.lesson", skill_id: "cpp.oop.abstract_interfaces", is_primary: true },
  { learning_item_id: "cpp.oop.abstract_interfaces.mc_pure_virtual", skill_id: "cpp.oop.abstract_interfaces", is_primary: true },
  { learning_item_id: "cpp.oop.slicing.lesson", skill_id: "cpp.oop.slicing", is_primary: true },
  { learning_item_id: "cpp.oop.slicing.mc_slice", skill_id: "cpp.oop.slicing", is_primary: true },
  { learning_item_id: "cpp.oop.override_final.lesson", skill_id: "cpp.oop.override_final", is_primary: true },
  { learning_item_id: "cpp.oop.override_final.mc_override", skill_id: "cpp.oop.override_final", is_primary: true },
  { learning_item_id: "cpp.oop.polymorphic_ownership.lesson", skill_id: "cpp.oop.polymorphic_ownership", is_primary: true },
  { learning_item_id: "cpp.oop.polymorphic_ownership.mc_unique", skill_id: "cpp.oop.polymorphic_ownership", is_primary: true },
  { learning_item_id: "cpp.concurrency.threads.lesson", skill_id: "cpp.concurrency.threads", is_primary: true },
  { learning_item_id: "cpp.concurrency.threads.mc_join", skill_id: "cpp.concurrency.threads", is_primary: true },
  { learning_item_id: "cpp.concurrency.data_races.lesson", skill_id: "cpp.concurrency.data_races", is_primary: true },
  { learning_item_id: "cpp.concurrency.data_races.mc_define", skill_id: "cpp.concurrency.data_races", is_primary: true },
  { learning_item_id: "cpp.concurrency.mutexes.lesson", skill_id: "cpp.concurrency.mutexes", is_primary: true },
  { learning_item_id: "cpp.concurrency.mutexes.mc_lock_guard", skill_id: "cpp.concurrency.mutexes", is_primary: true },
  { learning_item_id: "cpp.concurrency.async.lesson", skill_id: "cpp.concurrency.async", is_primary: true },
  { learning_item_id: "cpp.concurrency.async.mc_get", skill_id: "cpp.concurrency.async", is_primary: true },
  { learning_item_id: "cpp.concurrency.deadlock.lesson", skill_id: "cpp.concurrency.deadlock", is_primary: true },
  { learning_item_id: "cpp.concurrency.deadlock.mc_order", skill_id: "cpp.concurrency.deadlock", is_primary: true },
  { learning_item_id: "cpp.concurrency.condition_variables.lesson", skill_id: "cpp.concurrency.condition_variables", is_primary: true },
  { learning_item_id: "cpp.concurrency.condition_variables.mc_predicate", skill_id: "cpp.concurrency.condition_variables", is_primary: true },
  { learning_item_id: "cpp.concurrency.atomics.lesson", skill_id: "cpp.concurrency.atomics", is_primary: true },
  { learning_item_id: "cpp.concurrency.atomics.mc_volatile", skill_id: "cpp.concurrency.atomics", is_primary: true },
  { learning_item_id: "cpp.concurrency.jthread.lesson", skill_id: "cpp.concurrency.jthread", is_primary: true },
  { learning_item_id: "cpp.concurrency.jthread.mc_stop", skill_id: "cpp.concurrency.jthread", is_primary: true },
  { learning_item_id: "cpp.concurrency.promise_future.lesson", skill_id: "cpp.concurrency.promise_future", is_primary: true },
  { learning_item_id: "cpp.concurrency.promise_future.mc_promise", skill_id: "cpp.concurrency.promise_future", is_primary: true },
  { learning_item_id: "cpp.concurrency.task_selection.lesson", skill_id: "cpp.concurrency.task_selection", is_primary: true },
  { learning_item_id: "cpp.concurrency.task_selection.mc_concurrency", skill_id: "cpp.concurrency.task_selection", is_primary: true },
  { learning_item_id: "cpp.utilities.file_io.lesson", skill_id: "cpp.utilities.file_io", is_primary: true },
  { learning_item_id: "cpp.utilities.file_io.mc_exists", skill_id: "cpp.utilities.file_io", is_primary: true },
  { learning_item_id: "cpp.utilities.chrono.lesson", skill_id: "cpp.utilities.chrono", is_primary: true },
  { learning_item_id: "cpp.utilities.chrono.mc_clock", skill_id: "cpp.utilities.chrono", is_primary: true },
  { learning_item_id: "cpp.utilities.random.lesson", skill_id: "cpp.utilities.random", is_primary: true },
  { learning_item_id: "cpp.utilities.random.mc_bias", skill_id: "cpp.utilities.random", is_primary: true },
  { learning_item_id: "cpp.utilities.variant.lesson", skill_id: "cpp.utilities.variant", is_primary: true },
  { learning_item_id: "cpp.utilities.variant.mc_optional", skill_id: "cpp.utilities.variant", is_primary: true },
  { learning_item_id: "cpp.utilities.stream_validation.lesson", skill_id: "cpp.utilities.stream_validation", is_primary: true },
  { learning_item_id: "cpp.utilities.stream_validation.mc_recover", skill_id: "cpp.utilities.stream_validation", is_primary: true },
  { learning_item_id: "cpp.utilities.tuples.lesson", skill_id: "cpp.utilities.tuples", is_primary: true },
  { learning_item_id: "cpp.utilities.tuples.mc_bind", skill_id: "cpp.utilities.tuples", is_primary: true },
  { learning_item_id: "cpp.utilities.enums.lesson", skill_id: "cpp.utilities.enums", is_primary: true },
  { learning_item_id: "cpp.utilities.enums.mc_choose", skill_id: "cpp.utilities.enums", is_primary: true },
  { learning_item_id: "dsa.math.bit_manipulation.lesson", skill_id: "dsa.math.bit_manipulation", is_primary: true },
  { learning_item_id: "dsa.math.bit_manipulation.mc_test_bit", skill_id: "dsa.math.bit_manipulation", is_primary: true },
  { learning_item_id: "dsa.math.number_theory.lesson", skill_id: "dsa.math.number_theory", is_primary: true },
  { learning_item_id: "dsa.math.number_theory.mc_gcd", skill_id: "dsa.math.number_theory", is_primary: true },
  { learning_item_id: "dsa.math.combinatorics.lesson", skill_id: "dsa.math.combinatorics", is_primary: true },
  { learning_item_id: "dsa.math.combinatorics.mc_committee", skill_id: "dsa.math.combinatorics", is_primary: true },
  { learning_item_id: "dsa.math.geometry.lesson", skill_id: "dsa.math.geometry", is_primary: true },
  { learning_item_id: "dsa.math.geometry.mc_cross", skill_id: "dsa.math.geometry", is_primary: true },
  { learning_item_id: "dsa.math.bitmask_techniques.lesson", skill_id: "dsa.math.bitmask_techniques", is_primary: true },
  { learning_item_id: "dsa.math.bitmask_techniques.mc_submask", skill_id: "dsa.math.bitmask_techniques", is_primary: true },
  { learning_item_id: "dsa.math.sieve.lesson", skill_id: "dsa.math.sieve", is_primary: true },
  { learning_item_id: "dsa.math.sieve.mc_trial", skill_id: "dsa.math.sieve", is_primary: true },
  { learning_item_id: "dsa.math.modular_arithmetic.lesson", skill_id: "dsa.math.modular_arithmetic", is_primary: true },
  { learning_item_id: "dsa.math.modular_arithmetic.mc_fastpow", skill_id: "dsa.math.modular_arithmetic", is_primary: true },
  { learning_item_id: "dsa.arrays.two_pointers.mc_complexity", skill_id: "dsa.sorting.comparator", is_primary: false }
];

export const learningItemChoices: LearningItemChoice[] = [
  { id: "cpp.program_basics.structure.mc_entry.a", learning_item_id: "cpp.program_basics.structure.mc_entry", content: "The main() function", is_correct: true, order_index: 10 },
  { id: "cpp.program_basics.structure.mc_entry.b", learning_item_id: "cpp.program_basics.structure.mc_entry", content: "The first #include line", is_correct: false, order_index: 20 },
  { id: "cpp.program_basics.structure.mc_entry.c", learning_item_id: "cpp.program_basics.structure.mc_entry", content: "The first line of the file", is_correct: false, order_index: 30 },
  { id: "cpp.program_basics.structure.mc_entry.d", learning_item_id: "cpp.program_basics.structure.mc_entry", content: "Any function named start()", is_correct: false, order_index: 40 },

  { id: "cpp.program_basics.io.mc_read.a", learning_item_id: "cpp.program_basics.io.mc_read", content: "std::cin >> x;", is_correct: true, order_index: 10 },
  { id: "cpp.program_basics.io.mc_read.b", learning_item_id: "cpp.program_basics.io.mc_read", content: "std::cout << x;", is_correct: false, order_index: 20 },
  { id: "cpp.program_basics.io.mc_read.c", learning_item_id: "cpp.program_basics.io.mc_read", content: "std::read(x);", is_correct: false, order_index: 30 },
  { id: "cpp.program_basics.io.mc_read.d", learning_item_id: "cpp.program_basics.io.mc_read", content: "std::cin << x;", is_correct: false, order_index: 40 },

  { id: "cpp.program_basics.statements_comments.mc_terminate.a", learning_item_id: "cpp.program_basics.statements_comments.mc_terminate", content: "A semicolon ;", is_correct: true, order_index: 10 },
  { id: "cpp.program_basics.statements_comments.mc_terminate.b", learning_item_id: "cpp.program_basics.statements_comments.mc_terminate", content: "A period .", is_correct: false, order_index: 20 },
  { id: "cpp.program_basics.statements_comments.mc_terminate.c", learning_item_id: "cpp.program_basics.statements_comments.mc_terminate", content: "A newline", is_correct: false, order_index: 30 },
  { id: "cpp.program_basics.statements_comments.mc_terminate.d", learning_item_id: "cpp.program_basics.statements_comments.mc_terminate", content: "A closing brace }", is_correct: false, order_index: 40 },

  { id: "cpp.program_basics.exit_status.mc_success.a", learning_item_id: "cpp.program_basics.exit_status.mc_success", content: "The program finished successfully", is_correct: true, order_index: 10 },
  { id: "cpp.program_basics.exit_status.mc_success.b", learning_item_id: "cpp.program_basics.exit_status.mc_success", content: "The program crashed", is_correct: false, order_index: 20 },
  { id: "cpp.program_basics.exit_status.mc_success.c", learning_item_id: "cpp.program_basics.exit_status.mc_success", content: "main() printed zero", is_correct: false, order_index: 30 },
  { id: "cpp.program_basics.exit_status.mc_success.d", learning_item_id: "cpp.program_basics.exit_status.mc_success", content: "The program will restart", is_correct: false, order_index: 40 },

  { id: "cpp.program_basics.error_kinds.mc_classify.a", learning_item_id: "cpp.program_basics.error_kinds.mc_classify", content: "At link time (unresolved symbol)", is_correct: true, order_index: 10 },
  { id: "cpp.program_basics.error_kinds.mc_classify.b", learning_item_id: "cpp.program_basics.error_kinds.mc_classify", content: "At compile time", is_correct: false, order_index: 20 },
  { id: "cpp.program_basics.error_kinds.mc_classify.c", learning_item_id: "cpp.program_basics.error_kinds.mc_classify", content: "At run time", is_correct: false, order_index: 30 },
  { id: "cpp.program_basics.error_kinds.mc_classify.d", learning_item_id: "cpp.program_basics.error_kinds.mc_classify", content: "It never fails", is_correct: false, order_index: 40 },

  { id: "cpp.values_types.variables.mc_auto.a", learning_item_id: "cpp.values_types.variables.mc_auto", content: "double", is_correct: true, order_index: 10 },
  { id: "cpp.values_types.variables.mc_auto.b", learning_item_id: "cpp.values_types.variables.mc_auto", content: "int", is_correct: false, order_index: 20 },
  { id: "cpp.values_types.variables.mc_auto.c", learning_item_id: "cpp.values_types.variables.mc_auto", content: "float", is_correct: false, order_index: 30 },
  { id: "cpp.values_types.variables.mc_auto.d", learning_item_id: "cpp.values_types.variables.mc_auto", content: "auto is not a real type here", is_correct: false, order_index: 40 },

  { id: "cpp.values_types.conversions.mc_static_cast.a", learning_item_id: "cpp.values_types.conversions.mc_static_cast", content: "3 (truncated toward zero)", is_correct: true, order_index: 10 },
  { id: "cpp.values_types.conversions.mc_static_cast.b", learning_item_id: "cpp.values_types.conversions.mc_static_cast", content: "4 (rounded)", is_correct: false, order_index: 20 },
  { id: "cpp.values_types.conversions.mc_static_cast.c", learning_item_id: "cpp.values_types.conversions.mc_static_cast", content: "3.9 (unchanged)", is_correct: false, order_index: 30 },
  { id: "cpp.values_types.conversions.mc_static_cast.d", learning_item_id: "cpp.values_types.conversions.mc_static_cast", content: "a compile error", is_correct: false, order_index: 40 },

  { id: "cpp.values_types.fundamental_types.mc_money.a", learning_item_id: "cpp.values_types.fundamental_types.mc_money", content: "double is binary floating point, so decimals like 0.10 are approximate and drift", is_correct: true, order_index: 10 },
  { id: "cpp.values_types.fundamental_types.mc_money.b", learning_item_id: "cpp.values_types.fundamental_types.mc_money", content: "double cannot hold numbers below 1.0", is_correct: false, order_index: 20 },
  { id: "cpp.values_types.fundamental_types.mc_money.c", learning_item_id: "cpp.values_types.fundamental_types.mc_money", content: "double is slower than int for all programs", is_correct: false, order_index: 30 },
  { id: "cpp.values_types.fundamental_types.mc_money.d", learning_item_id: "cpp.values_types.fundamental_types.mc_money", content: "double rounds every value to two decimal places", is_correct: false, order_index: 40 },

  { id: "cpp.values_types.signed_unsigned.mc_compare.a", learning_item_id: "cpp.values_types.signed_unsigned.mc_compare", content: "false (the signed -1 converts to a large unsigned value)", is_correct: true, order_index: 10 },
  { id: "cpp.values_types.signed_unsigned.mc_compare.b", learning_item_id: "cpp.values_types.signed_unsigned.mc_compare", content: "true (-1 is less than 1)", is_correct: false, order_index: 20 },
  { id: "cpp.values_types.signed_unsigned.mc_compare.c", learning_item_id: "cpp.values_types.signed_unsigned.mc_compare", content: "It is a compile error", is_correct: false, order_index: 30 },
  { id: "cpp.values_types.signed_unsigned.mc_compare.d", learning_item_id: "cpp.values_types.signed_unsigned.mc_compare", content: "It throws an exception at run time", is_correct: false, order_index: 40 },

  { id: "cpp.values_types.literals.mc_intdiv.a", learning_item_id: "cpp.values_types.literals.mc_intdiv", content: "3", is_correct: true, order_index: 10 },
  { id: "cpp.values_types.literals.mc_intdiv.b", learning_item_id: "cpp.values_types.literals.mc_intdiv", content: "3.5", is_correct: false, order_index: 20 },
  { id: "cpp.values_types.literals.mc_intdiv.c", learning_item_id: "cpp.values_types.literals.mc_intdiv", content: "4", is_correct: false, order_index: 30 },
  { id: "cpp.values_types.literals.mc_intdiv.d", learning_item_id: "cpp.values_types.literals.mc_intdiv", content: "2", is_correct: false, order_index: 40 },

  { id: "cpp.control_flow.conditionals.mc_fallthrough.a", learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", content: "Execution falls through into the next case", is_correct: true, order_index: 10 },
  { id: "cpp.control_flow.conditionals.mc_fallthrough.b", learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", content: "It is a compile error", is_correct: false, order_index: 20 },
  { id: "cpp.control_flow.conditionals.mc_fallthrough.c", learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", content: "Nothing; break is automatic", is_correct: false, order_index: 30 },
  { id: "cpp.control_flow.conditionals.mc_fallthrough.d", learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", content: "The program crashes at runtime", is_correct: false, order_index: 40 },

  { id: "cpp.control_flow.loops.mc_offbyone.a", learning_item_id: "cpp.control_flow.loops.mc_offbyone", content: "i < n", is_correct: true, order_index: 10 },
  { id: "cpp.control_flow.loops.mc_offbyone.b", learning_item_id: "cpp.control_flow.loops.mc_offbyone", content: "i <= n", is_correct: false, order_index: 20 },
  { id: "cpp.control_flow.loops.mc_offbyone.c", learning_item_id: "cpp.control_flow.loops.mc_offbyone", content: "i < n - 1", is_correct: false, order_index: 30 },
  { id: "cpp.control_flow.loops.mc_offbyone.d", learning_item_id: "cpp.control_flow.loops.mc_offbyone", content: "i != n + 1", is_correct: false, order_index: 40 },

  { id: "cpp.control_flow.logical_operators.mc_shortcircuit.a", learning_item_id: "cpp.control_flow.logical_operators.mc_shortcircuit", content: "&& short-circuits, so p->ready is not evaluated when p != nullptr is false", is_correct: true, order_index: 10 },
  { id: "cpp.control_flow.logical_operators.mc_shortcircuit.b", learning_item_id: "cpp.control_flow.logical_operators.mc_shortcircuit", content: "Both sides always evaluate, but null dereference is allowed", is_correct: false, order_index: 20 },
  { id: "cpp.control_flow.logical_operators.mc_shortcircuit.c", learning_item_id: "cpp.control_flow.logical_operators.mc_shortcircuit", content: "The compiler reorders the checks automatically", is_correct: false, order_index: 30 },
  { id: "cpp.control_flow.logical_operators.mc_shortcircuit.d", learning_item_id: "cpp.control_flow.logical_operators.mc_shortcircuit", content: "!= binds tighter so the null is ignored", is_correct: false, order_index: 40 },

  { id: "cpp.control_flow.switch_statement.mc_nobreak.a", learning_item_id: "cpp.control_flow.switch_statement.mc_nobreak", content: "Execution falls through into the following case(s)", is_correct: true, order_index: 10 },
  { id: "cpp.control_flow.switch_statement.mc_nobreak.b", learning_item_id: "cpp.control_flow.switch_statement.mc_nobreak", content: "Only the matched case runs; break is optional", is_correct: false, order_index: 20 },
  { id: "cpp.control_flow.switch_statement.mc_nobreak.c", learning_item_id: "cpp.control_flow.switch_statement.mc_nobreak", content: "The program fails to compile", is_correct: false, order_index: 30 },
  { id: "cpp.control_flow.switch_statement.mc_nobreak.d", learning_item_id: "cpp.control_flow.switch_statement.mc_nobreak", content: "It jumps to default", is_correct: false, order_index: 40 },

  { id: "cpp.control_flow.loop_invariants.mc_halfopen.a", learning_item_id: "cpp.control_flow.loop_invariants.mc_halfopen", content: "[0, n)", is_correct: true, order_index: 10 },
  { id: "cpp.control_flow.loop_invariants.mc_halfopen.b", learning_item_id: "cpp.control_flow.loop_invariants.mc_halfopen", content: "[0, n]", is_correct: false, order_index: 20 },
  { id: "cpp.control_flow.loop_invariants.mc_halfopen.c", learning_item_id: "cpp.control_flow.loop_invariants.mc_halfopen", content: "[1, n]", is_correct: false, order_index: 30 },
  { id: "cpp.control_flow.loop_invariants.mc_halfopen.d", learning_item_id: "cpp.control_flow.loop_invariants.mc_halfopen", content: "[1, n + 1)", is_correct: false, order_index: 40 },

  { id: "cpp.functions.basics.mc_scope.a", learning_item_id: "cpp.functions.basics.mc_scope", content: "Local to that function (and its blocks)", is_correct: true, order_index: 10 },
  { id: "cpp.functions.basics.mc_scope.b", learning_item_id: "cpp.functions.basics.mc_scope", content: "Global to the whole program", is_correct: false, order_index: 20 },
  { id: "cpp.functions.basics.mc_scope.c", learning_item_id: "cpp.functions.basics.mc_scope", content: "Visible to every function in the file", is_correct: false, order_index: 30 },
  { id: "cpp.functions.basics.mc_scope.d", learning_item_id: "cpp.functions.basics.mc_scope", content: "Shared with the caller automatically", is_correct: false, order_index: 40 },

  { id: "cpp.functions.decomposition.mc_why.a", learning_item_id: "cpp.functions.decomposition.mc_why", content: "Readability, testability, and reuse", is_correct: true, order_index: 10 },
  { id: "cpp.functions.decomposition.mc_why.b", learning_item_id: "cpp.functions.decomposition.mc_why", content: "It always makes the program run faster", is_correct: false, order_index: 20 },
  { id: "cpp.functions.decomposition.mc_why.c", learning_item_id: "cpp.functions.decomposition.mc_why", content: "C++ requires functions under 10 lines", is_correct: false, order_index: 30 },
  { id: "cpp.functions.decomposition.mc_why.d", learning_item_id: "cpp.functions.decomposition.mc_why", content: "It uses more memory", is_correct: false, order_index: 40 },

  { id: "cpp.references.references.mc_init.a", learning_item_id: "cpp.references.references.mc_init", content: "It must be initialized with an existing object", is_correct: true, order_index: 10 },
  { id: "cpp.references.references.mc_init.b", learning_item_id: "cpp.references.references.mc_init", content: "It must be left null until assigned", is_correct: false, order_index: 20 },
  { id: "cpp.references.references.mc_init.c", learning_item_id: "cpp.references.references.mc_init", content: "It must be created with new", is_correct: false, order_index: 30 },
  { id: "cpp.references.references.mc_init.d", learning_item_id: "cpp.references.references.mc_init", content: "Nothing; references default to 0", is_correct: false, order_index: 40 },

  { id: "cpp.references.pointers.mc_null.a", learning_item_id: "cpp.references.pointers.mc_null", content: "Undefined behavior (typically a crash)", is_correct: true, order_index: 10 },
  { id: "cpp.references.pointers.mc_null.b", learning_item_id: "cpp.references.pointers.mc_null", content: "It safely returns 0", is_correct: false, order_index: 20 },
  { id: "cpp.references.pointers.mc_null.c", learning_item_id: "cpp.references.pointers.mc_null", content: "It returns nullptr", is_correct: false, order_index: 30 },
  { id: "cpp.references.pointers.mc_null.d", learning_item_id: "cpp.references.pointers.mc_null", content: "It is always a compile error", is_correct: false, order_index: 40 },

  { id: "cpp.references.const_correctness.mc_constref.a", learning_item_id: "cpp.references.const_correctness.mc_constref", content: "Read s without copying, and not modify it", is_correct: true, order_index: 10 },
  { id: "cpp.references.const_correctness.mc_constref.b", learning_item_id: "cpp.references.const_correctness.mc_constref", content: "Modify the caller's string in place", is_correct: false, order_index: 20 },
  { id: "cpp.references.const_correctness.mc_constref.c", learning_item_id: "cpp.references.const_correctness.mc_constref", content: "Make a private copy of s", is_correct: false, order_index: 30 },
  { id: "cpp.references.const_correctness.mc_constref.d", learning_item_id: "cpp.references.const_correctness.mc_constref", content: "Reseat s to another string", is_correct: false, order_index: 40 },

  { id: "cpp.references.parameter_passing.mc_large.a", learning_item_id: "cpp.references.parameter_passing.mc_large", content: "By const reference (const std::vector<int>&)", is_correct: true, order_index: 10 },
  { id: "cpp.references.parameter_passing.mc_large.b", learning_item_id: "cpp.references.parameter_passing.mc_large", content: "By value (std::vector<int>)", is_correct: false, order_index: 20 },
  { id: "cpp.references.parameter_passing.mc_large.c", learning_item_id: "cpp.references.parameter_passing.mc_large", content: "By non-const reference (std::vector<int>&)", is_correct: false, order_index: 30 },
  { id: "cpp.references.parameter_passing.mc_large.d", learning_item_id: "cpp.references.parameter_passing.mc_large", content: "By raw pointer to non-const", is_correct: false, order_index: 40 },

  { id: "cpp.references.lvalue_rvalue.mc_classify.a", learning_item_id: "cpp.references.lvalue_rvalue.mc_classify", content: "x + 2", is_correct: true, order_index: 10 },
  { id: "cpp.references.lvalue_rvalue.mc_classify.b", learning_item_id: "cpp.references.lvalue_rvalue.mc_classify", content: "x", is_correct: false, order_index: 20 },
  { id: "cpp.references.lvalue_rvalue.mc_classify.c", learning_item_id: "cpp.references.lvalue_rvalue.mc_classify", content: "y", is_correct: false, order_index: 30 },
  { id: "cpp.references.lvalue_rvalue.mc_classify.d", learning_item_id: "cpp.references.lvalue_rvalue.mc_classify", content: "The variable named x after assignment", is_correct: false, order_index: 40 },

  { id: "cpp.references.return_semantics.mc_local.a", learning_item_id: "cpp.references.return_semantics.mc_local", content: "It returns a reference to a local that is destroyed when f returns (dangling)", is_correct: true, order_index: 10 },
  { id: "cpp.references.return_semantics.mc_local.b", learning_item_id: "cpp.references.return_semantics.mc_local", content: "Nothing — it is correct and idiomatic", is_correct: false, order_index: 20 },
  { id: "cpp.references.return_semantics.mc_local.c", learning_item_id: "cpp.references.return_semantics.mc_local", content: "It copies the int unnecessarily", is_correct: false, order_index: 30 },
  { id: "cpp.references.return_semantics.mc_local.d", learning_item_id: "cpp.references.return_semantics.mc_local", content: "It fails to compile", is_correct: false, order_index: 40 },

  { id: "cpp.references.dangling.mc_extension.a", learning_item_id: "cpp.references.dangling.mc_extension", content: "No — lifetime extension does not survive the return, so it dangles", is_correct: true, order_index: 10 },
  { id: "cpp.references.dangling.mc_extension.b", learning_item_id: "cpp.references.dangling.mc_extension", content: "Yes — the const reference keeps the temporary alive for the caller", is_correct: false, order_index: 20 },
  { id: "cpp.references.dangling.mc_extension.c", learning_item_id: "cpp.references.dangling.mc_extension", content: "Yes — string literals live forever", is_correct: false, order_index: 30 },
  { id: "cpp.references.dangling.mc_extension.d", learning_item_id: "cpp.references.dangling.mc_extension", content: "Only if the caller marks the result const", is_correct: false, order_index: 40 },

  { id: "cpp.references.pointer_const.mc_which.a", learning_item_id: "cpp.references.pointer_const.mc_which", content: "The pointed-to int (it can't be changed through p), but p can be reassigned", is_correct: true, order_index: 10 },
  { id: "cpp.references.pointer_const.mc_which.b", learning_item_id: "cpp.references.pointer_const.mc_which", content: "The pointer p itself (it can't be reassigned)", is_correct: false, order_index: 20 },
  { id: "cpp.references.pointer_const.mc_which.c", learning_item_id: "cpp.references.pointer_const.mc_which", content: "Both the pointer and the pointee", is_correct: false, order_index: 30 },
  { id: "cpp.references.pointer_const.mc_which.d", learning_item_id: "cpp.references.pointer_const.mc_which", content: "Nothing; const is ignored on pointers", is_correct: false, order_index: 40 },

  { id: "cpp.references.non_owning.mc_select.a", learning_item_id: "cpp.references.non_owning.mc_select", content: "A reference (T& / const T&)", is_correct: true, order_index: 10 },
  { id: "cpp.references.non_owning.mc_select.b", learning_item_id: "cpp.references.non_owning.mc_select", content: "A raw pointer so it can be null", is_correct: false, order_index: 20 },
  { id: "cpp.references.non_owning.mc_select.c", learning_item_id: "cpp.references.non_owning.mc_select", content: "A std::shared_ptr to share ownership", is_correct: false, order_index: 30 },
  { id: "cpp.references.non_owning.mc_select.d", learning_item_id: "cpp.references.non_owning.mc_select", content: "A std::unique_ptr passed by value", is_correct: false, order_index: 40 },

  { id: "cpp.references.views.mc_use.a", learning_item_id: "cpp.references.views.mc_use", content: "Take a std::string_view", is_correct: true, order_index: 10 },
  { id: "cpp.references.views.mc_use.b", learning_item_id: "cpp.references.views.mc_use", content: "Take a const char* and a separate length", is_correct: false, order_index: 20 },
  { id: "cpp.references.views.mc_use.c", learning_item_id: "cpp.references.views.mc_use", content: "Take a std::string by value (copy it)", is_correct: false, order_index: 30 },
  { id: "cpp.references.views.mc_use.d", learning_item_id: "cpp.references.views.mc_use", content: "Take a char* and use pointer arithmetic", is_correct: false, order_index: 40 },

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
  { id: "cpp.constructors.destructor_intro.mc_destruction_order.d", learning_item_id: "cpp.constructors.destructor_intro.mc_destruction_order", content: "The order is unspecified by the language", is_correct: false, order_index: 40 },

  { id: "cpp.value_semantics.copy.mc_shallow.a", learning_item_id: "cpp.value_semantics.copy.mc_shallow", content: "Both objects point at the same T and each frees it (double free)", is_correct: true, order_index: 10 },
  { id: "cpp.value_semantics.copy.mc_shallow.b", learning_item_id: "cpp.value_semantics.copy.mc_shallow", content: "The copy is automatically deep", is_correct: false, order_index: 20 },
  { id: "cpp.value_semantics.copy.mc_shallow.c", learning_item_id: "cpp.value_semantics.copy.mc_shallow", content: "The program fails to compile", is_correct: false, order_index: 30 },
  { id: "cpp.value_semantics.copy.mc_shallow.d", learning_item_id: "cpp.value_semantics.copy.mc_shallow", content: "The pointer becomes null in both", is_correct: false, order_index: 40 },

  { id: "cpp.value_semantics.move.mc_source.a", learning_item_id: "cpp.value_semantics.move.mc_source", content: "Steals its resources, leaving it valid but empty", is_correct: true, order_index: 10 },
  { id: "cpp.value_semantics.move.mc_source.b", learning_item_id: "cpp.value_semantics.move.mc_source", content: "Makes a full deep copy of it", is_correct: false, order_index: 20 },
  { id: "cpp.value_semantics.move.mc_source.c", learning_item_id: "cpp.value_semantics.move.mc_source", content: "Immediately destroys it", is_correct: false, order_index: 30 },
  { id: "cpp.value_semantics.move.mc_source.d", learning_item_id: "cpp.value_semantics.move.mc_source", content: "Leaves it unchanged", is_correct: false, order_index: 40 },

  { id: "cpp.value_semantics.rule_of_zero_five.mc_zero.a", learning_item_id: "cpp.value_semantics.rule_of_zero_five.mc_zero", content: "Use self-managing members so no custom copy/move/destructor is needed", is_correct: true, order_index: 10 },
  { id: "cpp.value_semantics.rule_of_zero_five.mc_zero.b", learning_item_id: "cpp.value_semantics.rule_of_zero_five.mc_zero", content: "Always write all five special members", is_correct: false, order_index: 20 },
  { id: "cpp.value_semantics.rule_of_zero_five.mc_zero.c", learning_item_id: "cpp.value_semantics.rule_of_zero_five.mc_zero", content: "Never use destructors", is_correct: false, order_index: 30 },
  { id: "cpp.value_semantics.rule_of_zero_five.mc_zero.d", learning_item_id: "cpp.value_semantics.rule_of_zero_five.mc_zero", content: "Make every member public", is_correct: false, order_index: 40 },

  { id: "cpp.value_semantics.special_members.mc_which.a", learning_item_id: "cpp.value_semantics.special_members.mc_which", content: "Copy assignment operator", is_correct: true, order_index: 10 },
  { id: "cpp.value_semantics.special_members.mc_which.b", learning_item_id: "cpp.value_semantics.special_members.mc_which", content: "Copy constructor", is_correct: false, order_index: 20 },
  { id: "cpp.value_semantics.special_members.mc_which.c", learning_item_id: "cpp.value_semantics.special_members.mc_which", content: "Move constructor", is_correct: false, order_index: 30 },
  { id: "cpp.value_semantics.special_members.mc_which.d", learning_item_id: "cpp.value_semantics.special_members.mc_which", content: "Move assignment operator", is_correct: false, order_index: 40 },

  { id: "cpp.value_semantics.copy_elision.mc_return.a", learning_item_id: "cpp.value_semantics.copy_elision.mc_return", content: "Copy elision constructs the result directly in the caller, eliding the copy/move", is_correct: true, order_index: 10 },
  { id: "cpp.value_semantics.copy_elision.mc_return.b", learning_item_id: "cpp.value_semantics.copy_elision.mc_return", content: "The compiler returns a reference to the local instead", is_correct: false, order_index: 20 },
  { id: "cpp.value_semantics.copy_elision.mc_return.c", learning_item_id: "cpp.value_semantics.copy_elision.mc_return", content: "std::string is always stored on the heap and shared", is_correct: false, order_index: 30 },
  { id: "cpp.value_semantics.copy_elision.mc_return.d", learning_item_id: "cpp.value_semantics.copy_elision.mc_return", content: "Returning by value is in fact always an expensive copy", is_correct: false, order_index: 40 },

  { id: "cpp.value_semantics.operators.mc_explicit.a", learning_item_id: "cpp.value_semantics.operators.mc_explicit", content: "Mark the constructor explicit", is_correct: true, order_index: 10 },
  { id: "cpp.value_semantics.operators.mc_explicit.b", learning_item_id: "cpp.value_semantics.operators.mc_explicit", content: "Make the constructor private", is_correct: false, order_index: 20 },
  { id: "cpp.value_semantics.operators.mc_explicit.c", learning_item_id: "cpp.value_semantics.operators.mc_explicit", content: "Add a second int parameter", is_correct: false, order_index: 30 },
  { id: "cpp.value_semantics.operators.mc_explicit.d", learning_item_id: "cpp.value_semantics.operators.mc_explicit", content: "Mark the constructor const", is_correct: false, order_index: 40 },

  { id: "cpp.value_semantics.self_assignment.mc_guard.a", learning_item_id: "cpp.value_semantics.self_assignment.mc_guard", content: "this and &other are the same object, so the buffer is freed then read (use-after-free)", is_correct: true, order_index: 10 },
  { id: "cpp.value_semantics.self_assignment.mc_guard.b", learning_item_id: "cpp.value_semantics.self_assignment.mc_guard", content: "Nothing — self-assignment is always a no-op", is_correct: false, order_index: 20 },
  { id: "cpp.value_semantics.self_assignment.mc_guard.c", learning_item_id: "cpp.value_semantics.self_assignment.mc_guard", content: "The compiler rejects a = a at build time", is_correct: false, order_index: 30 },
  { id: "cpp.value_semantics.self_assignment.mc_guard.d", learning_item_id: "cpp.value_semantics.self_assignment.mc_guard", content: "It leaks memory but is otherwise correct", is_correct: false, order_index: 40 },

  { id: "cpp.value_semantics.stream_insertion.mc_signature.a", learning_item_id: "cpp.value_semantics.stream_insertion.mc_signature", content: "std::ostream& operator<<(std::ostream& os, const Point& p)", is_correct: true, order_index: 10 },
  { id: "cpp.value_semantics.stream_insertion.mc_signature.b", learning_item_id: "cpp.value_semantics.stream_insertion.mc_signature", content: "void Point::operator<<(std::ostream& os)", is_correct: false, order_index: 20 },
  { id: "cpp.value_semantics.stream_insertion.mc_signature.c", learning_item_id: "cpp.value_semantics.stream_insertion.mc_signature", content: "std::ostream operator<<(Point p, std::ostream os)", is_correct: false, order_index: 30 },
  { id: "cpp.value_semantics.stream_insertion.mc_signature.d", learning_item_id: "cpp.value_semantics.stream_insertion.mc_signature", content: "Point operator<<(const Point& p)", is_correct: false, order_index: 40 },

  { id: "cpp.raii.resource_lifetime.mc_ties.a", learning_item_id: "cpp.raii.resource_lifetime.mc_ties", content: "The lifetime of an object (constructor acquires, destructor releases)", is_correct: true, order_index: 10 },
  { id: "cpp.raii.resource_lifetime.mc_ties.b", learning_item_id: "cpp.raii.resource_lifetime.mc_ties", content: "The lifetime of the whole program", is_correct: false, order_index: 20 },
  { id: "cpp.raii.resource_lifetime.mc_ties.c", learning_item_id: "cpp.raii.resource_lifetime.mc_ties", content: "A manual free() call you must remember", is_correct: false, order_index: 30 },
  { id: "cpp.raii.resource_lifetime.mc_ties.d", learning_item_id: "cpp.raii.resource_lifetime.mc_ties", content: "A background garbage collector", is_correct: false, order_index: 40 },

  { id: "cpp.raii.destructor_cleanup.mc_where.a", learning_item_id: "cpp.raii.destructor_cleanup.mc_where", content: "In the destructor", is_correct: true, order_index: 10 },
  { id: "cpp.raii.destructor_cleanup.mc_where.b", learning_item_id: "cpp.raii.destructor_cleanup.mc_where", content: "In the constructor", is_correct: false, order_index: 20 },
  { id: "cpp.raii.destructor_cleanup.mc_where.c", learning_item_id: "cpp.raii.destructor_cleanup.mc_where", content: "In a separate static cleanup function", is_correct: false, order_index: 30 },
  { id: "cpp.raii.destructor_cleanup.mc_where.d", learning_item_id: "cpp.raii.destructor_cleanup.mc_where", content: "Nowhere — the operating system frees everything", is_correct: false, order_index: 40 },

  { id: "cpp.raii.exception_safety_intro.mc_unwind.a", learning_item_id: "cpp.raii.exception_safety_intro.mc_unwind", content: "Their destructors run during stack unwinding, releasing their resources", is_correct: true, order_index: 10 },
  { id: "cpp.raii.exception_safety_intro.mc_unwind.b", learning_item_id: "cpp.raii.exception_safety_intro.mc_unwind", content: "They leak because the function did not finish", is_correct: false, order_index: 20 },
  { id: "cpp.raii.exception_safety_intro.mc_unwind.c", learning_item_id: "cpp.raii.exception_safety_intro.mc_unwind", content: "Nothing happens until the program exits", is_correct: false, order_index: 30 },
  { id: "cpp.raii.exception_safety_intro.mc_unwind.d", learning_item_id: "cpp.raii.exception_safety_intro.mc_unwind", content: "They are released only if you catch the exception", is_correct: false, order_index: 40 },

  { id: "cpp.raii.ownership_boundary.mc_owners.a", learning_item_id: "cpp.raii.ownership_boundary.mc_owners", content: "Exactly one owner; others may observe without freeing", is_correct: true, order_index: 10 },
  { id: "cpp.raii.ownership_boundary.mc_owners.b", learning_item_id: "cpp.raii.ownership_boundary.mc_owners", content: "Every object that uses the resource", is_correct: false, order_index: 20 },
  { id: "cpp.raii.ownership_boundary.mc_owners.c", learning_item_id: "cpp.raii.ownership_boundary.mc_owners", content: "None — resources free themselves", is_correct: false, order_index: 30 },
  { id: "cpp.raii.ownership_boundary.mc_owners.d", learning_item_id: "cpp.raii.ownership_boundary.mc_owners", content: "At least two, for safety", is_correct: false, order_index: 40 },

  { id: "cpp.smart_pointers.unique_ptr.mc_no_copy.a", learning_item_id: "cpp.smart_pointers.unique_ptr.mc_no_copy", content: "Copying would create two owners of one object, so the copy operations are deleted", is_correct: true, order_index: 10 },
  { id: "cpp.smart_pointers.unique_ptr.mc_no_copy.b", learning_item_id: "cpp.smart_pointers.unique_ptr.mc_no_copy", content: "Copying a unique_ptr is simply too slow", is_correct: false, order_index: 20 },
  { id: "cpp.smart_pointers.unique_ptr.mc_no_copy.c", learning_item_id: "cpp.smart_pointers.unique_ptr.mc_no_copy", content: "The compiler does not support copying templates", is_correct: false, order_index: 30 },
  { id: "cpp.smart_pointers.unique_ptr.mc_no_copy.d", learning_item_id: "cpp.smart_pointers.unique_ptr.mc_no_copy", content: "unique_ptr can be copied freely", is_correct: false, order_index: 40 },

  { id: "cpp.smart_pointers.shared_ptr.mc_free.a", learning_item_id: "cpp.smart_pointers.shared_ptr.mc_free", content: "When the last owning shared_ptr is destroyed (reference count reaches zero)", is_correct: true, order_index: 10 },
  { id: "cpp.smart_pointers.shared_ptr.mc_free.b", learning_item_id: "cpp.smart_pointers.shared_ptr.mc_free", content: "When the first shared_ptr is destroyed", is_correct: false, order_index: 20 },
  { id: "cpp.smart_pointers.shared_ptr.mc_free.c", learning_item_id: "cpp.smart_pointers.shared_ptr.mc_free", content: "Immediately after it is created", is_correct: false, order_index: 30 },
  { id: "cpp.smart_pointers.shared_ptr.mc_free.d", learning_item_id: "cpp.smart_pointers.shared_ptr.mc_free", content: "Never — you must call delete yourself", is_correct: false, order_index: 40 },

  { id: "cpp.smart_pointers.weak_ptr.mc_count.a", learning_item_id: "cpp.smart_pointers.weak_ptr.mc_count", content: "None — it observes without owning and does not keep the object alive", is_correct: true, order_index: 10 },
  { id: "cpp.smart_pointers.weak_ptr.mc_count.b", learning_item_id: "cpp.smart_pointers.weak_ptr.mc_count", content: "It increases the reference count like a shared_ptr", is_correct: false, order_index: 20 },
  { id: "cpp.smart_pointers.weak_ptr.mc_count.c", learning_item_id: "cpp.smart_pointers.weak_ptr.mc_count", content: "It decreases the reference count", is_correct: false, order_index: 30 },
  { id: "cpp.smart_pointers.weak_ptr.mc_count.d", learning_item_id: "cpp.smart_pointers.weak_ptr.mc_count", content: "It frees the object immediately", is_correct: false, order_index: 40 },

  { id: "cpp.smart_pointers.cyclic_reference.mc_break.a", learning_item_id: "cpp.smart_pointers.cyclic_reference.mc_break", content: "Make one of the pointers in the cycle a weak_ptr", is_correct: true, order_index: 10 },
  { id: "cpp.smart_pointers.cyclic_reference.mc_break.b", learning_item_id: "cpp.smart_pointers.cyclic_reference.mc_break", content: "Call delete on both objects", is_correct: false, order_index: 20 },
  { id: "cpp.smart_pointers.cyclic_reference.mc_break.c", learning_item_id: "cpp.smart_pointers.cyclic_reference.mc_break", content: "Use make_unique instead of make_shared", is_correct: false, order_index: 30 },
  { id: "cpp.smart_pointers.cyclic_reference.mc_break.d", learning_item_id: "cpp.smart_pointers.cyclic_reference.mc_break", content: "Increase the reference count by hand", is_correct: false, order_index: 40 },

  { id: "cpp.smart_pointers.ownership_choice.mc_simplest.a", learning_item_id: "cpp.smart_pointers.ownership_choice.mc_simplest", content: "A plain value member", is_correct: true, order_index: 10 },
  { id: "cpp.smart_pointers.ownership_choice.mc_simplest.b", learning_item_id: "cpp.smart_pointers.ownership_choice.mc_simplest", content: "A std::shared_ptr<T> member", is_correct: false, order_index: 20 },
  { id: "cpp.smart_pointers.ownership_choice.mc_simplest.c", learning_item_id: "cpp.smart_pointers.ownership_choice.mc_simplest", content: "A std::unique_ptr<T> member", is_correct: false, order_index: 30 },
  { id: "cpp.smart_pointers.ownership_choice.mc_simplest.d", learning_item_id: "cpp.smart_pointers.ownership_choice.mc_simplest", content: "A raw owning pointer freed in the destructor", is_correct: false, order_index: 40 },

  { id: "cpp.smart_pointers.ownership_transfer.mc_moved_from.a", learning_item_id: "cpp.smart_pointers.ownership_transfer.mc_moved_from", content: "a is empty (null); the object now belongs to b", is_correct: true, order_index: 10 },
  { id: "cpp.smart_pointers.ownership_transfer.mc_moved_from.b", learning_item_id: "cpp.smart_pointers.ownership_transfer.mc_moved_from", content: "a and b both own the object", is_correct: false, order_index: 20 },
  { id: "cpp.smart_pointers.ownership_transfer.mc_moved_from.c", learning_item_id: "cpp.smart_pointers.ownership_transfer.mc_moved_from", content: "a is unchanged and still owns the object", is_correct: false, order_index: 30 },
  { id: "cpp.smart_pointers.ownership_transfer.mc_moved_from.d", learning_item_id: "cpp.smart_pointers.ownership_transfer.mc_moved_from", content: "a is destroyed and cannot be reassigned", is_correct: false, order_index: 40 },

  { id: "cpp.stl.vector.mc_at.a", learning_item_id: "cpp.stl.vector.mc_at", content: "v.at(i)", is_correct: true, order_index: 10 },
  { id: "cpp.stl.vector.mc_at.b", learning_item_id: "cpp.stl.vector.mc_at", content: "v[i]", is_correct: false, order_index: 20 },
  { id: "cpp.stl.vector.mc_at.c", learning_item_id: "cpp.stl.vector.mc_at", content: "v.get(i)", is_correct: false, order_index: 30 },
  { id: "cpp.stl.vector.mc_at.d", learning_item_id: "cpp.stl.vector.mc_at", content: "v.index(i)", is_correct: false, order_index: 40 },

  { id: "cpp.stl.string.mc_size.a", learning_item_id: "cpp.stl.string.mc_size", content: "size()", is_correct: true, order_index: 10 },
  { id: "cpp.stl.string.mc_size.b", learning_item_id: "cpp.stl.string.mc_size", content: "count()", is_correct: false, order_index: 20 },
  { id: "cpp.stl.string.mc_size.c", learning_item_id: "cpp.stl.string.mc_size", content: "len()", is_correct: false, order_index: 30 },
  { id: "cpp.stl.string.mc_size.d", learning_item_id: "cpp.stl.string.mc_size", content: "chars()", is_correct: false, order_index: 40 },

  { id: "cpp.stl.map.mc_check_key.a", learning_item_id: "cpp.stl.map.mc_check_key", content: "m.contains(k) (or m.find(k) != m.end())", is_correct: true, order_index: 10 },
  { id: "cpp.stl.map.mc_check_key.b", learning_item_id: "cpp.stl.map.mc_check_key", content: "m[k]", is_correct: false, order_index: 20 },
  { id: "cpp.stl.map.mc_check_key.c", learning_item_id: "cpp.stl.map.mc_check_key", content: "m.at(k)", is_correct: false, order_index: 30 },
  { id: "cpp.stl.map.mc_check_key.d", learning_item_id: "cpp.stl.map.mc_check_key", content: "m.size()", is_correct: false, order_index: 40 },

  { id: "cpp.stl.set.mc_insert_dup.a", learning_item_id: "cpp.stl.set.mc_insert_dup", content: "Nothing changes; sets store unique elements", is_correct: true, order_index: 10 },
  { id: "cpp.stl.set.mc_insert_dup.b", learning_item_id: "cpp.stl.set.mc_insert_dup", content: "The value is stored a second time", is_correct: false, order_index: 20 },
  { id: "cpp.stl.set.mc_insert_dup.c", learning_item_id: "cpp.stl.set.mc_insert_dup", content: "insert throws an exception", is_correct: false, order_index: 30 },
  { id: "cpp.stl.set.mc_insert_dup.d", learning_item_id: "cpp.stl.set.mc_insert_dup", content: "The whole set is cleared", is_correct: false, order_index: 40 },

  { id: "cpp.stl.algorithms.mc_sort.a", learning_item_id: "cpp.stl.algorithms.mc_sort", content: "std::sort(v.begin(), v.end())", is_correct: true, order_index: 10 },
  { id: "cpp.stl.algorithms.mc_sort.b", learning_item_id: "cpp.stl.algorithms.mc_sort", content: "v.sort()", is_correct: false, order_index: 20 },
  { id: "cpp.stl.algorithms.mc_sort.c", learning_item_id: "cpp.stl.algorithms.mc_sort", content: "std::order(v)", is_correct: false, order_index: 30 },
  { id: "cpp.stl.algorithms.mc_sort.d", learning_item_id: "cpp.stl.algorithms.mc_sort", content: "sort(v, ascending)", is_correct: false, order_index: 40 },

  { id: "cpp.stl.iterators.mc_end.a", learning_item_id: "cpp.stl.iterators.mc_end", content: "One position past the last element (a sentinel, not a real element)", is_correct: true, order_index: 10 },
  { id: "cpp.stl.iterators.mc_end.b", learning_item_id: "cpp.stl.iterators.mc_end", content: "The last element of the container", is_correct: false, order_index: 20 },
  { id: "cpp.stl.iterators.mc_end.c", learning_item_id: "cpp.stl.iterators.mc_end", content: "The first element of the container", is_correct: false, order_index: 30 },
  { id: "cpp.stl.iterators.mc_end.d", learning_item_id: "cpp.stl.iterators.mc_end", content: "A null pointer", is_correct: false, order_index: 40 },

  { id: "cpp.stl.adapters.mc_lifo.a", learning_item_id: "cpp.stl.adapters.mc_lifo", content: "std::stack", is_correct: true, order_index: 10 },
  { id: "cpp.stl.adapters.mc_lifo.b", learning_item_id: "cpp.stl.adapters.mc_lifo", content: "std::queue", is_correct: false, order_index: 20 },
  { id: "cpp.stl.adapters.mc_lifo.c", learning_item_id: "cpp.stl.adapters.mc_lifo", content: "std::priority_queue", is_correct: false, order_index: 30 },
  { id: "cpp.stl.adapters.mc_lifo.d", learning_item_id: "cpp.stl.adapters.mc_lifo", content: "std::vector", is_correct: false, order_index: 40 },

  { id: "cpp.stl.lambdas.mc_capture.a", learning_item_id: "cpp.stl.lambdas.mc_capture", content: "Which surrounding variables the lambda uses, and whether by value or reference", is_correct: true, order_index: 10 },
  { id: "cpp.stl.lambdas.mc_capture.b", learning_item_id: "cpp.stl.lambdas.mc_capture", content: "The return type of the lambda", is_correct: false, order_index: 20 },
  { id: "cpp.stl.lambdas.mc_capture.c", learning_item_id: "cpp.stl.lambdas.mc_capture", content: "The parameters of the lambda", is_correct: false, order_index: 30 },
  { id: "cpp.stl.lambdas.mc_capture.d", learning_item_id: "cpp.stl.lambdas.mc_capture", content: "The name of the lambda", is_correct: false, order_index: 40 },

  { id: "cpp.templates.function_templates.mc_purpose.a", learning_item_id: "cpp.templates.function_templates.mc_purpose", content: "Write one function for many types, with T deduced from arguments", is_correct: true, order_index: 10 },
  { id: "cpp.templates.function_templates.mc_purpose.b", learning_item_id: "cpp.templates.function_templates.mc_purpose", content: "Make the function run at compile time only", is_correct: false, order_index: 20 },
  { id: "cpp.templates.function_templates.mc_purpose.c", learning_item_id: "cpp.templates.function_templates.mc_purpose", content: "Force all callers to pass the type explicitly", is_correct: false, order_index: 30 },
  { id: "cpp.templates.function_templates.mc_purpose.d", learning_item_id: "cpp.templates.function_templates.mc_purpose", content: "Hide the function from other files", is_correct: false, order_index: 40 },

  { id: "cpp.templates.class_templates.mc_vector.a", learning_item_id: "cpp.templates.class_templates.mc_vector", content: "A class template instantiated with int", is_correct: true, order_index: 10 },
  { id: "cpp.templates.class_templates.mc_vector.b", learning_item_id: "cpp.templates.class_templates.mc_vector", content: "A function template", is_correct: false, order_index: 20 },
  { id: "cpp.templates.class_templates.mc_vector.c", learning_item_id: "cpp.templates.class_templates.mc_vector", content: "A macro", is_correct: false, order_index: 30 },
  { id: "cpp.templates.class_templates.mc_vector.d", learning_item_id: "cpp.templates.class_templates.mc_vector", content: "A concept", is_correct: false, order_index: 40 },

  { id: "cpp.templates.concepts.mc_role.a", learning_item_id: "cpp.templates.concepts.mc_role", content: "Constrains the parameter to types meeting a requirement, with clearer errors", is_correct: true, order_index: 10 },
  { id: "cpp.templates.concepts.mc_role.b", learning_item_id: "cpp.templates.concepts.mc_role", content: "Makes the template run faster", is_correct: false, order_index: 20 },
  { id: "cpp.templates.concepts.mc_role.c", learning_item_id: "cpp.templates.concepts.mc_role", content: "Allows any type with no checking", is_correct: false, order_index: 30 },
  { id: "cpp.templates.concepts.mc_role.d", learning_item_id: "cpp.templates.concepts.mc_role", content: "Replaces the need for a return type", is_correct: false, order_index: 40 },

  { id: "cpp.templates.ranges.mc_views.a", learning_item_id: "cpp.templates.ranges.mc_views", content: "Operate on whole ranges and compose lazy views without copying", is_correct: true, order_index: 10 },
  { id: "cpp.templates.ranges.mc_views.b", learning_item_id: "cpp.templates.ranges.mc_views", content: "They run on the GPU automatically", is_correct: false, order_index: 20 },
  { id: "cpp.templates.ranges.mc_views.c", learning_item_id: "cpp.templates.ranges.mc_views", content: "They always copy the container first", is_correct: false, order_index: 30 },
  { id: "cpp.templates.ranges.mc_views.d", learning_item_id: "cpp.templates.ranges.mc_views", content: "They remove the need for any includes", is_correct: false, order_index: 40 },

  { id: "cpp.templates.constexpr.mc_eval.a", learning_item_id: "cpp.templates.constexpr.mc_eval", content: "When it is used in a constant-expression context with constant arguments", is_correct: true, order_index: 10 },
  { id: "cpp.templates.constexpr.mc_eval.b", learning_item_id: "cpp.templates.constexpr.mc_eval", content: "Always, on every call, even with runtime arguments", is_correct: false, order_index: 20 },
  { id: "cpp.templates.constexpr.mc_eval.c", learning_item_id: "cpp.templates.constexpr.mc_eval", content: "Never; constexpr is only documentation", is_correct: false, order_index: 30 },
  { id: "cpp.templates.constexpr.mc_eval.d", learning_item_id: "cpp.templates.constexpr.mc_eval", content: "Only inside a class template", is_correct: false, order_index: 40 },

  { id: "cpp.templates.if_constexpr.mc_discarded.a", learning_item_id: "cpp.templates.if_constexpr.mc_discarded", content: "It is not instantiated, so it may contain code ill-formed for the current type", is_correct: true, order_index: 10 },
  { id: "cpp.templates.if_constexpr.mc_discarded.b", learning_item_id: "cpp.templates.if_constexpr.mc_discarded", content: "It still must compile for every type, like a runtime if", is_correct: false, order_index: 20 },
  { id: "cpp.templates.if_constexpr.mc_discarded.c", learning_item_id: "cpp.templates.if_constexpr.mc_discarded", content: "It runs at run time as a fallback", is_correct: false, order_index: 30 },
  { id: "cpp.templates.if_constexpr.mc_discarded.d", learning_item_id: "cpp.templates.if_constexpr.mc_discarded", content: "It is executed twice", is_correct: false, order_index: 40 },

  { id: "cpp.templates.static_assert.mc_when.a", learning_item_id: "cpp.templates.static_assert.mc_when", content: "Compilation fails with the supplied message", is_correct: true, order_index: 10 },
  { id: "cpp.templates.static_assert.mc_when.b", learning_item_id: "cpp.templates.static_assert.mc_when", content: "The program throws an exception at run time", is_correct: false, order_index: 20 },
  { id: "cpp.templates.static_assert.mc_when.c", learning_item_id: "cpp.templates.static_assert.mc_when", content: "It logs a warning and continues", is_correct: false, order_index: 30 },
  { id: "cpp.templates.static_assert.mc_when.d", learning_item_id: "cpp.templates.static_assert.mc_when", content: "Nothing until the assertion is reached at run time", is_correct: false, order_index: 40 },

  { id: "cpp.templates.multiple_params.mc_nttp.a", learning_item_id: "cpp.templates.multiple_params.mc_nttp", content: "A non-type template parameter (a compile-time value that becomes part of the type)", is_correct: true, order_index: 10 },
  { id: "cpp.templates.multiple_params.mc_nttp.b", learning_item_id: "cpp.templates.multiple_params.mc_nttp", content: "A second type parameter", is_correct: false, order_index: 20 },
  { id: "cpp.templates.multiple_params.mc_nttp.c", learning_item_id: "cpp.templates.multiple_params.mc_nttp", content: "A runtime function argument", is_correct: false, order_index: 30 },
  { id: "cpp.templates.multiple_params.mc_nttp.d", learning_item_id: "cpp.templates.multiple_params.mc_nttp", content: "A member variable of the struct", is_correct: false, order_index: 40 },

  { id: "cpp.templates.deduction.mc_headers.a", learning_item_id: "cpp.templates.deduction.mc_headers", content: "Each use instantiates the template, so its full definition must be visible there", is_correct: true, order_index: 10 },
  { id: "cpp.templates.deduction.mc_headers.b", learning_item_id: "cpp.templates.deduction.mc_headers", content: "Headers compile faster than .cpp files", is_correct: false, order_index: 20 },
  { id: "cpp.templates.deduction.mc_headers.c", learning_item_id: "cpp.templates.deduction.mc_headers", content: "Templates cannot contain statements", is_correct: false, order_index: 30 },
  { id: "cpp.templates.deduction.mc_headers.d", learning_item_id: "cpp.templates.deduction.mc_headers", content: "The linker runs before the compiler", is_correct: false, order_index: 40 },

  { id: "cpp.templates.aliases_specialization.mc_alias.a", learning_item_id: "cpp.templates.aliases_specialization.mc_alias", content: "An alias template: Vec<int> is another name for std::vector<int> (same type)", is_correct: true, order_index: 10 },
  { id: "cpp.templates.aliases_specialization.mc_alias.b", learning_item_id: "cpp.templates.aliases_specialization.mc_alias", content: "A new container type distinct from std::vector", is_correct: false, order_index: 20 },
  { id: "cpp.templates.aliases_specialization.mc_alias.c", learning_item_id: "cpp.templates.aliases_specialization.mc_alias", content: "A specialization of std::vector for int", is_correct: false, order_index: 30 },
  { id: "cpp.templates.aliases_specialization.mc_alias.d", learning_item_id: "cpp.templates.aliases_specialization.mc_alias", content: "A runtime copy of the vector", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.error_handling.mc_unwind.a", learning_item_id: "cpp.tooling.error_handling.mc_unwind", content: "They are destroyed by stack unwinding (their destructors run)", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.error_handling.mc_unwind.b", learning_item_id: "cpp.tooling.error_handling.mc_unwind", content: "They leak; destructors are skipped", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.error_handling.mc_unwind.c", learning_item_id: "cpp.tooling.error_handling.mc_unwind", content: "They are copied to the handler", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.error_handling.mc_unwind.d", learning_item_id: "cpp.tooling.error_handling.mc_unwind", content: "Nothing happens until the program exits", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.testing.mc_regression.a", learning_item_id: "cpp.tooling.testing.mc_regression", content: "Write a test that fails before the fix and passes after", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.testing.mc_regression.b", learning_item_id: "cpp.tooling.testing.mc_regression", content: "Inspect the output once by hand and move on", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.testing.mc_regression.c", learning_item_id: "cpp.tooling.testing.mc_regression", content: "Add a try/catch around the whole program", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.testing.mc_regression.d", learning_item_id: "cpp.tooling.testing.mc_regression", content: "Delete the failing code path", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.debugging.mc_firststep.a", learning_item_id: "cpp.tooling.debugging.mc_firststep", content: "Get a small, reliable reproduction of the bug", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.debugging.mc_firststep.b", learning_item_id: "cpp.tooling.debugging.mc_firststep", content: "Rewrite large parts at random", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.debugging.mc_firststep.c", learning_item_id: "cpp.tooling.debugging.mc_firststep", content: "Disable the compiler warnings", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.debugging.mc_firststep.d", learning_item_id: "cpp.tooling.debugging.mc_firststep", content: "Ship it and wait for reports", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.build.mc_linkstage.a", learning_item_id: "cpp.tooling.build.mc_linkstage", content: "The link stage (a definition is missing)", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.build.mc_linkstage.b", learning_item_id: "cpp.tooling.build.mc_linkstage", content: "The compile stage (a syntax error)", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.build.mc_linkstage.c", learning_item_id: "cpp.tooling.build.mc_linkstage", content: "Runtime", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.build.mc_linkstage.d", learning_item_id: "cpp.tooling.build.mc_linkstage", content: "Preprocessing only", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.warnings.mc_werror.a", learning_item_id: "cpp.tooling.warnings.mc_werror", content: "It turns warnings into build-failing errors so they can't accumulate unnoticed", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.warnings.mc_werror.b", learning_item_id: "cpp.tooling.warnings.mc_werror", content: "It silences all warnings", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.warnings.mc_werror.c", learning_item_id: "cpp.tooling.warnings.mc_werror", content: "It speeds up compilation", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.warnings.mc_werror.d", learning_item_id: "cpp.tooling.warnings.mc_werror", content: "It enables optimizations", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.sanitizers.mc_asan.a", learning_item_id: "cpp.tooling.sanitizers.mc_asan", content: "Memory errors: buffer overflows, use-after-free, and leaks", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.sanitizers.mc_asan.b", learning_item_id: "cpp.tooling.sanitizers.mc_asan", content: "Slow algorithms with poor Big-O", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.sanitizers.mc_asan.c", learning_item_id: "cpp.tooling.sanitizers.mc_asan", content: "Spelling mistakes in comments", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.sanitizers.mc_asan.d", learning_item_id: "cpp.tooling.sanitizers.mc_asan", content: "Missing header includes", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.cmake.mc_link.a", learning_item_id: "cpp.tooling.cmake.mc_link", content: "target_link_libraries(app PRIVATE lib)", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.cmake.mc_link.b", learning_item_id: "cpp.tooling.cmake.mc_link", content: "add_executable(app main.cpp)", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.cmake.mc_link.c", learning_item_id: "cpp.tooling.cmake.mc_link", content: "target_include_directories(app PRIVATE include)", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.cmake.mc_link.d", learning_item_id: "cpp.tooling.cmake.mc_link", content: "cmake --build build", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.preconditions.mc_assert.a", learning_item_id: "cpp.tooling.preconditions.mc_assert", content: "assert the pointer is non-null (a violated contract is a bug)", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.preconditions.mc_assert.b", learning_item_id: "cpp.tooling.preconditions.mc_assert", content: "Throw an exception on every call", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.preconditions.mc_assert.c", learning_item_id: "cpp.tooling.preconditions.mc_assert", content: "Return an error code from the helper", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.preconditions.mc_assert.d", learning_item_id: "cpp.tooling.preconditions.mc_assert", content: "Ignore it; the caller is responsible", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.optional_expected.mc_choose.a", learning_item_id: "cpp.tooling.optional_expected.mc_choose", content: "std::expected<T, E> (carries the value or an error reason)", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.optional_expected.mc_choose.b", learning_item_id: "cpp.tooling.optional_expected.mc_choose", content: "std::optional<T> (presence only, no reason)", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.optional_expected.mc_choose.c", learning_item_id: "cpp.tooling.optional_expected.mc_choose", content: "A bare bool return", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.optional_expected.mc_choose.d", learning_item_id: "cpp.tooling.optional_expected.mc_choose", content: "A magic sentinel value like -1", is_correct: false, order_index: 40 },

  { id: "cpp.tooling.error_strategy.mc_controlflow.a", learning_item_id: "cpp.tooling.error_strategy.mc_controlflow", content: "Return std::optional (not found is an expected, recoverable outcome)", is_correct: true, order_index: 10 },
  { id: "cpp.tooling.error_strategy.mc_controlflow.b", learning_item_id: "cpp.tooling.error_strategy.mc_controlflow", content: "Throw an exception each time nothing is found", is_correct: false, order_index: 20 },
  { id: "cpp.tooling.error_strategy.mc_controlflow.c", learning_item_id: "cpp.tooling.error_strategy.mc_controlflow", content: "Call std::abort", is_correct: false, order_index: 30 },
  { id: "cpp.tooling.error_strategy.mc_controlflow.d", learning_item_id: "cpp.tooling.error_strategy.mc_controlflow", content: "Set a global errno-style flag", is_correct: false, order_index: 40 },

  { id: "dsa.complexity.big_o.mc_single_loop.a", learning_item_id: "dsa.complexity.big_o.mc_single_loop", content: "O(n)", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.big_o.mc_single_loop.b", learning_item_id: "dsa.complexity.big_o.mc_single_loop", content: "O(1)", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.big_o.mc_single_loop.c", learning_item_id: "dsa.complexity.big_o.mc_single_loop", content: "O(n^2)", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.big_o.mc_single_loop.d", learning_item_id: "dsa.complexity.big_o.mc_single_loop", content: "O(log n)", is_correct: false, order_index: 40 },

  { id: "dsa.complexity.problem_solving.mc_first_step.a", learning_item_id: "dsa.complexity.problem_solving.mc_first_step", content: "Write a correct brute-force solution and test it", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.problem_solving.mc_first_step.b", learning_item_id: "dsa.complexity.problem_solving.mc_first_step", content: "Pick the fastest known algorithm immediately", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.problem_solving.mc_first_step.c", learning_item_id: "dsa.complexity.problem_solving.mc_first_step", content: "Skip the examples and start coding", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.problem_solving.mc_first_step.d", learning_item_id: "dsa.complexity.problem_solving.mc_first_step", content: "Optimize memory usage first", is_correct: false, order_index: 40 },

  { id: "dsa.complexity.growth_rates.mc_order.a", learning_item_id: "dsa.complexity.growth_rates.mc_order", content: "O(log n), O(n), O(n log n), O(n^2)", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.growth_rates.mc_order.b", learning_item_id: "dsa.complexity.growth_rates.mc_order", content: "O(n), O(log n), O(n^2), O(n log n)", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.growth_rates.mc_order.c", learning_item_id: "dsa.complexity.growth_rates.mc_order", content: "O(n^2), O(n log n), O(n), O(log n)", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.growth_rates.mc_order.d", learning_item_id: "dsa.complexity.growth_rates.mc_order", content: "O(n log n), O(n), O(log n), O(n^2)", is_correct: false, order_index: 40 },

  { id: "dsa.complexity.amortized.mc_pushback.a", learning_item_id: "dsa.complexity.amortized.mc_pushback", content: "O(1) amortized", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.amortized.mc_pushback.b", learning_item_id: "dsa.complexity.amortized.mc_pushback", content: "O(n) every time", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.amortized.mc_pushback.c", learning_item_id: "dsa.complexity.amortized.mc_pushback", content: "O(log n) amortized", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.amortized.mc_pushback.d", learning_item_id: "dsa.complexity.amortized.mc_pushback", content: "O(n log n) amortized", is_correct: false, order_index: 40 },

  { id: "dsa.complexity.constraints.mc_feasible.a", learning_item_id: "dsa.complexity.constraints.mc_feasible", content: "An O(n^2) approach", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.constraints.mc_feasible.b", learning_item_id: "dsa.complexity.constraints.mc_feasible", content: "An O(n log n) approach", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.constraints.mc_feasible.c", learning_item_id: "dsa.complexity.constraints.mc_feasible", content: "An O(n) approach", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.constraints.mc_feasible.d", learning_item_id: "dsa.complexity.constraints.mc_feasible", content: "An O(log n) approach", is_correct: false, order_index: 40 },

  { id: "dsa.complexity.pattern_recognition.mc_window.a", learning_item_id: "dsa.complexity.pattern_recognition.mc_window", content: "Sliding window", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.pattern_recognition.mc_window.b", learning_item_id: "dsa.complexity.pattern_recognition.mc_window", content: "Binary search on the answer", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.pattern_recognition.mc_window.c", learning_item_id: "dsa.complexity.pattern_recognition.mc_window", content: "Depth-first search", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.pattern_recognition.mc_window.d", learning_item_id: "dsa.complexity.pattern_recognition.mc_window", content: "A frequency map", is_correct: false, order_index: 40 },

  { id: "dsa.complexity.container_selection.mc_membership.a", learning_item_id: "dsa.complexity.container_selection.mc_membership", content: "std::unordered_set (average O(1) membership)", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.container_selection.mc_membership.b", learning_item_id: "dsa.complexity.container_selection.mc_membership", content: "std::vector (scan each time)", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.container_selection.mc_membership.c", learning_item_id: "dsa.complexity.container_selection.mc_membership", content: "std::stack", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.container_selection.mc_membership.d", learning_item_id: "dsa.complexity.container_selection.mc_membership", content: "std::priority_queue", is_correct: false, order_index: 40 },

  { id: "dsa.complexity.recursion_choice.mc_backtracking.a", learning_item_id: "dsa.complexity.recursion_choice.mc_backtracking", content: "Backtracking", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.recursion_choice.mc_backtracking.b", learning_item_id: "dsa.complexity.recursion_choice.mc_backtracking", content: "Dynamic programming", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.recursion_choice.mc_backtracking.c", learning_item_id: "dsa.complexity.recursion_choice.mc_backtracking", content: "A greedy scan", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.recursion_choice.mc_backtracking.d", learning_item_id: "dsa.complexity.recursion_choice.mc_backtracking", content: "A single while loop", is_correct: false, order_index: 40 },

  { id: "dsa.arrays.indexing.mc_last_index.a", learning_item_id: "dsa.arrays.indexing.mc_last_index", content: "n - 1", is_correct: true, order_index: 10 },
  { id: "dsa.arrays.indexing.mc_last_index.b", learning_item_id: "dsa.arrays.indexing.mc_last_index", content: "n", is_correct: false, order_index: 20 },
  { id: "dsa.arrays.indexing.mc_last_index.c", learning_item_id: "dsa.arrays.indexing.mc_last_index", content: "n + 1", is_correct: false, order_index: 30 },
  { id: "dsa.arrays.indexing.mc_last_index.d", learning_item_id: "dsa.arrays.indexing.mc_last_index", content: "1", is_correct: false, order_index: 40 },

  { id: "dsa.arrays.traversal.mc_safe_loop.a", learning_item_id: "dsa.arrays.traversal.mc_safe_loop", content: "for (int x : v) { ... }", is_correct: true, order_index: 10 },
  { id: "dsa.arrays.traversal.mc_safe_loop.b", learning_item_id: "dsa.arrays.traversal.mc_safe_loop", content: "for (int i = 0; i <= v.size(); i++) { ... }", is_correct: false, order_index: 20 },
  { id: "dsa.arrays.traversal.mc_safe_loop.c", learning_item_id: "dsa.arrays.traversal.mc_safe_loop", content: "for (int i = 1; i < v.size(); i++) { ... }", is_correct: false, order_index: 30 },
  { id: "dsa.arrays.traversal.mc_safe_loop.d", learning_item_id: "dsa.arrays.traversal.mc_safe_loop", content: "while (true) { ... }", is_correct: false, order_index: 40 },

  { id: "dsa.searching.binary_search.mc_precondition.a", learning_item_id: "dsa.searching.binary_search.mc_precondition", content: "The sequence must be sorted", is_correct: true, order_index: 10 },
  { id: "dsa.searching.binary_search.mc_precondition.b", learning_item_id: "dsa.searching.binary_search.mc_precondition", content: "The sequence must contain only unique values", is_correct: false, order_index: 20 },
  { id: "dsa.searching.binary_search.mc_precondition.c", learning_item_id: "dsa.searching.binary_search.mc_precondition", content: "The sequence must be a std::vector", is_correct: false, order_index: 30 },
  { id: "dsa.searching.binary_search.mc_precondition.d", learning_item_id: "dsa.searching.binary_search.mc_precondition", content: "The sequence must be small", is_correct: false, order_index: 40 },

  { id: "dsa.sorting.comparator.mc_descending.a", learning_item_id: "dsa.sorting.comparator.mc_descending", content: "[](int a, int b){ return a > b; }", is_correct: true, order_index: 10 },
  { id: "dsa.sorting.comparator.mc_descending.b", learning_item_id: "dsa.sorting.comparator.mc_descending", content: "[](int a, int b){ return a < b; }", is_correct: false, order_index: 20 },
  { id: "dsa.sorting.comparator.mc_descending.c", learning_item_id: "dsa.sorting.comparator.mc_descending", content: "[](int a, int b){ return a == b; }", is_correct: false, order_index: 30 },
  { id: "dsa.sorting.comparator.mc_descending.d", learning_item_id: "dsa.sorting.comparator.mc_descending", content: "No comparator; std::sort detects it automatically", is_correct: false, order_index: 40 },

  { id: "dsa.stacks.basic_stack.mc_parens.a", learning_item_id: "dsa.stacks.basic_stack.mc_parens", content: "A stack", is_correct: true, order_index: 10 },
  { id: "dsa.stacks.basic_stack.mc_parens.b", learning_item_id: "dsa.stacks.basic_stack.mc_parens", content: "A queue", is_correct: false, order_index: 20 },
  { id: "dsa.stacks.basic_stack.mc_parens.c", learning_item_id: "dsa.stacks.basic_stack.mc_parens", content: "A priority_queue", is_correct: false, order_index: 30 },
  { id: "dsa.stacks.basic_stack.mc_parens.d", learning_item_id: "dsa.stacks.basic_stack.mc_parens", content: "A sorted vector", is_correct: false, order_index: 40 },

  { id: "dsa.hashing.lookup.mc_advantage.a", learning_item_id: "dsa.hashing.lookup.mc_advantage", content: "Average O(1) membership instead of O(n) scanning", is_correct: true, order_index: 10 },
  { id: "dsa.hashing.lookup.mc_advantage.b", learning_item_id: "dsa.hashing.lookup.mc_advantage", content: "It keeps the elements sorted", is_correct: false, order_index: 20 },
  { id: "dsa.hashing.lookup.mc_advantage.c", learning_item_id: "dsa.hashing.lookup.mc_advantage", content: "It always uses less memory", is_correct: false, order_index: 30 },
  { id: "dsa.hashing.lookup.mc_advantage.d", learning_item_id: "dsa.hashing.lookup.mc_advantage", content: "It allows duplicate keys", is_correct: false, order_index: 40 },

  { id: "dsa.arrays.two_pointers.mc_complexity.a", learning_item_id: "dsa.arrays.two_pointers.mc_complexity", content: "O(n)", is_correct: true, order_index: 10 },
  { id: "dsa.arrays.two_pointers.mc_complexity.b", learning_item_id: "dsa.arrays.two_pointers.mc_complexity", content: "O(n^2)", is_correct: false, order_index: 20 },
  { id: "dsa.arrays.two_pointers.mc_complexity.c", learning_item_id: "dsa.arrays.two_pointers.mc_complexity", content: "O(log n)", is_correct: false, order_index: 30 },
  { id: "dsa.arrays.two_pointers.mc_complexity.d", learning_item_id: "dsa.arrays.two_pointers.mc_complexity", content: "O(1)", is_correct: false, order_index: 40 },

  { id: "dsa.recursion.base_case.mc_no_base.a", learning_item_id: "dsa.recursion.base_case.mc_no_base", content: "It recurses forever and overflows the call stack", is_correct: true, order_index: 10 },
  { id: "dsa.recursion.base_case.mc_no_base.b", learning_item_id: "dsa.recursion.base_case.mc_no_base", content: "It returns 0", is_correct: false, order_index: 20 },
  { id: "dsa.recursion.base_case.mc_no_base.c", learning_item_id: "dsa.recursion.base_case.mc_no_base", content: "The compiler refuses to build it", is_correct: false, order_index: 30 },
  { id: "dsa.recursion.base_case.mc_no_base.d", learning_item_id: "dsa.recursion.base_case.mc_no_base", content: "It runs once and stops", is_correct: false, order_index: 40 },

  { id: "dsa.trees.linked_list.mc_access.a", learning_item_id: "dsa.trees.linked_list.mc_access", content: "O(n)", is_correct: true, order_index: 10 },
  { id: "dsa.trees.linked_list.mc_access.b", learning_item_id: "dsa.trees.linked_list.mc_access", content: "O(1)", is_correct: false, order_index: 20 },
  { id: "dsa.trees.linked_list.mc_access.c", learning_item_id: "dsa.trees.linked_list.mc_access", content: "O(log n)", is_correct: false, order_index: 30 },
  { id: "dsa.trees.linked_list.mc_access.d", learning_item_id: "dsa.trees.linked_list.mc_access", content: "O(n log n)", is_correct: false, order_index: 40 },

  { id: "dsa.trees.list_vs_vector.mc_default.a", learning_item_id: "dsa.trees.list_vs_vector.mc_default", content: "Contiguous storage makes vector cache-friendly and fast to traverse", is_correct: true, order_index: 10 },
  { id: "dsa.trees.list_vs_vector.mc_default.b", learning_item_id: "dsa.trees.list_vs_vector.mc_default", content: "std::list cannot store more than 100 elements", is_correct: false, order_index: 20 },
  { id: "dsa.trees.list_vs_vector.mc_default.c", learning_item_id: "dsa.trees.list_vs_vector.mc_default", content: "std::vector gives O(1) mid-sequence insertion", is_correct: false, order_index: 30 },
  { id: "dsa.trees.list_vs_vector.mc_default.d", learning_item_id: "dsa.trees.list_vs_vector.mc_default", content: "std::list cannot be iterated", is_correct: false, order_index: 40 },

  { id: "dsa.trees.tree_terminology.mc_height.a", learning_item_id: "dsa.trees.tree_terminology.mc_height", content: "0", is_correct: true, order_index: 10 },
  { id: "dsa.trees.tree_terminology.mc_height.b", learning_item_id: "dsa.trees.tree_terminology.mc_height", content: "1", is_correct: false, order_index: 20 },
  { id: "dsa.trees.tree_terminology.mc_height.c", learning_item_id: "dsa.trees.tree_terminology.mc_height", content: "Its depth from the root", is_correct: false, order_index: 30 },
  { id: "dsa.trees.tree_terminology.mc_height.d", learning_item_id: "dsa.trees.tree_terminology.mc_height", content: "The number of nodes in the tree", is_correct: false, order_index: 40 },

  { id: "dsa.trees.traversal.mc_inorder_bst.a", learning_item_id: "dsa.trees.traversal.mc_inorder_bst", content: "Ascending sorted order", is_correct: true, order_index: 10 },
  { id: "dsa.trees.traversal.mc_inorder_bst.b", learning_item_id: "dsa.trees.traversal.mc_inorder_bst", content: "Descending sorted order", is_correct: false, order_index: 20 },
  { id: "dsa.trees.traversal.mc_inorder_bst.c", learning_item_id: "dsa.trees.traversal.mc_inorder_bst", content: "Level by level from the root", is_correct: false, order_index: 30 },
  { id: "dsa.trees.traversal.mc_inorder_bst.d", learning_item_id: "dsa.trees.traversal.mc_inorder_bst", content: "Random order", is_correct: false, order_index: 40 },

  { id: "dsa.trees.heap.mc_top_cost.a", learning_item_id: "dsa.trees.heap.mc_top_cost", content: "O(1)", is_correct: true, order_index: 10 },
  { id: "dsa.trees.heap.mc_top_cost.b", learning_item_id: "dsa.trees.heap.mc_top_cost", content: "O(log n)", is_correct: false, order_index: 20 },
  { id: "dsa.trees.heap.mc_top_cost.c", learning_item_id: "dsa.trees.heap.mc_top_cost", content: "O(n)", is_correct: false, order_index: 30 },
  { id: "dsa.trees.heap.mc_top_cost.d", learning_item_id: "dsa.trees.heap.mc_top_cost", content: "O(n log n)", is_correct: false, order_index: 40 },

  { id: "dsa.trees.disjoint_set.mc_use_case.a", learning_item_id: "dsa.trees.disjoint_set.mc_use_case", content: "Detecting whether adding an edge forms a cycle in a graph", is_correct: true, order_index: 10 },
  { id: "dsa.trees.disjoint_set.mc_use_case.b", learning_item_id: "dsa.trees.disjoint_set.mc_use_case", content: "Sorting an array in place", is_correct: false, order_index: 20 },
  { id: "dsa.trees.disjoint_set.mc_use_case.c", learning_item_id: "dsa.trees.disjoint_set.mc_use_case", content: "Finding the shortest string in a list", is_correct: false, order_index: 30 },
  { id: "dsa.trees.disjoint_set.mc_use_case.d", learning_item_id: "dsa.trees.disjoint_set.mc_use_case", content: "Reversing a linked list", is_correct: false, order_index: 40 },

  { id: "dsa.trees.bst_search.mc_cost.a", learning_item_id: "dsa.trees.bst_search.mc_cost", content: "O(h), the tree height", is_correct: true, order_index: 10 },
  { id: "dsa.trees.bst_search.mc_cost.b", learning_item_id: "dsa.trees.bst_search.mc_cost", content: "O(n) always", is_correct: false, order_index: 20 },
  { id: "dsa.trees.bst_search.mc_cost.c", learning_item_id: "dsa.trees.bst_search.mc_cost", content: "O(1)", is_correct: false, order_index: 30 },
  { id: "dsa.trees.bst_search.mc_cost.d", learning_item_id: "dsa.trees.bst_search.mc_cost", content: "O(n log n)", is_correct: false, order_index: 40 },

  { id: "dsa.trees.heap_applications.mc_topk.a", learning_item_id: "dsa.trees.heap_applications.mc_topk", content: "A min-heap of size k", is_correct: true, order_index: 10 },
  { id: "dsa.trees.heap_applications.mc_topk.b", learning_item_id: "dsa.trees.heap_applications.mc_topk", content: "A max-heap holding every element", is_correct: false, order_index: 20 },
  { id: "dsa.trees.heap_applications.mc_topk.c", learning_item_id: "dsa.trees.heap_applications.mc_topk", content: "A fully sorted copy of the whole stream", is_correct: false, order_index: 30 },
  { id: "dsa.trees.heap_applications.mc_topk.d", learning_item_id: "dsa.trees.heap_applications.mc_topk", content: "A hash set of all elements", is_correct: false, order_index: 40 },

  { id: "dsa.trees.dsu_internals.mc_compression.a", learning_item_id: "dsa.trees.dsu_internals.mc_compression", content: "Repoints visited nodes directly at the root, flattening the tree", is_correct: true, order_index: 10 },
  { id: "dsa.trees.dsu_internals.mc_compression.b", learning_item_id: "dsa.trees.dsu_internals.mc_compression", content: "Sorts the elements by rank", is_correct: false, order_index: 20 },
  { id: "dsa.trees.dsu_internals.mc_compression.c", learning_item_id: "dsa.trees.dsu_internals.mc_compression", content: "Deletes elements from the set", is_correct: false, order_index: 30 },
  { id: "dsa.trees.dsu_internals.mc_compression.d", learning_item_id: "dsa.trees.dsu_internals.mc_compression", content: "Balances the tree by rotating nodes", is_correct: false, order_index: 40 },

  { id: "dsa.graphs.representation.mc_sparse.a", learning_item_id: "dsa.graphs.representation.mc_sparse", content: "An adjacency list", is_correct: true, order_index: 10 },
  { id: "dsa.graphs.representation.mc_sparse.b", learning_item_id: "dsa.graphs.representation.mc_sparse", content: "An adjacency matrix", is_correct: false, order_index: 20 },
  { id: "dsa.graphs.representation.mc_sparse.c", learning_item_id: "dsa.graphs.representation.mc_sparse", content: "A V-by-V boolean grid", is_correct: false, order_index: 30 },
  { id: "dsa.graphs.representation.mc_sparse.d", learning_item_id: "dsa.graphs.representation.mc_sparse", content: "They use the same memory", is_correct: false, order_index: 40 },

  { id: "dsa.graphs.bfs.mc_shortest.a", learning_item_id: "dsa.graphs.bfs.mc_shortest", content: "The shortest path by number of edges to every reachable vertex", is_correct: true, order_index: 10 },
  { id: "dsa.graphs.bfs.mc_shortest.b", learning_item_id: "dsa.graphs.bfs.mc_shortest", content: "The minimum spanning tree", is_correct: false, order_index: 20 },
  { id: "dsa.graphs.bfs.mc_shortest.c", learning_item_id: "dsa.graphs.bfs.mc_shortest", content: "A topological ordering", is_correct: false, order_index: 30 },
  { id: "dsa.graphs.bfs.mc_shortest.d", learning_item_id: "dsa.graphs.bfs.mc_shortest", content: "The longest path in the graph", is_correct: false, order_index: 40 },

  { id: "dsa.graphs.dfs.mc_structure.a", learning_item_id: "dsa.graphs.dfs.mc_structure", content: "A stack (often the recursion call stack)", is_correct: true, order_index: 10 },
  { id: "dsa.graphs.dfs.mc_structure.b", learning_item_id: "dsa.graphs.dfs.mc_structure", content: "A FIFO queue", is_correct: false, order_index: 20 },
  { id: "dsa.graphs.dfs.mc_structure.c", learning_item_id: "dsa.graphs.dfs.mc_structure", content: "A min-priority queue", is_correct: false, order_index: 30 },
  { id: "dsa.graphs.dfs.mc_structure.d", learning_item_id: "dsa.graphs.dfs.mc_structure", content: "A hash map", is_correct: false, order_index: 40 },

  { id: "dsa.graphs.shortest_path.mc_dijkstra.a", learning_item_id: "dsa.graphs.shortest_path.mc_dijkstra", content: "It finalizes a vertex's distance once visited, which a negative edge can later undercut", is_correct: true, order_index: 10 },
  { id: "dsa.graphs.shortest_path.mc_dijkstra.b", learning_item_id: "dsa.graphs.shortest_path.mc_dijkstra", content: "It cannot use a priority queue", is_correct: false, order_index: 20 },
  { id: "dsa.graphs.shortest_path.mc_dijkstra.c", learning_item_id: "dsa.graphs.shortest_path.mc_dijkstra", content: "It only works on trees", is_correct: false, order_index: 30 },
  { id: "dsa.graphs.shortest_path.mc_dijkstra.d", learning_item_id: "dsa.graphs.shortest_path.mc_dijkstra", content: "It requires the graph to be undirected", is_correct: false, order_index: 40 },

  { id: "dsa.graphs.connected_components.mc_count.a", learning_item_id: "dsa.graphs.connected_components.mc_count", content: "Count how many times you start a BFS/DFS from an unvisited vertex", is_correct: true, order_index: 10 },
  { id: "dsa.graphs.connected_components.mc_count.b", learning_item_id: "dsa.graphs.connected_components.mc_count", content: "Count the total number of edges", is_correct: false, order_index: 20 },
  { id: "dsa.graphs.connected_components.mc_count.c", learning_item_id: "dsa.graphs.connected_components.mc_count", content: "Count the vertices with degree 0", is_correct: false, order_index: 30 },
  { id: "dsa.graphs.connected_components.mc_count.d", learning_item_id: "dsa.graphs.connected_components.mc_count", content: "Run Dijkstra from vertex 0", is_correct: false, order_index: 40 },

  { id: "dsa.graphs.cycle_detection.mc_directed.a", learning_item_id: "dsa.graphs.cycle_detection.mc_directed", content: "An edge to a gray vertex (still on the recursion stack)", is_correct: true, order_index: 10 },
  { id: "dsa.graphs.cycle_detection.mc_directed.b", learning_item_id: "dsa.graphs.cycle_detection.mc_directed", content: "An edge to a black (finished) vertex", is_correct: false, order_index: 20 },
  { id: "dsa.graphs.cycle_detection.mc_directed.c", learning_item_id: "dsa.graphs.cycle_detection.mc_directed", content: "An edge to a white (unvisited) vertex", is_correct: false, order_index: 30 },
  { id: "dsa.graphs.cycle_detection.mc_directed.d", learning_item_id: "dsa.graphs.cycle_detection.mc_directed", content: "Any edge at all", is_correct: false, order_index: 40 },

  { id: "dsa.graphs.topological_sort.mc_exists.a", learning_item_id: "dsa.graphs.topological_sort.mc_exists", content: "Acyclic (a DAG)", is_correct: true, order_index: 10 },
  { id: "dsa.graphs.topological_sort.mc_exists.b", learning_item_id: "dsa.graphs.topological_sort.mc_exists", content: "Connected", is_correct: false, order_index: 20 },
  { id: "dsa.graphs.topological_sort.mc_exists.c", learning_item_id: "dsa.graphs.topological_sort.mc_exists", content: "Undirected", is_correct: false, order_index: 30 },
  { id: "dsa.graphs.topological_sort.mc_exists.d", learning_item_id: "dsa.graphs.topological_sort.mc_exists", content: "Weighted with nonnegative edges", is_correct: false, order_index: 40 },

  { id: "dsa.techniques.prefix_sums.mc_query.a", learning_item_id: "dsa.techniques.prefix_sums.mc_query", content: "O(1)", is_correct: true, order_index: 10 },
  { id: "dsa.techniques.prefix_sums.mc_query.b", learning_item_id: "dsa.techniques.prefix_sums.mc_query", content: "O(log n)", is_correct: false, order_index: 20 },
  { id: "dsa.techniques.prefix_sums.mc_query.c", learning_item_id: "dsa.techniques.prefix_sums.mc_query", content: "O(n)", is_correct: false, order_index: 30 },
  { id: "dsa.techniques.prefix_sums.mc_query.d", learning_item_id: "dsa.techniques.prefix_sums.mc_query", content: "O(n^2)", is_correct: false, order_index: 40 },

  { id: "dsa.techniques.sliding_window.mc_complexity.a", learning_item_id: "dsa.techniques.sliding_window.mc_complexity", content: "Each element enters and leaves the window at most once", is_correct: true, order_index: 10 },
  { id: "dsa.techniques.sliding_window.mc_complexity.b", learning_item_id: "dsa.techniques.sliding_window.mc_complexity", content: "It sorts the array first", is_correct: false, order_index: 20 },
  { id: "dsa.techniques.sliding_window.mc_complexity.c", learning_item_id: "dsa.techniques.sliding_window.mc_complexity", content: "It uses recursion to skip elements", is_correct: false, order_index: 30 },
  { id: "dsa.techniques.sliding_window.mc_complexity.d", learning_item_id: "dsa.techniques.sliding_window.mc_complexity", content: "It examines every subarray explicitly", is_correct: false, order_index: 40 },

  { id: "dsa.techniques.greedy.mc_fails.a", learning_item_id: "dsa.techniques.greedy.mc_fails", content: "The 0/1 knapsack problem", is_correct: true, order_index: 10 },
  { id: "dsa.techniques.greedy.mc_fails.b", learning_item_id: "dsa.techniques.greedy.mc_fails", content: "Activity selection by earliest finish time", is_correct: false, order_index: 20 },
  { id: "dsa.techniques.greedy.mc_fails.c", learning_item_id: "dsa.techniques.greedy.mc_fails", content: "The fractional knapsack problem", is_correct: false, order_index: 30 },
  { id: "dsa.techniques.greedy.mc_fails.d", learning_item_id: "dsa.techniques.greedy.mc_fails", content: "Huffman coding", is_correct: false, order_index: 40 },

  { id: "dsa.techniques.dynamic_programming.mc_when.a", learning_item_id: "dsa.techniques.dynamic_programming.mc_when", content: "Optimal substructure and overlapping subproblems", is_correct: true, order_index: 10 },
  { id: "dsa.techniques.dynamic_programming.mc_when.b", learning_item_id: "dsa.techniques.dynamic_programming.mc_when", content: "Sorted input and a single answer", is_correct: false, order_index: 20 },
  { id: "dsa.techniques.dynamic_programming.mc_when.c", learning_item_id: "dsa.techniques.dynamic_programming.mc_when", content: "No recursion and constant memory", is_correct: false, order_index: 30 },
  { id: "dsa.techniques.dynamic_programming.mc_when.d", learning_item_id: "dsa.techniques.dynamic_programming.mc_when", content: "A greedy choice that is always safe", is_correct: false, order_index: 40 },

  { id: "dsa.techniques.range_structures.mc_dynamic.a", learning_item_id: "dsa.techniques.range_structures.mc_dynamic", content: "A Fenwick (binary indexed) tree", is_correct: true, order_index: 10 },
  { id: "dsa.techniques.range_structures.mc_dynamic.b", learning_item_id: "dsa.techniques.range_structures.mc_dynamic", content: "A static prefix-sum array", is_correct: false, order_index: 20 },
  { id: "dsa.techniques.range_structures.mc_dynamic.c", learning_item_id: "dsa.techniques.range_structures.mc_dynamic", content: "A sparse table", is_correct: false, order_index: 30 },
  { id: "dsa.techniques.range_structures.mc_dynamic.d", learning_item_id: "dsa.techniques.range_structures.mc_dynamic", content: "A plain unsorted vector", is_correct: false, order_index: 40 },

  { id: "dsa.techniques.greedy_proof.mc_exchange.a", learning_item_id: "dsa.techniques.greedy_proof.mc_exchange", content: "An exchange argument (swapping in the greedy choice never worsens an optimum)", is_correct: true, order_index: 10 },
  { id: "dsa.techniques.greedy_proof.mc_exchange.b", learning_item_id: "dsa.techniques.greedy_proof.mc_exchange", content: "Running it on a few example inputs", is_correct: false, order_index: 20 },
  { id: "dsa.techniques.greedy_proof.mc_exchange.c", learning_item_id: "dsa.techniques.greedy_proof.mc_exchange", content: "Measuring its runtime", is_correct: false, order_index: 30 },
  { id: "dsa.techniques.greedy_proof.mc_exchange.d", learning_item_id: "dsa.techniques.greedy_proof.mc_exchange", content: "Checking that it compiles without warnings", is_correct: false, order_index: 40 },

  { id: "dsa.techniques.dp_design.mc_order.a", learning_item_id: "dsa.techniques.dp_design.mc_order", content: "Only after the recurrence is correct", is_correct: true, order_index: 10 },
  { id: "dsa.techniques.dp_design.mc_order.b", learning_item_id: "dsa.techniques.dp_design.mc_order", content: "First, before writing the transition", is_correct: false, order_index: 20 },
  { id: "dsa.techniques.dp_design.mc_order.c", learning_item_id: "dsa.techniques.dp_design.mc_order", content: "Never; DP cannot be space-optimized", is_correct: false, order_index: 30 },
  { id: "dsa.techniques.dp_design.mc_order.d", learning_item_id: "dsa.techniques.dp_design.mc_order", content: "Only when using recursion", is_correct: false, order_index: 40 },

  { id: "dsa.strings.manipulation.mc_concat.a", learning_item_id: "dsa.strings.manipulation.mc_concat", content: "Each concatenation copies all characters accumulated so far", is_correct: true, order_index: 10 },
  { id: "dsa.strings.manipulation.mc_concat.b", learning_item_id: "dsa.strings.manipulation.mc_concat", content: "Strings are immutable, so it cannot be done at all", is_correct: false, order_index: 20 },
  { id: "dsa.strings.manipulation.mc_concat.c", learning_item_id: "dsa.strings.manipulation.mc_concat", content: "The compiler inserts a sort on every step", is_correct: false, order_index: 30 },
  { id: "dsa.strings.manipulation.mc_concat.d", learning_item_id: "dsa.strings.manipulation.mc_concat", content: "It allocates exactly one byte per iteration", is_correct: false, order_index: 40 },

  { id: "dsa.strings.searching.mc_kmp.a", learning_item_id: "dsa.strings.searching.mc_kmp", content: "O(n + m)", is_correct: true, order_index: 10 },
  { id: "dsa.strings.searching.mc_kmp.b", learning_item_id: "dsa.strings.searching.mc_kmp", content: "O(n * m)", is_correct: false, order_index: 20 },
  { id: "dsa.strings.searching.mc_kmp.c", learning_item_id: "dsa.strings.searching.mc_kmp", content: "O(n^2)", is_correct: false, order_index: 30 },
  { id: "dsa.strings.searching.mc_kmp.d", learning_item_id: "dsa.strings.searching.mc_kmp", content: "O(m log n)", is_correct: false, order_index: 40 },

  { id: "dsa.strings.palindrome.mc_anagram.a", learning_item_id: "dsa.strings.palindrome.mc_anagram", content: "Count each character's frequency in both strings and compare the counts", is_correct: true, order_index: 10 },
  { id: "dsa.strings.palindrome.mc_anagram.b", learning_item_id: "dsa.strings.palindrome.mc_anagram", content: "Compare the strings with two pointers from both ends", is_correct: false, order_index: 20 },
  { id: "dsa.strings.palindrome.mc_anagram.c", learning_item_id: "dsa.strings.palindrome.mc_anagram", content: "Reverse one string and check equality", is_correct: false, order_index: 30 },
  { id: "dsa.strings.palindrome.mc_anagram.d", learning_item_id: "dsa.strings.palindrome.mc_anagram", content: "Hash the whole string and compare hashes", is_correct: false, order_index: 40 },

  { id: "dsa.strings.parsing.mc_delim.a", learning_item_id: "dsa.strings.parsing.mc_delim", content: "std::getline(stream, token, ',')", is_correct: true, order_index: 10 },
  { id: "dsa.strings.parsing.mc_delim.b", learning_item_id: "dsa.strings.parsing.mc_delim", content: "stream >> token", is_correct: false, order_index: 20 },
  { id: "dsa.strings.parsing.mc_delim.c", learning_item_id: "dsa.strings.parsing.mc_delim", content: "std::sort(token.begin(), token.end())", is_correct: false, order_index: 30 },
  { id: "dsa.strings.parsing.mc_delim.d", learning_item_id: "dsa.strings.parsing.mc_delim", content: "token.push_back(',')", is_correct: false, order_index: 40 },

  { id: "dsa.strings.prefix_function.mc_value.a", learning_item_id: "dsa.strings.prefix_function.mc_value", content: "The length of the longest proper prefix of s[0..i] that is also a suffix", is_correct: true, order_index: 10 },
  { id: "dsa.strings.prefix_function.mc_value.b", learning_item_id: "dsa.strings.prefix_function.mc_value", content: "The index in the text where the pattern was found", is_correct: false, order_index: 20 },
  { id: "dsa.strings.prefix_function.mc_value.c", learning_item_id: "dsa.strings.prefix_function.mc_value", content: "The number of times s[i] appears in the string", is_correct: false, order_index: 30 },
  { id: "dsa.strings.prefix_function.mc_value.d", learning_item_id: "dsa.strings.prefix_function.mc_value", content: "The ASCII code of the character s[i]", is_correct: false, order_index: 40 },

  { id: "dsa.strings.trie.mc_usecase.a", learning_item_id: "dsa.strings.trie.mc_usecase", content: "Autocomplete: listing all words that start with a given prefix", is_correct: true, order_index: 10 },
  { id: "dsa.strings.trie.mc_usecase.b", learning_item_id: "dsa.strings.trie.mc_usecase", content: "Checking exact membership of a single key", is_correct: false, order_index: 20 },
  { id: "dsa.strings.trie.mc_usecase.c", learning_item_id: "dsa.strings.trie.mc_usecase", content: "Using the least possible memory for a few keys", is_correct: false, order_index: 30 },
  { id: "dsa.strings.trie.mc_usecase.d", learning_item_id: "dsa.strings.trie.mc_usecase", content: "Hashing a string to a single integer", is_correct: false, order_index: 40 },

  { id: "dsa.strings.hashing.mc_collision.a", learning_item_id: "dsa.strings.hashing.mc_collision", content: "They are probably equal, but you must verify (collisions are possible)", is_correct: true, order_index: 10 },
  { id: "dsa.strings.hashing.mc_collision.b", learning_item_id: "dsa.strings.hashing.mc_collision", content: "They are guaranteed to be identical", is_correct: false, order_index: 20 },
  { id: "dsa.strings.hashing.mc_collision.c", learning_item_id: "dsa.strings.hashing.mc_collision", content: "They are guaranteed to be different", is_correct: false, order_index: 30 },
  { id: "dsa.strings.hashing.mc_collision.d", learning_item_id: "dsa.strings.hashing.mc_collision", content: "Nothing, because hashes are random", is_correct: false, order_index: 40 },

  { id: "cpp.oop.composition.mc_relationship.a", learning_item_id: "cpp.oop.composition.mc_relationship", content: "A Car has-an Engine", is_correct: true, order_index: 10 },
  { id: "cpp.oop.composition.mc_relationship.b", learning_item_id: "cpp.oop.composition.mc_relationship", content: "A Dog is-an Animal", is_correct: false, order_index: 20 },
  { id: "cpp.oop.composition.mc_relationship.c", learning_item_id: "cpp.oop.composition.mc_relationship", content: "A Square is-a Shape", is_correct: false, order_index: 30 },
  { id: "cpp.oop.composition.mc_relationship.d", learning_item_id: "cpp.oop.composition.mc_relationship", content: "A Manager is-an Employee", is_correct: false, order_index: 40 },

  { id: "cpp.oop.inheritance.mc_access.a", learning_item_id: "cpp.oop.inheritance.mc_access", content: "Its public and protected members", is_correct: true, order_index: 10 },
  { id: "cpp.oop.inheritance.mc_access.b", learning_item_id: "cpp.oop.inheritance.mc_access", content: "Only its public members", is_correct: false, order_index: 20 },
  { id: "cpp.oop.inheritance.mc_access.c", learning_item_id: "cpp.oop.inheritance.mc_access", content: "All members including private ones", is_correct: false, order_index: 30 },
  { id: "cpp.oop.inheritance.mc_access.d", learning_item_id: "cpp.oop.inheritance.mc_access", content: "None of them", is_correct: false, order_index: 40 },

  { id: "cpp.oop.virtual_polymorphism.mc_destructor.a", learning_item_id: "cpp.oop.virtual_polymorphism.mc_destructor", content: "Otherwise deleting through the base pointer skips the derived destructor and leaks", is_correct: true, order_index: 10 },
  { id: "cpp.oop.virtual_polymorphism.mc_destructor.b", learning_item_id: "cpp.oop.virtual_polymorphism.mc_destructor", content: "Otherwise the class cannot have any members", is_correct: false, order_index: 20 },
  { id: "cpp.oop.virtual_polymorphism.mc_destructor.c", learning_item_id: "cpp.oop.virtual_polymorphism.mc_destructor", content: "Because constructors must also be virtual", is_correct: false, order_index: 30 },
  { id: "cpp.oop.virtual_polymorphism.mc_destructor.d", learning_item_id: "cpp.oop.virtual_polymorphism.mc_destructor", content: "It makes the class smaller in memory", is_correct: false, order_index: 40 },

  { id: "cpp.oop.abstract_interfaces.mc_pure_virtual.a", learning_item_id: "cpp.oop.abstract_interfaces.mc_pure_virtual", content: "It makes the class abstract so it cannot be instantiated and must be overridden", is_correct: true, order_index: 10 },
  { id: "cpp.oop.abstract_interfaces.mc_pure_virtual.b", learning_item_id: "cpp.oop.abstract_interfaces.mc_pure_virtual", content: "It gives draw a default empty body", is_correct: false, order_index: 20 },
  { id: "cpp.oop.abstract_interfaces.mc_pure_virtual.c", learning_item_id: "cpp.oop.abstract_interfaces.mc_pure_virtual", content: "It deletes the draw function", is_correct: false, order_index: 30 },
  { id: "cpp.oop.abstract_interfaces.mc_pure_virtual.d", learning_item_id: "cpp.oop.abstract_interfaces.mc_pure_virtual", content: "It makes draw a static function", is_correct: false, order_index: 40 },
  { id: "cpp.oop.slicing.mc_slice.a", learning_item_id: "cpp.oop.slicing.mc_slice", content: "They are sliced off; b holds only the base part and uses base behavior", is_correct: true, order_index: 10 },
  { id: "cpp.oop.slicing.mc_slice.b", learning_item_id: "cpp.oop.slicing.mc_slice", content: "They are preserved, and b dispatches to the derived overrides", is_correct: false, order_index: 20 },
  { id: "cpp.oop.slicing.mc_slice.c", learning_item_id: "cpp.oop.slicing.mc_slice", content: "The assignment fails to compile", is_correct: false, order_index: 30 },
  { id: "cpp.oop.slicing.mc_slice.d", learning_item_id: "cpp.oop.slicing.mc_slice", content: "b becomes a reference to d", is_correct: false, order_index: 40 },
  { id: "cpp.oop.override_final.mc_override.a", learning_item_id: "cpp.oop.override_final.mc_override", content: "Verify the function actually overrides a base virtual, erroring on a signature mismatch", is_correct: true, order_index: 10 },
  { id: "cpp.oop.override_final.mc_override.b", learning_item_id: "cpp.oop.override_final.mc_override", content: "Make the function virtual even if the base function is not", is_correct: false, order_index: 20 },
  { id: "cpp.oop.override_final.mc_override.c", learning_item_id: "cpp.oop.override_final.mc_override", content: "Prevent any further class from overriding it", is_correct: false, order_index: 30 },
  { id: "cpp.oop.override_final.mc_override.d", learning_item_id: "cpp.oop.override_final.mc_override", content: "Generate a default implementation automatically", is_correct: false, order_index: 40 },
  { id: "cpp.oop.polymorphic_ownership.mc_unique.a", learning_item_id: "cpp.oop.polymorphic_ownership.mc_unique", content: "std::unique_ptr<Base>", is_correct: true, order_index: 10 },
  { id: "cpp.oop.polymorphic_ownership.mc_unique.b", learning_item_id: "cpp.oop.polymorphic_ownership.mc_unique", content: "Base (returned by value)", is_correct: false, order_index: 20 },
  { id: "cpp.oop.polymorphic_ownership.mc_unique.c", learning_item_id: "cpp.oop.polymorphic_ownership.mc_unique", content: "Base& (a reference)", is_correct: false, order_index: 30 },
  { id: "cpp.oop.polymorphic_ownership.mc_unique.d", learning_item_id: "cpp.oop.polymorphic_ownership.mc_unique", content: "A raw Base* the caller must remember to delete", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.threads.mc_join.a", learning_item_id: "cpp.concurrency.threads.mc_join", content: "The program calls std::terminate and aborts", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.threads.mc_join.b", learning_item_id: "cpp.concurrency.threads.mc_join", content: "The thread is silently joined for you", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.threads.mc_join.c", learning_item_id: "cpp.concurrency.threads.mc_join", content: "The thread keeps running with no consequences", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.threads.mc_join.d", learning_item_id: "cpp.concurrency.threads.mc_join", content: "The compiler rejects the program", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.data_races.mc_define.a", learning_item_id: "cpp.concurrency.data_races.mc_define", content: "Two threads access the same variable concurrently and at least one writes, with no synchronization", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.data_races.mc_define.b", learning_item_id: "cpp.concurrency.data_races.mc_define", content: "Several threads only read the same shared constant", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.data_races.mc_define.c", learning_item_id: "cpp.concurrency.data_races.mc_define", content: "One thread writes a variable that no other thread touches", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.data_races.mc_define.d", learning_item_id: "cpp.concurrency.data_races.mc_define", content: "Threads write shared data while holding the same mutex", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.mutexes.mc_lock_guard.a", learning_item_id: "cpp.concurrency.mutexes.mc_lock_guard", content: "It releases the mutex automatically, even if the critical section throws", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.mutexes.mc_lock_guard.b", learning_item_id: "cpp.concurrency.mutexes.mc_lock_guard", content: "It makes the mutex faster to lock", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.mutexes.mc_lock_guard.c", learning_item_id: "cpp.concurrency.mutexes.mc_lock_guard", content: "It allows many threads to hold the mutex at once", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.mutexes.mc_lock_guard.d", learning_item_id: "cpp.concurrency.mutexes.mc_lock_guard", content: "It removes the need for a mutex entirely", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.async.mc_get.a", learning_item_id: "cpp.concurrency.async.mc_get", content: "Blocks until the task finishes, then returns its result or rethrows its exception", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.async.mc_get.b", learning_item_id: "cpp.concurrency.async.mc_get", content: "Cancels the task immediately", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.async.mc_get.c", learning_item_id: "cpp.concurrency.async.mc_get", content: "Returns a default value without waiting", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.async.mc_get.d", learning_item_id: "cpp.concurrency.async.mc_get", content: "Starts a brand-new thread each time it is called", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.deadlock.mc_order.a", learning_item_id: "cpp.concurrency.deadlock.mc_order", content: "Always acquire the mutexes in the same order (or take both with std::scoped_lock)", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.deadlock.mc_order.b", learning_item_id: "cpp.concurrency.deadlock.mc_order", content: "Have each thread lock them in the opposite order", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.deadlock.mc_order.c", learning_item_id: "cpp.concurrency.deadlock.mc_order", content: "Add a short sleep before the second lock", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.deadlock.mc_order.d", learning_item_id: "cpp.concurrency.deadlock.mc_order", content: "Use a recursive_mutex for both", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.condition_variables.mc_predicate.a", learning_item_id: "cpp.concurrency.condition_variables.mc_predicate", content: "A thread can wake spuriously or after the condition was already handled, so it must re-check", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.condition_variables.mc_predicate.b", learning_item_id: "cpp.concurrency.condition_variables.mc_predicate", content: "The predicate makes wait() return faster", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.condition_variables.mc_predicate.c", learning_item_id: "cpp.concurrency.condition_variables.mc_predicate", content: "wait() cannot compile without a predicate", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.condition_variables.mc_predicate.d", learning_item_id: "cpp.concurrency.condition_variables.mc_predicate", content: "It avoids having to hold the mutex while waiting", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.atomics.mc_volatile.a", learning_item_id: "cpp.concurrency.atomics.mc_volatile", content: "volatile gives no atomicity and no cross-thread ordering guarantees; use std::atomic", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.atomics.mc_volatile.b", learning_item_id: "cpp.concurrency.atomics.mc_volatile", content: "volatile is fully equivalent to std::atomic for threads", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.atomics.mc_volatile.c", learning_item_id: "cpp.concurrency.atomics.mc_volatile", content: "volatile makes all reads and writes use a mutex", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.atomics.mc_volatile.d", learning_item_id: "cpp.concurrency.atomics.mc_volatile", content: "volatile only works on integer types", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.jthread.mc_stop.a", learning_item_id: "cpp.concurrency.jthread.mc_stop", content: "The worker polls its stop_token (stop_requested()) and exits on its own; cancellation is cooperative", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.jthread.mc_stop.b", learning_item_id: "cpp.concurrency.jthread.mc_stop", content: "request_stop() forcibly terminates the running thread immediately", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.jthread.mc_stop.c", learning_item_id: "cpp.concurrency.jthread.mc_stop", content: "The operating system kills the thread and reclaims its stack", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.jthread.mc_stop.d", learning_item_id: "cpp.concurrency.jthread.mc_stop", content: "It throws an exception inside the worker to unwind it", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.promise_future.mc_promise.a", learning_item_id: "cpp.concurrency.promise_future.mc_promise", content: "The producer calls promise.set_value(x); the consumer's future.get() blocks until then and returns x", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.promise_future.mc_promise.b", learning_item_id: "cpp.concurrency.promise_future.mc_promise", content: "The consumer reads the value directly out of the promise object", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.promise_future.mc_promise.c", learning_item_id: "cpp.concurrency.promise_future.mc_promise", content: "The value is copied automatically when the producer thread joins", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.promise_future.mc_promise.d", learning_item_id: "cpp.concurrency.promise_future.mc_promise", content: "A shared global variable must be used; promise/future cannot pass values", is_correct: false, order_index: 40 },

  { id: "cpp.concurrency.task_selection.mc_concurrency.a", learning_item_id: "cpp.concurrency.task_selection.mc_concurrency", content: "Concurrency: overlap independent tasks so one progresses while another waits", is_correct: true, order_index: 10 },
  { id: "cpp.concurrency.task_selection.mc_concurrency.b", learning_item_id: "cpp.concurrency.task_selection.mc_concurrency", content: "Parallelism: run the work simultaneously on many cores", is_correct: false, order_index: 20 },
  { id: "cpp.concurrency.task_selection.mc_concurrency.c", learning_item_id: "cpp.concurrency.task_selection.mc_concurrency", content: "Adding more CPU cores", is_correct: false, order_index: 30 },
  { id: "cpp.concurrency.task_selection.mc_concurrency.d", learning_item_id: "cpp.concurrency.task_selection.mc_concurrency", content: "Vectorizing the inner compute loop", is_correct: false, order_index: 40 },

  { id: "cpp.utilities.file_io.mc_exists.a", learning_item_id: "cpp.utilities.file_io.mc_exists", content: "std::filesystem::exists(path)", is_correct: true, order_index: 10 },
  { id: "cpp.utilities.file_io.mc_exists.b", learning_item_id: "cpp.utilities.file_io.mc_exists", content: "std::cout << path", is_correct: false, order_index: 20 },
  { id: "cpp.utilities.file_io.mc_exists.c", learning_item_id: "cpp.utilities.file_io.mc_exists", content: "std::string::find on the path text", is_correct: false, order_index: 30 },
  { id: "cpp.utilities.file_io.mc_exists.d", learning_item_id: "cpp.utilities.file_io.mc_exists", content: "std::sort on the directory", is_correct: false, order_index: 40 },

  { id: "cpp.utilities.chrono.mc_clock.a", learning_item_id: "cpp.utilities.chrono.mc_clock", content: "std::chrono::steady_clock", is_correct: true, order_index: 10 },
  { id: "cpp.utilities.chrono.mc_clock.b", learning_item_id: "cpp.utilities.chrono.mc_clock", content: "std::chrono::system_clock", is_correct: false, order_index: 20 },
  { id: "cpp.utilities.chrono.mc_clock.c", learning_item_id: "cpp.utilities.chrono.mc_clock", content: "The wall clock on the screen", is_correct: false, order_index: 30 },
  { id: "cpp.utilities.chrono.mc_clock.d", learning_item_id: "cpp.utilities.chrono.mc_clock", content: "std::time(nullptr)", is_correct: false, order_index: 40 },

  { id: "cpp.utilities.random.mc_bias.a", learning_item_id: "cpp.utilities.random.mc_bias", content: "A random engine with std::uniform_int_distribution(1, 6)", is_correct: true, order_index: 10 },
  { id: "cpp.utilities.random.mc_bias.b", learning_item_id: "cpp.utilities.random.mc_bias", content: "rand() % 6 + 1", is_correct: false, order_index: 20 },
  { id: "cpp.utilities.random.mc_bias.c", learning_item_id: "cpp.utilities.random.mc_bias", content: "Taking the system time modulo 6", is_correct: false, order_index: 30 },
  { id: "cpp.utilities.random.mc_bias.d", learning_item_id: "cpp.utilities.random.mc_bias", content: "Hashing a counter modulo 6", is_correct: false, order_index: 40 },

  { id: "cpp.utilities.variant.mc_optional.a", learning_item_id: "cpp.utilities.variant.mc_optional", content: "An int that may or may not be present, without a magic sentinel value", is_correct: true, order_index: 10 },
  { id: "cpp.utilities.variant.mc_optional.b", learning_item_id: "cpp.utilities.variant.mc_optional", content: "A list of many ints", is_correct: false, order_index: 20 },
  { id: "cpp.utilities.variant.mc_optional.c", learning_item_id: "cpp.utilities.variant.mc_optional", content: "An int shared safely between threads", is_correct: false, order_index: 30 },
  { id: "cpp.utilities.variant.mc_optional.d", learning_item_id: "cpp.utilities.variant.mc_optional", content: "An int guaranteed to be prime", is_correct: false, order_index: 40 },

  { id: "cpp.utilities.stream_validation.mc_recover.a", learning_item_id: "cpp.utilities.stream_validation.mc_recover", content: "Call cin.clear() to reset error flags, then cin.ignore(...) to discard the bad input", is_correct: true, order_index: 10 },
  { id: "cpp.utilities.stream_validation.mc_recover.b", learning_item_id: "cpp.utilities.stream_validation.mc_recover", content: "Nothing; the next >> automatically retries cleanly", is_correct: false, order_index: 20 },
  { id: "cpp.utilities.stream_validation.mc_recover.c", learning_item_id: "cpp.utilities.stream_validation.mc_recover", content: "Re-declare the variable n", is_correct: false, order_index: 30 },
  { id: "cpp.utilities.stream_validation.mc_recover.d", learning_item_id: "cpp.utilities.stream_validation.mc_recover", content: "Close and reopen std::cin", is_correct: false, order_index: 40 },

  { id: "cpp.utilities.tuples.mc_bind.a", learning_item_id: "cpp.utilities.tuples.mc_bind", content: "auto [lo, hi] = f(); (structured bindings)", is_correct: true, order_index: 10 },
  { id: "cpp.utilities.tuples.mc_bind.b", learning_item_id: "cpp.utilities.tuples.mc_bind", content: "Read p.first and p.second on separate lines", is_correct: false, order_index: 20 },
  { id: "cpp.utilities.tuples.mc_bind.c", learning_item_id: "cpp.utilities.tuples.mc_bind", content: "Cast the pair to an array and index it", is_correct: false, order_index: 30 },
  { id: "cpp.utilities.tuples.mc_bind.d", learning_item_id: "cpp.utilities.tuples.mc_bind", content: "Call std::get on the pair without a template index", is_correct: false, order_index: 40 },

  { id: "cpp.utilities.enums.mc_choose.a", learning_item_id: "cpp.utilities.enums.mc_choose", content: "enum class", is_correct: true, order_index: 10 },
  { id: "cpp.utilities.enums.mc_choose.b", learning_item_id: "cpp.utilities.enums.mc_choose", content: "std::variant, one alternative per state", is_correct: false, order_index: 20 },
  { id: "cpp.utilities.enums.mc_choose.c", learning_item_id: "cpp.utilities.enums.mc_choose", content: "A base class with a virtual function per state", is_correct: false, order_index: 30 },
  { id: "cpp.utilities.enums.mc_choose.d", learning_item_id: "cpp.utilities.enums.mc_choose", content: "A plain int with documented magic values", is_correct: false, order_index: 40 },

  { id: "dsa.math.bit_manipulation.mc_test_bit.a", learning_item_id: "dsa.math.bit_manipulation.mc_test_bit", content: "(x >> i) & 1", is_correct: true, order_index: 10 },
  { id: "dsa.math.bit_manipulation.mc_test_bit.b", learning_item_id: "dsa.math.bit_manipulation.mc_test_bit", content: "x % i", is_correct: false, order_index: 20 },
  { id: "dsa.math.bit_manipulation.mc_test_bit.c", learning_item_id: "dsa.math.bit_manipulation.mc_test_bit", content: "x ^ i", is_correct: false, order_index: 30 },
  { id: "dsa.math.bit_manipulation.mc_test_bit.d", learning_item_id: "dsa.math.bit_manipulation.mc_test_bit", content: "x << i", is_correct: false, order_index: 40 },

  { id: "dsa.math.number_theory.mc_gcd.a", learning_item_id: "dsa.math.number_theory.mc_gcd", content: "Replace (a, b) with (b, a % b) until b is 0", is_correct: true, order_index: 10 },
  { id: "dsa.math.number_theory.mc_gcd.b", learning_item_id: "dsa.math.number_theory.mc_gcd", content: "Multiply a and b repeatedly", is_correct: false, order_index: 20 },
  { id: "dsa.math.number_theory.mc_gcd.c", learning_item_id: "dsa.math.number_theory.mc_gcd", content: "Subtract 1 from both until they match", is_correct: false, order_index: 30 },
  { id: "dsa.math.number_theory.mc_gcd.d", learning_item_id: "dsa.math.number_theory.mc_gcd", content: "Add a and b until one is prime", is_correct: false, order_index: 40 },

  { id: "dsa.math.combinatorics.mc_committee.a", learning_item_id: "dsa.math.combinatorics.mc_committee", content: "A combination, because order does not matter", is_correct: true, order_index: 10 },
  { id: "dsa.math.combinatorics.mc_committee.b", learning_item_id: "dsa.math.combinatorics.mc_committee", content: "A permutation, because order matters", is_correct: false, order_index: 20 },
  { id: "dsa.math.combinatorics.mc_committee.c", learning_item_id: "dsa.math.combinatorics.mc_committee", content: "Neither; it is just 10 times 3", is_correct: false, order_index: 30 },
  { id: "dsa.math.combinatorics.mc_committee.d", learning_item_id: "dsa.math.combinatorics.mc_committee", content: "A factorial of 10", is_correct: false, order_index: 40 },

  { id: "dsa.math.geometry.mc_cross.a", learning_item_id: "dsa.math.geometry.mc_cross", content: "The orientation: left turn, right turn, or collinear", is_correct: true, order_index: 10 },
  { id: "dsa.math.geometry.mc_cross.b", learning_item_id: "dsa.math.geometry.mc_cross", content: "The exact distance between the points", is_correct: false, order_index: 20 },
  { id: "dsa.math.geometry.mc_cross.c", learning_item_id: "dsa.math.geometry.mc_cross", content: "Whether the points are integers", is_correct: false, order_index: 30 },
  { id: "dsa.math.geometry.mc_cross.d", learning_item_id: "dsa.math.geometry.mc_cross", content: "The number of points on the line", is_correct: false, order_index: 40 },

  { id: "dsa.math.bitmask_techniques.mc_submask.a", learning_item_id: "dsa.math.bitmask_techniques.mc_submask", content: "for (int s = mask; s; s = (s - 1) & mask)", is_correct: true, order_index: 10 },
  { id: "dsa.math.bitmask_techniques.mc_submask.b", learning_item_id: "dsa.math.bitmask_techniques.mc_submask", content: "for (int s = 0; s < mask; ++s)", is_correct: false, order_index: 20 },
  { id: "dsa.math.bitmask_techniques.mc_submask.c", learning_item_id: "dsa.math.bitmask_techniques.mc_submask", content: "for (int s = mask; s; s >>= 1)", is_correct: false, order_index: 30 },
  { id: "dsa.math.bitmask_techniques.mc_submask.d", learning_item_id: "dsa.math.bitmask_techniques.mc_submask", content: "for (int s = mask; s; s = s & (s + 1))", is_correct: false, order_index: 40 },

  { id: "dsa.math.sieve.mc_trial.a", learning_item_id: "dsa.math.sieve.mc_trial", content: "Up to sqrt(n)", is_correct: true, order_index: 10 },
  { id: "dsa.math.sieve.mc_trial.b", learning_item_id: "dsa.math.sieve.mc_trial", content: "Up to n - 1", is_correct: false, order_index: 20 },
  { id: "dsa.math.sieve.mc_trial.c", learning_item_id: "dsa.math.sieve.mc_trial", content: "Up to n / 2 only", is_correct: false, order_index: 30 },
  { id: "dsa.math.sieve.mc_trial.d", learning_item_id: "dsa.math.sieve.mc_trial", content: "Up to log(n)", is_correct: false, order_index: 40 },

  { id: "dsa.math.modular_arithmetic.mc_fastpow.a", learning_item_id: "dsa.math.modular_arithmetic.mc_fastpow", content: "Binary exponentiation (square the base, halve the exponent): O(log b)", is_correct: true, order_index: 10 },
  { id: "dsa.math.modular_arithmetic.mc_fastpow.b", learning_item_id: "dsa.math.modular_arithmetic.mc_fastpow", content: "Multiply a by itself in a loop b times: O(b)", is_correct: false, order_index: 20 },
  { id: "dsa.math.modular_arithmetic.mc_fastpow.c", learning_item_id: "dsa.math.modular_arithmetic.mc_fastpow", content: "Use std::pow(a, b) and take the result mod m", is_correct: false, order_index: 30 },
  { id: "dsa.math.modular_arithmetic.mc_fastpow.d", learning_item_id: "dsa.math.modular_arithmetic.mc_fastpow", content: "Factor b into primes first", is_correct: false, order_index: 40 }
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
