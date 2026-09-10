# Framework Architecture

## Purpose

This document defines the architectural boundaries, responsibilities, execution model, and dependency rules of the Playwright Enterprise Framework.

The architecture is designed to remain maintainable and predictable as the test suite grows. Tests should express business behavior while reusable technical concerns are delegated to the appropriate framework layer.

New functionality should extend the existing architecture before introducing new abstractions or patterns.

## Architectural Principles

The framework follows these principles:

- tests describe behavior rather than infrastructure;
- each layer has a clear responsibility;
- dependencies flow toward reusable framework abstractions;
- API contracts are schema-first;
- runtime API data is validated before it is trusted;
- test data creation is separated from test execution;
- fixtures manage reusable setup, state, and lifecycle;
- Page Objects and Component Objects encapsulate UI interaction;
- assertions remain in tests unless validation belongs to an infrastructure boundary;
- test execution scope should reflect the responsibility being tested;
- browser-independent API tests should not be multiplied across browser projects;
- browser-dependent UI tests should execute against the intended browser projects;
- abstractions are introduced only when there is demonstrated reuse or architectural value;
- existing patterns should be extended before parallel patterns are created.

## Repository Structure

```text
config/
  environments/

docs/
  adr/

performance/
  k6/

src/
  api/
    clients/
    constants/
    models/
    schemas/
  components/
  pages/
  fixtures/
  data/
  mocks/
  security/
  accessibility/
  ai/
  utils/
  reporting/

tests/
  smoke/
  regression/
  ui/
  api/
  accessibility/
  visual/
  security/
  performance/

.github/
  workflows/
```

Some directories represent planned framework capabilities and may be populated as those capabilities are introduced.

## Core Dependency Model

A typical API flow is:

```text
Spec
  ↓
Fixture
  ↓
Factory
  ↓
Domain API Client
  ↓
TypeBox Schema
  ├── Static<T> → compile-time type
  └── AJV → runtime validation
  ↓
HTTP assertion
  ↓
Schema validation
  ↓
Business assertions
```

A typical UI flow is:

```text
Spec
  ↓
Fixture
  ↓
Page Object / Component Object
  ↓
Playwright Page
  ↓
Application UI
```

API and UI flows may be composed when API setup provides faster or more reliable prerequisites for UI behavior.

## Test Execution Architecture

The framework separates browser-independent API execution from browser-dependent UI execution.

Playwright projects represent execution responsibility rather than simply duplicating the full suite across multiple browser configurations.

Current project boundaries:

```text
api
→ tests/api/**
→ browser-independent
→ executed once

chromium
→ tests/ui/**
→ tests/smoke/**
→ Chromium browser coverage

firefox
→ tests/ui/**
→ tests/smoke/**
→ Firefox browser coverage

webkit
→ tests/ui/**
→ tests/smoke/**
→ WebKit browser coverage
```

API tests use Playwright's HTTP capabilities and do not validate browser-engine behavior. They must therefore not be multiplied across Chromium, Firefox, and WebKit projects.

UI and smoke tests validate browser-visible behavior and may run across multiple browser projects because rendering, interaction, and browser behavior can differ.

This separation avoids redundant API execution while preserving cross-browser UI coverage.

## CI Execution Architecture

CI execution is organized by responsibility.

The current GitHub Actions dependency model is:

```text
quality
├── formatting
└── typecheck
    ↓
    ├── api
    │   └── API tests once
    │
    └── ui matrix
        ├── chromium
        ├── firefox
        └── webkit
```

The `api` and `ui` jobs depend on the successful completion of the `quality` job but do not depend on one another.

This allows API and UI execution to proceed independently and in parallel after static quality validation succeeds.

The API job does not install browser binaries because browser execution is not required.

Each UI matrix job installs only the browser required by that matrix entry.

CI should avoid unnecessary work when execution responsibility can be expressed explicitly.

## CI Environment Model

CI execution context and test target environment are separate concepts.

```text
CI execution context
→ GitHub Actions
→ process.env.CI

Test target environment
→ selected through TEST_ENV
```

The current CI workflow explicitly targets:

