# cppFan Skill Engine

The skill engine connects the curriculum, review scheduling, learning events, and mastery status.

## Core idea

FSRS review scheduling and skill mastery are related but separate.

FSRS answers: when should an item be reviewed again?

Skill mastery answers: how well does the learner understand a skill?

## Initial skill areas

- C++ basics
- Structs and classes
- Constructors
- RAII
- Smart pointers
- Arrays
- Linked lists
- Stacks and queues
- Trees
- Graphs
- Sorting
- Searching
- Dynamic programming

## Data model

The planned data model includes:

- skills
- skill prerequisites
- learning items
- review cards
- review logs
- skill events
- mastery snapshots

## Mastery inputs

Positive signals:

- Correct quiz answers
- Successful reviews
- Practice completed without hints
- Repeated success across different days

Negative signals:

- Wrong answers
- Repeated mistakes
- Hint usage
- Regression after earlier success

## Mastery statuses

- new
- learning
- reviewing
- weak
- strong
- mastered
- regressed

## Recommendation order

The app should recommend due reviews first, then weak or regressed skills, then the current learning path, then optional exploration.

## Design note

Prerequisites should usually guide recommendations rather than block exploration. A user can open advanced content, but the app should show missing preparation clearly.
