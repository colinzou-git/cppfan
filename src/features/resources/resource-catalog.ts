export type ResourceKind = "tutorial" | "reference" | "practice" | "guidelines" | "project";

export type ResourceTag = "cpp" | "dsa" | "projects";

export type ExternalResource = {
  id: string;
  name: string;
  url: string;
  kind: ResourceKind;
  description: string;
  tags: ResourceTag[];
};

/*
 * A small, static catalog of high-quality external C++/DSA resources. cppFan
 * recommends the right resource at the right time rather than copying external
 * material. Keep entries original (short descriptions) and link out.
 */
export const externalResources: ExternalResource[] = [
  {
    id: "learncpp",
    name: "LearnCpp",
    url: "https://www.learncpp.com",
    kind: "tutorial",
    description: "Free, beginner-friendly tutorial spine for C++ language concepts.",
    tags: ["cpp"]
  },
  {
    id: "learncpp-initialization",
    name: "Variable assignment and initialization",
    url: "https://www.learncpp.com/cpp-tutorial/variable-assignment-and-initialization/",
    kind: "tutorial",
    description: "Focused beginner reference for assignment, initialization forms, and safe initialization habits.",
    tags: ["cpp"]
  },
  {
    id: "learncpp-forward-declarations",
    name: "Forward declarations",
    url: "https://www.learncpp.com/cpp-tutorial/forward-declarations/",
    kind: "tutorial",
    description: "Beginner-friendly explanation of declarations, definitions, and why link errors happen.",
    tags: ["cpp"]
  },
  {
    id: "learncpp-namespaces",
    name: "Naming collisions and namespaces",
    url: "https://www.learncpp.com/cpp-tutorial/naming-collisions-and-an-introduction-to-namespaces/",
    kind: "tutorial",
    description: "Introduction to naming collisions, namespaces, and qualified names.",
    tags: ["cpp"]
  },
  {
    id: "cppreference",
    name: "cppreference",
    url: "https://en.cppreference.com",
    kind: "reference",
    description: "Precise reference for the C++ language and standard library.",
    tags: ["cpp", "dsa"]
  },
  {
    id: "cppreference-concepts-library",
    name: "cppreference: standard concepts",
    url: "https://en.cppreference.com/w/cpp/concepts",
    kind: "reference",
    description: "Reference index for standard concepts such as integral, floating_point, same_as, and ranges concepts.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-constraints",
    name: "cppreference: constraints and concepts",
    url: "https://en.cppreference.com/w/cpp/language/constraints",
    kind: "reference",
    description: "Language reference for requires clauses, constrained declarations, and concept diagnostics.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-ranges-algorithms",
    name: "cppreference: ranges algorithms",
    url: "https://en.cppreference.com/w/cpp/algorithm/ranges",
    kind: "reference",
    description: "Reference index for std::ranges algorithms that operate on whole ranges.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-filter-view",
    name: "cppreference: filter_view",
    url: "https://en.cppreference.com/w/cpp/ranges/filter_view",
    kind: "reference",
    description: "Reference for lazy filtering views and their range/lifetime requirements.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-transform-view",
    name: "cppreference: transform_view",
    url: "https://en.cppreference.com/w/cpp/ranges/transform_view",
    kind: "reference",
    description: "Reference for lazy transformation views in ranges pipelines.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-take-view",
    name: "cppreference: take_view",
    url: "https://en.cppreference.com/w/cpp/ranges/take_view",
    kind: "reference",
    description: "Reference for limiting a lazy view pipeline to the first n elements.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-constexpr",
    name: "cppreference: constexpr",
    url: "https://en.cppreference.com/w/cpp/language/constexpr",
    kind: "reference",
    description: "Language reference for constexpr variables, functions, and compile-time evaluation.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-static-assert",
    name: "cppreference: static_assert",
    url: "https://en.cppreference.com/w/cpp/language/static_assert",
    kind: "reference",
    description: "Language reference for compile-time assertions and diagnostic messages.",
    tags: ["cpp"]
  },
  {
    id: "cmake-tutorial",
    name: "CMake tutorial",
    url: "https://cmake.org/cmake/help/latest/guide/tutorial/index.html",
    kind: "tutorial",
    description: "Official CMake tutorial covering targets, build directories, and project structure.",
    tags: ["cpp"]
  },
  {
    id: "gcc-warning-options",
    name: "GCC warning options",
    url: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
    kind: "reference",
    description: "Reference for GCC warning flags such as -Wall, -Wextra, -Wpedantic, and -Werror.",
    tags: ["cpp"]
  },
  {
    id: "clang-address-sanitizer",
    name: "Clang AddressSanitizer",
    url: "https://clang.llvm.org/docs/AddressSanitizer.html",
    kind: "reference",
    description: "Official AddressSanitizer guide with build flags, reports, and usage notes.",
    tags: ["cpp"]
  },
  {
    id: "clang-undefined-behavior-sanitizer",
    name: "Clang UndefinedBehaviorSanitizer",
    url: "https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html",
    kind: "reference",
    description: "Official UBSan guide for catching undefined behavior in debug/test builds.",
    tags: ["cpp"]
  },
  {
    id: "clang-tidy",
    name: "clang-tidy",
    url: "https://clang.llvm.org/extra/clang-tidy/",
    kind: "reference",
    description: "Static-analysis and linting tool for catching C++ defects and maintainability issues.",
    tags: ["cpp"]
  },
  {
    id: "cpp-core-guidelines",
    name: "C++ Core Guidelines",
    url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines",
    kind: "guidelines",
    description: "Modern C++ style and safety guidance, including resource management.",
    tags: ["cpp"]
  },
  {
    id: "cpp-core-guidelines-interfaces",
    name: "C++ Core Guidelines: interfaces",
    url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-interfaces",
    kind: "guidelines",
    description: "Guidance for function interfaces, parameter passing, ownership, and clear contracts.",
    tags: ["cpp"]
  },
  {
    id: "cpp-core-guidelines-rule-of-zero",
    name: "C++ Core Guidelines: default operations",
    url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Rc-zero",
    kind: "guidelines",
    description: "Guidance to avoid defining copy, move, and destructor operations when members can manage themselves.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-rule-of-three",
    name: "cppreference: rule of three/five/zero",
    url: "https://en.cppreference.com/w/cpp/language/rule_of_three",
    kind: "reference",
    description: "Reference for special-member ownership rules, including Rule of Zero and Rule of Five.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-copy-assignment",
    name: "cppreference: copy assignment",
    url: "https://en.cppreference.com/w/cpp/language/as_operator",
    kind: "reference",
    description: "Reference for copy-assignment generation and overload behavior.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-explicit",
    name: "cppreference: explicit",
    url: "https://en.cppreference.com/w/cpp/language/explicit",
    kind: "reference",
    description: "Reference for explicit constructors and conversion functions.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-optional",
    name: "cppreference: std::optional",
    url: "https://en.cppreference.com/w/cpp/utility/optional",
    kind: "reference",
    description: "Reference for representing an expected maybe-value without sentinel values.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-span",
    name: "cppreference: std::span",
    url: "https://en.cppreference.com/w/cpp/container/span",
    kind: "reference",
    description: "Reference for non-owning contiguous range parameters.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-string-view",
    name: "cppreference: std::string_view",
    url: "https://en.cppreference.com/w/cpp/string/basic_string_view",
    kind: "reference",
    description: "Reference for non-owning string parameters and lifetime caveats.",
    tags: ["cpp"]
  },
  {
    id: "hackerrank-cpp",
    name: "HackerRank C++",
    url: "https://www.hackerrank.com/domains/cpp",
    kind: "practice",
    description: "Introductory interactive C++ practice categories.",
    tags: ["cpp"]
  },
  {
    id: "cses",
    name: "CSES Problem Set",
    url: "https://cses.fi/problemset/",
    kind: "practice",
    description: "A clean, topic-ordered data-structures and algorithms problem bank.",
    tags: ["dsa"]
  },
  {
    id: "usaco-guide",
    name: "USACO Guide",
    url: "https://usaco.guide",
    kind: "guidelines",
    description: "Curated DSA explanations with difficulty levels and problem sets.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms",
    name: "cp-algorithms",
    url: "https://cp-algorithms.com",
    kind: "reference",
    description: "Algorithm explanations and implementation patterns.",
    tags: ["dsa"]
  },
  {
    id: "cppreference-vector",
    name: "cppreference: std::vector",
    url: "https://en.cppreference.com/w/cpp/container/vector",
    kind: "reference",
    description: "Reference for contiguous dynamic arrays, iterator invalidation, and amortized append behavior.",
    tags: ["cpp", "dsa"]
  },
  {
    id: "cppreference-list",
    name: "cppreference: std::list",
    url: "https://en.cppreference.com/w/cpp/container/list",
    kind: "reference",
    description: "Reference for node-based lists, splice behavior, and iterator stability tradeoffs.",
    tags: ["cpp", "dsa"]
  },
  {
    id: "cppreference-priority-queue",
    name: "cppreference: std::priority_queue",
    url: "https://en.cppreference.com/w/cpp/container/priority_queue",
    kind: "reference",
    description: "Reference for the heap-backed priority queue adapter and its push/pop/top complexity.",
    tags: ["cpp", "dsa"]
  },
  {
    id: "cp-algorithms-disjoint-set-union",
    name: "cp-algorithms: disjoint set union",
    url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html",
    kind: "reference",
    description: "Implementation-oriented guide to union-find with path compression, union by size/rank, and applications.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-range-queries",
    name: "cp-algorithms: range queries",
    url: "https://cp-algorithms.com/data_structures/segment_tree.html",
    kind: "reference",
    description: "Range-query data-structure reference that motivates query/update and memory tradeoffs.",
    tags: ["dsa"]
  },
  {
    id: "usaco-guide-prefix-sums",
    name: "USACO Guide: prefix sums",
    url: "https://usaco.guide/silver/prefix-sums",
    kind: "guidelines",
    description: "Practice-oriented walkthrough of prefix sums as a time/space tradeoff for repeated range queries.",
    tags: ["dsa"]
  },
  {
    id: "cses-sorting-searching",
    name: "CSES: Sorting and Searching",
    url: "https://cses.fi/problemset/list/",
    kind: "practice",
    description: "Problem set section with constraint-driven choices among sorting, scanning, hashing, and prefix-style techniques.",
    tags: ["dsa"]
  },
  {
    id: "the-algorithms-cpp",
    name: "TheAlgorithms / C++",
    url: "https://github.com/TheAlgorithms/C-Plus-Plus",
    kind: "project",
    description: "Educational C++ implementations of common algorithms and data structures.",
    tags: ["dsa", "projects"]
  },
  {
    id: "project-based-learning",
    name: "Project Based Learning",
    url: "https://github.com/practical-tutorials/project-based-learning",
    kind: "project",
    description: "Build-it-yourself project ideas (shells, emulators, databases, and more).",
    tags: ["projects"]
  }
];

export function getResourcesByKind(kind: ResourceKind): ExternalResource[] {
  return externalResources.filter((resource) => resource.kind === kind);
}

export function getResourcesByTag(tag: ResourceTag): ExternalResource[] {
  return externalResources.filter((resource) => resource.tags.includes(tag));
}
