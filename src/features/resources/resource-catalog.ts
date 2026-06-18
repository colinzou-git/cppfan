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
    id: "cpp-core-guidelines",
    name: "C++ Core Guidelines",
    url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines",
    kind: "guidelines",
    description: "Modern C++ style and safety guidance, including resource management.",
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
