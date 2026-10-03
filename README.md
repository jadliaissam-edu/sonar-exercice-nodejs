# Inventory & Orders API (Node.js) - SonarQube training project

A small REST API for managing **products, stock, customers, orders, users and reports**, written in plain
JavaScript (CommonJS) with Express 4 and an in-memory SQLite database (`better-sqlite3`).

This is a training project: it is the "legacy" code base of a fictional company, written by several
developers over several years. It **runs and its tests pass**, but the code is far from perfect.
Your job is to **scan it with SonarQube, understand what the analyzer reports, and improve the code**.

The code is organised in five difficulty levels, one folder each under `src/`.

## Prerequisites

- Node.js 22 or newer and npm
- A running SonarQube Community Build at <http://localhost:9000>
- A user token for SonarQube (My Account > Security > Generate Tokens). **Never write the token into a file
  that is committed - pass it through the environment.**
- `sonar-scanner` (CLI) **or** Docker to use the scanner image

## Install, run, test

```bash
npm install            # installs dependencies (and builds better-sqlite3 if needed)
npm start              # starts the API on http://localhost:3000  (PORT=4000 npm start to change it)
npm test               # runs Jest + supertest and writes coverage/lcov.info
```

Quick smoke test once the server runs:

```bash
curl http://localhost:3000/health
curl "http://localhost:3000/api/products?size=3"
curl http://localhost:3000/api/customers/1/loyalty
```

The database lives in memory and is re-seeded every time the server starts.

### Coverage

`npm test` always collects coverage and produces:

- `coverage/lcov.info` - the file SonarQube imports (`sonar.javascript.lcov.reportPaths`)
- a short text summary in the terminal

Open `coverage/lcov-report/index.html` for the browsable HTML report.

## Scan with SonarQube

All scanner settings are in `sonar-project.properties` (project key `jadli-nodejs`).

```bash
npm test                                   # 1. produce coverage first
export SONAR_TOKEN="<your token>"          # 2. token from your SonarQube account
sonar-scanner                              # 3. analyse (reads sonar-project.properties)
```

Without a local `sonar-scanner` (macOS/Windows Docker Desktop):

```bash
docker run --rm -e SONAR_TOKEN -e SONAR_HOST_URL=http://host.docker.internal:9000 \
  -v "$PWD":/usr/src sonarsource/sonar-scanner-cli
```

**Scanning a single level** (handy for the exercises below) - give every level its own project:

```bash
sonar-scanner -Dsonar.projectKey=jadli-nodejs-level1 -Dsonar.projectName="Node.js - Level 1" \
              -Dsonar.sources=src/level1
```

Then open <http://localhost:9000> and look at *Issues*, *Security Hotspots*, *Measures* and *Code* tabs.

> Run `npm install` before the first scan: some rules need the type definitions in `node_modules`.

## Level to folder map

| Level | Theme | Folder | What lives there |
|-------|-------|--------|------------------|
| 1 - Beginner | Code smells | `src/level1/` | Product catalogue: routes, product service, stock helpers, formatters |
| 2 - Easy / Intermediate | Bugs and reliability | `src/level2/` | Customers, loyalty rules, order creation and cancellation |
| 3 - Intermediate | Vulnerabilities and security hotspots | `src/level3/` | Server setup, authentication, admin tools, report export and sync |
| 4 - Advanced | Maintainability, duplication, coverage, test quality | `src/level4/` (+ `tests/level4.test.js`) | Pricing engine, fulfilment planner, supplier / warehouse / carrier directories, inventory manager |
| 5 - Expert | Realistic mixed capstone | `src/level5/` | Order processing pipeline, notifications, cache, legacy adapters, error handling |

Shared wiring (`src/app.js`, `src/server.js`, `src/db.js`) and the tests under `tests/` belong to no level.

## API overview

