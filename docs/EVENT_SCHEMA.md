# cppFan Learning Events

cppFan should record important learning actions so the app can understand progress over time.

This document is a first draft. The future database table will likely be named `skill_events`.

## Why events matter

Review scheduling and mastery tracking are not the same thing.

Review scheduling decides when an item should appear again.

Learning events describe what the learner actually did.

## Initial events

- lesson started
- concept viewed
- quiz submitted
- quiz answered correctly
- quiz answered incorrectly
- hint used
- review completed
- practice attempted
- practice completed
- skill marked mastered
- skill marked regressed

## Common fields

- event id
- user id
- skill id
- learning item id
- review card id
- event name
- event time
- extra details
- creation time

## Rules

- Events should belong to one user.
- Events should usually connect to one skill.
- Events should be append-only.
- Extra details should be small.
- Extra details should not include secrets.

## How events support mastery

Positive signals include correct answers, successful reviews, and repeated success over multiple days.

Negative signals include wrong answers, repeated mistakes, hints, and regression after previous success.

The app should use these signals to show weak skills, strong skills, mastered skills, and skills that need more review.
