# Gym & Fitness Management Platform — Implementation Task List

> **For the build session:** This is the master task list. Work top-to-bottom: **Phase 0 (Foundations) → Phase 1 (MVP/P0) → Phase 2 (P1) → Phase 3 (P2).** Each task has a checkbox, a one-line description, a priority, dependencies (by task ID), and the PRD requirement IDs it covers. Tick subtasks as you go. Do not start a feature task until its dependencies are checked off.

**Source PRD:** `Docs/Gym_Management_Platform_PRD.md` (v1.0)
**Generated:** 2026-06-03

---

## 0. Locked Architecture Decisions

These were decided during planning and are the source of truth for the build. Do not re-litigate without updating this file.

| # | Decision | Choice |
|---|---|---|
| 1 | Repo structure | **Monorepo** — pnpm workspaces + Turborepo |
| 2 | Multi-tenancy | **Single MySQL database, shared schema, `tenantId` (facilityId) on every tenant-owned row**, enforced by a Prisma client extension + request-scoped tenant context. No query may cross tenants. |
| 3 | Fiscal integration topology | **Local "fiscal-bridge" agent** at the edge (per facility) owns the device connection + the offline transaction queue, and syncs to the cloud API on reconnect. Fiscal domain logic lives in a shared `fiscal-core` package. |
| 4 | Fiscal device (now) | **Mock driver only.** Build a pluggable `FiscalDriver` interface + `MockFiscalDriver`. Real Akcent/David drivers + certification are deferred (see T1.19). |
| 5 | Front-desk terminal | **The React admin web app shipped as a PWA** on the Android tablet — IndexedDB offline queue + service worker, talking to the local fiscal-bridge on localhost. No separate native terminal app. |
| 6 | Auth | **Separate `Staff` and `Member` identity tables**, one auth module issuing **JWT access (short) + refresh (rotating)** tokens carrying `tenantId` + `role`/`scope`. RBAC via Nest guards. |
| 7 | Hosting | **Hetzner (EU region), Docker.** Managed/containerized MySQL, containerized API + bridge images. |
| 8 | Localization | **i18n infrastructure for MK / SQ / EN built now; ship MK + EN content at MVP. Albanian (SQ) content deferred to P1 (T2.27).** Currency always denar (MKD). |

### Accepted lower-stakes defaults
- **API contract:** NestJS DTOs validated with class-validator; OpenAPI/Swagger auto-generated; shared TS types/Zod contracts in `packages/shared-types`.
- **Client data/state:** TanStack Query + Zustand (admin web and RN).
- **UI:** admin = React + Vite + **shadcn/ui** + Tailwind; member app = React Native + **React Native Paper**.
- **Testing:** API = Jest + Supertest (unit + e2e per module); admin web = Vitest + React Testing Library; RN = Jest + RTL (Detox smoke later). Fiscal + offline-sync get dedicated integration tests.

---

## 1. Repository Layout (target structure)