```text
TEST_ENV=hosted
```

This makes CI intent explicit rather than relying on the framework's default environment.

A future change to the default test environment must not silently redirect CI execution to another target.

## CI Permissions

Test workflows follow least-privilege principles.

The current workflow requires repository content read access and does not require repository write access.

```text
permissions:
  contents: read
```

Additional permissions should be introduced only when a workflow capability demonstrates a concrete need.

Secrets must not be introduced merely to demonstrate secret support. Sensitive values should be stored in an appropriate secret store only when a real runtime credential requirement exists.

## CI Artifact Strategy

Playwright generates test reports and failure diagnostics. CI is responsible for preserving those outputs when useful.

Current artifact strategy:

```text
HTML report
→ uploaded for successful and failed executions

Failure diagnostics
→ uploaded only when test execution fails
```

Artifacts are named by execution responsibility to avoid collisions and improve diagnostics.

Examples:

```text
playwright-report-api

playwright-report-chromium
playwright-report-firefox
playwright-report-webkit

test-results-api

test-results-chromium
test-results-firefox
test-results-webkit
```

Matrix jobs execute on independent runners, so identical local output paths are acceptable. Artifact upload names must remain unique when outputs originate from separate jobs.

Artifact retention should be intentional and should balance diagnostic value with storage cost.

## Layer Responsibilities

### Specs

Specs are responsible for verifying observable behavior.

They should:

- express the scenario and business expectation;
- use fixtures for reusable setup and state;
- use Page Objects and Component Objects for UI interaction;
- use API clients for API interaction;
- contain HTTP and business assertions;
- validate successful API responses against runtime schemas;
- avoid duplicating framework infrastructure.

Specs should not become containers for reusable setup logic, raw locator implementation, or repeated HTTP mechanics.

### Fixtures

Fixtures compose framework dependencies and manage reusable setup, state, and lifecycle.

Typical responsibilities include:

- constructing Page Objects and Component Objects;
- constructing API clients;
- generating test users;
- registering or authenticating users;
- creating reusable domain prerequisites;
- creating authenticated browser contexts;
- cleaning up owned resources when required.

Fixture dependencies should represent the actual setup flow.

A fixture should not be introduced merely to hide a single line of code. It should provide meaningful reuse, lifecycle management, state composition, or dependency management.

### Factories

Factories create test data.

They should:

- generate valid data by default;
- allow explicit overrides;
- support intentionally partial or invalid payloads when required by negative tests;
- remain independent from HTTP and UI execution;
- avoid assertions.

Factories answer the question:

> What test data do I need?

They do not perform the operation that consumes that data.

### API Clients

API clients represent domain-specific HTTP interaction.

They are responsible for:

- constructing requests;
- applying authentication when required;
- sending HTTP requests;
- returning raw responses where tests need control over status and negative behavior;
- providing focused setup helpers when repeated setup behavior has demonstrated value.

API clients should not contain test assertions.

Setup helpers may fail fast when their contract requires successful setup.

The framework intentionally does not use a generic `BaseApiClient`. Shared abstractions should only be introduced when real duplication demonstrates a need.

### Schemas

TypeBox schemas are the source of truth for provider API contracts.

They provide both:

```text
TypeBox Schema
  ├── Static<typeof schema> → compile-time TypeScript type
  └── AJV validation        → runtime contract validation
```

Provider responses must not be trusted through TypeScript casting before runtime validation.

Successful API responses should be validated at the provider boundary before their fields are used as typed contract data.

### Models

Models represent framework-owned or test-state concepts when they are not provider API contracts.

For example, framework user state may combine test data with an access token used by later fixtures.

Provider request and response contracts belong in schemas rather than duplicated TypeScript interfaces.

### Constants

Constants represent reusable, stable domain values.

They are appropriate for values such as:

- supported domain states;
- supported priorities;
- stable API error messages used across tests.

One-off values should remain local when extracting them would not improve reuse or clarity.

### Page Objects

Page Objects encapsulate page-level UI structure and interaction.

They are responsible for:

- owning the Playwright `Page`;
- defining page-level locators;
- exposing meaningful user actions;
- exposing locator queries required for assertions.

