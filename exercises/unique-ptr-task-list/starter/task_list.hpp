// Exercise: unique-ptr-task-list
// A task list that OWNS its tasks through std::unique_ptr.
//
// Rules:
//  - add(id, title): create a Task owned by the list (std::make_unique).
//  - size(): number of tasks.
//  - find(id): return a NON-owning const Task* (nullptr if absent). The list
//    keeps ownership.
//  - remove(id): destroy the task; return whether it was found.
//  - take(id): TRANSFER ownership out as a std::unique_ptr<Task> (nullptr if
//    absent); the task is no longer in the list.
//
// Store tasks in a std::vector<std::unique_ptr<Task>>. The tests run under
// AddressSanitizer, so ownership mistakes will show up.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <memory>
#include <string>
#include <vector>

struct Task {
  int id;
  std::string title;
};

class TaskList {
 public:
  void add(int id, std::string title) {
    // TODO: push a make_unique<Task> onto the vector.
    (void)id;
    (void)title;
  }

  int size() const { return static_cast<int>(tasks_.size()); }

  const Task* find(int id) const {
    // TODO: return a non-owning pointer, or nullptr.
    (void)id;
    return nullptr;
  }

  bool remove(int id) {
    // TODO: erase the matching task; return whether found.
    (void)id;
    return false;
  }

  std::unique_ptr<Task> take(int id) {
    // TODO: move the matching task out of the vector and return it.
    (void)id;
    return nullptr;
  }

 private:
  std::vector<std::unique_ptr<Task>> tasks_;
};