```
gymapp/
├─ apps/
│  ├─ api/                 # NestJS cloud backend (REST /api/v1, multi-tenant)
│  ├─ admin-web/           # React (Vite) admin + PWA front-desk/POS terminal
│  ├─ member-mobile/       # React Native member app (Android-first, iOS in P1)
│  └─ fiscal-bridge/       # Local NestJS edge agent: device + offline queue + sync
├─ packages/
│  ├─ shared-types/        # Shared TS types, DTO contracts, Zod schemas, enums
│  ├─ db/                  # Prisma schema (source of truth), client, migrations, seed
│  ├─ fiscal-core/         # Fiscal engine: FiscalDriver interface, receipt model, MockFiscalDriver
│  ├─ i18n/                # Translation catalogs (mk, sq, en) + format helpers
│  └─ config/              # Shared tsconfig / eslint / prettier / tailwind presets
├─ docker/                 # Dockerfiles, docker-compose, Hetzner deploy
├─ .github/workflows/      # CI
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

**Definition of done (applies to every task unless stated):** code merged on its own branch; lint + typecheck clean; the task's tests written and passing; tenant isolation respected; visible behavior verified manually where a UI is involved; committed with a descriptive message.

**Subtask layer legend:** each feature task is broken into the layers it touches — **Prisma** (data model) · **Backend** (NestJS module/service/controller) · **API** (endpoints) · **Admin UI** (React) · **RN** (member app screens) · **Tests** · **Integration** (cross-surface wiring + manual verify). Layers that don't apply are marked _n/a_.

---

# Phase 0 — Foundations

> Front-loaded scaffolding, the data/tenancy/auth core, and the fiscal de-risk spike. Nothing in Phase 1+ should start before the foundation tasks it depends on are done.

### Project & tooling

- [x] **T0.1 — Monorepo scaffold** · `P0`
  - _Description:_ Stand up the pnpm + Turborepo monorepo with the app/package folders.
  - _Depends on:_ none · _Covers:_ infra
  - [x] Init `pnpm-workspace.yaml`, root `package.json`, `turbo.json` with `build`/`lint`/`test`/`typecheck` pipelines.
  - [x] Create empty `apps/*` and `packages/*` per the Repository Layout with placeholder `package.json` each.
  - [x] Tests: `pnpm install` resolves; `pnpm turbo run build` runs across empty packages without error.
  - [x] Integration: commit; verify Turbo task graph caches.
  - ✅ **Done (2026-06-04):** pnpm 9.15.9 + turbo 2.9.16; 9 workspace packages all build green. Placeholder `build/lint/typecheck/test` scripts echo until each package is fleshed out in its own task. pnpm installed via `npm i -g` (corepack shim wasn't on PATH on this Windows machine). Remote `origin` = github.com/bojan-eftimoski/gymapp.

- [ ] **T0.2 — Shared tooling & CI config** · `P0`
  - _Description:_ Centralized TS/ESLint/Prettier presets and a CI pipeline.
  - _Depends on:_ T0.1 · _Covers:_ infra, NFR 8.6
  - [ ] `packages/config`: base `tsconfig`, ESLint (TS + import + boundaries), Prettier, Tailwind preset.
  - [ ] Git hooks (lint-staged + commit message check) and `.editorconfig`.
  - [ ] `.github/workflows/ci.yml`: install → typecheck → lint → test on PR.
  - [ ] Tests: CI green on an empty PR; lint fails on a deliberately bad file.
  - [ ] Integration: branch protection notes documented in README.

- [ ] **T0.3 — Shared packages bootstrap** · `P0`
  - _Description:_ Initialize `shared-types`, `i18n`, and `fiscal-core` so other packages can import them.
  - _Depends on:_ T0.2 · _Covers:_ PL-01 (infra)
  - [ ] `packages/shared-types`: exportable enums (Role, MembershipStatus, PaymentMethod, etc.) + Zod base.
  - [ ] `packages/i18n`: locale loader for `mk`/`sq`/`en`, key-typed catalogs, date/denar formatters.
  - [ ] `packages/fiscal-core`: empty module skeleton + public barrel (filled in T0.9).
  - [ ] Tests: a consumer package imports a type from each; i18n returns a translated key for all 3 locales.
  - [ ] Integration: commit; verify workspace `@gymapp/*` aliases resolve in TS.

### Data, API skeleton, tenancy, auth

- [ ] **T0.4 — Database & Prisma foundation** · `P0`
  - _Description:_ Stand up MySQL + Prisma in `packages/db` with the `Facility` (tenant) model, migration workflow, and seed.
  - _Depends on:_ T0.1 · _Covers:_ data model foundation, entity "Facility/Tenant"
  - [ ] Prisma: init schema against MySQL; `Facility` model (name, locale defaults, fiscal config JSON, timestamps); base enums; `datasource`/`generator`.
  - [ ] Migration workflow scripts (`migrate dev`/`deploy`) + generated client exported from package.
  - [ ] Seed script: one demo facility + reference data hook.
  - [ ] Tests: migration applies to a throwaway DB; client connects; seed runs idempotently.
  - [ ] Integration: `docker-compose` local MySQL (wired fully in T0.13); document `.env` DATABASE_URL.

- [ ] **T0.5 — NestJS API skeleton** · `P0`
  - _Description:_ Bootstrap `apps/api` with config, validation, structured errors, versioning, OpenAPI, and health.
  - _Depends on:_ T0.4 · _Covers:_ API §10.1 conventions
  - [ ] Backend: Nest app, `ConfigModule`, global `ValidationPipe`, global exception filter returning `{code,message,details}`, `/api/v1` prefix, Swagger at `/api/docs`.
  - [ ] PrismaModule wrapping `packages/db` client; `GET /api/v1/health`.
  - [ ] API: health + error contract documented in OpenAPI.
  - [ ] Tests: e2e boot test; health returns 200; a forced error returns the structured body.
  - [ ] Integration: Swagger renders; commit.

- [ ] **T0.6 — Multi-tenancy core** · `P0`
  - _Description:_ Enforce per-request tenant scoping so no query can cross facilities.
  - _Depends on:_ T0.5 · _Covers:_ Architecture #2, NFR 8.5, §10.3 tenant isolation
  - [ ] Backend: `AsyncLocalStorage` tenant context; tenant-resolution middleware/guard (from JWT `tenantId`, validated server-side, never trusting client body).
  - [ ] Prisma client extension that auto-injects `tenantId` filter on read and value on write for all tenant-owned models; a typed marker for tenant-owned vs global models.
  - [ ] API: a temporary protected probe endpoint to exercise scoping.
  - [ ] Tests: **isolation tests** — seeded facility A cannot read/update/delete facility B rows; missing tenant context throws; writes stamp the correct `tenantId`.
  - [ ] Integration: document the "all tenant models must carry tenantId" rule for later schema tasks.

- [ ] **T0.7 — Auth & RBAC** · `P0`
  - _Description:_ Staff + Member auth with JWT access/refresh and role-based guards.
  - _Depends on:_ T0.6 · _Covers:_ ST-01, ML-01 (auth half), §10.1 auth
  - [ ] Prisma: `Staff` (email, passwordHash, role, facility) and `Member` (login identity, facility) identity tables; `Role` enum (Owner, Manager, FrontDesk, Trainer, Member); refresh-token store.
  - [ ] Backend: password hashing (argon2/bcrypt), Passport JWT access strategy, rotating refresh strategy, `AuthModule`; `RolesGuard` + `@Roles()` + `@CurrentUser()` decorators; member vs staff token scopes.
  - [ ] API: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /me`.
  - [ ] Admin UI: _n/a here_ (consumed in T0.10).
  - [ ] RN: _n/a here_ (consumed in T0.12).
  - [ ] Tests: login issues tokens; refresh rotates + invalidates old; role guard blocks/permits correctly; member token cannot hit staff routes; tenant scope embedded.
  - [ ] Integration: seed an Owner staff account; verify end-to-end token lifecycle.

- [ ] **T0.8 — Audit logging** · `P0`
  - _Description:_ Record sensitive actions (financial, membership, data export) for compliance.
  - _Depends on:_ T0.7 · _Covers:_ ML-01, NFR 8.3
  - [ ] Prisma: `AuditLog` (actor, role, action, entity, entityId, diff JSON, tenantId, timestamp).
  - [ ] Backend: audit interceptor/service + `@Audited()` decorator; helper to attach diffs.
  - [ ] API: `GET /audit-logs` (Owner/Manager, filterable).
  - [ ] Admin UI: read-only audit log viewer (basic table).
  - [ ] Tests: a financial mutation writes an audit row with correct actor/diff; tenant-scoped.
  - [ ] Integration: wire audit decorator into auth + a sample mutation.

### Fiscal de-risk spike (highest-risk item, done early)

- [ ] **T0.9 — `fiscal-core` + mock device + fiscal-bridge spike** · `P0`
  - _Description:_ De-risk fiscal by building the driver abstraction, a mock device, and the edge bridge with an offline queue — before any payment feature.
  - _Depends on:_ T0.5 · _Covers:_ Architecture #3/#4, BP-02 foundation, §10.3 payment→fiscal coupling, Risk "fiscal-device integration"
  - [ ] `fiscal-core`: `FiscalDriver` interface (`issueReceipt`, `voidReceipt`, `status`, `zReport`), `ReceiptPayload`/`ReceiptResult` types, `MockFiscalDriver` (deterministic fake fiscal numbers + simulated latency/failure modes).
  - [ ] `apps/fiscal-bridge`: NestJS edge service exposing a localhost API (`POST /fiscal/issue`, `GET /fiscal/status`, `POST /fiscal/z-report`); driver selected by config (mock now).
  - [ ] Offline queue in the bridge: durable local store of pending fiscal ops with **idempotency keys**; background **idempotent replay/sync** to the cloud API when online; never silently drops a transaction (logged failure + retry).
  - [ ] API: cloud-side `POST /fiscal/receipts` + `GET /fiscal/receipts/{id}` (idempotent) that the bridge syncs into; `FiscalReceipt` persistence (see T1.7 for full model).
  - [ ] Tests: issue-via-mock returns a receipt; **kill connectivity → queue grows → reconnect → exactly-once sync** (idempotency proven by replaying the same key); forced device failure is logged + retriable, never lost.
  - [ ] Integration: end-to-end mock receipt from bridge → cloud; document the driver contract real Akcent/David drivers must implement (T1.19).

### Frontend shells & offline foundation

- [ ] **T0.10 — Admin web scaffold** · `P0`
  - _Description:_ Bootstrap the React admin app with routing, data layer, i18n, and auth.
  - _Depends on:_ T0.7, T0.3 · _Covers:_ PL-03, NFR 8.4
  - [ ] `apps/admin-web`: Vite + React + TS, Tailwind + shadcn/ui, app shell/nav, route layout.
  - [ ] TanStack Query client + Zustand store; typed API client generated from OpenAPI/shared-types.
  - [ ] i18n provider (mk/en active, sq scaffolded); language switcher; denar/date formatting.
  - [ ] Auth: login screen, token storage + silent refresh, role-gated routes, logout.
  - [ ] Tests: login flow renders + redirects; role-gated route blocks unauthorized; locale switch updates copy.
  - [ ] Integration: log in against the seeded Owner; land on an (empty) dashboard.

- [ ] **T0.11 — PWA & offline foundation** · `P0`
  - _Description:_ Make the admin web installable on the Android tablet and capable of queuing actions offline.
  - _Depends on:_ T0.10 · _Covers:_ PL-02, NFR 8.2
  - [ ] PWA manifest + service worker (app-shell caching, installability), offline detection UX banner.
  - [ ] IndexedDB-backed **offline action queue** abstraction with idempotency keys; replay engine on reconnect; conflict/error surfacing.
  - [ ] Local discovery/config of the fiscal-bridge localhost endpoint.
  - [ ] Tests: queue persists across reload; actions replay in order once online; idempotent (no dupes); installable audit (Lighthouse PWA pass).
  - [ ] Integration: dummy "queued action" round-trips to the API after simulated offline→online.

- [ ] **T0.12 — Member app scaffold (RN)** · `P0`
  - _Description:_ Bootstrap the React Native member app (Android-first) with navigation, data layer, i18n, and auth.
  - _Depends on:_ T0.7, T0.3 · _Covers:_ PL-04 (Android), NFR 8.1
  - [ ] `apps/member-mobile`: RN + TS, React Navigation, React Native Paper theme, TanStack Query, secure token storage (Keychain/Keystore).
  - [ ] i18n (mk/en), auth flow (login/refresh/logout), splash + tab shell.
  - [ ] Tests: auth flow unit/RTL; navigation smoke; cold-start under target on mid-range profile.
  - [ ] Integration: log in as a seeded Member; reach an empty home tab.

### Ops

- [ ] **T0.13 — Containerization & Hetzner deploy** · `P0`
  - _Description:_ Dockerize API + bridge, compose for local dev, and a Hetzner deployment path.
  - _Depends on:_ T0.5, T0.9 · _Covers:_ Architecture #7, NFR 8.2/8.6
  - [ ] Dockerfiles for `api` and `fiscal-bridge`; `docker-compose.yml` (MySQL + api + adminer) for local dev.
  - [ ] Hetzner deploy (compose or lightweight orchestration), env/secrets handling, run migrations on deploy, TLS termination.
  - [ ] Tests: `docker compose up` boots API + DB; health endpoint reachable; migration runs on container start.
  - [ ] Integration: deploy to a Hetzner staging box; smoke the health endpoint over TLS.

- [ ] **T0.14 — Observability baseline** · `P0`
  - _Description:_ Centralized logging, request IDs, and alerts for fiscal failures + sync errors.
  - _Depends on:_ T0.5, T0.9 · _Covers:_ NFR 8.6, §3.2 uptime/fiscal metrics
  - [ ] Backend: structured JSON logging, request-ID propagation, error tracking (Sentry or equivalent).
  - [ ] Metrics/health for uptime; alert hooks on **fiscal-receipt failures** and **offline-sync errors**.
  - [ ] Tests: a forced fiscal failure emits the alert signal; logs carry request IDs.
  - [ ] Integration: dashboard/log sink receiving from staging.

---

# Phase 2 — MVP / P0 Features

> The wedge: membership + billing with fiscal receipts + retail POS + check-in + core analytics + member-app core, trilingual (MK/EN), offline-capable, with data migration and GDPR handling.

## Membership Management

- [ ] **T1.1 — Member profiles & directory** · `P0`
  - _Description:_ CRUD member profiles plus a searchable, paginated directory with at-a-glance counts.
  - _Depends on:_ T0.6, T0.7 · _Covers:_ AM-01, AM-02, AM-07, AM-09
  - [ ] Prisma: `Member` profile fields (name, contact, photo URL, emergency contact, health notes, joinDate, consent flags, `tenantId`); search/filter indexes.
  - [ ] Backend: `MembersModule` (service + controller) under tenant + role guards; DTOs + validation; cursor/page pagination.
  - [ ] API: `GET/POST /members`, `GET/PATCH /members/{id}`, `GET /members/{id}/history`; age-group/demographic breakdown endpoint.
  - [ ] Admin UI: member list (search + age filter), counts widget, member detail/edit form, photo upload.
  - [ ] RN: _n/a_ (member self-view is T1.14).
  - [ ] Tests: service tenant-scoping + filters; controller e2e; web component tests for list/detail.
  - [ ] Integration: cross-tenant access denied; counts/breakdown correct against seed.

- [ ] **T1.2 — Membership plans & pricing** · `P0`
  - _Description:_ Configure plan types (monthly/quarterly/annual/unlimited/off-peak/session-pack/day-pass) and edit pricing easily.
  - _Depends on:_ T0.6 · _Covers:_ AM-04, AM-05
  - [ ] Prisma: `Plan` model (type enum, duration, price MKD, off-peak rules, pack credits, active flag, `tenantId`).
  - [ ] Backend: `PlansModule`; validation per plan type; price-change handling.
  - [ ] API: `GET/POST /plans`, `PATCH /plans/{id}`.
  - [ ] Admin UI: plan list, create/edit plan form, inline pricing edit.
  - [ ] RN: _n/a_.
  - [ ] Tests: plan-type validation; price edit doesn't mutate historical memberships; tenant-scoped.
  - [ ] Integration: seed a starter set of plans for the demo facility.

- [ ] **T1.3 — Promotions & discounts** · `P0`
  - _Description:_ Create and apply promotions/discounts with validity periods.
  - _Depends on:_ T1.2 · _Covers:_ AM-06
  - [ ] Prisma: `Promotion` (type %/fixed, scope, validFrom/validTo, active, `tenantId`).
  - [ ] Backend: `PromotionsModule`; eligibility/validity evaluation service (reused at payment time in T1.6).
  - [ ] API: `GET/POST /promotions`, `PATCH /promotions/{id}`.
  - [ ] Admin UI: promotion list + create/edit with date range.
  - [ ] RN: _n/a_.
  - [ ] Tests: expired/not-yet-valid promo rejected; discount math correct; tenant-scoped.
  - [ ] Integration: apply a promo to a plan in a dry-run pricing call.

- [ ] **T1.4 — Membership assignment, expiry & lifecycle filters** · `P0`
  - _Description:_ Assign/renew plans to members, track expiry, and power the soonest-to-pay / longevity / subscription-type filters.
  - _Depends on:_ T1.1, T1.2, T1.3 · _Covers:_ AM-03, AM-07, AM-08
  - [ ] Prisma: `Membership` (member, plan, status enum active/expired/frozen, startDate, endDate, price snapshot, promo ref, history, `tenantId`); indexes for expiry + longevity.
  - [ ] Backend: `MembershipsModule`; assign/renew service (snapshots price + promo); expiry computation; daily status-roll job (active→expired).
  - [ ] API: `POST /members/{id}/memberships` (assign/renew), `GET /members?filter=soonest-to-pay|longevity|plan|status` (extends T1.1 list), `GET /members/{id}/history`.
  - [ ] Admin UI: assign/renew flow on member detail; expiry column + "expiring soon" view; filter controls (soonest-to-pay, longevity, subscription type/status).
  - [ ] RN: _n/a_ (surfaced read-only in T1.14).
  - [ ] Tests: renew extends correctly; status roll flips expired; soonest-to-pay ordering correct; price snapshot immutable to later plan edits.
  - [ ] Integration: seed varied memberships; verify each filter + the expiry view.

- [ ] **T1.5 — Session packs & auto-decrement** · `P0`
  - _Description:_ Track punch-card/session-pack credits and auto-decrement per visit/booking.
  - _Depends on:_ T1.4, T1.11 · _Covers:_ AM-13, AM-04 (packs)
  - [ ] Prisma: pack credit fields/ledger on `Membership` (remaining, total, per-use log).
  - [ ] Backend: decrement service invoked on check-in/booking; guard against negative balance; expiry of unused credits.
  - [ ] API: decrement happens inside check-in (T1.11); `GET /members/{id}/memberships` exposes remaining credits.
  - [ ] Admin UI: show remaining credits on member detail; manual adjust (audited).
  - [ ] RN: show remaining credits on member status (T1.14).
  - [ ] Tests: each check-in decrements by one; zero-balance blocks/flags; concurrent check-ins don't double-spend.
  - [ ] Integration: end-to-end check-in decrements a seeded pack.

## Billing, Payments & Fiscal

- [ ] **T1.6 — Payments core & overdue tracking** · `P0`
  - _Description:_ Record payments (cash/card/bank transfer) against memberships/retail with idempotency, and flag overdue/unpaid.
  - _Depends on:_ T0.9, T1.4 · _Covers:_ BP-01, BP-04, §10.1 idempotency
  - [ ] Prisma: `Payment`/`Transaction` (amount MKD, method enum, member/membership ref, line items, status, fiscalReceipt ref, idempotencyKey, `tenantId`).
  - [ ] Backend: `PaymentsModule`; idempotent create (idempotency key); overdue/unpaid status derivation; applies promotions (T1.3).
  - [ ] API: `POST /payments` (idempotent), `GET /payments/{id}`; overdue flag in member list.
  - [ ] Admin UI: take-payment dialog (method, amount, plan/renewal), overdue indicator + filter on member directory.
  - [ ] RN: _n/a_.
  - [ ] Tests: duplicate idempotency key returns the same payment (no double charge); overdue derived correctly; tenant-scoped.
  - [ ] Integration: payment ties to a membership renewal; fiscal coupling exercised in T1.7.

- [ ] **T1.7 — Fiscal receipt issuance** · `P0`
  - _Description:_ Deterministically couple every payment to a fiscal receipt (via fiscal-core/bridge) or a logged retriable failure; UJP-readiness in the payload.
  - _Depends on:_ T0.9, T1.6 · _Covers:_ BP-02, BP-03, §10.3 payment→fiscal coupling
  - [ ] Prisma: `FiscalReceipt` (device response, fiscal number, timestamp, payload, status, payment ref, `tenantId`); UJP-relevant fields.
  - [ ] Backend: on successful payment, issue via fiscal-bridge (mock driver); persist receipt; on failure mark retriable + enqueue; never a payment without a receipt outcome; UJP e-invoice payload shaping (readiness, no live submission yet).
  - [ ] API: `POST /fiscal/receipts`, `GET /fiscal/receipts/{id}` (idempotent); receipt ref returned on payment.
  - [ ] Admin UI: receipt status on payment confirmation; reprint/retry control; failed-receipt queue view.
  - [ ] RN: _n/a_.
  - [ ] Tests: payment → receipt happy path; device failure → payment retained + receipt retriable (never lost); idempotent issuance; UJP payload schema validated.
  - [ ] Integration: full payment→fiscal→receipt against the mock; verify the failed→retry→success path.

- [ ] **T1.8 — Z-report / daily reconciliation** · `P0`
  - _Description:_ End-of-day cash reconciliation / Z-report across payments + retail.
  - _Depends on:_ T1.6, T1.7 · _Covers:_ BP-07, §6.2(5)
  - [ ] Prisma: `ZReport` (date, totals by method, fiscal totals, operator, `tenantId`).
  - [ ] Backend: aggregation service (sum payments/retail by method/day); trigger device Z-report via bridge (mock).
  - [ ] API: `POST /reports/z-report`, `GET /reports/z-report?date=`.
  - [ ] Admin UI: "Close day" screen with totals + printable Z-report.
  - [ ] RN: _n/a_.
  - [ ] Tests: totals match seeded day's transactions; report immutable once closed; tenant-scoped.
  - [ ] Integration: run a full mock day → close → verify reconciliation.

## Retail / Supplements

- [ ] **T1.9 — Retail products & inventory** · `P0`
  - _Description:_ Product catalog with stock levels and low-stock alerts.
  - _Depends on:_ T0.6 · _Covers:_ RT-02 (model), RT-03
  - [ ] Prisma: `Product` (name, price MKD, barcode, stock qty, reorder threshold, `tenantId`); `StockMovement` ledger.
  - [ ] Backend: `InventoryModule`; stock adjust service; low-stock detection.
  - [ ] API: `GET /products`, `PATCH /products/{id}/stock`, `POST /products`.
  - [ ] Admin UI: product list with stock, low-stock badges, add/edit product, manual stock adjust (audited).
  - [ ] RN: _n/a_.
  - [ ] Tests: stock adjust writes a movement; low-stock threshold flags; tenant-scoped.
  - [ ] Integration: seed products; trigger a low-stock alert.

- [ ] **T1.10 — Retail POS sale** · `P0`
  - _Description:_ Sell supplements/drinks/gear with payment, fiscal receipt, and automatic inventory deduction.
  - _Depends on:_ T1.6, T1.7, T1.9 · _Covers:_ RT-01, RT-02 (deduction), barcode/QR scan
  - [ ] Prisma: reuse `Payment` line items referencing products.
  - [ ] Backend: POS sale service — atomic: create payment → issue fiscal → decrement stock; barcode lookup.
  - [ ] API: `POST /payments` with product line items (reuses T1.6 path).
  - [ ] Admin UI: POS screen (barcode/QR scan or pick, cart, tender, fiscal receipt), works inside the PWA terminal.
  - [ ] RN: _n/a_.
  - [ ] Tests: sale decrements exactly the sold qty; fiscal receipt issued; atomic rollback if fiscal fails; oversell prevented.
  - [ ] Integration: scan-to-sale on the tablet PWA against the mock device.

## Attendance & Check-in

- [ ] **T1.11 — Check-in & attendance** · `P0`
  - _Description:_ Member check-in via card/app QR scan with instant validity verification and visit history.
  - _Depends on:_ T1.4 · _Covers:_ AD-01, AD-02, AC-01, barcode/QR, NFR 8.1 (<1s)
  - [ ] Prisma: `CheckIn`/`Visit` (member, timestamp, location, source card/app, validity result, `tenantId`); indexes for history/density.
  - [ ] Backend: `CheckInModule`; validity verification (active membership / pack balance via T1.5); idempotent check-in for offline replay.
  - [ ] API: `POST /checkins` (validates membership, returns active/expired/overdue), `GET /members/{id}/checkins`.
  - [ ] Admin UI: front-desk check-in panel (scan or lookup → green/red validity), visit history on member detail; works offline via the queue.
  - [ ] RN: app scan-in handled in T1.14 (digital QR).
  - [ ] Tests: valid member → allowed; expired/overdue → flagged; <1s under load; idempotent offline replay (no duplicate visits).
  - [ ] Integration: scan a member's QR (from T1.14) at the desk; verify validity + history + pack decrement.

## Analytics (core)

- [ ] **T1.12 — Core financial analytics** · `P0`
  - _Description:_ Income reporting, expense tracking, and profit/loss overview.
  - _Depends on:_ T1.6, T1.10 · _Covers:_ BA-01, BA-02, BA-03
  - [ ] Prisma: `Expense` (category, amount MKD, date, note, `tenantId`); analytics-friendly indexes on payments.
  - [ ] Backend: `AnalyticsModule`; income aggregation (month/year/custom), expense CRUD, P/L computation.
  - [ ] API: `GET /analytics/revenue?period=`, `GET /analytics/expenses`, `POST /expenses`.
  - [ ] Admin UI: dashboard cards + charts (income, expenses, P/L) with period picker; expense entry form.
  - [ ] RN: _n/a_.
  - [ ] Tests: income totals match seeded payments; P/L = income − expenses; period filters correct; tenant-scoped.
  - [ ] Integration: dashboard reflects a seeded month of activity.

## Staff & Roles (admin)

- [ ] **T1.13 — Staff management UI** · `P0`
  - _Description:_ Manage staff profiles, roles, and permissions on top of the auth/RBAC core, with audit visibility.
  - _Depends on:_ T0.7, T0.8 · _Covers:_ ST-01, ML-01
  - [ ] Prisma: extend `Staff` (profile fields, status); permission mapping per role.
  - [ ] Backend: `StaffModule` (CRUD, role assignment), Owner-only guards on sensitive ops.
  - [ ] API: `GET/POST /staff`, `PATCH /staff/{id}`.
  - [ ] Admin UI: staff list, create/edit with role picker, deactivate; surfaced audit log (from T0.8).
  - [ ] RN: _n/a_.
  - [ ] Tests: role change enforced on next request; only Owner can manage staff; audited; tenant-scoped.
  - [ ] Integration: create a FrontDesk user and verify their restricted access.

## Member App (core)

- [ ] **T1.14 — Member app core self-service** · `P0`
  - _Description:_ Member registration/login, subscription status + history, digital membership card/QR, and app check-in.
  - _Depends on:_ T0.12, T1.4, T1.11 · _Covers:_ MA-01, MA-02, MA-03, MA-04, MA-05
  - [ ] Prisma: member self-registration linkage (invite/claim flow to an existing member record).
  - [ ] Backend: `/me` profile/status/history endpoints (member-scoped); QR token generation for check-in.
  - [ ] API: `GET /me`, `GET /me/memberships`, `GET /me/history`, `GET /me/checkin-token`.
  - [ ] Admin UI: generate/send member registration invite.
  - [ ] RN: registration/login, home with subscription status + expiry, history list, digital card/QR screen, "scan to check in" flow.
  - [ ] Tests: member sees only their own data (tenant + member scope); QR validates at desk (T1.11); cold start under target.
  - [ ] Integration: full loop — invite → register → view status → app QR scanned at desk.

## Cross-cutting MVP

- [ ] **T1.15 — Data migration tooling** · `P0`
  - _Description:_ Vendor-run importer for members + memberships from CSV/Excel with validation.
  - _Depends on:_ T1.1, T1.4 · _Covers:_ PL-05, §9.3, Risk "data migration quality"
  - [ ] Backend: import service — parse CSV/Excel, map to `Member`/`Membership`, validate, dry-run preview, commit; error report.
  - [ ] API: `POST /import/members` (multipart, dry-run flag), `GET /import/{id}/report`.
  - [ ] Admin UI: upload wizard (template download → upload → preview/validation → confirm), error display.
  - [ ] RN: _n/a_.
  - [ ] Tests: clean file imports fully; malformed rows reported without aborting valid rows; dry-run writes nothing; tenant-scoped.
  - [ ] Integration: import a sample messy spreadsheet end-to-end.

- [ ] **T1.16 — Offline terminal end-to-end** · `P0`
  - _Description:_ Make check-in, retail POS, and fiscal issuance fully operational offline with queue + idempotent sync + conflict handling.
  - _Depends on:_ T0.11, T0.9, T1.10, T1.11 · _Covers:_ PL-02, NFR 8.2, §10.3 offline queue
  - [ ] Admin UI: route check-in (T1.11) and POS (T1.10) through the IndexedDB queue when offline; talk to local fiscal-bridge for receipts offline.
  - [ ] Backend: idempotent replay endpoints accept queued check-ins/sales/receipts; reconcile on reconnect.
  - [ ] Tests: full offline session (check-ins + sales + receipts) → reconnect → exactly-once sync, no lost fiscal transactions, no duplicates; clock-skew + ordering handled.
  - [ ] Integration: pull the network on the tablet, run a busy front-desk session, restore network, verify cloud matches the terminal.

- [ ] **T1.17 — Trilingual content MK/EN + locale formatting** · `P0`
  - _Description:_ Complete Macedonian + English content across both surfaces with denar/date formatting; Albanian scaffolded but deferred.
  - _Depends on:_ T0.3, T0.10, T0.12 · _Covers:_ PL-01 (MK/EN), NFR 8.4/8.7
  - [ ] i18n: fill `mk` + `en` catalogs for all MVP screens; `sq` keys present but untranslated (fallback to EN); denar + locale date formatting helpers applied.
  - [ ] Admin UI + RN: language switcher; verify no hardcoded strings on MVP screens.
  - [ ] Tests: snapshot/lint for missing keys in mk/en; formatting renders denar + MK dates correctly; switching locale updates live.
  - [ ] Integration: walk the MVP flows in MK and EN.

- [ ] **T1.18 — GDPR-aligned data handling** · `P0`
  - _Description:_ Consent capture, data-subject access/export, erasure, and retention controls for personal + health data.
  - _Depends on:_ T1.1, T0.8 · _Covers:_ PL-06, NFR 8.3
  - [ ] Prisma: consent flags + timestamps on `Member`; retention policy fields; soft-delete/erasure markers.
  - [ ] Backend: data-export (subject access) builder, erasure workflow (with fiscal-record legal retention carve-out), consent enforcement; encryption-at-rest config documented; TLS enforced.
  - [ ] API: `GET /members/{id}/data-export`, `POST /members/{id}/erasure`.
  - [ ] Admin UI: consent display on member profile, export button, erasure request flow (audited).
  - [ ] RN: consent screen at registration; in-app data export request.
  - [ ] Tests: export contains all member data; erasure removes/anonymizes personal data while retaining legally-required fiscal records; consent gates sensitive fields; audited.
  - [ ] Integration: run a full subject-access + erasure cycle.

- [ ] **T1.19 — Real fiscal driver + certification (Akcent/David)** · `P0` *(deferred — currently mocked per Decision #4; REQUIRED before any production go-live)*
  - _Description:_ Implement a real `FiscalDriver` for the first target device and complete certification, replacing the mock in production.
  - _Depends on:_ T0.9, T1.7, T1.8 · _Covers:_ BP-02 (real), §9.2 fiscal devices, Risk "fiscal-device integration"
  - [ ] Decide first target model (Akcent **or** David) + obtain hardware + protocol/SDK docs (open input — pin this before starting).
  - [ ] `fiscal-core`: implement the real driver against the `FiscalDriver` contract (USB/serial/TCP per device); map device errors to the retriable-failure model.
  - [ ] Backend/bridge: config switch mock↔real per facility; verify Z-report + void on real hardware.
  - [ ] Tests: integration tests against real hardware (issue, void, Z-report, failure/retry); certification test receipts validated.
  - [ ] Integration: certified compliant receipt on real hardware; document the second-device path.

---

# Phase 3 — P1 Features (fast-follow)

> Engagement + boutique-market enablers. Moderate detail — same layer breakdown applies; expand into full subtasks at build time.

## Membership (P1)

- [ ] **T2.1 — Membership freeze/pause** · `P1`
  - _Description:_ Freeze/pause memberships (vacation/injury) with date tracking and manager approval; member-initiated requests.
  - _Depends on:_ T1.4 · _Covers:_ AM-10, MA-08
  - [ ] Prisma freeze records + status; Backend approval workflow + expiry extension; API freeze/approve; Admin approve UI; RN request screen; tests (expiry extends by frozen days); integration.

- [ ] **T2.2 — Upgrade/downgrade & transfer** · `P1`
  - _Description:_ Change a member's plan or transfer a membership between members with proration.
  - _Depends on:_ T1.4, T1.6 · _Covers:_ AM-11
  - [ ] Prisma history; Backend proration + transfer service (audited); API `POST /memberships/{id}/transfer`; Admin UI; tests (proration math, audit); integration.

- [ ] **T2.3 — Contract/waiver e-signature** · `P1`
  - _Description:_ Capture and store signed waivers/contracts.
  - _Depends on:_ T1.1 · _Covers:_ AM-12
  - [ ] Prisma waiver/signature storage; Backend signing + storage (encrypted); API; Admin upload/template + signature view; RN sign-on-device; tests; integration.

## Billing (P1)

- [ ] **T2.4 — Automated reminder campaigns** · `P1`
  - _Description:_ Push/SMS/email renewal & payment reminders tied to the soonest-to-pay segment.
  - _Depends on:_ T1.4, T2.25 · _Covers:_ BP-05, §9.2 SMS/email/push
  - [ ] Integrations: SMS gateway, email service, push. Backend campaign service + scheduler + templates; API `POST /campaigns/reminders`; Admin campaign builder + segment; tests (segment targeting, delivery logging); integration.

- [ ] **T2.5 — Recurring / automatic billing** · `P1`
  - _Description:_ Auto-bill eligible recurring plans.
  - _Depends on:_ T1.6, T2.4 · _Covers:_ BP-06
  - [ ] Prisma recurring schedule; Backend billing scheduler + retry + fiscal coupling; API; Admin config + failures view; tests (cycle correctness, idempotency); integration.

- [ ] **T2.6 — Refunds, voids & credit notes** · `P1`
  - _Description:_ Fiscally-compliant refunds, voids, and credit notes.
  - _Depends on:_ T1.7 · _Covers:_ BP-08
  - [ ] Prisma refund/credit entities; Backend void/refund via fiscal driver; API; Admin UI; tests (fiscal void path, audit); integration.

- [ ] **T2.7 — Discounts, vouchers & gift cards at POS** · `P1`
  - _Description:_ Apply promo codes, vouchers, and gift cards at point of payment.
  - _Depends on:_ T1.3, T1.6 · _Covers:_ BP-10
  - [ ] Prisma voucher/gift-card balances; Backend redemption + balance ledger; API; Admin/POS redemption UI; tests (balance math, double-redeem guard); integration.

## Analytics (P1)

- [ ] **T2.8 — Revenue split analytics** · `P1`
  - _Description:_ Split revenue across memberships vs retail vs personal training.
  - _Depends on:_ T1.12 · _Covers:_ BA-04 — Backend aggregation by source; API; Admin charts; tests; integration.

- [ ] **T2.9 — Membership analytics & churn** · `P1`
  - _Description:_ Active/expired/frozen counts and retention/churn rate.
  - _Depends on:_ T1.4, T1.12 · _Covers:_ BA-05 — Backend churn computation; API; Admin dashboards; tests; integration.

- [ ] **T2.10 — Exportable financial reports** · `P1`
  - _Description:_ Export financial reports for accounting.
  - _Depends on:_ T1.12 · _Covers:_ BA-06 — Backend CSV/XLSX export; API; Admin export UI; tests; integration.

## Attendance & Density (P1)

- [ ] **T2.11 — Live occupancy** · `P1`
  - _Description:_ Real-time occupancy counter for staff and members.
  - _Depends on:_ T1.11 · _Covers:_ AD-03, MA-06 — Backend occupancy derive from check-ins/out; API `GET /occupancy`; Admin counter + RN "how crowded now"; tests; integration.

- [ ] **T2.12 — Density analytics** · `P1`
  - _Description:_ Hourly/daily/monthly attendance density.
  - _Depends on:_ T1.11 · _Covers:_ AD-04 — Backend density aggregation; API `GET /analytics/density?granularity=`; Admin heatmap; tests; integration.

## Retail (P1)

- [ ] **T2.13 — Suppliers & purchase orders** · `P1`
  - _Description:_ Suppliers, purchase orders, and goods receipt.
  - _Depends on:_ T1.9 · _Covers:_ RT-04 — Prisma supplier/PO; Backend PO + receive-stock; API; Admin UI; tests; integration.

- [ ] **T2.14 — Batch/expiry tracking** · `P1`
  - _Description:_ Track product batches and expiry dates.
  - _Depends on:_ T1.9 · _Covers:_ RT-05 — Prisma batch/expiry; Backend FEFO logic + expiry alerts; API; Admin UI; tests; integration.

- [ ] **T2.15 — Café/juice-bar POS mode** · `P1`
  - _Description:_ Café/juice-bar POS mode reusing the restaurant-POS engine.
  - _Depends on:_ T1.10 · _Covers:_ RT-06 — Backend menu/modifiers; API; Admin/POS café mode; tests; integration.

## Classes & Scheduling (P1)

- [ ] **T2.16 — Class scheduling core** · `P1`
  - _Description:_ Recurring/one-off class calendar with instructor and room/equipment allocation and booking rules.
  - _Depends on:_ T1.13 · _Covers:_ CS-01, CS-03, CS-04, CS-05
  - [ ] Prisma `Class`/`Session` (schedule, capacity, instructor, room/equipment, booking window/cancellation rules); Backend `ClassesModule`; API `GET/POST /classes`, `PATCH /classes/{id}`; Admin calendar UI; tests; integration.

- [ ] **T2.17 — Bookings & waitlists** · `P1`
  - _Description:_ Book/cancel classes with capacity limits, waitlists, and no-show/late-cancel handling.
  - _Depends on:_ T2.16, T1.14 · _Covers:_ CS-02, CS-05, MB-02
  - [ ] Prisma `Booking` (status booked/cancelled/no-show/waitlisted); Backend capacity + waitlist promotion + cancellation cut-offs + pack decrement; API `POST /classes/{id}/bookings`, `DELETE /bookings/{id}`; Admin roster UI; RN booking/waitlist screens; tests (capacity, waitlist promote, cutoffs); integration.

- [ ] **T2.18 — Personal-training sessions & packs** · `P1`
  - _Description:_ 1-on-1 PT session booking and session-pack tracking.
  - _Depends on:_ T2.17, T1.5 · _Covers:_ CS-06 — Backend PT booking + pack tie-in; API; Admin + RN; tests; integration.

## Staff (P1)

- [ ] **T2.19 — Shift scheduling & clock-in/out** · `P1`
  - _Description:_ Staff shift scheduling with clock-in/out.
  - _Depends on:_ T1.13 · _Covers:_ ST-02 — Prisma shift/clock; Backend; API; Admin scheduler; tests; integration.

- [ ] **T2.20 — Commission tracking** · `P1`
  - _Description:_ Commissions on memberships sold, PT sessions, and retail.
  - _Depends on:_ T1.13, T1.6, T2.18 · _Covers:_ ST-03 — Prisma commission rules; Backend computation; API `GET /staff/{id}/commissions`; Admin UI; tests; integration.

## Access & Admin (P1)

- [ ] **T2.21 — Auto-block on expired/unpaid** · `P1`
  - _Description:_ Software signal to block entry for expired/unpaid memberships at check-in.
  - _Depends on:_ T1.11, T1.6 · _Covers:_ AC-02 — Backend block decision in check-in; API; Admin override (audited); tests; integration.

- [ ] **T2.22 — Hardware management** · `P1`
  - _Description:_ Manage terminals, printers, scanners, and readers.
  - _Depends on:_ T0.9, T1.13 · _Covers:_ ML-02 — Prisma device registry; Backend health/config; API; Admin hardware screen (bridge status); tests; integration.

## Member App (P1)

- [ ] **T2.23 — Personal calendar & workout scheduling** · `P1`
  - _Description:_ Member personal calendar and self-scheduled workouts.
  - _Depends on:_ T1.14, T2.17 · _Covers:_ MA-07, MB-01 — Backend; API; RN calendar + schedule; tests; integration.

- [ ] **T2.24 — Personal statistics & streaks** · `P1`
  - _Description:_ Visit frequency, preferred days, history, and streaks.
  - _Depends on:_ T1.11, T1.14 · _Covers:_ MB-03 — Backend stats aggregation; API; RN stats screen; tests; integration.

- [ ] **T2.25 — Push notifications** · `P1`
  - _Description:_ Push for expiry reminders, booked-class alerts, and promotions (APNs/FCM).
  - _Depends on:_ T1.14 · _Covers:_ MB-04, §9.2 push — Integration APNs/FCM; Backend notification service + tokens; API; RN permission + handling; Admin trigger; tests; integration.

- [ ] **T2.26 — iOS build & store readiness** · `P1`
  - _Description:_ Complete iOS support and prepare both stores.
  - _Depends on:_ T0.12, T1.14 · _Covers:_ PL-04 (iOS) — iOS build config, store assets, Detox smoke; tests; integration.

- [ ] **T2.27 — Albanian (SQ) localization content** · `P1`
  - _Description:_ Complete Albanian translations to fulfill the trilingual requirement.
  - _Depends on:_ T1.17 · _Covers:_ PL-01 (SQ completion) — fill `sq` catalogs across all shipped screens; tests (no missing sq keys); integration walk-through in Albanian.

---

# Phase 4 — P2 Features (later / differentiators)

> Epic-level. Each becomes its own brainstorm → spec → plan cycle when scheduled. Several carry open questions (see PRD §15).

- [ ] **T3.1 — Corporate/B2B invoices** · `P2` — _Covers:_ BP-09. Depends on T1.7. Fiscally-compliant B2B invoicing.
- [ ] **T3.2 — Forecasting analytics** · `P2` — _Covers:_ BA-07. Depends on T2.9. Expected renewals + projected recurring revenue.
- [ ] **T3.3 — Staffing-optimization insights** · `P2` — _Covers:_ AD-05. Depends on T2.12. Density-derived staffing recommendations.
- [ ] **T3.4 — Trainer performance dashboards** · `P2` — _Covers:_ ST-04. Depends on T2.20.
- [ ] **T3.5 — Access-control hardware integration** · `P2` — _Covers:_ AC-03, AC-04. Depends on T2.21, T2.22. Turnstile/RFID/smart-lock + 24/7 unmanned mode. *(Open Q4: vendor selection + install model.)*
- [ ] **T3.6 — Multi-branch & centralized dashboard** · `P2` — _Covers:_ ML-03, ML-04. Depends on T0.6. Members usable across locations + owner cross-branch dashboard.
- [ ] **T3.7 — Payment processor integration** · `P2` — _Covers:_ §9.2 processor. Depends on T1.7. CaSys/CPAY/bank gateway with fiscal-compliant flow. *(Open Q1.)*
- [ ] **T3.8 — In-app membership purchase & renewal** · `P2` — _Covers:_ MP-01. Depends on T3.7, T1.14. Online buy/renew with fiscal receipt.
- [ ] **T3.9 — In-app payment** · `P2` — _Covers:_ MP-02. Depends on T3.7, T3.8. *(Blocked on Open Q1 regulatory/processor confirmation.)*
- [ ] **T3.10 — In-gym leaderboard** · `P2` — _Covers:_ MS-01. Depends on T2.24. Same-gym leaderboard, opt-in.
- [ ] **T3.11 — Friends cross-gym leaderboard** · `P2` — _Covers:_ MS-02. Depends on T3.10. *(Open Q5: global vs per-gym member identity — resolve first.)* Visibility strictly user + added friends.
- [ ] **T3.12 — Activity logging (Strava-like)** · `P2` — _Covers:_ MS-03. Depends on T2.24. Optional exercises/sets/duration/photo logging, GDPR-sensitive.

---

## Appendix A — PRD Requirement Coverage

| Phase | Requirement IDs covered |
|---|---|
| **P0 (MVP)** | AM-01, AM-02, AM-03, AM-04, AM-05, AM-06, AM-07, AM-08, AM-09, AM-13 · BP-01, BP-02, BP-03, BP-04, BP-07 · BA-01, BA-02, BA-03 · AD-01, AD-02 · RT-01, RT-02, RT-03 · ST-01 · AC-01 · ML-01 · MA-01, MA-02, MA-03, MA-04, MA-05 · PL-01 (MK/EN), PL-02, PL-03, PL-05, PL-06 · fiscal devices (mock→real T1.19), UJP, barcode/QR |
| **P1** | AM-10, AM-11, AM-12 · BP-05, BP-06, BP-08, BP-10 · BA-04, BA-05, BA-06 · AD-03, AD-04 · RT-04, RT-05, RT-06 · CS-01–CS-06 · ST-02, ST-03 · AC-02 · ML-02 · MA-06, MA-07, MA-08 · MB-01, MB-02, MB-03, MB-04 · PL-01 (SQ), PL-04 · SMS, email, push |
| **P2** | BP-09 · BA-07 · AD-05 · ST-04 · AC-03, AC-04 · ML-03, ML-04 · MP-01, MP-02 · MS-01, MS-02, MS-03 · payment processor, access-control hardware |

## Appendix B — Open Questions Carried From PRD §15

These do **not** block the MVP build but must be answered before their dependent tasks:
1. In-app/card payment regulatory + processor (CaSys/CPAY/bank) → blocks **T3.7–T3.9**.
2. Fiscal device models + certification effort per model → informs **T1.19** (first target to be pinned).
3. Pricing/segment skew (GTM) → influences P1/P2 prioritization.
4. Access-control hardware vendors + install model → **T3.5**.
5. Cross-gym member identity (global vs per-gym) → **T3.11**.
6. Offline fiscal legal constraints + max sync delay → tighten **T1.16 / T1.19**.
7. Albanian MVP timing → resolved: deferred to **T2.27** per Decision #8.
8. Data residency (in-country vs EU) → resolved: EU/Hetzner per Decision #7 (revisit if law requires in-country).
9. Support capacity ceiling + remote diagnostics → informs **T0.14 / T2.22**.
10. Reformer per-machine booking depth → informs **T2.16** (room/equipment allocation).
