# Playwright Enterprise Framework

A production-oriented test automation framework built with **Playwright** and **TypeScript**, designed to demonstrate scalable Quality Engineering practices across API and browser testing.

The project focuses on maintainable architecture, runtime API contract validation, reusable test infrastructure, deterministic test data, programmatic authentication, reproducible containerized execution, and CI execution designed around test responsibility.

> This framework is actively evolving as additional Quality Engineering capabilities are introduced.

## Overview

This repository demonstrates how a Playwright test suite can evolve beyond individual automated tests into a structured Quality Engineering framework.

The framework currently provides:

- API and UI automation with Playwright;
- schema-first API contract validation with TypeBox and AJV;
- domain-specific API clients;
- deterministic test-data factories;
- reusable Playwright fixtures;
- programmatic API and browser authentication;
- Page Object and Component Object patterns;
- network mocking for controlled UI scenarios;
- cross-browser UI execution;
- dedicated browser-independent API execution;
- containerized Playwright execution with Docker;
- runtime environment selection for reusable test images;
- persistent test artifacts from ephemeral containers;
- GitHub Actions CI with quality gates;
- browser matrix execution;
- Playwright reports and failure diagnostics;
- explicit architecture and testing standards for human and AI-assisted development.

The framework is intentionally extended only when new capabilities demonstrate a real architectural need.

## Technology Stack

| Area                      | Technology                    |
| ------------------------- | ----------------------------- |
| Test Framework            | Playwright                    |
| Language                  | TypeScript                    |
| API Testing               | Playwright APIRequestContext  |
| Runtime Schema Validation | TypeBox + AJV                 |
| UI Automation             | Playwright Browser Automation |
| Containerization          | Docker                        |
| CI/CD                     | GitHub Actions                |
| Formatting                | Prettier                      |
| Target Application        | UPEX DOJO                     |

## Architecture

The framework separates test behavior from reusable infrastructure.

### API flow

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

Successful provider responses are validated at runtime before their data is trusted by the test.

### UI flow

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

API and programmatic setup are used where appropriate to keep UI tests focused on the browser behavior being verified.

For the complete architectural rules, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Repository Structure

```text
Dockerfile
.dockerignore

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
  api/
  ui/
  smoke/
  regression/
  accessibility/
  visual/
  security/
  performance/

.github/
  workflows/
```

Some directories represent planned framework capabilities and will be populated as those capabilities are introduced.

## API Testing

API tests are implemented as browser-independent Playwright tests.

The framework uses a schema-first contract strategy:

```text
HTTP response
    ↓
status assertion
    ↓
parse response
    ↓
runtime schema validation
    ↓
typed business assertions
```

TypeBox schemas provide both compile-time TypeScript types and runtime contracts validated through AJV.

This prevents provider responses from being trusted through TypeScript casting alone.

API clients remain responsible for HTTP interaction, while assertions remain in the test layer.

## UI Testing

UI automation follows Page Object and Component Object boundaries.

Page Objects represent page-level behavior, while Component Objects encapsulate reusable UI regions.

Authentication setup is separated from the behavior under test. Protected UI scenarios use a programmatically authenticated browser context rather than repeating UI login unless login itself is the scenario being tested.

Locator scope follows the actual application DOM, including support for portal-rendered UI elements.

## Authentication

The target application exposes separate API and browser authentication mechanisms:

```text
API authentication
→ Bearer JWT

Browser authentication
→ Auth.js session
```

The framework preserves this distinction through explicit fixture states:

```text
testUserData
→ generated only

registeredTestUser
→ registered through API

authenticatedTestUser
→ registered + API authenticated

authenticatedPage
→ programmatically authenticated browser context
```

This keeps setup fast while preserving correct authentication boundaries.

## Test Data

Reusable test data is generated through domain factories.

Factories provide valid defaults with explicit overrides:

```text
valid defaults
+
scenario overrides
=
test-specific data
```

Negative tests can intentionally generate partial or invalid payloads when required.

Factories remain independent from HTTP execution, UI interaction, assertions, and fixture lifecycle.

## Docker Execution

Docker provides a reproducible execution environment for the Playwright test suite.

