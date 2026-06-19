cmake_minimum_required(VERSION 3.20)
project(cppfan_concurrency_task_queue LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(CPPFAN_IMPL_DIR "${CMAKE_CURRENT_SOURCE_DIR}/starter" CACHE PATH "Directory containing bounded_task_queue.hpp")
option(CPPFAN_ENABLE_SANITIZERS "Enable AddressSanitizer and UndefinedBehaviorSanitizer" ON)

add_executable(task_queue_tests tests/tests.cpp)
target_include_directories(
  task_queue_tests
  PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/../_harness"
    "${CPPFAN_IMPL_DIR}"
)

target_compile_options(task_queue_tests PRIVATE -Wall -Wextra -Wpedantic)

if(CPPFAN_ENABLE_SANITIZERS AND CMAKE_CXX_COMPILER_ID MATCHES "Clang|GNU")
  target_compile_options(task_queue_tests PRIVATE -fsanitize=address,undefined -fno-omit-frame-pointer)
  target_link_options(task_queue_tests PRIVATE -fsanitize=address,undefined)
endif()

enable_testing()
add_test(NAME concurrency_task_queue_tests COMMAND task_queue_tests)
