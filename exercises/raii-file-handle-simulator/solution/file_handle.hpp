// Reference solution for raii-file-handle-simulator.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>

// A RAII handle that "opens" a resource on construction and "closes" it exactly
// once — in close() or the destructor. A shared counter tracks how many handles
// are currently open, so leaks/double-closes are observable.
class FileHandle {
 public:
  explicit FileHandle(std::string name) : name_(std::move(name)), open_(true) {
    ++open_count_ref();
  }

  FileHandle(const FileHandle&) = delete;
  FileHandle& operator=(const FileHandle&) = delete;

  ~FileHandle() { close(); }

  bool is_open() const { return open_; }
  const std::string& name() const { return name_; }

  // Idempotent: closing an already-closed handle does nothing.
  void close() {
    if (open_) {
      open_ = false;
      --open_count_ref();
    }
  }

  static int open_count() { return open_count_ref(); }

 private:
  static int& open_count_ref() {
    static int count = 0;
    return count;
  }

  std::string name_;
  bool open_;
};
