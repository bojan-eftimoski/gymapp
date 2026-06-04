# Product Requirements Document
## Gym & Fitness Management Platform — Member App + Admin Platform

**Document version:** 1.0
**Status:** Draft for build planning
**Market:** North Macedonia (initial launch: Skopje)
**Product type:** Two-sided SaaS — manager/admin web platform + member mobile app

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals and Success Metrics](#3-goals-and-success-metrics)
4. [Target Users](#4-target-users)
5. [Solution Overview](#5-solution-overview)
6. [User Journeys](#6-user-journeys)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Data and Integrations](#9-data-and-integrations)
10. [API Design](#10-api-design)
11. [Risks and Mitigations](#11-risks-and-mitigations)
12. [MVP Scope](#12-mvp-scope)
13. [Timeline](#13-timeline)
14. [Out of Scope](#14-out-of-scope)
15. [Open Questions](#15-open-questions)
16. [Assumptions](#16-assumptions)

---

## 1. Executive Summary

This document defines the requirements for a gym and fitness management platform purpose-built for the North Macedonian market. The product consists of two surfaces: an **admin/manager platform** (web + tablet) that runs the day-to-day operations of a fitness business, and a **member-facing mobile app** (iOS + Android) that drives engagement and retention.

The product's central differentiator is **local fiscal compliance** — native integration with Macedonian fiscal devices (Akcent, David) and UJP e-invoicing — combined with Macedonian/Albanian/English language support and on-the-ground installation and training. Existing regional competitors (e.g., Andrea 360, Fitbrry, GymGate from Serbia/Croatia) offer member databases but do not issue legally compliant Macedonian fiscal receipts; global SaaS platforms (Virtuagym, GymMaster) are not localized for the market at all. This gap is the wedge.

The platform targets the full spectrum of fitness facilities — traditional gyms, full-service fitness centers, reformer pilates studios, yoga studios, and martial-arts clubs — with a single, all-inclusive product. It is being built and supported by a lean three-person founding team (two engineers, one sales/operations), which shapes the scope, phasing, and operational model throughout this document.

The strategic frame is that this is the **second vertical on a shared platform** (the first being hospitality/restaurant POS), reusing a common fiscal engine, retail POS, payment integrations, and support infrastructure. This significantly lowers build cost and informs the prioritization of reusable components.

---

## 2. Problem Statement

Fitness businesses in North Macedonia operate with fragmented, manual, or non-compliant tooling:

- **Membership and billing are managed on paper or in spreadsheets.** Owners track who has paid, who is overdue, and when memberships expire manually. This causes revenue leakage (lapsed members who are never followed up), administrative burden, and no reliable financial visibility.
- **Existing software does not handle local fiscal compliance.** Regional and global gym-management tools can store member records but cannot issue legally required Macedonian fiscal receipts via certified fiscal printers, forcing gyms to run a *separate* fiscal cash register alongside any software they adopt — a disconnected, error-prone setup.
- **There is no localized, supported option.** Foreign tools are in Serbian, Croatian, or English, priced in foreign currency, and offer no local installation, training, or support. Adoption requires self-service onboarding that most small Macedonian operators will not complete.
- **Member engagement and retention tooling is absent.** Member churn is the dominant economic problem in fitness (industry-wide annual churn is estimated at ~29%). Local gyms have no member app, no automated renewal reminders, no class booking, and no engagement layer to reduce churn.
- **Retail (supplement/juice-bar) sales are disconnected** from membership and inventory systems.

The result: owners lose time and money, members have a poor digital experience, and no single vendor offers an integrated, legal, locally-supported solution.

---

## 3. Goals and Success Metrics

### 3.1 Product Goals

1. Replace spreadsheets/paper with a single system that manages memberships, billing, attendance, retail, and reporting.
2. Guarantee legal fiscal compliance on every monetary transaction, out of the box.
3. Reduce member churn for customer gyms through an engagement-focused member app and automated retention workflows.
4. Deliver a localized experience (language, currency, payment methods, support) that foreign competitors cannot match.
5. Be operable and supportable by a three-person team up to an initial customer ceiling, with architecture that allows scaling beyond it.

### 3.2 Success Metrics

| Metric | Target | Measurement window |
|---|---|---|
| Customer facilities onboarded (Skopje) | 10+ active | First 12 months |
| Customer facilities onboarded (national) | 40+ active | 24 months |
| Monthly logo churn (customer gyms) | < 1.5% / month | Rolling, post month 6 |
| Onboarding time per new facility | < 5 business days from contract to live | Per customer |
| Fiscal receipt success rate | > 99.5% of transactions | Continuous |
| Member app adoption within a customer gym | > 40% of that gym's active members registered | Per gym, within 90 days of gym go-live |
| Member 30-day app retention | > 50% | Rolling |
| Reduction in overdue/lapsed memberships at customer gyms | Measurable decrease vs. pre-adoption baseline | 6 months post go-live |
| Platform uptime | ≥ 99.5% | Monthly |
| Support resolution (critical issues) | < 4 business hours | Continuous |

### 3.3 Acceptance Criteria (product-level)

- A gym owner can onboard, migrate existing member data, configure a fiscal printer, and process a compliant sale within the standard onboarding window.
- Every payment recorded in the system produces a valid fiscal receipt or a clear, logged failure with retry.
- A member can register, view membership status, check in, and book a class from the mobile app without staff assistance.
- The system operates correctly in Macedonian, Albanian, and English.

---

## 4. Target Users

### 4.1 Primary Customer Segments (the businesses that buy)

1. **Full-service commercial gyms / fitness centers** — highest value, most feature needs (memberships, retail, classes, PT, multi-staff). Primary revenue target.
2. **Reformer pilates studios** — premium boutique model; class/session-pack heavy, instructor-led, smaller member counts but high per-member value.
3. **Yoga studios** — class-schedule driven, instructor-led, membership + package mix.
4. **Martial-arts / combat-sport clubs** — group-class model, often lower budget; included in scope but lower-priority prospects.

### 4.2 User Roles

**Admin/Manager platform:**
- **Owner** — full access: financials, analytics, pricing, staff management, all locations.
- **Manager** — operational access: memberships, billing, scheduling, check-in; limited financial visibility per owner configuration.
- **Front-desk / Reception staff** — member lookup, check-in, payments, retail sales.
- **Trainer / Instructor** — own schedule, assigned classes/sessions, attendance for their classes.

**Member app:**
- **Member** — the end customer of the gym: manages their own membership, bookings, check-in, stats, and social features.

### 4.3 User Characteristics & Constraints

- Owners and staff are generally **not highly technical**; the admin UI must be simple and require minimal training (staff are trained on-site by the vendor).
- Members span all age groups and device types; the app must work on common, mid-range Android devices (Android is the dominant platform) as well as iOS.
- All users operate in a denar-based, Macedonian/Albanian-language context.

---

## 5. Solution Overview

The platform is delivered as three coordinated components sharing one backend and data model:

### 5.1 Admin/Manager Platform (Web + Android tablet)
The operational hub. A responsive web application (desktop admin) plus an Android tablet/terminal app for front-desk and POS use. Handles membership management, billing with fiscal compliance, attendance/check-in, retail POS, class and staff scheduling, business analytics, and access-control configuration.

### 5.2 Member Mobile App (iOS + Android)
The engagement and retention layer. Members check in, view subscription status and history, book classes and personal-training sessions, see live gym occupancy, track personal attendance statistics, receive push notifications, and (in later phases) use social/leaderboard and activity-logging features.

### 5.3 Shared Backend & Services
A cloud backend exposing a REST API consumed by both surfaces, with integrations to Macedonian fiscal devices, payment processors, and messaging (SMS/email/push). Designed to reuse the shared platform's fiscal engine and retail-POS components.

### 5.4 Key Differentiators (designed-in)
- **Native Macedonian fiscal compliance** (Akcent/David fiscal devices, UJP e-invoice readiness) on every transaction.
- **Trilingual** (Macedonian / Albanian / English) across both surfaces.
- **Density/occupancy tracking** derived from check-in scans, valuable to both members (avoid crowds) and managers (optimize staffing).
- **Integrated retail POS** for supplement/juice-bar sales, reusing the restaurant-POS engine.
- **Access-control integration** (later phase) — turnstile/smart-lock as a strong retention and security lock-in.

---

## 6. User Journeys

### 6.1 Gym Owner — Onboarding
1. Signs contract; vendor schedules on-site setup.
2. Vendor migrates existing member data (from spreadsheet/notebook) into the platform.
3. Vendor configures the fiscal printer and verifies a compliant test receipt.
4. Vendor configures membership plans, pricing, staff accounts, and class schedule.
5. Vendor trains staff on-site (front desk, POS, member management).
6. Gym goes live; owner sees real-time dashboard of members, revenue, and attendance.

### 6.2 Front-Desk Staff — Daily Operations
1. Member arrives; staff looks up member or member self-scans.
2. System confirms membership validity (active / expired / overdue) instantly.
3. If a payment is due, staff records payment → fiscal receipt issues automatically.
4. Staff sells a supplement; inventory auto-decrements; fiscal receipt issues.
5. At day end, staff runs the daily cash reconciliation / Z-report.

### 6.3 Member — Join & Engage
1. Receives an invite/registration from their gym; installs the app.
2. Views their membership plan, expiry date, and history.
3. Checks live gym occupancy before deciding to go.
4. Books a 7:00 PM class (or joins the waitlist if full).
5. Arrives and scans into the gym via the app.
6. Receives a push reminder 3 days before membership expiry; renews.
7. Views personal stats (visit frequency, preferred days); compares with friends on the leaderboard (later phase).

### 6.4 Member — Membership Lifecycle
1. Membership approaches expiry → automated reminder sequence (push/SMS/email).
2. Member renews via app or at desk.
3. Member requests a freeze (vacation/injury) via the app → manager approves → expiry extends.
4. On lapse, member appears in the owner's "overdue / win-back" segment for follow-up.

### 6.5 Manager — Business Review
1. Opens analytics dashboard: income (month/year), expenses, profit/loss.
2. Reviews attendance density (hourly/daily/monthly) to plan staffing and class times.
3. Reviews membership breakdown (active/expired/frozen, age groups, plan types).
4. Filters members by "soonest to pay" and triggers reminder campaign.
5. Reviews staff/trainer performance and commissions.

---

## 7. Functional Requirements

Priority legend: **P0** = MVP / must-have for launch · **P1** = important, fast-follow · **P2** = later phase / differentiator-but-deferrable.

### 7.1 Admin Platform — Membership Management

| ID | Requirement | Priority |
|---|---|---|
| AM-01 | Create/edit member profiles (contact info, photo, emergency contact, health notes, join date) | P0 |
| AM-02 | Total/active member count and at-a-glance membership overview | P0 |
| AM-03 | Membership expiry tracking — see who expires and when | P0 |
| AM-04 | Configure membership plan types (monthly, quarterly, annual, unlimited, off-peak, session packs/punch cards, day passes) | P0 |
| AM-05 | Easy membership pricing edits | P0 |
| AM-06 | Create and apply special promotions / discounts (with validity periods) | P0 |
| AM-07 | Member detail view: membership duration, start date, current plan, longevity | P0 |
| AM-08 | Filters: soonest-to-pay, age group, subscription type, subscription longevity | P0 |
| AM-09 | Age-group / demographic breakdown | P0 |
| AM-10 | Membership freeze/pause (vacation, injury) with date tracking and approval | P1 |
| AM-11 | Membership upgrade/downgrade and transfer between members | P1 |
| AM-12 | Contract/waiver e-signature capture and storage | P1 |
| AM-13 | Session-pack auto-decrement per visit/booking | P0 |

### 7.2 Admin Platform — Billing, Payments & Fiscal Compliance

| ID | Requirement | Priority |
|---|---|---|
| BP-01 | Record payments (cash, card, bank transfer) against memberships | P0 |
| BP-02 | **Issue legally compliant fiscal receipts via Macedonian fiscal devices (Akcent/David) on every transaction** | P0 |
| BP-03 | UJP e-invoice readiness/compliance | P0 |
| BP-04 | Overdue / unpaid tracking with status flags | P0 |
| BP-05 | Automated payment/renewal reminders (push/SMS/email), tied to the soonest-to-pay filter | P1 |
| BP-06 | Recurring/automatic billing for eligible plans | P1 |
| BP-07 | Daily cash reconciliation / Z-report | P0 |
| BP-08 | Refunds, voids, and credit notes (fiscally compliant) | P1 |
| BP-09 | Corporate/B2B invoices | P2 |
| BP-10 | Discounts, promo codes, vouchers, gift cards applied at point of payment | P1 |

### 7.3 Admin Platform — Business Analytics

| ID | Requirement | Priority |
|---|---|---|
| BA-01 | Income reporting (month, year, custom periods) | P0 |
| BA-02 | Expense tracking (rent, staff payments, utilities, other) | P0 |
| BA-03 | Profit/loss overview | P0 |
| BA-04 | Revenue split: memberships vs. retail/supplements vs. personal training | P1 |
| BA-05 | Membership analytics: active/expired/frozen counts, retention/churn rate | P1 |
| BA-06 | Exportable financial reports (for accounting) | P1 |
| BA-07 | Forecasting (expected renewals, projected recurring revenue) | P2 |

### 7.4 Admin Platform — Attendance & Density

| ID | Requirement | Priority |
|---|---|---|
| AD-01 | Member check-in via card/app scan, with validity verification | P0 |
| AD-02 | Visit logging and attendance history per member | P0 |
| AD-03 | Live occupancy counter | P1 |
| AD-04 | Density analytics: hourly, daily, monthly | P1 |
| AD-05 | Staffing-optimization insights derived from density data | P2 |

### 7.5 Admin Platform — Retail / Supplements

| ID | Requirement | Priority |
|---|---|---|
| RT-01 | Sell supplements/drinks/gear with payment and fiscal receipt | P0 |
| RT-02 | Automatic inventory deduction on sale | P0 |
| RT-03 | Stock levels and low-stock alerts | P0 |
| RT-04 | Supplier / purchase orders and goods receipt | P1 |
| RT-05 | Batch/expiry tracking | P1 |
| RT-06 | Café/juice-bar POS mode (reuses restaurant-POS engine) | P1 |

### 7.6 Admin Platform — Classes & Scheduling

| ID | Requirement | Priority |
|---|---|---|
| CS-01 | Class calendar (recurring and one-off) | P1 |
| CS-02 | Class capacity limits and waitlists | P1 |
| CS-03 | Instructor assignment per class | P1 |
| CS-04 | Room/equipment allocation (e.g., reformer machines) | P1 |
| CS-05 | Booking rules (booking windows, cancellation cut-offs, no-show/late-cancel handling) | P1 |
| CS-06 | Personal-training (1-on-1) session booking and session-pack tracking | P1 |

### 7.7 Admin Platform — Staff & Trainer Management

| ID | Requirement | Priority |
|---|---|---|
| ST-01 | Staff profiles, roles, and permissions (role-based access) | P0 |
| ST-02 | Shift scheduling and clock-in/out | P1 |
| ST-03 | Commission tracking (memberships sold, PT sessions, retail sales) | P1 |
| ST-04 | Trainer performance dashboards | P2 |

### 7.8 Admin Platform — Access Control

| ID | Requirement | Priority |
|---|---|---|
| AC-01 | Card/app scan check-in driving attendance + density data (software-only) | P0 |
| AC-02 | Auto-block entry on expired/unpaid membership (software signal) | P1 |
| AC-03 | Turnstile / smart-lock / RFID hardware integration | P2 |
| AC-04 | 24/7 unmanned access mode with valid-membership verification | P2 |

### 7.9 Admin Platform — Multi-Location & Administration

| ID | Requirement | Priority |
|---|---|---|
| ML-01 | Role-based security and audit logs | P0 |
| ML-02 | Hardware management (terminals, printers, scanners, readers) | P1 |
| ML-03 | Multi-branch support; members usable across locations | P2 |
| ML-04 | Centralized owner dashboard across branches | P2 |

### 7.10 Member App — Core Self-Service

| ID | Requirement | Priority |
|---|---|---|
| MA-01 | Member registration and login | P0 |
| MA-02 | View subscription status and expiry | P0 |
| MA-03 | View membership history | P0 |
| MA-04 | Digital membership card / QR code | P0 |
| MA-05 | Scan into gym via app | P0 |
| MA-06 | View live gym occupancy ("how crowded is it now") | P1 |
| MA-07 | Personal calendar | P1 |
| MA-08 | Request membership freeze/pause | P1 |

### 7.11 Member App — Booking & Stats

| ID | Requirement | Priority |
|---|---|---|
| MB-01 | Schedule personal workouts | P1 |
| MB-02 | Book/cancel group classes and PT sessions; join waitlists | P1 |
| MB-03 | Personal statistics: visit frequency, preferred days, history, streaks | P1 |
| MB-04 | Push notifications (expiry reminders, booked-class alerts, promotions) | P1 |

### 7.12 Member App — Payments & Social

| ID | Requirement | Priority |
|---|---|---|
| MP-01 | Renew/purchase memberships and packs online (requires payment-processor + fiscal integration) | P2 |
| MP-02 | In-app payment (pending regulatory/processor confirmation — see Open Questions) | P2 |
| MS-01 | In-gym leaderboard (members of the same gym) | P2 |
| MS-02 | Friends leaderboard — cross-gym, visible only to the user and their friends | P2 |
| MS-03 | Activity logging (exercises, sets, duration, photo) — "Strava-like", optional | P2 |

### 7.13 Platform — Cross-Cutting

| ID | Requirement | Priority |
|---|---|---|
| PL-01 | Trilingual UI: Macedonian / Albanian / English | P0 |
| PL-02 | Cloud-based with offline fallback for the front-desk/POS terminal | P0 |
| PL-03 | Android terminal/tablet + desktop admin web app | P0 |
| PL-04 | iOS + Android member app | P1 |
| PL-05 | Data migration tooling (from spreadsheets/legacy) | P0 |
| PL-06 | GDPR-aligned handling of personal and health/activity data | P0 |

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Member lookup and check-in validity response: **< 1 second** under normal load.
- Fiscal receipt issuance: **< 3 seconds** end-to-end at the point of sale.
- Admin dashboard initial load: **< 3 seconds**.
- Member app cold start: **< 3 seconds** on mid-range Android hardware.

### 8.2 Reliability & Availability
- Platform uptime target: **≥ 99.5% monthly**.
- **Offline fallback:** the front-desk/POS terminal must continue check-in and sales during a connectivity outage, queuing fiscal transactions and syncing on reconnect.
- Fiscal transaction durability: no transaction may be silently lost; all failures logged with retry.

### 8.3 Security & Privacy
- Role-based access control across all admin functions.
- Encryption in transit (TLS) and at rest for personal and health data.
- Audit logs for sensitive actions (financial, membership changes, data export).
- GDPR-aligned consent, data-subject access/erasure, and data-retention controls. Health/activity and biometric-adjacent data (check-in patterns, health notes) treated as sensitive.
- Member social/leaderboard data visibility strictly limited to user + explicitly added friends; opt-in.

### 8.4 Usability
- Admin UI usable by non-technical staff after a single on-site training session.
- Member app intuitive enough for self-service registration and booking without support.
- Full trilingual coverage; currency displayed in denar.

### 8.5 Scalability
- Architecture must support the realistic three-person-team customer ceiling (tens of facilities) and scale beyond it to a national footprint without re-platforming.
- Multi-tenant data isolation between customer facilities.

### 8.6 Maintainability & Operability
- Shared components (fiscal engine, retail POS, payments) maintained once and reused across the company's verticals.
- Centralized logging/monitoring and alerting for uptime, fiscal failures, and sync errors, operable by a small team.
- Remote diagnostics to minimize on-site support trips.

### 8.7 Localization & Compliance
- Macedonian fiscal-device certification and UJP e-invoice conformance are hard requirements, not configurable options.
- Trilingual content and locale-correct formatting (dates, currency).

---

## 9. Data and Integrations

### 9.1 Core Data Entities
- **Facility / Tenant** — the gym/studio; settings, locations, fiscal device config.
- **Member** — profile, contacts, health notes, consent flags.
- **Membership** — plan, status (active/expired/frozen), start/end dates, history.
- **Plan / Product** — membership plans, session packs, retail products (with stock).
- **Payment / Transaction** — amount, method, fiscal receipt reference, status.
- **Fiscal Receipt** — fiscal device response, receipt number, timestamp, payload.
- **Check-in / Visit** — member, timestamp, location, source (card/app).
- **Class / Session** — schedule, capacity, instructor, room/equipment, bookings, waitlist.
- **Booking** — member, class/session, status (booked/cancelled/no-show).
- **Staff** — profile, role, permissions, schedule, commission rules.
- **Inventory Item** — stock level, supplier, batch/expiry.
- **Expense** — category, amount, date.
- **Friendship / Social** — friend links, leaderboard visibility (later phase).

### 9.2 Integrations

| Integration | Purpose | Priority |
|---|---|---|
| **Macedonian fiscal devices (Akcent, David)** | Legally compliant fiscal receipts | P0 |
| **UJP e-invoice** | Tax/e-invoice compliance | P0 |
| **SMS gateway (local provider)** | Renewal reminders, alerts | P1 |
| **Email service** | Reminders, reports, notifications | P1 |
| **Push notification service (APNs / FCM)** | Member app engagement | P1 |
| **Payment processor / bank gateway (e.g., CaSys/CPAY or bank)** | Card and in-app payments | P2 |
| **Access-control hardware (turnstile, RFID/smart-lock)** | Physical entry control | P2 |
| **Barcode/QR scanning** | Retail and check-in | P0 |

### 9.3 Data Migration
- Tooling/process to import existing member and membership data from spreadsheets (CSV/Excel) and basic legacy records, performed by the vendor during onboarding.

---

## 10. API Design

A REST API (JSON) backs both the admin platform and the member app, with token-based authentication and role-scoped authorization. The API is multi-tenant; every request is scoped to a facility/tenant.

### 10.1 Conventions
- **Auth:** Bearer tokens (OAuth2-style); short-lived access tokens + refresh tokens. Member and staff tokens carry role/tenant scope.
- **Versioning:** URI-versioned (`/api/v1/...`).
- **Errors:** Standard HTTP status codes with structured error bodies (`code`, `message`, `details`).
- **Pagination:** cursor- or page-based for list endpoints.
- **Idempotency:** required on payment and fiscal endpoints (idempotency keys) to prevent double-charge/double-receipt.

### 10.2 Representative Endpoints

**Authentication**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

**Members (admin + member-scoped)**
- `GET /api/v1/members` — list/filter (soonest-to-pay, age, plan, longevity)
- `POST /api/v1/members` — create
- `GET /api/v1/members/{id}` — detail
- `PATCH /api/v1/members/{id}` — update
- `GET /api/v1/members/{id}/history` — membership history
- `GET /api/v1/me` — current member's own profile/status (member app)

**Memberships**
- `POST /api/v1/members/{id}/memberships` — assign/renew a plan
- `POST /api/v1/memberships/{id}/freeze` — freeze/pause
- `POST /api/v1/memberships/{id}/transfer` — transfer

**Plans & Products**
- `GET /api/v1/plans` · `POST /api/v1/plans` · `PATCH /api/v1/plans/{id}`
- `GET /api/v1/products` · `PATCH /api/v1/products/{id}/stock`

**Payments & Fiscal**
- `POST /api/v1/payments` — record payment (idempotent); triggers fiscal issuance
- `GET /api/v1/payments/{id}`
- `POST /api/v1/fiscal/receipts` — issue fiscal receipt (internal/idempotent)
- `GET /api/v1/fiscal/receipts/{id}` — status/retrieval
- `POST /api/v1/reports/z-report` — daily reconciliation

**Check-in & Density**
- `POST /api/v1/checkins` — record check-in (validates membership)
- `GET /api/v1/occupancy` — current live occupancy
- `GET /api/v1/analytics/density?granularity=hourly|daily|monthly`

**Classes & Bookings**
- `GET /api/v1/classes` — schedule
- `POST /api/v1/classes` · `PATCH /api/v1/classes/{id}`
- `POST /api/v1/classes/{id}/bookings` — book (member app); handles capacity/waitlist
- `DELETE /api/v1/bookings/{id}` — cancel

**Analytics & Reporting**
- `GET /api/v1/analytics/revenue?period=...`
- `GET /api/v1/analytics/expenses`
- `GET /api/v1/analytics/memberships`

**Notifications**
- `POST /api/v1/campaigns/reminders` — trigger reminder campaign (e.g., soonest-to-pay segment)

**Staff**
- `GET /api/v1/staff` · `POST /api/v1/staff` · `PATCH /api/v1/staff/{id}`
- `GET /api/v1/staff/{id}/commissions`

### 10.3 Critical API Behaviors
- **Payment → fiscal coupling:** a successful payment must deterministically result in either an issued fiscal receipt or a logged, retriable failure; never a payment without a receipt outcome.
- **Offline queue:** check-in and sale endpoints support client-side queuing with later idempotent replay.
- **Tenant isolation:** every endpoint enforces tenant scope server-side regardless of client claims.

---

## 11. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Fiscal-device integration complexity** (multiple vendors, certification) | High — it is the core differentiator; failure undermines the value prop | Medium | Reuse the existing restaurant-POS fiscal engine; prioritize fiscal integration first; verify against real Akcent/David hardware early; budget certification time explicitly |
| **Adoption inertia** — gyms "happy" on Excel until forced | High — slows revenue | High | Lead with the legal/fiscal angle (a real external pressure); free or low-friction onboarding for early reference customers; on-site setup removes effort barrier |
| **Regional competitor response** (e.g., Andrea 360, with a free tier) | Medium | Medium | Compete on locality + fiscal compliance + support, not feature count; do not match a race-to-free; secure local reference logos early |
| **In-app payment regulatory/processor hurdles** | Medium — blocks a member-app feature | Medium | Treat in-app payment as P2; confirm processor + fiscal requirements before committing; launch with desk/card payments first |
| **Three-person team capacity ceiling** | High — support load caps growth | Medium-High | Phase scope (P0/P1/P2); invest in remote diagnostics, self-serve onboarding aids, and monitoring; cap customer count per support capacity; hire trigger tied to customer count |
| **Access-control hardware lift** (physical install, integration) | Medium | Medium | Defer to P2; software-only check-in first; treat turnstile/lock as a premium project, not a launch feature |
| **Data migration quality** (messy spreadsheets) | Medium — bad first impression | Medium | Vendor-led migration with validation step during onboarding; standard import templates |
| **Member app engagement underperforms** | Medium — weakens retention claim and upsell story | Medium | Focus P1 app features on the highest-retention levers (reminders, booking, occupancy) before social/Strava features |
| **Offline/connectivity issues at facilities** | Medium — POS must not stop | Medium | Offline-first terminal design with transaction queue and idempotent sync |
| **Privacy/GDPR for health & social data** | Medium — legal exposure | Low-Medium | Privacy-by-design; opt-in social; data-subject controls; minimize sensitive data collection |

---

## 12. MVP Scope

The MVP is the **wedge that closes sales and is legal** — a manager-side-heavy release that replaces spreadsheets and guarantees fiscal compliance.

### 12.1 In MVP (all P0)
- Membership management: profiles, plans, expiry tracking, pricing, promotions, filters, age groups, session-pack decrement (AM-01–09, AM-13).
- Billing with **fiscal compliance**: payments, fiscal receipts, UJP readiness, overdue tracking, Z-report (BP-01–04, BP-07).
- Business analytics: income, expenses, profit/loss (BA-01–03).
- Attendance: card/app check-in with validity, visit history (AD-01–02).
- Retail POS: supplement sales with fiscal receipt, inventory deduction, low-stock alerts (RT-01–03).
- Staff: profiles, roles, permissions, audit logs (ST-01, ML-01).
- Member app core: registration, subscription status, history, digital card/QR, app check-in (MA-01–05).
- Cross-cutting: trilingual UI, offline-capable terminal, Android tablet + desktop web, data migration, GDPR-aligned data handling (PL-01–03, PL-05–06).

### 12.2 Explicitly NOT in MVP
- Class/PT booking and scheduling (P1)
- Density analytics and live occupancy (P1)
- Automated reminder campaigns and recurring billing (P1)
- Member statistics, push notifications, freeze requests (P1)
- In-app payments, social/leaderboard, activity logging (P2)
- Access-control hardware, multi-location (P2)

### 12.3 MVP Acceptance Criteria
- A facility can be fully onboarded (data migrated, fiscal printer configured, staff trained) and process compliant membership and retail sales.
- Every MVP transaction yields a valid fiscal receipt or a logged retriable failure.
- Front desk can verify membership validity and check members in, including during a connectivity outage.
- A member can register and view status/history and check in via the app.
- The system runs correctly in all three languages.

---

## 13. Timeline

> **Assumption:** two engineers building, one sales/operations lead running validation and early customer acquisition in parallel. Durations are indicative and assume substantial reuse of the existing shared fiscal/POS platform.

### Phase 0 — Validation & Foundations (Weeks 1–6)
- Customer discovery interviews with gym/studio owners (pricing, must-have features, current fiscal setup).
- Confirm fiscal-device integration approach against real hardware.
- Architecture, data model, shared-component reuse plan, environment setup.

### Phase 1 — MVP Build (Months 2–5)
- Membership, billing + fiscal, retail POS, check-in, core analytics (admin).
- Member app core (registration, status, card/QR, check-in).
- Trilingual support, offline terminal, data-migration tooling.
- Pilot with 1–3 friendly facilities late in this phase.

### Phase 2 — Engagement & Boutique Market (Months 6–10)
- Class & PT booking, capacity/waitlists (unlocks pilates/yoga/group market).
- Density/occupancy analytics.
- Automated reminders + recurring billing.
- Member app: stats, push notifications, freeze requests, live occupancy.
- Staff scheduling and commissions.

### Phase 3 — Differentiation & Lock-in (Months 11+)
- Access-control hardware integration (premium installs).
- In-app payments (subject to processor/regulatory confirmation).
- Social/leaderboard and activity logging.
- Multi-location support and centralized dashboard.
- Forecasting analytics.

### Indicative Milestones
- **Month 5:** MVP live with first paying reference customers in Skopje.
- **Month 10:** Engagement features live; boutique studios (pilates/yoga) addressable.
- **Month 12:** 10+ active Skopje facilities (success-metric target).
- **Month 24:** 40+ active facilities nationally; premium/access-control tier available.

---

## 14. Out of Scope

The following are explicitly out of scope for this product (at least through the phases above):

- **Pricing model, billing of customers for the SaaS itself, and any commercial/packaging logic** (handled separately).
- Markets outside North Macedonia (regional expansion is a future consideration, not a current requirement).
- Verticals other than fitness (restaurant/hospitality is a separate, existing product; salons/clinics are potential future verticals, not part of this PRD).
- Native fitness content (workout video libraries, coaching content, nutrition plans) — the product is operational/management software, not a content platform.
- Wearable-device integrations (heart-rate, smartwatch sync) beyond optional manual activity logging.
- Full accounting/ERP functionality — the product exports to accounting tools rather than replacing them.
- Advanced marketing automation beyond membership reminder/win-back campaigns.
- E-commerce / online retail storefront beyond in-facility POS and in-app membership purchase.
- Franchise/enterprise-grade hierarchical org management beyond multi-location support.

---

## 15. Open Questions

1. **In-app & card payments:** What are the exact regulatory and fiscal requirements for accepting in-app/card payments in North Macedonia, and which processor (e.g., CaSys/CPAY or a bank gateway) best supports a compliant flow that still issues a fiscal receipt? (Blocks MP-01/MP-02 scope.)
2. **Fiscal device coverage:** Which specific fiscal-device models (Akcent, David, others) must be supported at launch, and what is the certification effort and timeline for each?
3. **Pricing inputs (commercial, out of scope here but needed for GTM):** What will owners actually pay, and does the target segment skew to full-service gyms or include smaller studios/clubs? (Drives which P1/P2 features matter most.)
4. **Access-control hardware:** Which turnstile/smart-lock/RFID vendors are common and integrable locally, and what is the install model for a three-person team?
5. **Member identity for cross-gym social:** How are member identities handled if a person belongs to multiple gyms (for the cross-gym friends leaderboard)? Single global member identity vs. per-gym identity?
6. **Offline fiscal rules:** What are the legal constraints on issuing fiscal receipts during offline operation, and what is the maximum acceptable sync delay?
7. **Albanian-language coverage:** Is full Albanian localization required at MVP, or can it follow shortly after Macedonian/English?
8. **Data residency:** Are there local requirements on where member/health data may be stored (in-country vs. EU cloud)?
9. **Support model & capacity ceiling:** At what customer count does the three-person team need its first support/ops hire, and what monitoring/remote-diagnostic tooling is needed to push that ceiling higher?
10. **Class/booking depth for reformer studios:** Do reformer studios need equipment-level (per-machine) booking at MVP-of-Phase-2, or is class-capacity booking sufficient initially?

---

## 16. Assumptions

The following assumptions are made explicit; changes to them may alter scope, timeline, or priorities:

- **Shared platform reuse:** A fiscal engine, retail-POS components, and support infrastructure already exist (from a hospitality/restaurant POS product) and can be substantially reused, lowering build cost and de-risking fiscal integration.
- **Team:** Two engineers and one sales/operations lead, with no separate salary overhead assumed in the build (founder-operated).
- **Market:** Initial launch in Skopje, expanding nationally within North Macedonia. Target market spans gyms, fitness centers, reformer pilates studios, yoga studios, and martial-arts clubs, with commercial gyms and reformer studios as the highest-value segments.
- **Platform mix:** Android is the dominant device platform locally; the front-desk terminal is Android-based; the admin platform is a responsive web app; the member app is cross-platform (iOS + Android).
- **Onboarding is vendor-led and on-site:** installation, data migration, fiscal configuration, and staff training are performed by the vendor, not self-service. This is a deliberate differentiator.
- **Fiscal compliance is mandatory and is the primary wedge** versus regional/global competitors.
- **Connectivity is generally available but not guaranteed:** the terminal must operate offline and sync later.
- **Language:** Macedonian and English at minimum from early on; Albanian included in the trilingual requirement (exact MVP timing per Open Question 7).
- **Competitive landscape:** Regional competitors (Serbian/Croatian gym software) and global SaaS exist but are not locally fiscal-compliant or locally supported; this product does not attempt to out-feature them but to out-localize them.
- **Retention is the core economic lever:** the member app and automated workflows are justified primarily by their effect on reducing churn at customer facilities.
- **Pricing and SaaS commercials are deliberately excluded** from this document per stakeholder direction.

---

*End of document.*