The test image is built from the official Playwright image matching the framework's installed Playwright version:

```text
mcr.microsoft.com/playwright:v1.62.1-noble
```

The image contains the Linux runtime and browser dependencies required for Playwright execution, while project dependencies are installed reproducibly through:

```text
npm ci
```

The framework follows:

```text
build once
→ configure at runtime
```

Target environment selection is therefore not baked into the image.

For example:

```bash
docker run --rm \
  -e TEST_ENV=hosted \
  playwright-enterprise-tests
```

The same image can execute a specific Playwright project by overriding the default container command:

```bash
docker run --rm \
  -e TEST_ENV=hosted \
  playwright-enterprise-tests \
  npx playwright test --project=api
```

This keeps the container image reusable rather than creating separate images for API and browser projects.

### Container Lifecycle

Test containers are treated as ephemeral execution environments.

```text
Docker image
    ↓
container starts
    ↓
Playwright executes
    ↓
process returns exit code
    ↓
container stops
    ↓
container removed
```

`--rm` removes the stopped container automatically after execution.

The container exit code represents the test-process result and can therefore be consumed by the calling execution environment.

### Docker Artifacts

Container filesystems are ephemeral, so test outputs that must survive container removal are persisted outside the container lifecycle.

For local Docker execution, Playwright reports and test results can be bind-mounted to the host:

```bash
docker run --rm \
  -e TEST_ENV=hosted \
  -v "$(pwd)/playwright-report:/app/playwright-report" \
  -v "$(pwd)/test-results:/app/test-results" \
  playwright-enterprise-tests
```

This preserves:

```text
playwright-report/
test-results/
```

on the host even after the container is removed.

Local Docker artifact persistence and CI artifact upload are separate concerns. GitHub Actions continues to preserve CI execution evidence through its artifact upload strategy.

## CI Pipeline

GitHub Actions provides automated quality validation and containerized test execution.

Current execution architecture:

```text
quality
├── Prettier
└── TypeScript typecheck
        ↓
build-image
├── docker build once
├── image tag = github.sha
├── docker save
└── temporary GitHub Actions artifact
        ↓
        ├── api
        │   └── same image → --project=api
        │
        └── ui matrix
            ├── same image → chromium
            ├── same image → firefox
            └── same image → webkit
```

The quality gate currently validates:

```text
Prettier
→ TypeScript typecheck
```

After quality validation succeeds, CI builds the reusable Playwright test image once.

The image is tagged with the current commit SHA, saved as a temporary GitHub Actions artifact, and reused by the API and UI jobs.

API tests execute once because they are browser-independent.

UI and smoke tests execute through browser-specific Playwright projects using a GitHub Actions matrix.

The API and UI jobs load and execute the same previously built Docker image rather than installing project dependencies or Playwright browsers independently on their runners.

Test containers are ephemeral and execute with `--rm`.

Playwright report and test-result directories are bind-mounted from the containers to the GitHub Actions runners so CI can upload them as workflow artifacts after container execution.

## Playwright Projects

The current project ownership is:

```text
api
→ tests/api/**

chromium
firefox
webkit
→ tests/ui/**
→ tests/smoke/**
```

This prevents HTTP-only API tests from being redundantly executed once per browser while preserving cross-browser coverage where browser behavior matters.

## Reports and Diagnostics

CI preserves execution evidence through Playwright artifacts.

```text
HTML report
→ uploaded for every test execution

Failure diagnostics
→ uploaded when execution fails
```

Artifacts are separated by execution responsibility and browser so failures remain attributable to the correct job.

Playwright is configured to retain additional diagnostics for failed or retried execution, including screenshots, video, and traces according to the configured policy.

Docker-based local execution can preserve the same generated Playwright output directories through bind mounts, independently of CI artifact handling.

## Environment Configuration

The framework supports explicit target environments through `TEST_ENV`.

Current environment definitions include:

```text
hosted
local
ci
```

The GitHub Actions workflow explicitly targets:

```text
TEST_ENV=hosted
```

Docker execution can select the same target at container runtime:

```text
docker run -e TEST_ENV=hosted ...
```

