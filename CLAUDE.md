# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status: greenfield (pre-scaffold)

This repository currently contains **only planning docs** — there is no application code, `package.json`, or git history yet. Do not assume any build tooling exists until it has been scaffolded.

The two sources of truth:
- **`Docs/Gym_Management_Platform_PRD.md`** — full product requirements (multi-tenant gym/fitness management platform for North Macedonia; admin web + member mobile app + shared backend). Requirement IDs (e.g. `AM-01`, `BP-02`) are referenced throughout the task list.
- **`Docs/TASKLIST.md`** — the master implementation task list. **Start here for any build work.** Tasks are ordered Phase 0 (Foundations) → Phase 1 (MVP/P0) → Phase 2 (P1) → Phase 3 (P2), each with a checkbox, dependencies (by task ID like `T0.6`), and the PRD requirement IDs it covers. Work top-to-bottom; do not start a feature task before its dependency tasks are checked off. The entry point is **T0.1**; the fiscal spike (**T0.9**) is deliberately front-loaded to retire the biggest risk first.

When the architecture, conventions, or commands below conflict with `Docs/TASKLIST.md`, the task list wins — update this file to match.

## Locked architecture decisions

These were settled during planning (see `Docs/TASKLIST.md` §0). Do not re-litigate without updating the task list.

1. **Monorepo** — pnpm workspaces + Turborepo. One TypeScript language across the whole stack.
2. **Multi-tenancy: single MySQL database, shared schema, `tenantId` (facilityId) column on every tenant-owned row.** Enforced by a Prisma client extension + request-scoped tenant context (`AsyncLocalStorage`). This is a hard invariant — see below.
3. **Fiscal integration runs at the edge.** A local **`fiscal-bridge`** agent (one per facility) owns the physical device connection and the offline transaction queue, and syncs to the cloud API on reconnect. Shared fiscal logic lives in `packages/fiscal-core`.
4. **Fiscal device is currently mocked.** Build against the `FiscalDriver` interface + `MockFiscalDriver`. Real Akcent/David drivers + certification are deferred to **T1.19** (required before any production go-live).
5. **Front-desk terminal = the React admin web app shipped as a PWA** on an Android tablet (IndexedDB offline queue + service worker), talking to the local `fiscal-bridge` on localhost. There is **no** separate native terminal app.
6. **Auth: separate `Staff` and `Member` identity tables**, one auth module issuing JWT access (short-lived) + rotating refresh tokens carrying `tenantId` + `role`/`scope`. RBAC via Nest guards (`Owner`, `Manager`, `FrontDesk`, `Trainer`, `Member`).
7. **Hosting: Hetzner (EU region), Docker.** Containerized MySQL + API + bridge images.
8. **Localization: i18n infra for MK / SQ / EN built up front; ship MK + EN content first, Albanian (SQ) deferred to T2.27.** Currency is always denar (MKD).

## Target repository layout (once scaffolded — T0.1)

```
apps/
  api/            # NestJS cloud backend, REST /api/v1, multi-tenant
  admin-web/      # React (Vite) admin + PWA front-desk/POS terminal
  member-mobile/  # React Native member app (Android-first, iOS in P1)
  fiscal-bridge/  # Local NestJS edge agent: device + offline queue + sync
packages/
  shared-types/   # Shared TS types, DTO contracts, Zod schemas, enums
  db/             # Prisma schema (source of truth for the data model), client, migrations, seed
  fiscal-core/    # FiscalDriver interface, receipt model, MockFiscalDriver
  i18n/           # mk / sq / en catalogs + denar/date format helpers
  config/         # Shared tsconfig / eslint / prettier / tailwind presets
docker/           # Dockerfiles, docker-compose, Hetzner deploy
```

The **Prisma schema in `packages/db` is the source of truth for the data model** — shared TS types derive from it.

## Stack conventions (decided in the task list)

- **API contract:** NestJS DTOs validated with class-validator; OpenAPI/Swagger auto-generated; shared types/Zod contracts in `packages/shared-types`. URI-versioned (`/api/v1`); structured error bodies (`{ code, message, details }`); idempotency keys required on payment + fiscal endpoints.
- **Client data/state:** TanStack Query + Zustand (admin web and RN).
- **UI:** admin = React + Vite + shadcn/ui + Tailwind; member app = React Native + React Native Paper.
- **Testing:** API = Jest + Supertest (unit + e2e per module); admin web = Vitest + React Testing Library; RN = Jest + RTL (Detox smoke later). Fiscal and offline-sync get dedicated integration tests.

## Planned commands

The repo is **not yet scaffolded**, so these do not run today. Once T0.1–T0.5 are complete, the intended Turborepo/pnpm commands are:

```bash
pnpm install                       # install workspace deps
pnpm turbo run build               # build all packages/apps
pnpm turbo run lint                # lint all
pnpm turbo run typecheck           # typecheck all
pnpm turbo run test                # run all test suites

# Scope to one workspace (after scaffolding):
pnpm --filter @gymapp/api test
pnpm --filter @gymapp/api test -- <path/to/file.spec.ts>   # single test file (Jest)
pnpm --filter @gymapp/admin-web test -- <pattern>          # single test (Vitest)

# Database (packages/db):
pnpm --filter @gymapp/db prisma migrate dev    # apply migrations in dev
pnpm --filter @gymapp/db prisma generate       # regenerate client
pnpm --filter @gymapp/db seed                  # seed demo facility + reference data

# Local stack:
docker compose up                  # MySQL + api (+ adminer) for local dev
```

Verify the exact script names against the root `package.json` and each workspace's `package.json` once they exist — update this section to match what is actually defined.

## Critical invariants (correctness-sensitive — do not weaken)

- **Tenant isolation:** every tenant-owned query must be scoped by `tenantId`, server-side, derived from the validated JWT — never from a client-supplied body/param. No endpoint may return or mutate another facility's data. New Prisma models for tenant-owned data **must** carry `tenantId` and go through the client extension. Tenant-isolation tests are mandatory for any data-touching task.
- **Payment ↔ fiscal coupling:** a successful payment must deterministically result in **either** an issued fiscal receipt **or** a logged, retriable failure — never a payment with no receipt outcome, and never a silently lost fiscal transaction. Fiscal issuance and Z-reports go through `fiscal-core`/`fiscal-bridge`.
- **Offline idempotency:** check-in and sale/payment operations are queued client-side when offline and replayed on reconnect. Every such operation carries an idempotency key and must sync **exactly once** (no duplicate visits, charges, or receipts). Test the full offline → reconnect → sync path.
- **Audit + GDPR:** financial, membership, and data-export/erasure actions are audited (`AuditLog`). Erasure anonymizes personal data while retaining legally-required fiscal records. Health notes and check-in patterns are treated as sensitive.

## Performance targets (from PRD §8.1)

Member lookup / check-in validity < 1s; fiscal receipt issuance < 3s end-to-end; admin dashboard and member-app cold start < 3s (mid-range Android). Keep these in mind for check-in, POS, and fiscal paths.
