// Reference solution for shared-weak-observer-graph.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <memory>
#include <vector>

// Nodes own their children with shared_ptr but point back to the parent with a
// weak_ptr, so parent<->child links do NOT form a reference cycle (no leak).
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
  parent->children.push_back(child);
  child->parent = parent;  // weak: does not raise parent's use_count
}

// Value of the child's parent, or -1 if the parent no longer exists (weak expired).
inline int parent_value(const std::shared_ptr<Node>& child) {
  if (std::shared_ptr<Node> p = child->parent.lock()) {
    return p->value;
  }
  return -1;
}