Page Objects should use domain types when the domain already defines the value.

Assertions normally remain in specs.

### Component Objects

Component Objects represent reusable UI regions that are not entire pages.

Child locators should be scoped to the component root when the DOM boundary supports it.

Elements rendered outside that DOM subtree, such as portal-rendered dropdown content, may remain page-scoped. Locator scope should reflect the real application DOM rather than artificial structural uniformity.

### Mocks

Mocks provide controlled replacement of external or application network behavior.

They should:

- intercept only the behavior required by the scenario;
- preserve unrelated requests;
- remain focused on network behavior;
- avoid duplicating test assertions.

Mocks should represent provider behavior accurately rather than invent application states that the UI does not support.

### Utilities

Utilities contain reusable technical behavior that does not naturally belong to a domain-specific layer.

Utilities should remain focused. Domain behavior should not be moved into generic helpers merely to reduce line count.

## Authentication Architecture

The target application has separate API and browser authentication mechanisms.

```text
API authentication
  → Bearer JWT

Browser authentication
  → Auth.js session
```

These mechanisms must not be treated as interchangeable.

The framework distinguishes between:

```text
testUserData
  → generated only

registeredTestUser
  → registered through API

authenticatedTestUser
  → registered + authenticated through API
  → contains access token

authenticatedPage
  → authenticated browser context
  → programmatic Auth.js session
```

UI authentication setup should preserve programmatic browser authentication rather than falling back to UI login unless the UI login flow itself is the behavior under test.

## API Contract Strategy

The framework uses schema-first API contracts.

The expected positive-response flow is:

```text
request
→ HTTP assertion
→ parse response as unknown
→ runtime schema validation
→ typed business assertions
```

Negative tests do not force successful response schemas onto error responses.

Validation should reflect the provider's observed contract, including nullable fields and server-side defaults.

## Test Data Strategy

Test data should be generated through factories when reusable generation behavior exists.

Factories should provide valid defaults while allowing tests to express only the values relevant to the scenario.

Negative tests may intentionally bypass valid defaults or request partial payloads when testing validation and defaulting behavior.

Test data generation should remain separate from:

- API execution;
- UI interaction;
- assertions;
- fixture lifecycle.

## UI Architecture

Public Page Objects may use the standard Playwright `page` fixture.

Protected UI flows may use `authenticatedPage`, which owns a separate authenticated browser context.

Objects must be constructed from the `Page` belonging to the context they operate on.

A Page Object or Component Object created from the default `page` fixture must not be reused against `authenticatedPage`.

## Execution Boundary Rules

Test placement and Playwright project ownership must remain aligned.

Use:

```text
tests/api/**
→ API project

tests/ui/**
→ browser projects

tests/smoke/**
→ browser projects
```

Do not place browser-dependent behavior under the API suite.

Do not place browser-independent API contract tests under UI or smoke suites merely to force execution through browser projects.

If a new test type requires a materially different execution model, introduce the smallest explicit project boundary required by the behavior rather than extending unrelated projects.

## Abstraction Rules

Before creating a new abstraction, determine whether the existing architecture can be extended.

Do not introduce a new:

- base client;
- service layer;
- generic factory;
- generic mock service;
- domain directory;
- helper wrapper;
- fixture;

solely for symmetry or anticipated future reuse.

New abstractions should solve demonstrated duplication, lifecycle complexity, domain responsibility, or maintainability problems.

Consistency means equivalent responsibilities follow equivalent patterns. It does not mean different responsibilities must have identical structure.

## Architectural Change Policy

Small additions that follow existing architectural rules do not require an ADR.

An ADR should be considered when a change:

- introduces a new architectural layer;
- changes dependency direction;
- replaces an established framework pattern;
- introduces a major external technology;
- changes authentication strategy;
- significantly changes execution or deployment architecture.

Changes to test-project boundaries or CI execution responsibilities should be documented when they alter how suites are selected, distributed, or validated.

When implementation and documentation disagree, the discrepancy should be resolved rather than allowing the documentation to become stale.

Architecture documentation should evolve together with meaningful framework changes.
