-- Roadmap #78 / #118 (concurrency, third slice): learning items for memory
-- ordering/happens-before, lock granularity, and minimizing shared mutable state.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.concurrency.memory_ordering.lesson',
    'lesson',
    'Memory ordering and happens-before',
    'Atomic operations take a memory_order argument that controls how surrounding non-atomic reads and writes may be reordered around them. The default, memory_order_seq_cst, gives a single global order everyone agrees on — easiest to reason about, slightly slower. The key weaker pairing is release/acquire: a store with memory_order_release publishes everything the thread wrote before it, and a load with memory_order_acquire on the same variable that reads that stored value sees all of those writes. This establishes a happens-before relationship — the classic pattern is writing data then doing `flag.store(true, release)`, while the consumer spins on `flag.load(acquire)` and, once it sees true, is guaranteed to see the data. memory_order_relaxed gives atomicity with no ordering guarantees at all; it is correct only for things like an independent counter where you never use the value to gate access to other memory. The rule of thumb: start with seq_cst (the default) for correctness; drop to release/acquire only on a proven hot path where you can name the exact happens-before pair; reserve relaxed for standalone counters. Getting this wrong produces races that appear only on weakly-ordered hardware (ARM) and never on x86, so prefer the stronger default unless you can prove the weaker one.',
    'memory_order controls reordering around atomics. seq_cst (default) = one global order, easiest. release store + acquire load on the same variable establish happens-before (publish data, then flag.store(release); consumer flag.load(acquire) then sees the data). relaxed = atomic but no ordering, only for standalone counters. Default to seq_cst.',
    'advanced',
    7,
    4470,
    true
  ),
  (
    'cpp.concurrency.memory_ordering.mc_release_acquire',
    'multiple_choice',
    'Release-acquire publishing',
    'One thread writes data then does `ready.store(true, std::memory_order_release)`. What must the consumer do to be guaranteed to see that data?',
    'The consumer must load the same atomic with acquire — `ready.load(std::memory_order_acquire)` — and proceed once it reads true. A release store paired with an acquire load on the same variable establishes happens-before, making the prior writes visible.',
    'advanced',
    2,
    4480,
    true
  ),
  (
    'cpp.concurrency.lock_granularity.lesson',
    'lesson',
    'Lock granularity',
    'Lock granularity is how much data one lock protects. A coarse lock (one mutex for an entire structure) is simple and correct but serializes every operation, so threads queue up and throughput collapses under contention. Fine-grained locking (a lock per bucket, per node, or per shard) lets independent operations proceed in parallel, but adds complexity and the risk of deadlock when several locks are taken together (acquire them in a consistent order). The practical guidance: hold a lock for as little code as possible — do expensive or blocking work (I/O, allocation, computing a value) outside the critical section, and only lock around the actual shared-state access. For read-heavy data, std::shared_mutex lets many readers hold a shared lock concurrently (std::shared_lock) while writers take an exclusive lock (std::unique_lock), which beats a plain mutex when reads vastly outnumber writes. Always measure: fine-grained locking only pays off under real contention, and its overhead and bug surface can make it slower than a coarse lock for low-contention data. Start coarse and correct, then refine the hot spots.',
    'Granularity = how much data one lock guards. Coarse = simple but serializes; fine-grained = more parallelism but complexity/deadlock risk (consistent lock order). Hold locks briefly (do I/O/compute outside the critical section). Use std::shared_mutex for read-heavy data (many shared readers, exclusive writers). Measure before refining.',
    'advanced',
    6,
    4490,
    true
  ),
  (
    'cpp.concurrency.lock_granularity.mc_shared_mutex',
    'multiple_choice',
    'A lock for read-heavy data',
    'A data structure is read by many threads but written rarely. Which locking choice maximizes concurrency while staying safe?',
    'std::shared_mutex lets many readers hold a shared lock at once (std::shared_lock) while a writer takes an exclusive lock (std::unique_lock). For read-mostly data this allows concurrent reads, unlike a plain std::mutex that serializes every access.',
    'advanced',
    2,
    4500,
    true
  ),
  (
    'cpp.concurrency.shared_state_design.lesson',
    'lesson',
    'Minimizing shared mutable state',
    'The most reliable way to avoid data races is to have less shared mutable state, not more locks. Three design tactics. Thread confinement: keep data owned by a single thread and never share it — for example, give each worker its own accumulator and combine the results at the end, instead of all threads incrementing one shared total under a lock. Immutability: data that is never modified after construction can be shared freely with no synchronization, because concurrent reads of unchanging data are always safe (share by const reference or std::shared_ptr<const T>). Message passing: rather than letting threads reach into each other''s memory, have them communicate by sending values through a thread-safe queue (a producer-consumer channel), so ownership transfers with the message and only the queue needs locking. These approaches turn a synchronization problem into a structure problem and scale better than fine-grained locking because there is simply less contention. When you must share writable state, keep it small and well-encapsulated behind one clear owner. Rule: prefer confinement and immutability first, message passing second, shared-memory-plus-locks last.',
    'Fewer shared writable cells beats more locks. Confine state to one thread (per-thread accumulators, combine at the end); share immutable data freely (no sync needed for read-only); pass messages through a thread-safe queue so ownership transfers. Prefer confinement/immutability/messages over shared-memory-plus-locks.',
    'advanced',
    6,
    4510,
    true
  ),
  (
    'cpp.concurrency.shared_state_design.mc_immutable',
    'multiple_choice',
    'Sharing data without locks',
    'Why can immutable data (never modified after construction) be shared across threads without synchronization?',
    'A data race requires concurrent access where at least one thread writes. If the data is never modified after construction, all accesses are reads, so there is no race and no lock is needed.',
    'advanced',
    2,
    4520,
    true
  )