| Area | Endpoints |
|------|-----------|
| Products (L1) | `GET/POST /api/products`, `GET /api/products/:id`, `PUT /api/products/:id/stock`, `DELETE /api/products/:id`, `GET /api/products/low-stock`, `GET /api/products/summary` |
| Customers & orders (L2) | `GET/POST /api/customers`, `GET /api/customers/:id/loyalty`, `GET/POST /api/orders`, `POST /api/orders/:id/cancel` |
| Auth, tools, reports (L3) | `POST /api/auth/login`, `GET /api/auth/me`, `/api/tools/*`, `/api/reports/*` |
| Pricing, fulfilment, directories (L4) | `/api/pricing/*`, `/api/fulfilment/:orderId`, `/api/suppliers`, `/api/warehouses`, `/api/carriers` |
| Processing (L5) | `/api/processing/*` |

## Exercises

General rules for every exercise: **do not break the tests** (`npm test` must stay green), re-run the scan after
your changes, and write down what changed in the dashboard. Before fixing anything, read the rule description in
SonarQube (the *Why is this an issue?* and *How can I fix it?* tabs) - do not just click *Fix*.

### Level 1 - Beginner

1. Scan `src/level1` only. How many issues are reported? Group them by *rule* and by *severity*. Which rule
   appears most often? Which files are the worst?
2. Filter on type *Maintainability* (Code Smell). Fix every issue in `productService.js`, then in `stockUtils.js`,
   re-scanning in between.
3. Pick one rule that is **not** active in the default *Sonar way* profile (hint: look at the quality profile
   page) and activate it in a copy of the profile. What new issues appear? Do you agree with them?
4. Some reported issues cannot be fixed by simply deleting code because other files depend on the name or
   signature. Find at least one and explain how you would change it safely.
5. Which findings would you ignore in a code review, and which would you insist on? Defend your choice.

### Level 2 - Easy / Intermediate

1. Scan `src/level2` and filter by type *Bug*. For each bug write down: what happens at runtime, what input
   triggers it, and how you would prove it with a test.
2. Write a failing unit test for **three** of the bugs (use Jest, put them in `tests/level2.test.js`), then fix the
   code and watch the test turn green.
3. Some issues are marked as Code Smells but have a reliability flavour. Find two and explain why they could
   become real bugs under load or with unexpected input.
4. Look at the *Reliability rating* before and after your fixes. What rating did you reach and why?
5. Open the *Activity* tab: how does fixing issues change the project history?

### Level 3 - Intermediate

1. Scan `src/level3` and open both the *Issues* tab (type *Vulnerability*) **and** the *Security Hotspots* tab
   (depending on your SonarQube version, security findings appear in one, the other, or both).
2. For every finding decide: *real problem*, *needs a design change*, or *safe in context*. In the hotspot
   workflow mark each one *Acknowledged*, *Fixed* or *Safe* with a written justification.
3. Fix the findings that can be solved in code. For the ones that need configuration (secrets, URLs) move the
   values out of the source code and read them from environment variables; update `README` / tests accordingly.
4. Look at the OWASP and CWE tags of the findings. Which OWASP Top 10 categories are present?
5. Some dangerous behaviours of this level are **not** reported by the Community Build. Review the routes in
   `src/level3/toolRoutes.js` by hand and list what you would reject in a code review. Which Sonar edition would
   find more?
6. Check *Measures > Security* and *Security Review*: what do the rating and the "hotspots reviewed" percentage
   mean?

### Level 4 - Advanced

1. Scan `src/level4`. Open *Measures > Maintainability*, *Complexity* and *Duplications*. Which files carry the
   most technical debt (SQALE / remediation effort)?
2. Open the *Duplications* view of the project. Which files share code? Propose a refactoring that removes the
   duplication (a shared module, a factory function...) without changing the API behaviour, and implement it.
3. Pick the most complex function of the project. Describe what makes its *Cognitive Complexity* high, then
   refactor it step by step until it is below the default threshold. Add tests **before** you refactor.
