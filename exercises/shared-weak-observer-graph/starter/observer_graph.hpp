// Exercise: shared-weak-observer-graph
// Link parent and child nodes without creating a reference cycle.
//
// Rules:
//  - A Node owns its children with std::shared_ptr.
//  - A Node points back to its parent with a std::weak_ptr (so the parent<->child
//    link does NOT keep both alive forever — no leak).
//  - add_child(parent, child): append child to parent->children and set
//    child->parent to the parent (as a weak reference).
//  - parent_value(child): return the parent's value, or -1 if the parent has
//    already been destroyed (the weak_ptr is expired).
//
// Setting child->parent = parent must NOT increase the parent's use_count.
// The tests run under AddressSanitizer to catch cycles/leaks.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <memory>
#include <vector>

struct Node {
  int value;
  std::vector<std::shared_ptr<Node>> children;
  std::weak_ptr<Node> parent;
  explicit Node(int v) : value(v) {}
};

inline std::shared_ptr<Node> make_node(int value) {
  return std::make_shared<Node>(value);
}

inline void add_child(const std::shared_ptr<Node>& parent, const std::shared_ptr<Node>& child) {
  // TODO: add child to parent->children and set child->parent (weak) to parent.
  (void)parent;
  (void)child;
}

inline int parent_value(const std::shared_ptr<Node>& child) {
  // TODO: lock the weak parent; return its value, or -1 if expired.
  (void)child;
  return -1;
}
