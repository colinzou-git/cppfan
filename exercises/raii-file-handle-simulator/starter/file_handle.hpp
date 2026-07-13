// Exercise: raii-file-handle-simulator
// Build a RAII handle that opens on construction and closes exactly once.
//
// Rules:
//  - The constructor "opens" the handle and increments a shared open counter.
//  - close() marks the handle closed and decrements the counter, but only the
//    first time (idempotent — a second close() does nothing).
//  - The destructor closes the handle (so a handle that goes out of scope is
//    cleaned up automatically).
//  - is_open() and name() are simple observers.
//  - open_count() returns how many handles are currently open.
//  - A FileHandle is non-copyable (copying would double-close).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

class FileHandle {
 public:
  explicit FileHandle(std::string name) : name_(std::move(name)), open_(true) {
    // TODO: record that one more handle is open.
  }

  FileHandle(const FileHandle&) = delete;
  FileHandle& operator=(const FileHandle&) = delete;

  ~FileHandle() {
    // TODO: ensure the handle is closed.
  }

  bool is_open() const { return open_; }
  const std::string& name() const { return name_; }

  void close() {
    // TODO: close once — flip open_ and decrement the counter only if still open.
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