4. Open *Measures > Coverage*. Which files have 0 % coverage? Write tests for the pricing engine and the
   fulfilment planner until each reaches at least 80 % line coverage.
5. Review `tests/level4.test.js` as if it were production code. List everything that makes these tests
   unreliable or useless, and fix it. Does Sonar report all of it?
6. **Quality Gate challenge:** create a copy of the default *Sonar way* gate (or use the built-in one) and make the
   *new code* satisfy all of the following:
   - coverage on new code >= 80 %
   - 0 new bugs and 0 new vulnerabilities
   - 100 % of new security hotspots reviewed
   - duplicated lines on new code <= 3 %
   Hint: define "new code" as *Previous version*, make a change, scan again, and check the gate status.

### Level 5 - Expert

1. Scan `src/level5`. Read each issue and explain the failure scenario in a real running API (what would two
   concurrent requests do? what happens after 100 requests?). Prove at least one scenario with a test.
2. Several problems here are not reported by any rule. Review the code in `notifier.js`, `orderProcessor.js`
   and `cache.js` manually and write a short code review (5-10 findings) with severity and a proposed fix.
3. Fix the promise handling in `orderProcessor.js` so that errors are never lost and the code only uses one
   style (async/await or promises).
4. **Triage exercise.** Some findings in this level should *not* be "fixed". For every open issue and hotspot
   decide: *Fix*, *Accept / Won't fix*, *False positive*, or *Safe*. Use the SonarQube workflow to record your
   decision with a comment that would convince a reviewer a year from now. There is at least one false-positive /
   won't-fix case and at least one hotspot that is safe in context - find them without "fixing" them.
5. Raise `src/level5` branch coverage above 85 % while keeping the tests meaningful (no assertion-less tests).
6. **Capstone Quality Gate challenge:** with the whole project (`sonar.sources=src`), configure a gate that
   fails on any new bug, any new vulnerability, unreviewed hotspots, and new-code coverage below 80 %. Then
   make a change to the code that passes the gate on the first try.

## Sonar concepts primer

- **Issue types:** *Bug* (something is probably broken), *Vulnerability* (a security weakness that can be
  exploited), *Code Smell* (maintainability problem), and *Security Hotspot* (security-sensitive code that a human must review - it is
  not automatically a vulnerability). Newer versions also describe the impact on software qualities
  (Reliability, Security, Maintainability) and a severity of Blocker / High / Medium / Low / Info.
- **Rule:** one specific check, identified by a key such as `javascript:S1481`. Rules live in a **Quality Profile**
  per language; *Sonar way* is the default.
- **Quality Gate:** a pass/fail rule set evaluated after each scan (typically on *new code*). A failed gate is a
  signal not to merge/release.
- **New code period:** the baseline (previous version, N days, a branch) that decides what counts as "new".
  "Clean as you code" means: keep new code clean even if old code is not.
- **Ratings:** A-E ratings for Reliability, Security and Maintainability. Maintainability is derived from the
  *technical debt ratio* (estimated remediation effort versus size of the code).
- **Coverage:** percentage of lines/branches executed by tests. SonarQube does not run tests; it imports the
  report (`lcov.info`) generated by your test runner.
- **Duplications:** blocks of identical tokens across or inside files.
- **Cognitive complexity:** a measure of how hard a function is to *understand* (nesting counts more than
  plain branching). Default threshold: 15.
- **Resolutions:** *Accepted / Won't fix* (valid but deliberately kept), *False positive* (the analyzer is wrong);
  hotspots use *Safe*, *Acknowledged* and *Fixed*. Every resolution should carry a comment.
- **Taint analysis** (user input flowing to a dangerous operation) is a Developer Edition feature; the Community
  Build finds the simpler, pattern-based variants.

## Project layout

```
src/
  app.js server.js db.js          shared wiring and in-memory SQLite
  level1/ ... level5/             one folder per difficulty level
tests/                            Jest + supertest (one file per level)
sonar-project.properties          scanner configuration
```
