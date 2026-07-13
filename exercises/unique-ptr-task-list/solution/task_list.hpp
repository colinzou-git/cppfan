// Reference solution for unique-ptr-task-list.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

struct Task {
  int id;
  std::string title;
};

// Owns its tasks through std::unique_ptr. add() creates, find() lends a
// non-owning view, take() transfers ownership out, remove() destroys.
class TaskList {
 public:
  void add(int id, std::string title) {
    tasks_.push_back(std::make_unique<Task>(Task{id, std::move(title)}));
  }

  int size() const { return static_cast<int>(tasks_.size()); }

  const Task* find(int id) const {
    for (const auto& task : tasks_) {
      if (task->id == id) {
        return task.get();
      }
    }
    return nullptr;
  }

  bool remove(int id) {
    for (auto it = tasks_.begin(); it != tasks_.end(); ++it) {
      if ((*it)->id == id) {
        tasks_.erase(it);
        return true;
      }
    }
    return false;
  }

  std::unique_ptr<Task> take(int id) {
    for (auto it = tasks_.begin(); it != tasks_.end(); ++it) {
      if ((*it)->id == id) {
        std::unique_ptr<Task> owned = std::move(*it);
        tasks_.erase(it);
        return owned;
      }
    }
    return nullptr;
  }

 private:
  std::vector<std::unique_ptr<Task>> tasks_;
};
