---
name: typescript-best-practices
description: "TypeScript and JavaScript module conventions: single source of truth, inferred types, Zod at trust boundaries, edge-case elimination, destructuring, timeless comments, dependency discipline, async patterns. Use when writing or refactoring any .ts or .tsx logic, types, validation, utilities, adapters, or config. For React UI work, also apply react-best-practices."
---

# TypeScript best practices

Rules for TypeScript and JavaScript modules: utilities, adapters, shared types, business logic. React UI behavior lives in [react-best-practices](../react-best-practices/SKILL.md). Testing lives in [testing-best-practices](../testing-best-practices/SKILL.md).

## Keep one source of truth

Every fact lives in exactly one place. Everything else derives from it. Derived things cannot drift out of sync, and most staleness bugs are two copies of one truth diverging. Many rules here are instances of this principle: types infer from values, a constant names a value once, derived data is computed rather than stored. When two places must agree, make one generate the other, or collapse them into one.

## Infer types, validate at boundaries

- Infer types from values with `satisfies`, `ReturnType`, `z.infer`, and `keyof typeof` on `as const` objects. Write an explicit type only at a boundary consumers depend on. A type maintained in parallel with its value is a second source of truth.
- At boundaries, take `unknown` and narrow it with a schema or a type guard.
- Parse trust boundaries with Zod. A trust boundary is any data you do not control: forms, `JSON.parse`, fetch responses, env vars. For internal shapes, discriminated unions or type guards are enough. Zod belongs at the edge, not in every layer.

## Add adapters only for unstable dependencies

Wrap a dependency behind a contract and an adapter only when its shape is unstable. Generated OpenAPI types and churning third-party APIs qualify. Define the type consumers need, map external to domain in one place, and depend on the contract. Use a pinned, stable library directly. The contract may be an inferred type. Write an explicit `interface` only when inference stops being the single source of truth.

## Eliminate edge cases

Handling an edge case is the fallback. Before you write a conditional, try one of three moves that make the case impossible or identical to the normal one:

- **Normalize at the top.** Collapse input variants into one canonical shape on the first lines, so the body handles exactly one case. Parsing external data with Zod is one instance. So are `Array.isArray(x) ? x : [x]` and `range.end ?? Infinity`.
- **Make the edge the normal case.** Pick representations where the special case behaves like every other case. An empty array needs no guard before `.map` or `.filter`. `items.join(", ")` deletes last-element separator logic. A discriminated union deletes invalid flag combinations.
- **Move the boundary.** Check once, where the case can occur, and let types carry the guarantee downstream. A function that takes `Order` instead of `Order | undefined` has nothing to handle. An exhaustive `switch` on a union has no arm for cases that cannot happen.

For the cases that survive:

- Write them as guard clauses that return early. After the guards, the happy path reads top to bottom, unnested, with no re-checks of conditions the guards already excluded.
- Treat each remaining branch as a cost. An `else if` chain signals a missing normalization, lookup map, or helper. Keep an `else` only when it reads clearer than the alternative.
- Prefer declarative constructs, such as `map`, `filter`, and object lookups, over imperative bookkeeping. Fewer branches leave logic bugs fewer places to hide.
- Reach for destructuring when shaping data: object parameters with defaults (`function f({ limit = 50 }: Opts)`), picking fields (`const { id, name } = row`), rest-omit (`const { secret, ...safe } = row`), tuple returns. It states the shape you want instead of assigning field by field, and renames stay compiler-checked.

## Write timeless comments

- Write identifiers, comments, and committed text in English unless the project says otherwise.
- A comment describes the code as it stands. It holds only what the code cannot say: intent, tradeoffs, non-obvious invariants.
- Change narration belongs in the commit message, never in the code. This includes "changed because the user asked", "previously this did X", and dated notes. Committed reasoning reads as law to the next agent, who trusts it over their own analysis long after it is stale.
- Add JSDoc to public APIs, hooks, and utilities whose behavior the types do not convey. Keep it to one or two lines.
- A spot that seems to need a comment is often code that needs a rethink. Refactor first. Comment what remains.

## Name constants, parse config

Give every value with meaning in business logic a named constant. Take deployment-specific values from env config, such as `import.meta.env` in Vite, and parse them like any trust boundary.

## Choose dependencies deliberately

- Reach for the platform first: modern JavaScript and TypeScript, `Intl`, `URL`, `fetch`, `AbortController`, `structuredClone`.
- Add a dependency for a hard problem. Validation gets zod. Server state gets TanStack Query. Write the code yourself when it is a small piece you would fully own. Install what you introduce, at the latest stable version unless the project or the user pins one.

## Handle async deliberately

- Run independent awaits in parallel with `Promise.all`. A sequential `await` chain implies a real data dependency.
- Thread an `AbortSignal` through cancellable or long-running operations.

## Keep scope tight

- Backwards compatibility is opt-in. Ship only the new path and delete what it replaces, unless something is known to depend on the old one. Ask instead of assuming.
- Search for an existing utility to use or extend before adding a near-duplicate.
- Keep related code close. A helper used by one file lives in that file.

## Before finishing

Re-read the full diff against the rules above and fix any drift. Adherence decays over a long session, and the diff is where it shows.
