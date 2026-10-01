---
name: testing-best-practices
description: "Testing conventions: Vitest integration tests as the regression suite, red-green TDD for bug fixes and algorithms, real database in backend tests, edge-level mocking, few component tests, Playwright for critical E2E workflows. Use when writing or changing tests, fixing a reported bug, or deciding what a change needs tested."
---

# Testing best practices

A test exists to pin behavior that could plausibly regress, or to drive a fix red-green. Assert observable behavior. A test that proves `1 + 1 === 2`, or that an error message contains its own words, pins nothing. Delete it rather than write it.

Vitest is the default runner.

## Decide what earns a test

- Logic earns tests: parsing, date math, pricing, permissions, state machines, tricky branching. Pin behavior where a wrong branch would go unnoticed.
- Plumbing does not: wiring a prop, rendering static content, a route that validates and forwards to one domain function. The type checker already covers it.
- Most React components earn nothing. Declarative rendering has no logic to regress, and a test of it pins the markup instead of the behavior. Test a component only when it holds real logic: a multi-step form, conditional flows, a state machine in a hook. Test the hook or the pure function first, and the component only if the logic cannot be pulled out.

## Put most tests at the integration layer

- Make integration tests the bulk. Exercise a feature through its public surface, with only the edge mocked. This suite catches changed behavior without pinning structure.
- Backend: call the route through the app instance, not the handler function. Run against a real database, so queries, constraints, and migrations are under test. Isolate tests with a transaction rolled back per test, or truncate between tests. Build fixtures with the same code paths production uses, such as the domain functions, not raw inserts.
- Frontend: render the feature, not the leaf component, with the network mocked at the edge.
- Reserve Playwright E2E tests for critical workflows: the flows that must never break. Keep this layer thin. Do not mirror the integration suite.

## Work red-green

Bug fixes and algorithmic work go red-green:

1. Red: reproduce the bug, or express the target behavior, as a failing test. A bug test must fail for the reported reason before you write any fix.
2. Green: implement until the test passes.
3. Keep the test. It now guards against regression.

Feature work with meaningful logic gets the same loop: write the goal as tests first, then implement toward them.

## Mock the edge only

- Mock the edge: network with MSW, time, randomness, external services.
- Run your own modules real. Mock an internal module only when isolating it is expensive, such as a heavy auth context or native bindings. Treat every internal mock as a cost to justify.

## Assert observable outcomes

- Assert what users or callers observe: rendered text and roles, response bodies and status codes, persisted rows, calls that crossed the edge.
- Assert specific values. One `toEqual` with the real expected object beats a chain of `toBeDefined` and `toContain` shape checks.

## Before finishing

Re-read the tests you touched against the rules above. Confirm that every bug fix has a test that failed for the reported reason first. Fix any drift.
