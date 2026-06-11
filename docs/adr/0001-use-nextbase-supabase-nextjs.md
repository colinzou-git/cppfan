# ADR 0001: Use Next.js and Supabase as the App Foundation

## Status

Accepted for initial development.

## Context

cppFan needs a modern web app foundation with account login, user data sync, protected routes, database access, testing, and future deployment support.

The app should work well on Windows PC, iPad, and iPhone.

## Decision

Use a Next.js and Supabase architecture as the starting point.

Preferred direction:

- Next.js App Router
- TypeScript
- Supabase Auth
- Supabase Postgres
- Supabase RLS
- Tailwind CSS
- shadcn/ui and Radix UI
- Vitest and Playwright
- GitHub Actions

A starter such as NextBase or a smaller Vercel Supabase starter can be used as a reference during scaffolding.

## Alternatives considered

### From-scratch Next.js

Pros:

- Maximum control
- Minimal code

Cons:

- More setup work
- More chances to miss auth, RLS, testing, or deployment details

### Firebase

Pros:

- Strong Google ecosystem
- Good auth support
- Generous free tier for many small apps

Cons:

- Data model is less natural for relational skill maps, review logs, and event queries

### Moodle

Pros:

- Mature learning platform
- Many LMS features

Cons:

- Too large for cppFan
- Not optimized for a custom adaptive C++ learning loop

### Frappe LMS

Pros:

- Modern open-source LMS ideas
- Useful reference for course and quiz concepts

Cons:

- Too tied to its own ecosystem
- More LMS than custom adaptive learning app

## Consequences

Good consequences:

- Strong ecosystem
- Easier auth and sync
- Relational database fits skill/event models
- Works well with GitHub and Vercel workflows
- Friendly to Claude Code because TypeScript and modular structure are easier to inspect

Tradeoffs:

- Requires careful Supabase RLS design
- Requires discipline to avoid overusing SaaS starter features
- Requires clear module boundaries

## Implementation notes

During app scaffold, avoid adding billing, teams, admin dashboards, or unrelated SaaS features. Keep only what cppFan needs for the learning loop.