on conflict (id) do update
set
  type = excluded.type,
  title = excluded.title,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.learning_item_skills (learning_item_id, skill_id, is_primary)
values
  ('cpp.concurrency.memory_ordering.lesson', 'cpp.concurrency.memory_ordering', true),
  ('cpp.concurrency.memory_ordering.mc_release_acquire', 'cpp.concurrency.memory_ordering', true),
  ('cpp.concurrency.lock_granularity.lesson', 'cpp.concurrency.lock_granularity', true),
  ('cpp.concurrency.lock_granularity.mc_shared_mutex', 'cpp.concurrency.lock_granularity', true),
  ('cpp.concurrency.shared_state_design.lesson', 'cpp.concurrency.shared_state_design', true),
  ('cpp.concurrency.shared_state_design.mc_immutable', 'cpp.concurrency.shared_state_design', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.concurrency.memory_ordering.mc_release_acquire.a', 'cpp.concurrency.memory_ordering.mc_release_acquire', 'Load the same atomic with acquire and proceed once it reads true', true, 10),
  ('cpp.concurrency.memory_ordering.mc_release_acquire.b', 'cpp.concurrency.memory_ordering.mc_release_acquire', 'Load the flag with relaxed ordering', false, 20),
  ('cpp.concurrency.memory_ordering.mc_release_acquire.c', 'cpp.concurrency.memory_ordering.mc_release_acquire', 'Read the data directly without touching the flag', false, 30),
  ('cpp.concurrency.memory_ordering.mc_release_acquire.d', 'cpp.concurrency.memory_ordering.mc_release_acquire', 'Sleep briefly before reading the data', false, 40),
  ('cpp.concurrency.lock_granularity.mc_shared_mutex.a', 'cpp.concurrency.lock_granularity.mc_shared_mutex', 'std::shared_mutex: many readers share a lock, writers take it exclusively', true, 10),
  ('cpp.concurrency.lock_granularity.mc_shared_mutex.b', 'cpp.concurrency.lock_granularity.mc_shared_mutex', 'A single std::mutex around every access', false, 20),
  ('cpp.concurrency.lock_granularity.mc_shared_mutex.c', 'cpp.concurrency.lock_granularity.mc_shared_mutex', 'No lock at all, since reads are safe', false, 30),
  ('cpp.concurrency.lock_granularity.mc_shared_mutex.d', 'cpp.concurrency.lock_granularity.mc_shared_mutex', 'A recursive_mutex so readers can re-enter', false, 40),
  ('cpp.concurrency.shared_state_design.mc_immutable.a', 'cpp.concurrency.shared_state_design.mc_immutable', 'All accesses are reads, so there is no race and no lock is needed', true, 10),
  ('cpp.concurrency.shared_state_design.mc_immutable.b', 'cpp.concurrency.shared_state_design.mc_immutable', 'The compiler automatically locks immutable data', false, 20),
  ('cpp.concurrency.shared_state_design.mc_immutable.c', 'cpp.concurrency.shared_state_design.mc_immutable', 'Immutable data is copied per thread behind the scenes', false, 30),
  ('cpp.concurrency.shared_state_design.mc_immutable.d', 'cpp.concurrency.shared_state_design.mc_immutable', 'Reads are always atomic regardless of the data', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
