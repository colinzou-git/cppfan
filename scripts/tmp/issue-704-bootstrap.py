#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SEED = ROOT / "src/features/learning-items/learning-item-seed.ts"
COVERAGE_TEST = ROOT / "tests/unit/concurrency-coverage.test.ts"
DOC = ROOT / "docs/QUESTION_FAMILIES.md"
MIGRATION = ROOT / "supabase/migrations/20261102050000_seed_concurrency_reasoning_items.sql"
UNIT_TEST = ROOT / "tests/unit/concurrency-reasoning-items.test.ts"
E2E_TEST = ROOT / "tests/e2e/concurrency-learning.spec.ts"
INTEGRATION_TEST = ROOT / "tests/integration/concurrency-reasoning.test.ts"

ITEMS = [
    {
        "id": "cpp.concurrency.threads.reasoning_join_trace",
        "type": "code_reading",
        "title": "Trace join ownership",
        "skill": "cpp.concurrency.threads",
        "prompt": "A main thread starts T1, reaches `t.join()` while T1 is still running, T1 finishes, and then `join()` returns. What guarantee does `join()` provide at the point main continues?",
        "explanation": "`join()` blocks until the owned thread has finished. After it returns, that `std::thread` is no longer joinable and the worker cannot still be accessing state through that thread execution.",
        "choices": [
            "Main continues only after T1 has finished, and the thread object is no longer joinable",
            "Main continues immediately while T1 keeps running in the background",
            "join() detaches T1 and transfers ownership to the operating system",
            "join() only waits until T1 starts, not until it finishes",
        ],
    },
    {
        "id": "cpp.concurrency.threads.reasoning_dangling_capture",
        "type": "bug_spotting",
        "title": "Spot a worker lifetime bug",
        "skill": "cpp.concurrency.threads",
        "prompt": "Spot the bug:\n\n```cpp\nstd::thread make_worker() {\n  std::string label = \"ready\";\n  return std::thread([&] { log(label); });\n}\n```\n\nThe returned thread can keep running after `make_worker` returns.",
        "explanation": "The lambda captures the local `label` by reference, but `label` is destroyed when `make_worker` returns. The worker may dereference a dangling reference. Give the worker owned data (capture by value/move) or keep the referenced object alive until the thread is joined.",
        "choices": [
            "The lambda may use `label` after its lifetime ends; capture owned data or keep the object alive until join",
            "Returning a `std::thread` always copies its callable, so references become safe",
            "The only bug is that `label` should be declared `volatile`",
            "There is no bug because the thread object itself is returned by value",
        ],
    },
    {
        "id": "cpp.concurrency.data_races.reasoning_lost_update",
        "type": "code_reading",
        "title": "Trace a lost increment",
        "skill": "cpp.concurrency.data_races",
        "prompt": "Assume `counter` starts at 0 and two unsynchronized `counter++` operations interleave as these explicit steps:\n\n```text\nT1 reads counter -> 0\nT2 reads counter -> 0\nT1 writes 1\nT2 writes 1\n```\n\nWhat final value does this trace produce, and what does it demonstrate?",
        "explanation": "This trace finishes at 1, not 2: both increments used the same stale read, so one update was lost. In actual C++, the unsynchronized conflicting accesses are a data race and therefore undefined behavior; the trace is a teaching interleaving, not a guarantee of one runtime outcome.",
        "choices": [
            "The final value can be 1: both threads read 0 before either write, so one update is lost",
            "The final value must be 2 because `++` is always atomic",
            "The final value must be 0 because concurrent writes cancel each other",
            "The trace is safe because each thread performs only one increment",
        ],
    },
    {
        "id": "cpp.concurrency.data_races.reasoning_plain_flag",
        "type": "bug_spotting",
        "title": "Spot the unsynchronized flag",
        "skill": "cpp.concurrency.data_races",
        "prompt": "Spot the concurrency defect:\n\n```cpp\nbool ready = false;\nstd::thread writer([&] { ready = true; });\nstd::thread reader([&] { while (!ready) { /* work */ } });\n```",
        "explanation": "A plain `bool` is not synchronization. One thread writes `ready` while another reads it without a happens-before relationship, which is a data race. Use an atomic flag for this simple state, or protect the state with a mutex/condition variable if the predicate spans more data.",
        "choices": [
            "The read and write of `ready` race; use an atomic or proper mutex-based synchronization",
            "The code is safe because `bool` reads and writes are always synchronized",
            "The code is safe as long as the writer starts first",
            "Only the writer needs a mutex; the reader can remain unsynchronized",
        ],
    },
    {
        "id": "cpp.concurrency.mutexes.reasoning_multi_field_invariant",
        "type": "code_reading",
        "title": "Protect a multi-field invariant",
        "skill": "cpp.concurrency.mutexes",
        "prompt": "A statistics object requires `total == sum of all recorded amounts`. One thread executes:\n\n```cpp\n{\n  std::lock_guard lock(m);\n  ++count;\n}\ntotal += amount;\n```\n\nOther threads read `count` and `total` while holding `m`. What is wrong with this lock scope?",
        "explanation": "The invariant spans both fields, but `total` is modified after releasing the mutex. Readers can observe a new `count` with an old `total`, and the write to `total` can race. Protect the entire invariant update with the same mutex.",
        "choices": [
            "The lock protects only part of the invariant; `count` and `total` must be updated together under the same mutex",
            "The lock should protect only `total` because integer increments are automatically synchronized",
            "The code is safe because readers already hold the mutex",
            "The mutex should be replaced with `volatile` fields",
        ],
    },
    {
        "id": "cpp.concurrency.mutexes.reasoning_manual_unlock",
        "type": "bug_spotting",
        "title": "Spot a leaked mutex",
        "skill": "cpp.concurrency.mutexes",
        "prompt": "Spot the bug:\n\n```cpp\nm.lock();\nif (!valid(input)) {\n  return;\n}\nupdate_shared_state();\nm.unlock();\n```",
        "explanation": "The early return skips `unlock()`, leaving the mutex locked and potentially blocking every future caller. Use RAII (`std::lock_guard` or `std::unique_lock`) so every exit path releases the mutex automatically.",
        "choices": [
            "The early return can leave `m` locked; use an RAII lock guard",
            "The mutex unlocks automatically when the function returns even without a guard",
            "The only issue is that `valid` must be called after `update_shared_state`",
            "Manual locking is safer than RAII when a function has multiple returns",
        ],
    },
    {
        "id": "cpp.concurrency.async.reasoning_exception_get",
        "type": "code_reading",
        "title": "Trace an async exception",
        "skill": "cpp.concurrency.async",
        "prompt": "Read this code:\n\n```cpp\nauto f = std::async(std::launch::async, []() -> int {\n  throw std::runtime_error(\"bad input\");\n});\nint value = f.get();\n```\n\nWhere does the exception become observable?",
        "explanation": "The asynchronous task stores the exception in the shared state. `future::get()` waits for completion and rethrows that exception in the calling thread, so normal exception handling can surround `get()`.",
        "choices": [
            "`f.get()` rethrows the worker exception in the calling thread",
            "The exception is silently discarded when the worker exits",
            "The exception is thrown when `std::async` returns the future",
            "The exception automatically terminates the entire process before `get()`",
        ],
    },
    {
        "id": "cpp.concurrency.async.reasoning_default_policy",
        "type": "bug_spotting",
        "title": "Do not assume eager async execution",
        "skill": "cpp.concurrency.async",
        "prompt": "A program calls `std::async(do_work)` and then performs other work assuming `do_work` is already running in parallel. What assumption is unsafe?",
        "explanation": "Without an explicit launch policy, the implementation may choose deferred execution, meaning the callable can run only when the future is waited on or queried. If the design requires eager asynchronous execution, request `std::launch::async` explicitly.",
        "choices": [
            "The default policy may defer execution; use `std::launch::async` if eager background execution is required",
            "`std::async` always creates exactly one operating-system thread immediately",
            "The future can be ignored because its destructor always executes the callable",
            "Adding `volatile` to the future forces eager execution",
        ],
    },
    {
        "id": "cpp.concurrency.deadlock.reasoning_wait_cycle",
        "type": "code_reading",
        "title": "Trace a two-lock deadlock",
        "skill": "cpp.concurrency.deadlock",
        "prompt": "Trace this explicitly ordered state:\n\n```text\nT1 locks A\nT2 locks B\nT1 requests B -> blocked\nT2 requests A -> blocked\n```\n\nWhy can neither thread make progress?",
        "explanation": "T1 holds A while waiting for B, and T2 holds B while waiting for A. That circular wait cannot resolve by itself. A consistent global lock order or a deadlock-avoiding multi-lock operation removes the cycle.",
        "choices": [
            "Each thread waits for a lock held by the other, forming a circular wait",
            "The mutexes will automatically exchange owners after a timeout",
            "T1 will always win because it acquired its first mutex first",
            "The deadlock happens only if both mutexes are recursive",
        ],
    },
    {
        "id": "cpp.concurrency.deadlock.reasoning_scoped_lock",
        "type": "bug_spotting",
        "title": "Repair opposite lock ordering",
        "skill": "cpp.concurrency.deadlock",
        "prompt": "Two transfer functions lock account mutexes in opposite orders (`from` then `to` in one path, `to` then `from` in another). What is the safest direct repair when both locks are needed together?",
        "explanation": "Acquire both mutexes with `std::scoped_lock(from.m, to.m)` (or enforce one global ordering everywhere). The important property is eliminating inconsistent nested acquisition that can form a circular wait.",
        "choices": [
            "Acquire both with `std::scoped_lock` (or enforce one global lock order everywhere)",
            "Insert a short delay between the first and second lock",
            "Use `try_lock` once and proceed even if the second lock fails",
            "Make both mutexes recursive without changing the order",
        ],
    },
    {
        "id": "cpp.concurrency.condition_variables.reasoning_predicate_trace",
        "type": "code_reading",
        "title": "Trace a predicate wait",
        "skill": "cpp.concurrency.condition_variables",
        "prompt": "A consumer holds `m` and executes `cv.wait(lock, [&] { return ready; });`. The wait releases `m`, the producer sets `ready = true` while holding `m`, unlocks, and notifies. What must the consumer do before returning from `wait`?",
        "explanation": "The waiting operation re-acquires the mutex and checks the predicate again before it returns. Rechecking is essential because wakes can be spurious or another thread may have changed/consumed the state before this waiter reacquires the lock.",
        "choices": [
            "Re-acquire the mutex and confirm the predicate is true before proceeding",
            "Proceed immediately after any notification without checking state",
            "Keep the mutex locked for the entire time it is sleeping",
            "Convert `ready` to `volatile` so the predicate is unnecessary",
        ],
    },
    {
        "id": "cpp.concurrency.condition_variables.reasoning_shutdown_notify",
        "type": "bug_spotting",
        "title": "Wake every waiter on shutdown",
        "skill": "cpp.concurrency.condition_variables",
        "prompt": "Three consumers wait on the predicate `shutdown || !queue.empty()`. The shutdown path sets `shutdown = true` under the mutex and then calls only `cv.notify_one()`. What is the bug?",
        "explanation": "Shutdown makes the predicate true for every blocked consumer, so all of them must get a chance to wake and exit. `notify_one()` can leave other consumers asleep forever; the shutdown transition should normally use `notify_all()` after updating the protected state.",
        "choices": [
            "Only one waiter may wake; a global shutdown transition should wake all blocked consumers",
            "`notify_one()` always wakes every waiter whose predicate is true",
            "Notifications must be sent before changing the protected state",
            "The waiters should stop checking a predicate during shutdown",
        ],
    },
    {
        "id": "cpp.concurrency.atomics.reasoning_compound_check",
        "type": "code_reading",
        "title": "Atomic operations do not make a transaction",
        "skill": "cpp.concurrency.atomics",
        "prompt": "Suppose `tickets` is `std::atomic<int>` and two threads execute:\n\n```cpp\nif (tickets.load() > 0) {\n  tickets.fetch_sub(1);\n}\n```\n\nWhy can this still violate the invariant that tickets never goes below zero?",
        "explanation": "Each atomic operation is indivisible, but the check and decrement are separate operations. Two threads can both observe 1 and both decrement. Use a compare-exchange loop or a mutex when the invariant is a multi-step transaction.",
        "choices": [
            "The load and decrement are separate atomic steps; two threads can both pass the check before either decrement",
            "`std::atomic<int>` is not actually atomic on integer types",
            "`fetch_sub` can randomly subtract more than one",
            "The invariant is guaranteed because every individual access is atomic",
        ],
    },
    {
        "id": "cpp.concurrency.atomics.reasoning_volatile_stop",
        "type": "bug_spotting",
        "title": "Do not synchronize with volatile",
        "skill": "cpp.concurrency.atomics",
        "prompt": "A worker loop polls `volatile bool stop` while another thread writes `stop = true`. What is the concurrency defect?",
        "explanation": "`volatile` does not provide atomicity or inter-thread ordering in C++. The read and write still form a data race. For a standalone stop flag, use `std::atomic<bool>` (or a higher-level cancellation mechanism such as `std::stop_token`).",
        "choices": [
            "`volatile` is not thread synchronization; use an atomic flag or a higher-level cancellation primitive",
            "`volatile` makes the flag fully equivalent to `std::atomic<bool>`",
            "The flag is safe because `bool` occupies only one byte",
            "The writer alone can add a mutex and leave the reader unchanged",
        ],
    },
    {
        "id": "cpp.concurrency.jthread.reasoning_stop_trace",
        "type": "code_reading",
        "title": "Trace cooperative cancellation",
        "skill": "cpp.concurrency.jthread",
        "prompt": "A `std::jthread` worker loops while `!token.stop_requested()`. The owner calls `request_stop()`, the worker reaches its next check, exits the loop, and returns. What makes this cancellation safe?",
        "explanation": "The owner requests cancellation but does not kill the thread asynchronously. The worker observes the shared stop state at a safe point and returns normally, so its cleanup and invariants remain under program control; `jthread` then joins through RAII.",
        "choices": [
            "Cancellation is cooperative: the worker observes the stop request at a safe point and exits normally",
            "`request_stop()` forcibly interrupts the worker at an arbitrary instruction",
            "The operating system destroys the worker stack immediately",
            "The token automatically throws an exception inside the worker",
        ],
    },
    {
        "id": "cpp.concurrency.jthread.reasoning_blocked_wait",
        "type": "bug_spotting",
        "title": "A stop request must wake blocked work",
        "skill": "cpp.concurrency.jthread",
        "prompt": "A `jthread` checks its `stop_token` only at the top of a loop, then can block indefinitely in a condition-variable wait whose predicate is only `!queue.empty()`. The owner calls `request_stop()` while the queue is empty. What can go wrong?",
        "explanation": "The worker may never return to the top of the loop to observe the stop request. Design the blocking wait to react to cancellation too—for example a stop-token-aware wait, or a shutdown predicate plus notification—so a blocked worker can wake and exit.",
        "choices": [
            "The worker can remain blocked and never observe the stop request; the wait must also be cancellation-aware",
            "`request_stop()` always interrupts every blocking library call automatically",
            "The worker should detach before waiting so cancellation can complete",
            "The fix is to ignore the stop token while the queue is empty",
        ],
    },
    {
        "id": "cpp.concurrency.promise_future.reasoning_exception_channel",
        "type": "code_reading",
        "title": "Deliver an exception through a future",
        "skill": "cpp.concurrency.promise_future",
        "prompt": "A producer catches an exception and calls `promise.set_exception(std::current_exception())`. What happens when the consumer later calls the paired `future.get()`?",
        "explanation": "The future's shared state stores the exception. `get()` rethrows it in the consumer thread, allowing the result channel to carry either a value or failure without a separate shared error variable.",
        "choices": [
            "`future.get()` rethrows the stored exception in the consumer thread",
            "The exception is converted into a default-constructed result value",
            "The promise immediately throws the exception in every thread",
            "The exception is discarded once `set_exception` returns",
        ],
    },
    {
        "id": "cpp.concurrency.promise_future.reasoning_get_twice",
        "type": "bug_spotting",
        "title": "A future is a one-shot result",
        "skill": "cpp.concurrency.promise_future",
        "prompt": "Spot the misuse:\n\n```cpp\nauto f = promise.get_future();\nint first = f.get();\nint second = f.get();\n```",
        "explanation": "A `std::future` result is consumed by `get()` and may be retrieved only once. If multiple reads/consumers are required, convert to `std::shared_future` before consuming the result or redesign the ownership of the result.",
        "choices": [
            "The second `get()` is invalid because a `std::future` result is consumed once; use `shared_future` for repeated access",
            "Both calls are guaranteed to return the same value",
            "The first call should be replaced with `wait()` because `get()` never blocks",
            "The future becomes reusable automatically after the producer thread joins",
        ],
    },
    {
        "id": "cpp.concurrency.task_selection.reasoning_io_concurrency",
        "type": "code_reading",
        "title": "Choose concurrency for waiting work",
        "skill": "cpp.concurrency.task_selection",
        "prompt": "A server has many independent requests that mostly wait for network I/O and it currently runs on one CPU core. Why can a concurrent task design still improve responsiveness?",
        "explanation": "Concurrency lets another task make progress while one request is waiting, even when only one CPU core executes instructions at a time. This is different from CPU parallelism, which needs simultaneous execution on multiple cores to accelerate compute-heavy work.",
        "choices": [
            "Tasks can overlap waiting periods, so another request can progress while one is blocked on I/O",
            "Concurrency automatically creates more CPU cores",
            "Only parallel numeric code benefits from multiple tasks",
            "The only useful design is one detached thread per request",
        ],
    },
    {
        "id": "cpp.concurrency.task_selection.reasoning_detached_poller",
        "type": "bug_spotting",
        "title": "Own a long-lived background worker",
        "skill": "cpp.concurrency.task_selection",
        "prompt": "A component starts a detached raw thread that polls a device forever and captures `this`. The component can be destroyed while the thread is still running. What design better matches the job?",
        "explanation": "A long-lived background worker needs explicit lifetime ownership and shutdown. An owned `std::jthread` (or another managed worker abstraction) lets the component request cancellation and join during destruction instead of leaving detached work touching dead state.",
        "choices": [
            "Own the long-lived worker (for example with `std::jthread`) and give it a defined cancellation/join lifecycle",
            "Keep the detached thread and rely on the process to outlive every component",
            "Capture `this` by reference explicitly to make the lifetime safer",
            "Replace the thread with `volatile` state and no shutdown protocol",
        ],
    },
    {
        "id": "cpp.concurrency.memory_ordering.reasoning_release_acquire",
        "type": "code_reading",
        "title": "Trace release/acquire publication",
        "skill": "cpp.concurrency.memory_ordering",
        "prompt": "Producer: `data = 42; ready.store(true, std::memory_order_release);` Consumer: it reads `true` from `ready.load(std::memory_order_acquire)` and then reads `data`. What relationship makes the read of `data` valid?",
        "explanation": "The release store publishes prior writes, and the acquire load that reads that released value synchronizes with it. That creates a happens-before edge from the producer's earlier `data = 42` to the consumer's subsequent read.",
        "choices": [
            "The release store synchronizes with the acquire load that reads it, creating happens-before for the earlier data write",
            "Any atomic access automatically orders every unrelated memory access in the program",
            "The consumer is safe only because integer reads are one machine instruction",
            "The guarantee comes from the threads starting in producer-before-consumer order",
        ],
    },
    {
        "id": "cpp.concurrency.memory_ordering.reasoning_relaxed_publish",
        "type": "bug_spotting",
        "title": "Relaxed ordering cannot publish unrelated data",
        "skill": "cpp.concurrency.memory_ordering",
        "prompt": "Producer writes ordinary non-atomic payload fields and then stores `ready = true` with `memory_order_relaxed`. Consumer waits until a relaxed load sees true and then reads the payload. What guarantee is missing?",
        "explanation": "Relaxed operations make the flag itself atomic but establish no ordering for the ordinary payload writes. Use an appropriate release/acquire publication edge (or a mutex). Relaxed ordering is suitable for independent telemetry counters where no other memory is gated by the value.",
        "choices": [
            "There is no happens-before edge publishing the payload; use release/acquire or a mutex",
            "Relaxed ordering is stronger than acquire/release for publication",
            "The payload becomes atomic because the flag is atomic",
            "A relaxed load guarantees visibility of every write made before thread creation",
        ],
    },
    {
        "id": "cpp.concurrency.lock_granularity.reasoning_short_critical_section",
        "type": "code_reading",
        "title": "Keep independent work outside the lock",
        "skill": "cpp.concurrency.lock_granularity",
        "prompt": "A function locks `m`, copies one shared record into a local value, formats a large report from that local copy, performs a slow external write, and then unlocks. Which part should normally remain inside the critical section?",
        "explanation": "Only the access needed to obtain a consistent shared-state snapshot needs the mutex. Formatting and external I/O on an owned local copy should happen after unlocking so unrelated threads are not serialized behind slow independent work.",
        "choices": [
            "Keep only the shared-state snapshot under the lock; do formatting and external I/O after unlocking",
            "Hold the lock through all formatting and I/O so no other thread can run",
            "Remove the lock because copying a record is always atomic",
            "Replace the mutex with a recursive mutex so the long critical section is faster",
        ],
    },
    {
        "id": "cpp.concurrency.lock_granularity.reasoning_shared_ref_escape",
        "type": "bug_spotting",
        "title": "Do not return an unprotected reference",
        "skill": "cpp.concurrency.lock_granularity",
        "prompt": "A read-heavy registry uses `std::shared_mutex`. `lookup()` takes a `std::shared_lock`, finds a `std::string` in an internal map, returns `const std::string&`, and then the lock is destroyed as the function returns. Why is that dangerous?",
        "explanation": "The caller keeps a reference after the shared lock is gone, so a writer can mutate/erase/reallocate the underlying object concurrently. Return an owned copy/value, or return an object that also owns the lock/lifetime needed to keep the reference stable.",
        "choices": [
            "The reference escapes after the shared lock is released; return owned data or keep protection alive with the reference",
            "A `shared_mutex` permanently freezes any object read through a shared lock",
            "References are automatically copied when a lock goes out of scope",
            "The only problem is that writers should also use `shared_lock`",
        ],
    },
    {
        "id": "cpp.concurrency.shared_state_design.reasoning_local_reduce",
        "type": "code_reading",
        "title": "Prefer local accumulation then combine",
        "skill": "cpp.concurrency.shared_state_design",
        "prompt": "Four workers each process a disjoint chunk. Compare (A) every item locks one shared `total` and adds to it versus (B) each worker accumulates a local subtotal and the owner combines four subtotals after join. Why is B often the better design?",
        "explanation": "The local-reduction design confines mutable state to each worker during the hot loop, eliminating per-item lock contention. Only the small final combine step needs coordination, which is easier to reason about and usually scales better.",
        "choices": [
            "Each worker mutates only local state during the hot loop, reducing contention and synchronization surface",
            "Local variables are automatically atomic across threads",
            "The final combine step is unnecessary because the subtotals merge themselves",
            "A shared locked counter is always faster because it uses only one variable",
        ],
    },
    {
        "id": "cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation",
        "type": "bug_spotting",
        "title": "Avoid threads reaching into each other's state",
        "skill": "cpp.concurrency.shared_state_design",
        "prompt": "Two worker objects expose mutable fields, and each worker directly edits the other worker's fields whenever it needs to hand off work. The code accumulates several locks and lock-order rules. What redesign most directly reduces the synchronization problem?",
        "explanation": "Prefer clear ownership boundaries: send immutable/owned messages through a thread-safe queue or transfer values to the worker that owns the state. Reducing shared writable memory often removes entire classes of races and deadlocks instead of managing them with more locks.",
        "choices": [
            "Give each worker ownership of its own state and communicate with owned/immutable messages through a synchronized channel",
            "Expose even more fields so each worker can update the other without helper functions",
            "Replace every mutex with `volatile` fields",
            "Keep direct cross-thread mutation but add arbitrary lock retries",
        ],
    },
]

