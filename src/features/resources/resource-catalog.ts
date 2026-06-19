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
    id: "cpp-core-guidelines-concurrency",
    name: "C++ Core Guidelines: concurrency",
    url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-concurrency",
    kind: "guidelines",
    description: "Guidance to avoid data races, minimize shared writable state, and think in tasks.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-condition-variable",
    name: "cppreference: condition_variable",
    url: "https://en.cppreference.com/w/cpp/thread/condition_variable",
    kind: "reference",
    description: "Reference for condition_variable waiting, notification, and predicate-based producer-consumer coordination.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-jthread",
    name: "cppreference: jthread",
    url: "https://en.cppreference.com/w/cpp/thread/jthread",
    kind: "reference",
    description: "Reference for auto-joining std::jthread and cooperative stop_token support.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-atomic",
    name: "cppreference: atomic",
    url: "https://en.cppreference.com/w/cpp/atomic/atomic",
    kind: "reference",
    description: "Reference for std::atomic operations and their synchronization role.",
    tags: ["cpp"]
  },
  {
    id: "clang-thread-sanitizer",
    name: "Clang ThreadSanitizer",
    url: "https://clang.llvm.org/docs/ThreadSanitizer.html",
    kind: "reference",
    description: "Official ThreadSanitizer guide for detecting data races when the toolchain supports it.",
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
    id: "cppreference-filesystem",
    name: "cppreference: std::filesystem",
    url: "https://en.cppreference.com/w/cpp/filesystem",
    kind: "reference",
    description: "Reference for portable paths, file type checks, directory iteration, and error_code overloads.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-fstream",
    name: "cppreference: file streams",
    url: "https://en.cppreference.com/w/cpp/io/basic_fstream",
    kind: "reference",
    description: "Reference for file stream ownership, open modes, state checks, and RAII closing.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-chrono",
    name: "cppreference: chrono",
    url: "https://en.cppreference.com/w/cpp/chrono",
    kind: "reference",
    description: "Reference for clocks, durations, time points, duration_cast, and elapsed-time measurement.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-random",
    name: "cppreference: random",
    url: "https://en.cppreference.com/w/cpp/numeric/random",
    kind: "reference",
    description: "Reference for random engines, distributions, seeding, and unbiased range generation.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-variant",
    name: "cppreference: std::variant",
    url: "https://en.cppreference.com/w/cpp/utility/variant",
    kind: "reference",
    description: "Reference for type-safe alternatives, std::visit, and exhaustive variant handling.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-any",
    name: "cppreference: std::any",
    url: "https://en.cppreference.com/w/cpp/utility/any",
    kind: "reference",
    description: "Reference for type-erased storage, any_cast, and runtime cast failures.",
    tags: ["cpp"]
  },
  {
    id: "cppreference-tuple",
    name: "cppreference: std::tuple",
    url: "https://en.cppreference.com/w/cpp/utility/tuple",
    kind: "reference",
    description: "Reference for fixed-size heterogeneous value groups and structured-binding-friendly access.",
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
    id: "cses-graph-algorithms",
    name: "CSES: Graph Algorithms",
    url: "https://cses.fi/problemset/",
    kind: "practice",
    description: "Problem set section covering graph traversal, routes, connectivity, DAGs, and shortest paths.",
    tags: ["dsa"]
  },
  {
    id: "usaco-guide-graph-traversal",
    name: "USACO Guide: graph traversal",
    url: "https://usaco.guide/silver/graph-traversal",
    kind: "guidelines",
    description: "Practice-oriented guide for DFS/BFS traversal, connected components, and grid-as-graph modeling.",
    tags: ["dsa"]
  },
  {
    id: "usaco-guide-unweighted-shortest-paths",
    name: "USACO Guide: unweighted shortest paths",
    url: "https://usaco.guide/gold/unweighted-shortest-paths",
    kind: "guidelines",
    description: "Guide to BFS shortest paths and parent-style route reconstruction on unweighted graphs.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-bfs",
    name: "cp-algorithms: breadth-first search",
    url: "https://cp-algorithms.com/graph/breadth-first-search.html",
    kind: "reference",
    description: "Reference for BFS traversal, shortest paths in unweighted graphs, and path restoration.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-dijkstra",
    name: "cp-algorithms: Dijkstra",
    url: "https://cp-algorithms.com/graph/dijkstra.html",
    kind: "reference",
    description: "Reference for Dijkstra's algorithm and its nonnegative-weight precondition.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-bellman-ford",
    name: "cp-algorithms: Bellman-Ford",
    url: "https://cp-algorithms.com/graph/bellman_ford.html",
    kind: "reference",
    description: "Reference for single-source shortest paths with negative edges and negative-cycle detection.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-floyd-warshall",
    name: "cp-algorithms: Floyd-Warshall",
    url: "https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html",
    kind: "reference",
    description: "Reference for all-pairs shortest paths on small graphs using O(V^3) dynamic programming.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-kruskal-dsu",
    name: "cp-algorithms: Kruskal with DSU",
    url: "https://cp-algorithms.com/graph/mst_kruskal_with_dsu.html",
    kind: "reference",
    description: "Reference for minimum spanning tree construction with sorted edges and union-find.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-strongly-connected-components",
    name: "cp-algorithms: strongly connected components",
    url: "https://cp-algorithms.com/graph/strongly-connected-components.html",
    kind: "reference",
    description: "Reference for SCC decomposition and condensation graphs in directed graphs.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-bridges",
    name: "cp-algorithms: bridges",
    url: "https://cp-algorithms.com/graph/bridge-searching.html",
    kind: "reference",
    description: "Reference for finding bridge edges with DFS low-link values.",
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
    id: "cp-algorithms-fenwick-tree",
    name: "cp-algorithms: Fenwick tree",
    url: "https://cp-algorithms.com/data_structures/fenwick.html",
    kind: "reference",
    description: "Reference for binary indexed tree operations, lowbit jumps, and O(log n) dynamic prefix sums.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-sparse-table",
    name: "cp-algorithms: sparse table",
    url: "https://cp-algorithms.com/data_structures/sparse-table.html",
    kind: "reference",
    description: "Reference for immutable idempotent range queries such as range minimum with O(1) lookup.",
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
    id: "usaco-guide-dynamic-programming",
    name: "USACO Guide: dynamic programming",
    url: "https://usaco.guide/gold/dp",
    kind: "guidelines",
    description: "Practice-oriented introduction to DP state design, transitions, and table order.",
    tags: ["dsa"]
  },
  {
    id: "cses-dynamic-programming",
    name: "CSES: Dynamic Programming",
    url: "https://cses.fi/problemset/list/",
    kind: "practice",
    description: "Introductory DP practice section with small-state problems suitable after guided examples.",
    tags: ["dsa"]
  },
  {
    id: "cses-range-queries",
    name: "CSES: Range Queries",
    url: "https://cses.fi/problemset/list/",
    kind: "practice",
    description: "Range-query practice section for static prefix sums, Fenwick trees, segment trees, and sparse-table style tradeoffs.",
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
    id: "cses-string-algorithms",
    name: "CSES: String Algorithms",
    url: "https://cses.fi/problemset/list/",
    kind: "practice",
    description: "String-algorithm practice section for pattern matching, borders, hashing, and related text-processing tasks.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-prefix-function",
    name: "cp-algorithms: prefix function",
    url: "https://cp-algorithms.com/string/prefix-function.html",
    kind: "reference",
    description: "Reference for prefix-function construction, KMP-style matching, and border interpretation.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-z-function",
    name: "cp-algorithms: Z-function",
    url: "https://cp-algorithms.com/string/z-function.html",
    kind: "reference",
    description: "Reference for Z-array meaning, linear Z-box construction, and pattern matching with pattern+separator+text.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-string-hashing",
    name: "cp-algorithms: string hashing",
    url: "https://cp-algorithms.com/string/string-hashing.html",
    kind: "reference",
    description: "Reference for polynomial rolling hashes, substring equality, collision risk, and multi-hash safeguards.",
    tags: ["dsa"]
  },
  {
    id: "cses-mathematics",
    name: "CSES: Mathematics",
    url: "https://cses.fi/problemset/",
    kind: "practice",
    description: "Problem set section for number theory, modular arithmetic, combinatorics, and counting practice.",
    tags: ["dsa"]
  },
  {
    id: "cses-geometry",
    name: "CSES: Geometry",
    url: "https://cses.fi/problemset/",
    kind: "practice",
    description: "Problem set section for orientation, segment intersection, polygon area, point-in-polygon, and convex hull practice.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-bit-manipulation",
    name: "cp-algorithms: bit manipulation",
    url: "https://cp-algorithms.com/algebra/bit-manipulation.html",
    kind: "reference",
    description: "Reference for binary representation, shifts, bitwise operators, and common bit tricks.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-submasks",
    name: "cp-algorithms: enumerating submasks",
    url: "https://cp-algorithms.com/algebra/all-submasks.html",
    kind: "reference",
    description: "Reference for iterating all submasks of a mask and the zero-submask edge case.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-euclid",
    name: "cp-algorithms: Euclidean algorithm",
    url: "https://cp-algorithms.com/algebra/euclid-algorithm.html",
    kind: "reference",
    description: "Reference for GCD, LCM via GCD, and Euclid's logarithmic algorithm.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-sieve",
    name: "cp-algorithms: sieve of Eratosthenes",
    url: "https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html",
    kind: "reference",
    description: "Reference for prime precomputation, marking multiples, and sieve complexity.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-factorization",
    name: "cp-algorithms: integer factorization",
    url: "https://cp-algorithms.com/algebra/factorization.html",
    kind: "reference",
    description: "Reference for trial division, factor extraction, and factorization method choices.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-binary-exp",
    name: "cp-algorithms: binary exponentiation",
    url: "https://cp-algorithms.com/algebra/binary-exp.html",
    kind: "reference",
    description: "Reference for exponentiation by squaring, modular power, and logarithmic exponent handling.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-modular-inverse",
    name: "cp-algorithms: modular inverse",
    url: "https://cp-algorithms.com/algebra/module-inverse.html",
    kind: "reference",
    description: "Reference for modular inverse prerequisites, prime-modulus shortcuts, and inverse existence.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-binomial-coefficients",
    name: "cp-algorithms: binomial coefficients",
    url: "https://cp-algorithms.com/combinatorics/binomial-coefficients.html",
    kind: "reference",
    description: "Reference for Pascal recurrence, factorial formulas, and modular binomial coefficients.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-inclusion-exclusion",
    name: "cp-algorithms: inclusion-exclusion",
    url: "https://cp-algorithms.com/combinatorics/inclusion-exclusion.html",
    kind: "reference",
    description: "Reference for adding and subtracting intersections to count unions without double-counting.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-generating-combinations",
    name: "cp-algorithms: generating combinations",
    url: "https://cp-algorithms.com/combinatorics/generating_combinations.html",
    kind: "reference",
    description: "Reference for generating k-combinations and connecting combinations to bitmask-style ordering.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-basic-geometry",
    name: "cp-algorithms: basic geometry",
    url: "https://cp-algorithms.com/geometry/basic-geometry.html",
    kind: "reference",
    description: "Reference for points, vectors, dot products, cross products, and geometric primitives.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-segment-intersection",
    name: "cp-algorithms: segment intersection",
    url: "https://cp-algorithms.com/geometry/segments-intersection.html",
    kind: "reference",
    description: "Reference for checking whether two line segments intersect, including collinear cases.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-polygon-area",
    name: "cp-algorithms: polygon area",
    url: "https://cp-algorithms.com/geometry/area-of-simple-polygon.html",
    kind: "reference",
    description: "Reference for computing simple polygon area from ordered vertices.",
    tags: ["dsa"]
  },
  {
    id: "cp-algorithms-convex-hull",
    name: "cp-algorithms: convex hull",
    url: "https://cp-algorithms.com/geometry/convex-hull.html",
    kind: "reference",
    description: "Reference for convex hull construction and the orientation checks used by hull algorithms.",
    tags: ["dsa"]
  },
  {
    id: "usaco-guide-complete-recursion",
    name: "USACO Guide: complete search with recursion",
    url: "https://usaco.guide/bronze/complete-rec",
    kind: "guidelines",
    description: "Practice-oriented guide for recursive generation, including permutations and bitmask subsets.",
    tags: ["dsa"]
  },
  {
    id: "usaco-guide-bitmask-dp",
    name: "USACO Guide: bitmask DP",
    url: "https://usaco.guide/gold/dp-bitmasks",
    kind: "guidelines",
    description: "Guide for representing subsets as masks and using bit operations in small-state DP.",
    tags: ["dsa"]
  },
  {
    id: "usaco-guide-combinatorics",
    name: "USACO Guide: combinatorics",
    url: "https://usaco.guide/gold/combo",
    kind: "guidelines",
    description: "Practice-oriented guide for combinations, permutations, and modular counting patterns.",
    tags: ["dsa"]
  },
  {
    id: "usaco-guide-geometry-primitives",
    name: "USACO Guide: geometry primitives",
    url: "https://usaco.guide/plat/geo-pri",
    kind: "guidelines",
    description: "Guide for points, vectors, orientation, and segment-intersection primitives.",
    tags: ["dsa"]
  },
  {
    id: "usaco-guide-convex-hull",
    name: "USACO Guide: convex hull",
    url: "https://usaco.guide/plat/convex-hull",
    kind: "guidelines",
    description: "Guide and visualization-oriented reference for convex hull as advanced geometry enrichment.",
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
