---
name: react-best-practices
description: "React and UI conventions for Vite, TanStack Query, and Tailwind: Suspense and error boundaries for async UI, near-zero useEffect, one source of truth per piece of state, small named components, flex-first layout, CVA variants. Use when building or refactoring React components, hooks, forms, queries, or Tailwind styling. typescript-best-practices still applies to all .tsx code."
---

# React best practices

Conventions for React UI code. Every `.ts` and `.tsx` module also follows [typescript-best-practices](../typescript-best-practices/SKILL.md) for types, Zod, adapters, control flow, comments, and dependencies.

Stack defaults: React, Vite, TanStack Query, Tailwind. Generated API client code is an unstable external shape. Adapt it, as described under Adapters in typescript-best-practices.

## Keep each piece of state in one place

- Keep server and async state in TanStack Query. Reach for Zustand only when local UI state is large or cross-cutting.
- Server data lives in the query cache, shareable UI state lives in the URL, and the rest is derived at render. An effect that copies one state into another is two sources drifting. Derive instead.
- Keep renders pure: UI derives from props, state, and query results.
- Treat `useEffect` as a last resort. Reach first for query `select` or callbacks, event handlers, derived values, or search params. Put a needed effect in a dedicated `useThing()` hook. Reserve inline effects for a tiny one-off sync that can live nowhere else.

## Handle loading and errors at the right layer

- Handle loading and failure in the render tree with Suspense and error boundaries, or route-level equivalents. Suspense queries fit this model.
- Event handlers, timers, and mutation paths bypass boundaries. Handle those with try/catch, mutation `onError`, or toasts.

## Extract components around concepts

- Keep components small and focused. Extract when the piece names a concept or enables reuse. Keep JSX inline when splitting would hurt locality.
- Put multiple components in one file only when they are tightly coupled. Split a very long file by domain.
- Compute view-ready data in named variables above the `return`. Keep `{...}` expressions in the JSX trivial.

## Wrap DOM access, skip premature memo

- Put imperative DOM and browser APIs in custom hooks, not in component bodies.
- Add `useMemo`, `React.memo`, or `useCallback` only when the cost is measured or obvious. React Compiler shrinks the need further.
- Several independent `useState` calls are fine. Coupled updates, stored derived state, or state that belongs in the URL or the query cache all signal extraction into a hook, a store, or a derived value.

## Style with theme tokens, lay out with flex

- Reach for flexbox first. Use grid when the layout is two-dimensional: explicit rows and columns, or overlapping areas.
- Prefer theme tokens over arbitrary values. Reserve arbitrary values for one-off cases. `min-*` and `max-*` together make a fine intentional clamp.
- Use CVA for variant-heavy presentational components. Add `class-variance-authority` as a direct dependency when you introduce it.
- Format dates and numbers with `Intl` APIs, such as `Intl.DateTimeFormat` and `Intl.NumberFormat`, not hand-rolled strings.

## Before finishing

Re-read the full diff against the rules above and fix any drift. Adherence decays over a long session, and the diff is where it shows.
