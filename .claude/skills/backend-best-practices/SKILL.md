---
name: backend-best-practices
description: "Server-side conventions for Node and Hono APIs: few layers, Zod-validated route input, typed AppError mapped to HTTP in one onError, Drizzle for data, tRPC or Hono RPC for internal contracts and OpenAPI for public ones. Use when writing or refactoring API routes, server logic, database access, or endpoint design."
---

# Backend best practices

Conventions for server-side TypeScript. [typescript-best-practices](../typescript-best-practices/SKILL.md) applies in full. This file covers what is specific to APIs.

Stack defaults: Hono, Drizzle, Zod.

## Default to few layers

A route handler that calls a domain function that queries the database is usually the whole stack. Add an abstraction when something concrete justifies it: a real second consumer, a deep module that hides complexity, or a boundary expected to churn. Skip ceremony added for symmetry, such as a service class per table or a repository interface with one implementation.

## Pick the contract by its consumers

- For internal or single-consumer APIs, use end-to-end types with tRPC or the Hono RPC client. Types flow, and iteration stays fast.
- For public or multi-consumer APIs, use OpenAPI with `@hono/zod-openapi`, so consumers get a spec. Accept the slower iteration as the price of a published contract.
- Either way, derive the contract from the route schemas. A hand-maintained spec is a second source of truth.

## Validate every route input

Parse every route input with Zod at the route boundary: body, params, query, and any header you read. Use `zValidator` in Hono and `input()` schemas in tRPC. Past that line, data is typed and trusted. Parse env vars once at startup with a Zod schema, so bad config crashes at boot, not mid-request.

## Map errors to HTTP in one place

Domain code throws a typed `AppError` with a coarse, closed set of codes. One `onError` maps codes to HTTP. Routes and domain functions stay free of status codes.

```ts
// errors.ts
export type ErrorCode = "not_found" | "forbidden" | "conflict" | "invalid";

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

// app.ts, the one place errors become HTTP
const STATUS: Record<ErrorCode, ContentfulStatusCode> = {
  not_found: 404,
  forbidden: 403,
  conflict: 409,
  invalid: 400,
};

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.code, message: err.message }, STATUS[err.code]);
  }
  console.error(err);
  return c.json({ error: "internal" }, 500);
});

// domain code, no HTTP knowledge
if (!order) throw new AppError("not_found", `Order ${id} not found`);
```

- Keep the code set coarse, around five codes. A new code must map to a distinct HTTP status or to distinct client handling. Otherwise reuse an existing code.
- Log unknown errors server-side and return a generic 500 body. Internals stay out of responses.
- When a caller must recover from a specific failure mid-flow, return a discriminated union from that function instead of throwing. Throwing is for failures that end the request.
- With tRPC, apply the same principle: map `AppError` to `TRPCError` in one place, such as an error formatter or a shared wrapper.

## Keep the schema in code, shape what leaves it

- Use Drizzle with the schema in code. Generate migrations and check them in.
- Shape responses by picking fields, with destructuring or `columns:` in the query, not with mapper layers. Pick rather than rest-omit: `...rest` is a deny-list, so a column added later silently flows to clients. Public contracts still get a real mapping to the promised shape.
- Wrap multi-write invariants in a transaction.
- Compute derived values with generated columns, views, defaults, or at read time, instead of writing second copies. When denormalizing for performance, give one code path ownership of the write.

## Before finishing

Re-read the full diff against the rules above and fix any drift. Adherence decays over a long session, and the diff is where it shows.
