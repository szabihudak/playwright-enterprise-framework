# Agent Instructions

## Purpose

This file defines how AI coding agents must operate when modifying this repository.

The same architectural and quality standards apply to AI-generated and human-written code.

Agents must preserve the established framework architecture rather than optimize for generating the smallest amount of code or completing only the immediately requested spec.

## Required Reading

Before implementing or modifying tests, read:

1. `docs/ARCHITECTURE.md`
2. `docs/TESTING_STANDARDS.md`
3. relevant ADRs under `docs/adr/`
4. existing implementations analogous to the requested change

`docs/ARCHITECTURE.md` defines architectural responsibilities.

`docs/TESTING_STANDARDS.md` defines implementation rules and golden patterns.

This file defines the execution behavior expected from an AI agent.

## Operating Principle

Do not start by generating code.

First determine:

```text
requested behavior
        ↓
existing analogous implementation
        ↓
affected architectural layers
        ↓
reuse existing abstractions
        ↓
extend existing abstractions where appropriate
        ↓
create missing abstractions only when required
        ↓
implement
        ↓
validate
```

Prefer:

```text
reuse
→ extend
→ create
```

Do not introduce parallel patterns when an established pattern already owns the responsibility.

## Before Modifying Code

Inspect the relevant repository areas before deciding what must change.

Depending on the task, inspect the applicable:

- spec;
- API client;
- schema;
- constants;
- factory;
- fixture;
- Page Object;
- Component Object;
- mock;
- utility;
- configuration.

Do not assume that a request to "add a test" requires changing only a spec.

Likewise, do not assume every new test requires new framework components.

Modify only the layers genuinely required by the behavior.

## Golden References

Use existing implementations with equivalent responsibilities as architectural references.

Examples include:

```text
User API behavior
→ existing user client
→ user schemas
→ user factory
→ authentication fixtures
→ user API specs

Task API behavior
→ TaskApiClient
→ task schemas
→ task constants
→ taskFactory
→ task fixtures
→ task API specs

Authenticated UI behavior
→ authenticatedPage
→ relevant Page Object / Component Object
→ existing authenticated UI specs
```

References demonstrate structural grammar and responsibility boundaries.

Do not copy implementations mechanically when the domain behavior differs.

## Architectural Boundaries

Preserve the responsibilities defined in `docs/ARCHITECTURE.md`.

In particular:

```text
Schema
→ provider API contract

API Client
→ HTTP interaction

Factory
→ test data generation

Fixture
→ setup, state, dependencies, lifecycle

Page Object
→ page-level UI interaction

Component Object
→ reusable UI-region interaction

Mock
→ controlled network behavior

Spec
→ behavior verification and assertions
```

Do not move responsibilities between layers merely to reduce code.

## API Rules

Provider API contracts are schema-first.

TypeBox schemas are the source of truth for provider request and response contracts.

Do not create duplicate TypeScript interfaces for schema-owned provider contracts.

Do not trust provider response data through TypeScript casting before runtime validation.

For successful API responses, preserve the pattern:

```text
request
→ HTTP assertion
→ parse response
→ runtime schema validation
→ business assertions
```

Negative responses should not be forced through successful-response schemas.

API clients must not contain test assertions.

Do not introduce a generic `BaseApiClient` without demonstrated architectural need.

## UI Rules

Keep UI interaction inside the appropriate Page Object or Component Object.

Keep test assertions in specs unless a validation belongs to an infrastructure boundary.

Use domain types when an established domain type already represents the value.

Locator scope must reflect the actual DOM.

Do not force component-root scoping for portal-rendered elements that exist outside the component subtree.

Objects used with `authenticatedPage` must operate on that authenticated `Page` instance.

Do not reuse an object constructed from the default Playwright `page` against `authenticatedPage`.

## Authentication Rules

API and browser authentication are separate concerns:

```text
API
→ Bearer JWT

Browser
→ Auth.js session
```

Preserve the established fixture semantics:

```text
testUserData
→ generated, unregistered, unauthenticated

registeredTestUser
→ registered only

authenticatedTestUser
→ registered + API authenticated

authenticatedPage
→ programmatically authenticated browser context
```

Do not replace `authenticatedPage` setup with UI login.

Use UI login only when login behavior itself is under test.

## Abstraction Rules

Do not introduce a new:

- base client;
- service layer;
- generic factory;
- generic mock service;
- domain directory;
- helper wrapper;
- fixture;
- Page Object;
- Component Object;

for hypothetical future reuse or structural symmetry.

Before creating an abstraction, verify:

```text
Does this responsibility already exist?
→ reuse

Can the existing abstraction own it cleanly?
→ extend

Is it genuinely a new responsibility?
→ create the smallest appropriate abstraction
```

Real reuse and demonstrated complexity should drive generalization.

## Change Scope

Make the smallest architecturally complete change.

This does not mean changing the fewest files.

For example, a correct feature implementation may require:

```text
schema
+ client
+ factory
+ fixture
+ Page Object
+ spec
```

if the behavior genuinely crosses those layers.

Conversely, do not touch those layers when the existing implementation already supports the behavior.

Avoid unrelated cleanup during focused feature work unless the existing issue blocks or compromises the requested implementation.

## Comments and Formatting

Do not add generic comments that restate code.

Avoid:

```ts
// Arrange
// Act
// Assert
```

Comments should explain non-obvious reasons or constraints.

Preserve semantic whitespace.

Separate external and internal imports according to the repository standard.

Use Prettier as the formatting authority, while remembering that unnecessary semantic blank lines may still require manual cleanup.

## Validation

Before considering implementation complete, run the relevant validation.

At minimum:

```bash
npx prettier --check .
npm run typecheck
```

Run the affected Playwright tests.

Run broader regression scope when the change affects shared framework infrastructure.

Do not claim a test or validation command passed unless it was actually executed successfully.

If validation cannot be executed, state that explicitly.

## Documentation

Update documentation when a change modifies:

- architectural responsibility;
- established golden patterns;
- authentication strategy;
- dependency direction;
- framework-wide implementation standards;
- major technology choices.

Do not modify architecture documentation for ordinary feature additions that already follow documented patterns.

Consider an ADR when the change represents a meaningful architectural decision as defined in `docs/ARCHITECTURE.md`.

## Completion Review

Before completing a task, verify:

```text
requested behavior implemented
        ↓
existing architecture preserved
        ↓
correct layers modified
        ↓
no unnecessary abstraction introduced
        ↓
provider contracts validated correctly
        ↓
authentication boundaries preserved
        ↓
formatting passes
        ↓
typecheck passes
        ↓
affected tests pass
        ↓
documentation updated if required
```

A passing test alone does not make an implementation complete.

The resulting code must also remain consistent with the framework's architectural standards.

## Architecture Changes

Do not redesign the framework as part of ordinary feature implementation.

If the requested behavior cannot be implemented cleanly within the documented architecture:

1. identify the architectural conflict;
2. explain why the existing pattern is insufficient;
3. propose the smallest architectural change;
4. update the appropriate documentation or ADR;
5. only then implement the new pattern.

Architecture changes must be deliberate rather than accidental.