for i, item in enumerate(ITEMS, start=1):
    item["difficulty"] = "advanced"
    item["estimated_minutes"] = 3 if item["type"] == "code_reading" else 4
    item["order_index"] = 6000 + i * 10


def js(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def ts_item(item: dict) -> str:
    return "\n".join(
        [
            "  {",
            f"    id: {js(item['id'])},",
            f"    type: {js(item['type'])},",
            f"    title: {js(item['title'])},",
            f"    prompt: {js(item['prompt'])},",
            f"    explanation: {js(item['explanation'])},",
            f"    difficulty: {js(item['difficulty'])},",
            f"    estimated_minutes: {item['estimated_minutes']},",
            f"    order_index: {item['order_index']},",
            "    is_active: true",
            "  }",
        ]
    )


def append_to_array(text: str, export_name: str, next_anchor: str, block: str) -> str:
    start = text.index(export_name)
    next_pos = text.index(next_anchor, start)
    close = text.rfind("\n];", start, next_pos)
    if close < 0:
        raise RuntimeError(f"could not find closing bracket for {export_name}")
    return text[:close] + ",\n" + block + text[close:]


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def build_migration() -> str:
    item_rows = []
    mapping_rows = []
    choice_rows = []
    letters = "abcd"
    for item in ITEMS:
        item_rows.append(
            "  (" + ", ".join(
                [
                    sql_quote(item["id"]),
                    sql_quote(item["type"]),
                    sql_quote(item["title"]),
                    sql_quote(item["prompt"]),
                    sql_quote(item["explanation"]),
                    sql_quote(item["difficulty"]),
                    str(item["estimated_minutes"]),
                    str(item["order_index"]),
                    "true",
                ]
            ) + ")"
        )
        mapping_rows.append(
            f"  ({sql_quote(item['id'])}, {sql_quote(item['skill'])}, true)"
        )
        for idx, content in enumerate(item["choices"]):
            choice_rows.append(
                "  (" + ", ".join(
                    [
                        sql_quote(f"{item['id']}.{letters[idx]}"),
                        sql_quote(item["id"]),
                        sql_quote(content),
                        "true" if idx == 0 else "false",
                        str((idx + 1) * 10),
                    ]
                ) + ")"
            )
    return f"""-- #704: deterministic concurrency reasoning depth.\n-- Adds two choice-backed reasoning items per existing concurrency skill.\n-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.\n\ninsert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)\nvalues\n{',\n'.join(item_rows)}\non conflict (id) do update\nset\n  type = excluded.type,\n  title = excluded.title,\n  prompt = excluded.prompt,\n  explanation = excluded.explanation,\n  difficulty = excluded.difficulty,\n  estimated_minutes = excluded.estimated_minutes,\n  order_index = excluded.order_index,\n  is_active = true,\n  updated_at = now();\n\ninsert into public.learning_item_skills (learning_item_id, skill_id, is_primary)\nvalues\n{',\n'.join(mapping_rows)}\non conflict (learning_item_id, skill_id) do update\nset is_primary = excluded.is_primary;\n\ninsert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)\nvalues\n{',\n'.join(choice_rows)}\non conflict (id) do update\nset\n  learning_item_id = excluded.learning_item_id,\n  content = excluded.content,\n  is_correct = excluded.is_correct,\n  order_index = excluded.order_index;\n"""


def patch_seed() -> None:
    text = SEED.read_text()
    sentinel = ITEMS[0]["id"]
    if sentinel in text:
        raise RuntimeError("#704 seed items already present")

    item_block = ",\n".join(ts_item(item) for item in ITEMS)
    text = append_to_array(
        text,
        "export const learningItems: LearningItem[] = [",
        "export const learningItemSkills: LearningItemSkill[] = [",
        item_block,
    )

    mapping_block = ",\n".join(
        f"  {{ learning_item_id: {js(item['id'])}, skill_id: {js(item['skill'])}, is_primary: true }}"
        for item in ITEMS
    )
    text = append_to_array(
        text,
        "export const learningItemSkills: LearningItemSkill[] = [",
        "export const learningItemChoices: LearningItemChoice[] = [",
        mapping_block,
    )

    letters = "abcd"
    choice_lines = []
    for item in ITEMS:
        for idx, content in enumerate(item["choices"]):
            choice_lines.append(
                f"  {{ id: {js(item['id'] + '.' + letters[idx])}, learning_item_id: {js(item['id'])}, content: {js(content)}, is_correct: {'true' if idx == 0 else 'false'}, order_index: {(idx + 1) * 10} }}"
            )
    text = append_to_array(
        text,
        "export const learningItemChoices: LearningItemChoice[] = [",
        "export function toPublicChoice",
        ",\n".join(choice_lines),
    )
    SEED.write_text(text)


def patch_coverage_test() -> None:
    text = COVERAGE_TEST.read_text()
    if "REASONING_ITEM_IDS" in text:
        raise RuntimeError("#704 coverage test already patched")
    text = text.replace(
        "  getLearningItemById,\n  learningItemSkills\n",
        "  getLearningItemById,\n  learningItemChoices,\n  learningItemSkills\n",
    )
    ids = ",\n".join(f"  {js(item['id'])}" for item in ITEMS)
    constants = f"""\nconst REASONING_ITEM_IDS = [\n{ids}\n] as const;\n\nconst REQUIRED_REASONING_TYPES = [\"code_reading\", \"bug_spotting\"] as const;\n"""
    text = text.replace(
        "const REQUIRED_RESOURCES = [",
        constants + "\nconst REQUIRED_RESOURCES = [",
        1,
    )
    new_test = r'''
  it("keeps deterministic reasoning depth on every concurrency skill (#704)", () => {
    expect(new Set(REASONING_ITEM_IDS).size).toBe(26);

    for (const skillId of REQUIRED_SKILLS) {
      const mappings = learningItemSkills.filter((mapping) => mapping.skill_id === skillId);
      expect(mappings.length, `${skillId} should have lesson, retrieval, and reasoning depth`).toBeGreaterThanOrEqual(4);

      const types = mappings
        .map((mapping) => getLearningItemById(mapping.learning_item_id)?.item.type)
        .filter(Boolean);
      for (const type of REQUIRED_REASONING_TYPES) {
        expect(types, `${skillId} should include ${type}`).toContain(type);
      }
    }

    for (const itemId of REASONING_ITEM_IDS) {
      const details = getLearningItemById(itemId);
      expect(details, itemId).toBeTruthy();
      expect(["code_reading", "bug_spotting"]).toContain(details!.item.type);
      expect(details!.item.prompt).not.toMatch(/sleep_for|sleep_until/i);

      const choices = learningItemChoices.filter((choice) => choice.learning_item_id === itemId);
      expect(choices, `${itemId} should have four choices`).toHaveLength(4);
      expect(choices.filter((choice) => choice.is_correct), `${itemId} should have one answer`).toHaveLength(1);
    }
  });

'''
    anchor = '  it("covers deterministic synchronization, communication, atomics, and task-selection reasoning", () => {'
    text = text.replace(anchor, new_test + anchor, 1)
    text = text.replace(
        'describe("concurrency completion coverage (#118)", () => {',
        'describe("concurrency completion/depth coverage (#118/#704)", () => {',
    )
    COVERAGE_TEST.write_text(text)


def write_unit_test() -> None:
    ids = ",\n".join(f"  {js(item['id'])}" for item in ITEMS)
    UNIT_TEST.write_text(f'''import {{ describe, expect, it }} from "vitest";\nimport {{\n  getLearningItemById,\n  isReviewEligibleItem,\n  learningItemChoices,\n  learningItemSkills\n}} from "@/features/learning-items/learning-item-seed";\n\nconst IDS = [\n{ids}\n] as const;\n\ndescribe("concurrency reasoning items (#704)", () => {{\n  it("registers 26 unique choice-backed review-eligible items", () => {{\n    expect(new Set(IDS).size).toBe(26);\n    for (const id of IDS) {{\n      const details = getLearningItemById(id);\n      expect(details, id).toBeTruthy();\n      expect(["code_reading", "bug_spotting"]).toContain(details!.item.type);\n      expect(isReviewEligibleItem(id), id).toBe(true);\n      const choices = learningItemChoices.filter((choice) => choice.learning_item_id === id);\n      expect(choices).toHaveLength(4);\n      expect(choices.filter((choice) => choice.is_correct)).toHaveLength(1);\n    }}\n  }});\n\n  it("adds exactly one code-reading and one bug-spotting item to each original concurrency skill", () => {{\n    const reasoning = IDS.map((id) => getLearningItemById(id)!.item);\n    const skillIds = new Set(\n      learningItemSkills\n        .filter((mapping) => IDS.includes(mapping.learning_item_id as (typeof IDS)[number]))\n        .map((mapping) => mapping.skill_id)\n    );\n    expect(skillIds.size).toBe(13);\n\n    for (const skillId of skillIds) {{\n      const mappedIds = learningItemSkills\n        .filter((mapping) => mapping.skill_id === skillId && IDS.includes(mapping.learning_item_id as (typeof IDS)[number]))\n        .map((mapping) => mapping.learning_item_id);\n      const types = mappedIds.map((id) => reasoning.find((item) => item.id === id)!.type).sort();\n      expect(types).toEqual(["bug_spotting", "code_reading"]);\n    }}\n  }});\n\n  it("never bases correctness on scheduler timing", () => {{\n    for (const id of IDS) {{\n      const item = getLearningItemById(id)!.item;\n      expect(`${{item.prompt}} ${{item.explanation ?? ""}}`).not.toMatch(/sleep_for|sleep_until|give .* thread time/i);\n    }}\n  }});\n}});\n''')


def write_e2e_test() -> None:
    E2E_TEST.write_text(r'''import { expect, test } from "@playwright/test";

test("concurrency reasoning items render and grade through the normal choice flow", async ({ page }) => {
  await page.goto("/learn/cpp.concurrency.data_races.reasoning_lost_update");

  const item = page.getByTestId("learning-item");
  await expect(item.getByRole("heading", { name: "Trace a lost increment" })).toBeVisible();
  await expect(item.getByTestId("learning-item-type")).toHaveText(/code reading/i);
  await page.getByRole("radio", { name: /final value can be 1/i }).check();
  await page.getByTestId("answer-submit").click();
  await expect(page.getByTestId("answer-result")).toContainText("Correct!");
  await expect(item).toContainText(/undefined behavior/i);

  await page.goto("/learn/cpp.concurrency.condition_variables.reasoning_shutdown_notify");
  await expect(page.getByTestId("learning-item-type")).toHaveText(/bug spotting/i);
  await expect(page.getByText(/three consumers wait/i)).toBeVisible();
});

test("concurrency code and trace text stays within a mobile page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/cpp.concurrency.deadlock.reasoning_wait_cycle");
  await expect(page.getByRole("heading", { name: "Trace a two-lock deadlock" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
''')


def write_integration_test() -> None:
    INTEGRATION_TEST.write_text(r'''import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && anonKey && serviceKey);
const PASSWORD = "Test-Password-123!";
const RIGHT_ITEM = "cpp.concurrency.data_races.reasoning_lost_update";
const WRONG_ITEM = "cpp.concurrency.condition_variables.reasoning_shutdown_notify";
const suite = ready ? describe : describe.skip;

function anonClient(): SupabaseClient {
  return createClient(url!, anonKey!, { auth: { persistSession: false, autoRefreshToken: false } });
}

suite("authenticated concurrency reasoning evidence (#704)", () => {
  let service: SupabaseClient;
  let client: SupabaseClient;
  let userId = "";

  async function correctAndWrongChoices(itemId: string) {
    const rows = await client.from("learning_item_choices").select("id").eq("learning_item_id", itemId).order("order_index");
    if (rows.error) throw rows.error;
    const ids = (rows.data ?? []).map((row) => row.id as string);
    const probe = await client.rpc("grade_learning_item_choice", { p_item_id: itemId, p_choice_id: ids[0] });
    if (probe.error) throw probe.error;
    const correct = probe.data![0].correct_choice_id as string;
    return { correct, wrong: ids.find((id) => id !== correct)! };
  }

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } });
    const email = `concurrency-704-${Date.now()}@example.test`;
    const created = await service.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
    if (created.error) throw created.error;
    userId = created.data.user!.id;
    client = anonClient();
    const signIn = await client.auth.signInWithPassword({ email, password: PASSWORD });
    if (signIn.error) throw signIn.error;
  });

  afterAll(async () => {
    if (service && userId) await service.auth.admin.deleteUser(userId).catch(() => undefined);
  });

  it("persists a correct code-reading answer and enrolls its normal review card", async () => {
    const { correct } = await correctAndWrongChoices(RIGHT_ITEM);
    const submit = await client.rpc("submit_learning_item_answer", {
      p_item_id: RIGHT_ITEM,
      p_choice_id: correct,
      p_submission_id: crypto.randomUUID()
    });
    expect(submit.error).toBeNull();
    expect(submit.data?.[0]?.is_correct).toBe(true);
    expect(submit.data?.[0]?.enrolled).toBe(true);

    const cards = await client.from("review_cards").select("id").eq("learning_item_id", RIGHT_ITEM);
    expect(cards.error).toBeNull();
    expect(cards.data).toHaveLength(1);
  });

  it("records a wrong bug-spotting answer without creating false correct evidence", async () => {
    const { wrong } = await correctAndWrongChoices(WRONG_ITEM);
    const submit = await client.rpc("submit_learning_item_answer", {
      p_item_id: WRONG_ITEM,
      p_choice_id: wrong,
      p_submission_id: crypto.randomUUID()
    });
    expect(submit.error).toBeNull();
    expect(submit.data?.[0]?.is_correct).toBe(false);

    const mapping = await client.from("learning_item_skills").select("skill_id").eq("learning_item_id", WRONG_ITEM).eq("is_primary", true).single();
    expect(mapping.error).toBeNull();
    const events = await client.from("skill_events").select("event_type").eq("skill_id", mapping.data!.skill_id);
    expect(events.error).toBeNull();
    const types = (events.data ?? []).map((event) => event.event_type);
    expect(types).toContain("quiz_attempted");
    expect(types).not.toContain("quiz_correct");
  });
});
''')


def patch_docs() -> None:
    text = DOC.read_text()
    marker = "## Concurrency reasoning rules (#704)"
    if marker in text:
        raise RuntimeError("#704 docs already patched")
    text += r'''

## Concurrency reasoning rules (#704)

Concurrency items should test reasoning about **possible executions and synchronization state**, not whether one lucky run happened to work.

- Prefer `code_reading` and `bug_spotting` for races, lock ownership, condition-variable predicates, atomics, and happens-before.
- When teaching an interleaving, spell out a finite authored trace (`T1 read`, `T2 read`, `T1 write`, ...) or an explicit partial order. Do not infer correctness from an observed scheduler order.
- Never use fixed delays as the premise that makes an answer correct. Correctness must come from synchronization, ownership, or a stated invariant.
- A data-race trace may illustrate one possible lost update, but the explanation must still state that a C++ data race is undefined behavior rather than promising that exact runtime result.
- For condition variables, separate the protected state from the notification: mutate state under the mutex, wait with/recheck a predicate, and choose `notify_one` versus `notify_all` from how many waiters' predicates become actionable.
- For atomics, distinguish **atomicity of one operation** from a larger transaction/invariant. Release/acquire examples must name the publishing atomic and the happens-before relationship; relaxed examples must not smuggle in visibility guarantees for unrelated data.
- Viewing an instructional trace is not mastery or an FSRS rating. Choice-backed reasoning items use the normal trusted grading/review-card flow.
'''
    DOC.write_text(text)


def cleanup_bootstrap() -> None:
    for path in [
        ROOT / ".github/workflows/codex-704-bootstrap.yml",
        ROOT / "scripts/tmp/issue-704-bootstrap.py",
    ]:
        if path.exists():
            path.unlink()
    tmp_dir = ROOT / "scripts/tmp"
    if tmp_dir.exists() and not any(tmp_dir.iterdir()):
        tmp_dir.rmdir()


patch_seed()
MIGRATION.write_text(build_migration())
patch_coverage_test()
write_unit_test()
write_e2e_test()
write_integration_test()
patch_docs()
cleanup_bootstrap()
print(f"Applied #704: {len(ITEMS)} reasoning items, migration, tests, docs")
