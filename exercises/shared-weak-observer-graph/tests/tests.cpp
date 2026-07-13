// Tests for shared-weak-observer-graph. Build with -I _harness and the impl dir.
#include <memory>

#include "check.hpp"
#include "observer_graph.hpp"

static void test_parent_value() {
  auto root = make_node(10);
  auto child = make_node(20);
  add_child(root, child);
  CHECK(parent_value(child) == 10);
}

static void test_weak_does_not_raise_use_count() {
  auto root = make_node(1);
  auto child = make_node(2);
  add_child(root, child);
  // root is owned only by the local shared_ptr; child->parent is weak.
  CHECK(root.use_count() == 1);
  // child is owned by the local shared_ptr AND by root->children.
  CHECK(child.use_count() == 2);
}

static void test_expired_parent_returns_minus_one() {
  auto child = make_node(5);
  {
    auto root = make_node(99);
    add_child(root, child);
    CHECK(parent_value(child) == 99);
  }  // root destroyed here
  CHECK(parent_value(child) == -1);
}

static void test_root_has_no_parent() {
  auto root = make_node(7);
  CHECK(parent_value(root) == -1);
}

static void test_multiple_children() {
  auto root = make_node(100);
  auto a = make_node(1);
  auto b = make_node(2);
  add_child(root, a);
  add_child(root, b);
  CHECK(root->children.size() == 2);
  CHECK(parent_value(a) == 100 && parent_value(b) == 100);
}

int main() {
  test_parent_value();
  test_weak_does_not_raise_use_count();
  test_expired_parent_returns_minus_one();
  test_root_has_no_parent();
  test_multiple_children();
  return REPORT();
}