The execution environment and test target environment are intentionally treated as separate concepts.

For example:

```text
execution environment
→ local machine
→ Docker container
→ GitHub Actions runner

test target environment
→ selected through TEST_ENV
```

## Running Locally

Install dependencies:

```bash
npm ci
```

Install Playwright browsers:

```bash
npx playwright install
```

Run the complete configured test suite:

```bash
npm test
```

Run API tests only:

```bash
npx playwright test --project=api
```

Run a browser project:

```bash
npx playwright test --project=chromium
```

Run formatting validation:

```bash
npx prettier --check .
```

Run TypeScript validation:

```bash
npm run typecheck
```

### Running with Docker

Build the reusable Playwright test image:

```bash
docker build -t playwright-enterprise-tests .
```

Run the complete configured suite against the hosted target:

```bash
docker run --rm \
  -e TEST_ENV=hosted \
  playwright-enterprise-tests
```

Run only the API project:

```bash
docker run --rm \
  -e TEST_ENV=hosted \
  playwright-enterprise-tests \
  npx playwright test --project=api
```

Run the complete suite while preserving reports and test results on the host:

```bash
docker run --rm \
  -e TEST_ENV=hosted \
  -v "$(pwd)/playwright-report:/app/playwright-report" \
  -v "$(pwd)/test-results:/app/test-results" \
  playwright-enterprise-tests
```

## Engineering Standards

The repository contains explicit architecture and implementation standards.

Before making framework changes, contributors should read:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/TESTING_STANDARDS.md`](docs/TESTING_STANDARDS.md)
- [`AGENTS.md`](AGENTS.md)
- relevant Architecture Decision Records under [`docs/adr/`](docs/adr/)

The framework follows a simple extension rule:

```text
reuse
→ extend
→ create
```

New abstractions are introduced only when demonstrated responsibility, reuse, or complexity justifies them.

## AI-Assisted Development

The repository is structured to support AI-assisted engineering without allowing generated code to define the architecture.

AI coding agents are instructed to:

- inspect existing implementations before generating code;
- follow documented architectural boundaries;
- use equivalent implementations as golden references;
- reuse or extend existing abstractions before creating new ones;
- preserve schema-first API contracts;
- preserve authentication and fixture boundaries;
- select the correct Playwright execution project;
- validate formatting, types, and affected tests before completion.

Repository-level agent behavior is defined in [`AGENTS.md`](AGENTS.md), with GitHub Copilot-specific instructions in [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

Architecture drives generated code, not the other way around.

## Target Application

The framework currently tests **UPEX DOJO**, a full-stack application exposing both browser workflows and REST APIs.

The target provides realistic scenarios for:

- user registration and authentication;
- authenticated browser sessions;
- task management;
- API contract testing;
- API/UI integration;
- negative testing;
- controlled network failure scenarios.

The framework treats the target application as an external provider and models observed runtime behavior rather than assuming undocumented contracts.

## Project Status

Current implemented foundation:

```text
Framework architecture        ✅
Reusable fixtures             ✅
Test-data factories           ✅
API automation                ✅
API authentication            ✅
Runtime contract validation   ✅
API/UI integration            ✅
Network mocking               ✅
Page/Component architecture   ✅
Programmatic browser auth     ✅
Cross-browser execution       ✅
Docker test execution         ✅
Runtime container config      ✅
Container artifact persistence ✅
GitHub Actions CI             ✅
CI quality gates              ✅
CI artifacts                  ✅
Browser matrix execution      ✅
Agent engineering standards   ✅
```

Additional Quality Engineering capabilities will be introduced as the framework evolves.

## Design Philosophy

The goal of this repository is not to maximize abstraction or demonstrate the largest possible number of tools.

The framework favors:

- explicit responsibility boundaries;
- type safety;
- runtime validation;
- reusable but focused abstractions;
- deterministic setup;
- reproducible execution;
- maintainable test structure;
- efficient CI execution;
- meaningful diagnostics;
- documented architectural decisions.

A passing test is necessary, but maintainability, reliability, reproducibility, and architectural consistency are part of the definition of quality.
