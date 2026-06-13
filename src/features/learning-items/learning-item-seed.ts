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
  }
];

export const learningItemSkills: LearningItemSkill[] = [
  { learning_item_id: "cpp.program_basics.structure.lesson", skill_id: "cpp.program_basics.structure", is_primary: true },
  { learning_item_id: "cpp.program_basics.structure.mc_entry", skill_id: "cpp.program_basics.structure", is_primary: true },
  { learning_item_id: "cpp.program_basics.io.lesson", skill_id: "cpp.program_basics.io", is_primary: true },
  { learning_item_id: "cpp.program_basics.io.mc_read", skill_id: "cpp.program_basics.io", is_primary: true },
  { learning_item_id: "cpp.values_types.variables.lesson", skill_id: "cpp.values_types.variables", is_primary: true },
  { learning_item_id: "cpp.values_types.variables.mc_auto", skill_id: "cpp.values_types.variables", is_primary: true },
  { learning_item_id: "cpp.values_types.conversions.lesson", skill_id: "cpp.values_types.conversions", is_primary: true },
  { learning_item_id: "cpp.values_types.conversions.mc_static_cast", skill_id: "cpp.values_types.conversions", is_primary: true },
  { learning_item_id: "cpp.control_flow.conditionals.lesson", skill_id: "cpp.control_flow.conditionals", is_primary: true },
  { learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", skill_id: "cpp.control_flow.conditionals", is_primary: true },
  { learning_item_id: "cpp.control_flow.loops.lesson", skill_id: "cpp.control_flow.loops", is_primary: true },
  { learning_item_id: "cpp.control_flow.loops.mc_offbyone", skill_id: "cpp.control_flow.loops", is_primary: true },
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
  { learning_item_id: "cpp.templates.class_templates.mc_vector", skill_id: "cpp.stl.vector", is_primary: false },
  { learning_item_id: "cpp.tooling.error_handling.lesson", skill_id: "cpp.tooling.error_handling", is_primary: true },
  { learning_item_id: "cpp.tooling.error_handling.mc_unwind", skill_id: "cpp.tooling.error_handling", is_primary: true },
  { learning_item_id: "cpp.tooling.testing.lesson", skill_id: "cpp.tooling.testing", is_primary: true },
  { learning_item_id: "cpp.tooling.testing.mc_regression", skill_id: "cpp.tooling.testing", is_primary: true },
  { learning_item_id: "cpp.tooling.debugging.lesson", skill_id: "cpp.tooling.debugging", is_primary: true },
  { learning_item_id: "cpp.tooling.debugging.mc_firststep", skill_id: "cpp.tooling.debugging", is_primary: true },
  { learning_item_id: "cpp.tooling.build.lesson", skill_id: "cpp.tooling.build", is_primary: true },
  { learning_item_id: "cpp.tooling.build.mc_linkstage", skill_id: "cpp.tooling.build", is_primary: true },
  { learning_item_id: "cpp.tooling.error_handling.lesson", skill_id: "cpp.raii.exception_safety_intro", is_primary: false },
  { learning_item_id: "dsa.complexity.big_o.lesson", skill_id: "dsa.complexity.big_o", is_primary: true },
  { learning_item_id: "dsa.complexity.big_o.mc_single_loop", skill_id: "dsa.complexity.big_o", is_primary: true },
  { learning_item_id: "dsa.complexity.problem_solving.lesson", skill_id: "dsa.complexity.problem_solving", is_primary: true },
  { learning_item_id: "dsa.complexity.problem_solving.mc_first_step", skill_id: "dsa.complexity.problem_solving", is_primary: true },
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
  { learning_item_id: "dsa.trees.traversal.lesson", skill_id: "dsa.trees.traversal", is_primary: true },
  { learning_item_id: "dsa.trees.traversal.mc_inorder_bst", skill_id: "dsa.trees.traversal", is_primary: true },
  { learning_item_id: "dsa.trees.heap.lesson", skill_id: "dsa.trees.heap", is_primary: true },
  { learning_item_id: "dsa.trees.heap.mc_top_cost", skill_id: "dsa.trees.heap", is_primary: true },
  { learning_item_id: "dsa.trees.disjoint_set.lesson", skill_id: "dsa.trees.disjoint_set", is_primary: true },
  { learning_item_id: "dsa.trees.disjoint_set.mc_use_case", skill_id: "dsa.trees.disjoint_set", is_primary: true },
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

  { id: "cpp.values_types.variables.mc_auto.a", learning_item_id: "cpp.values_types.variables.mc_auto", content: "double", is_correct: true, order_index: 10 },
  { id: "cpp.values_types.variables.mc_auto.b", learning_item_id: "cpp.values_types.variables.mc_auto", content: "int", is_correct: false, order_index: 20 },
  { id: "cpp.values_types.variables.mc_auto.c", learning_item_id: "cpp.values_types.variables.mc_auto", content: "float", is_correct: false, order_index: 30 },
  { id: "cpp.values_types.variables.mc_auto.d", learning_item_id: "cpp.values_types.variables.mc_auto", content: "auto is not a real type here", is_correct: false, order_index: 40 },

  { id: "cpp.values_types.conversions.mc_static_cast.a", learning_item_id: "cpp.values_types.conversions.mc_static_cast", content: "3 (truncated toward zero)", is_correct: true, order_index: 10 },
  { id: "cpp.values_types.conversions.mc_static_cast.b", learning_item_id: "cpp.values_types.conversions.mc_static_cast", content: "4 (rounded)", is_correct: false, order_index: 20 },
  { id: "cpp.values_types.conversions.mc_static_cast.c", learning_item_id: "cpp.values_types.conversions.mc_static_cast", content: "3.9 (unchanged)", is_correct: false, order_index: 30 },
  { id: "cpp.values_types.conversions.mc_static_cast.d", learning_item_id: "cpp.values_types.conversions.mc_static_cast", content: "a compile error", is_correct: false, order_index: 40 },

  { id: "cpp.control_flow.conditionals.mc_fallthrough.a", learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", content: "Execution falls through into the next case", is_correct: true, order_index: 10 },
  { id: "cpp.control_flow.conditionals.mc_fallthrough.b", learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", content: "It is a compile error", is_correct: false, order_index: 20 },
  { id: "cpp.control_flow.conditionals.mc_fallthrough.c", learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", content: "Nothing; break is automatic", is_correct: false, order_index: 30 },
  { id: "cpp.control_flow.conditionals.mc_fallthrough.d", learning_item_id: "cpp.control_flow.conditionals.mc_fallthrough", content: "The program crashes at runtime", is_correct: false, order_index: 40 },

  { id: "cpp.control_flow.loops.mc_offbyone.a", learning_item_id: "cpp.control_flow.loops.mc_offbyone", content: "i < n", is_correct: true, order_index: 10 },
  { id: "cpp.control_flow.loops.mc_offbyone.b", learning_item_id: "cpp.control_flow.loops.mc_offbyone", content: "i <= n", is_correct: false, order_index: 20 },
  { id: "cpp.control_flow.loops.mc_offbyone.c", learning_item_id: "cpp.control_flow.loops.mc_offbyone", content: "i < n - 1", is_correct: false, order_index: 30 },
  { id: "cpp.control_flow.loops.mc_offbyone.d", learning_item_id: "cpp.control_flow.loops.mc_offbyone", content: "i != n + 1", is_correct: false, order_index: 40 },

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

  { id: "dsa.complexity.big_o.mc_single_loop.a", learning_item_id: "dsa.complexity.big_o.mc_single_loop", content: "O(n)", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.big_o.mc_single_loop.b", learning_item_id: "dsa.complexity.big_o.mc_single_loop", content: "O(1)", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.big_o.mc_single_loop.c", learning_item_id: "dsa.complexity.big_o.mc_single_loop", content: "O(n^2)", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.big_o.mc_single_loop.d", learning_item_id: "dsa.complexity.big_o.mc_single_loop", content: "O(log n)", is_correct: false, order_index: 40 },

  { id: "dsa.complexity.problem_solving.mc_first_step.a", learning_item_id: "dsa.complexity.problem_solving.mc_first_step", content: "Write a correct brute-force solution and test it", is_correct: true, order_index: 10 },
  { id: "dsa.complexity.problem_solving.mc_first_step.b", learning_item_id: "dsa.complexity.problem_solving.mc_first_step", content: "Pick the fastest known algorithm immediately", is_correct: false, order_index: 20 },
  { id: "dsa.complexity.problem_solving.mc_first_step.c", learning_item_id: "dsa.complexity.problem_solving.mc_first_step", content: "Skip the examples and start coding", is_correct: false, order_index: 30 },
  { id: "dsa.complexity.problem_solving.mc_first_step.d", learning_item_id: "dsa.complexity.problem_solving.mc_first_step", content: "Optimize memory usage first", is_correct: false, order_index: 40 },

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
  { id: "dsa.trees.disjoint_set.mc_use_case.d", learning_item_id: "dsa.trees.disjoint_set.mc_use_case", content: "Reversing a linked list", is_correct: false, order_index: 40 }
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
