# Testing Standards

## Purpose

This document defines the implementation standards for creating and modifying tests in the Playwright Enterprise Framework.

`ARCHITECTURE.md` defines where responsibilities belong and why. This document defines how those architectural rules are applied during implementation.

These standards apply to both human contributors and AI-assisted development.

## Core Rule

Before writing code, inspect the existing implementation and determine which framework layers are actually required.

Do not create a new abstraction merely because a new test is being added.

Prefer:

```text
reuse
→ extend
→ create
```

in that order.

Equivalent responsibilities should follow existing golden patterns.

Different responsibilities should not be forced into artificial structural uniformity.

## New Test Implementation Workflow

When implementing a new test, follow this sequence:

```text
Understand the behavior
        ↓
Find an analogous existing test
        ↓
Identify required framework layers
        ↓
Reuse existing layers where possible
        ↓
Extend existing layers where appropriate
        ↓
Create missing layers only when required
        ↓
Implement the spec
        ↓
Format
        ↓
Typecheck
        ↓
Run affected tests
        ↓
Review architecture impact
```

Before implementation, answer:

1. What behavior is being verified?
2. Is this primarily API, UI, or composed API/UI behavior?
3. Is there an existing test demonstrating a similar pattern?
4. Which existing framework components can be reused?
5. Which components genuinely need modification?
6. Is any new abstraction actually required?

## Layer Decision Guide

Use this guide when deciding what must change.

```text
Need to call a new API endpoint?
→ API Client

Need to define or change a provider request/response contract?
→ Schema

Need reusable stable domain values?
→ Constants

Need generated or reusable test data?
→ Factory

Need reusable setup, state, dependency composition, or lifecycle?
→ Fixture

Need page-level UI interaction?
→ Page Object

Need reusable UI-region interaction?
→ Component Object

Need controlled network behavior?
→ Mock

Need to verify behavior?
→ Spec
```

Not every test requires every layer.

A new test should modify the smallest set of layers necessary to represent the behavior correctly.

## Existing Implementation First

Before creating a new file or abstraction:

1. search for an existing implementation with the same responsibility;
2. inspect at least one analogous implementation;
3. determine whether the existing component can be extended;
4. preserve the established structural pattern where the responsibility is equivalent.

For example:

```text
New user API behavior
→ inspect UserApiClient
→ inspect user schemas
→ inspect userFactory
→ inspect relevant fixtures
→ inspect existing user API specs
```

or:

```text
New task UI behavior
→ inspect TasksDashboardPage
→ inspect relevant components
→ inspect taskFactory
→ inspect authenticated fixtures
→ inspect existing task UI specs
```

Existing implementations are reference patterns, not templates to copy blindly.

## API Test Standard

A successful API test should normally follow:

```text
prerequisite / test data

request + HTTP assertion

parse response
runtime schema validation

business assertions
```

Example structure:

```ts
test("creates a task", async ({ taskApi, authenticatedTestUser }) => {
  const request = createTask();

  const response = await taskApi.createTask(
    request,
    authenticatedTestUser.accessToken,
  );
  expect(response.status()).toBe(201);

  const body = await response.json();
  validateSchema(taskResponseSchema, body);

  expect(body.title).toBe(request.title);
  expect(body.priority).toBe(request.priority);
});
```

Runtime validation must happen before successful provider data is trusted as a typed contract.

Do not use a TypeScript cast to bypass runtime validation.

Avoid:

```ts
const body = (await response.json()) as TaskResponse;
```

Prefer:

```ts
const body = await response.json();
validateSchema(taskResponseSchema, body);
```

After validation, TypeScript may safely use the schema-derived type.

## Negative API Test Standard

Negative tests should normally follow:

```text
prerequisite / test data

request + HTTP assertion

parse response

error/business assertions
```

Do not validate an error response against a successful response schema.

Do not introduce a generic error schema merely for structural symmetry.

Use a reusable error schema only when the provider exposes a stable, meaningful error contract that benefits from runtime validation.

## API Client Standard

Before adding a client method:

- confirm the responsibility belongs to that domain client;
- follow the existing request construction pattern;
- preserve raw response access when tests need status or negative-response control;
- avoid assertions inside client methods.

Setup helpers may provide stronger guarantees when repeated successful setup is their explicit responsibility.

Do not introduce a generic base client unless demonstrated duplication justifies it.

## Schema Standard

Provider API contracts use TypeBox as the source of truth.

Use:

```ts
export const exampleSchema = Type.Object({
  id: Type.String(),
});

export type Example = Static<typeof exampleSchema>;
```

Do not maintain a separate TypeScript interface that duplicates the same provider contract.

Schema definitions must reflect observed provider behavior, including:

- required fields;
- optional fields;
- nullable values;
- formats;
- enums;
- server-generated defaults.

## Constants Standard

Extract a constant when the value represents reusable and stable domain knowledge.

Do not extract values merely to avoid string literals.

Prefer local values for scenario-specific or one-off test inputs.

Domain unions should derive from canonical constant arrays when appropriate.

## Factory Standard

Factories should generate valid test data by default.

Preferred pattern:

```text
valid defaults
+
explicit overrides
=
scenario-specific data
```

Factories may additionally support intentionally partial or invalid data when negative testing requires it.

Factories must not:

- call APIs;
- interact with UI;
- perform assertions;
- manage test lifecycle.

Before creating a new factory, determine whether the existing domain factory can be extended cleanly.

## Fixture Standard

Create or extend a fixture when the behavior provides meaningful:

- reusable setup;
- state;
- dependency composition;
- lifecycle management.

Do not create a fixture solely to hide trivial construction.

Fixture ordering should communicate logical dependency flow rather than alphabetical ordering.

When adding a fixture:

1. identify its dependencies;
2. reuse existing lower-level fixtures;
3. keep its responsibility focused;
4. clean up owned resources when required;
5. preserve authentication boundaries.

## Authentication Standard

Do not treat API authentication and browser authentication as interchangeable.

```text
API
→ Bearer JWT

Browser
→ Auth.js session
```

Use the fixture matching the required state:

```text
testUserData
→ generated only

registeredTestUser
→ registered

authenticatedTestUser
→ registered + API authenticated

authenticatedPage
→ browser-authenticated Page
```

Do not replace programmatic browser authentication with UI login merely for convenience.

UI login should be performed when login behavior itself is under test.

Objects interacting with `authenticatedPage` must be constructed from that Page or from a fixture that explicitly depends on it.

## Page Object Standard

Page Objects should follow this structural grammar:

```text
external imports

internal imports

class
  page
  locators

  constructor
    page assignment
    locator assignments

  navigation methods

  user action methods

  locator query/helper methods
```

Only include sections that the Page Object actually needs.

Prefer meaningful domain actions over exposing low-level interaction sequences to specs.

Example:

```ts
await loginPage.login(email, password);
```

rather than:

```ts
await loginPage.emailInput.fill(email);
await loginPage.passwordInput.fill(password);
await loginPage.loginButton.click();
```

when the behavior being tested is not the individual field interaction.

Assertions normally remain in specs.

## Component Object Standard

Use a Component Object for a reusable UI region that does not represent an entire page.

Scope child locators to the component root when the real DOM hierarchy supports it.

Do not force root scoping when the application renders an element outside the component subtree.

Portal-rendered dropdowns, dialogs, menus, and similar UI may require page-scoped locators.

DOM reality takes precedence over visual or structural symmetry.

## UI Spec Standard

UI tests should normally follow:

```text
prerequisite / setup

action

primary assertion
related assertions
```

Related assertions should remain visually grouped.

Do not insert blank lines between every assertion.

Do not add generic comments such as:

```ts
// Arrange
// Act
// Assert
```

The test structure should communicate these phases without commentary.

Comments should explain non-obvious reasons rather than restating code.

## API/UI Composition

Prefer API or programmatic setup when UI setup would make a test slower, more brittle, or unrelated to the behavior under test.

For example:

```text
register through API
→ establish browser session programmatically
→ verify authenticated UI behavior
```

Do not use UI flows merely because the final assertion is a UI assertion.

The setup mechanism should serve the behavior being tested.

## Mock Standard

Before creating a mock:

1. determine the exact network behavior that must be controlled;
2. intercept only the required request;
3. preserve unrelated traffic;
4. reproduce realistic provider behavior;
5. keep assertions in the spec.

Do not create a generic mock abstraction before repeated mocking behavior demonstrates a need.

## Naming and Structure

Names should communicate domain responsibility.

Prefer:

```text
UserApiClient
TaskApiClient
TasksDashboardPage
createTestUser
createTask
authenticatedPage
```

Avoid generic names that hide responsibility.

Same-role files should follow the same structural grammar where practical.

Do not make different roles artificially identical.

## Imports and Formatting

Separate external and internal imports:

```ts
import { test } from "@playwright/test";

import { UserApiClient } from "../api/clients/UserApiClient";
```

Do not add blank lines between arbitrary internal import subgroups unless a meaningful convention requires them.

Use Prettier as the formatting authority.

Prettier does not decide semantic whitespace. Contributors remain responsible for removing unnecessary blank lines.

## Comments

Comments should explain why something non-obvious exists.

Good:

```ts
// Dropdown content is portal-rendered outside the navigation subtree.
```

Avoid:

```ts
// Click button
await button.click();
```

Avoid generic AAA comments when the structure is already clear.

## Creating New Abstractions

Before creating a new:

- client;
- schema;
- constant collection;
- factory;
- fixture;
- Page Object;
- Component Object;
- mock;
- utility;

ask:

```text
Does this responsibility already exist?
        ↓
yes → reuse it

Can the existing abstraction own this responsibility cleanly?
        ↓
yes → extend it

Is this genuinely a new responsibility?
        ↓
yes → create the smallest appropriate abstraction
```

Do not design for hypothetical future requirements.

Repeated real usage should drive generalization.

## Definition of Done

Before considering a test implementation complete:

```text
Behavior implemented
        ↓
Architecture boundaries respected
        ↓
Existing abstractions reused where appropriate
        ↓
No unnecessary abstraction introduced
        ↓
Prettier passes
        ↓
TypeScript typecheck passes
        ↓
Affected tests pass
        ↓
Relevant regression scope passes when appropriate
        ↓
Documentation updated if architecture or standards changed
```

A passing test is necessary but not sufficient.

The implementation should also preserve the maintainability and architectural consistency of the framework.

## AI-Assisted Development

AI-generated code is held to the same standard as human-written code.

An AI agent must not assume that generating the spec file alone completes a testing task.

A request such as:

```text
Add tests for a new task feature
```

may legitimately require changes to:

```text
schema
→ client
→ constants
→ factory
→ fixture
→ Page Object / Component
→ mock
→ spec
```

but only the layers required by the behavior should be modified.

Agents should inspect existing implementations before deciding which layers are required.

Architecture must drive generated code, not the other way around.
