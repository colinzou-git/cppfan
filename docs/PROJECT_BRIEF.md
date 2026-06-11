# cppFan Project Brief

## Vision

cppFan is a cross-device learning app for C++, data structures, and algorithms. It should help a learner move from basic syntax to practical problem solving through short lessons, quizzes, code-reading exercises, bug-spotting tasks, review scheduling, and skill mastery tracking.

The app should be usable on:

- Windows PC for deeper study and coding practice
- iPad for reading, reviewing, and interactive practice
- iPhone for quick reviews, issue tracking, and continuing development through GitHub/Claude workflows

cppFan should be built as a custom adaptive learning app rather than a generic LMS.

## Core user problem

Learning C++ and DSA is hard because concepts are connected, mistakes are easy to forget, and practice is often not personalized. Existing courses, videos, and problem sites usually do not track fine-grained mastery of skills such as RAII, references, constructors, pointer ownership, tree traversal, or dynamic programming state design.

cppFan should make the learning process more efficient by combining:

- Skill map guidance
- Short concept explanations
- Practice immediately after learning
- FSRS-based review scheduling
- Skill event logging
- Mastery and weak-skill detection
- Mobile-friendly daily review

## MVP

The MVP should include:

1. User account and sync
   - Google login
   - Email login if practical
   - User profile
   - Cross-device progress sync

2. Skill map
   - Initial C++ and DSA skill hierarchy
   - Skill prerequisites
   - Status indicators: new, learning, reviewing, weak, strong, mastered, regressed

3. Learning content
   - First modules: structs/classes, constructors, RAII, smart pointers
   - Short lessons
   - Quizzes
   - Code-reading tasks
   - Bug-spotting tasks

4. Review system
   - FSRS scheduling through `ts-fsrs`
   - Review cards linked to skills and learning items
   - Review logs
   - Due review dashboard

5. Skill event ledger
   - Append-only event tracking for learning actions
   - Events used for mastery scoring and weak-skill detection

6. Testing and AI development loop
   - Unit tests
   - Playwright workflow tests
   - GitHub Actions CI
   - Claude Code guardrails
   - Specs and acceptance criteria for each feature

## Non-goals for early versions

- Do not build a full generic LMS.
- Do not build public leaderboards or social features.
- Do not add billing or teams.
- Do not add arbitrary C++ code execution in the first version.
- Do not rely on AI chat for core learning progress.
- Do not create a large content library before validating the learning loop.

## Core learning loop

```text
Choose skill -> learn concept -> practice immediately -> log events -> update review schedule -> update mastery -> recommend next action
```

The learner should always know:

- What to learn next
- What to review today
- Which skills are weak
- Which skills are becoming strong
- What concrete mistakes need attention

## Design principles

- Fast on phone and tablet
- Clear enough for short study sessions
- Deep enough for serious C++/DSA practice
- Offline-friendly where practical
- Every learning action should create useful data
- Review scheduling and mastery tracking should be separate but connected
- Claude Code should work from specs and tests, not vague instructions
