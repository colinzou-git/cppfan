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
  }
];

export const learningItemSkills: LearningItemSkill[] = [
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
  { learning_item_id: "dsa.arrays.indexing.lesson", skill_id: "dsa.arrays.indexing", is_primary: true },
  { learning_item_id: "dsa.arrays.indexing.mc_last_index", skill_id: "dsa.arrays.indexing", is_primary: true },
  { learning_item_id: "dsa.arrays.traversal.code_reading", skill_id: "dsa.arrays.traversal", is_primary: true },
  { learning_item_id: "dsa.arrays.traversal.mc_safe_loop", skill_id: "dsa.arrays.traversal", is_primary: true },
  { learning_item_id: "dsa.arrays.traversal.mc_safe_loop", skill_id: "dsa.arrays.indexing", is_primary: false }
];

export const learningItemChoices: LearningItemChoice[] = [
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

  { id: "dsa.arrays.indexing.mc_last_index.a", learning_item_id: "dsa.arrays.indexing.mc_last_index", content: "n - 1", is_correct: true, order_index: 10 },
  { id: "dsa.arrays.indexing.mc_last_index.b", learning_item_id: "dsa.arrays.indexing.mc_last_index", content: "n", is_correct: false, order_index: 20 },
  { id: "dsa.arrays.indexing.mc_last_index.c", learning_item_id: "dsa.arrays.indexing.mc_last_index", content: "n + 1", is_correct: false, order_index: 30 },
  { id: "dsa.arrays.indexing.mc_last_index.d", learning_item_id: "dsa.arrays.indexing.mc_last_index", content: "1", is_correct: false, order_index: 40 },

  { id: "dsa.arrays.traversal.mc_safe_loop.a", learning_item_id: "dsa.arrays.traversal.mc_safe_loop", content: "for (int x : v) { ... }", is_correct: true, order_index: 10 },
  { id: "dsa.arrays.traversal.mc_safe_loop.b", learning_item_id: "dsa.arrays.traversal.mc_safe_loop", content: "for (int i = 0; i <= v.size(); i++) { ... }", is_correct: false, order_index: 20 },
  { id: "dsa.arrays.traversal.mc_safe_loop.c", learning_item_id: "dsa.arrays.traversal.mc_safe_loop", content: "for (int i = 1; i < v.size(); i++) { ... }", is_correct: false, order_index: 30 },
  { id: "dsa.arrays.traversal.mc_safe_loop.d", learning_item_id: "dsa.arrays.traversal.mc_safe_loop", content: "while (true) { ... }", is_correct: false, order_index: 40 }
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
