# QuickFix Backend

Express + PostgreSQL REST API for **QuickFix – Smart Maintenance & Escalation System**.
Matches the Frontend PRD contract (`/api/auth`, `/api/tickets`, `/api/admin`).

**Stack:** Node.js 18+, Express, PostgreSQL (`pg`), JWT auth (`jsonwebtoken` + `bcryptjs`), Zod validation.

## Quick start

```bash
cd backend
npm install
cp .env.example .env          # then edit DATABASE_URL / JWT_SECRET
createdb quickfix             # or create the DB in pgAdmin
npm run db:reset              # creates tables + demo data
npm run dev                   # http://localhost:5000/api
```

Frontend `.env`: `VITE_API_BASE_URL=http://localhost:5000/api`

| Script | What it does |
|---|---|
| `npm run dev` | Start with auto-reload |
| `npm start` | Start (production) |
| `npm run db:migrate` | Create tables if missing |
| `npm run db:seed` | Insert demo data (only if DB is empty) |
| `npm run db:reset` | Drop everything, recreate, reseed |
| `npm test` | Integration tests (uses `TEST_DATABASE_URL`, default `.../quickfix_test`; create that DB first) |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@quickfix.com | Admin@123 |
| Employee | priya@quickfix.com | Employee@123 |
| Employee | rahul@quickfix.com / anita@quickfix.com | Employee@123 |

## Conventions (agree these with the frontend)

- **Auth:** `POST /api/auth/login` → `{ token, user }`. Send `Authorization: Bearer <token>` on every other call. Role is always read from the DB, never trusted from the token. Expired token → `401` with `error.code = "TOKEN_EXPIRED"`.
- **Statuses:** `Pending`, `In Progress`, `Resolved`, `Escalated`. **Escalated is a status** *and* `escalatedAt` / `escalationReason` stay filled after the ticket moves on. **Overdue is separate**: `isOverdue` = unresolved and past `slaDeadline`.
- **Transitions** (also at `GET /api/meta`): Pending → In Progress | Escalated · In Progress → Resolved | Escalated · Escalated → In Progress | Resolved · Resolved → *(closed)*. `Escalated` can only be set through the escalation endpoint (a reason is mandatory).
- **Priorities:** `Low`, `Medium`, `High`, `Critical`. **Categories:** Electrical, Plumbing, IT & Networking, Air Conditioning/HVAC, Furniture, Infrastructure, Other.
- **Lists** → `{ data: [...], pagination: { page, limit, total, totalPages } }`. **Errors** → `{ error: { code, message, fields? } }` (`fields` = per-field messages for `400 VALIDATION_ERROR`).
- Timestamps are ISO-8601 UTC strings; format them in the browser's local timezone.
- Employees get `404` (not `403`) for tickets that aren't theirs.

## Endpoints

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/health` | public | |
| GET | `/api/meta` | public | categories, priorities, statuses, transitions, SLA config |
| POST | `/api/auth/login` | public | `{ email, password }` |
| GET | `/api/auth/me` | any user | |
| GET | `/api/tickets/my` | any user | own tickets. Query: `search, status, category, priority, sort(newest\|oldest\|priority\|deadline), page, limit` |
| GET | `/api/tickets/my/summary` | any user | `{ summary: { total, pending, inProgress, resolved, escalated } }` |
| POST | `/api/tickets` | any user | `{ title, description, category, location, priority }` → `201 { message, ticket }` |
| GET | `/api/tickets/:id` | owner / admin | `{ ticket }` |
| GET | `/api/tickets/:id/history` | owner / admin | `{ data: [events] }` real events only |
| PATCH | `/api/tickets/:id/status` | admin | `{ status }` |
| PATCH | `/api/tickets/:id/assign` | admin | `{ technicianId }` |
| PATCH | `/api/tickets/:id/escalate` | admin | `{ reason }` manual fallback |
| GET | `/api/admin/tickets` | admin | filters above + `technicianId` (id or `unassigned`), `overdue=true`, `escalated=true` |
| GET | `/api/admin/dashboard` | admin | `{ metrics, byCategory, byPriority, priorityTickets, recentTickets }` |
| GET | `/api/admin/escalations` | admin | filters: `status, category, priority, trigger, from, to (YYYY-MM-DD), page, limit` |
| POST | `/api/admin/escalations/run` | admin | runs the overdue check now (demo button) |
| GET | `/api/admin/technicians` | admin | optional `?team=`; includes `openTickets` |

### Ticket object

```json
{
  "id": 4, "ticketNumber": "QF-1004", "title": "...", "description": "...",
  "category": "Air Conditioning/HVAC", "location": "Block C - Server Room",
  "priority": "High", "status": "Escalated",
  "createdBy": { "id": 3, "name": "Rahul Mehta", "email": "rahul@quickfix.com" },
  "assignedTo": { "id": 6, "name": "Deepa Joshi", "team": "HVAC Team", "email": "deepa@quickfix.com" },
  "createdAt": "...", "updatedAt": "...", "slaDeadline": "...",
  "escalatedAt": "...", "escalationReason": "...", "resolvedAt": null,
  "isOverdue": true, "overdueSeconds": 302
}
```
`assignedTo`, `escalatedAt`, `escalationReason`, `resolvedAt` and `overdueSeconds` are `null` when not applicable.

## How escalation works (the 40% + 10% part)

1. **On create** the ticket gets an SLA deadline from its priority and is **auto-assigned** to the least-loaded technician in the team that handles its category (e.g. *IT & Networking → IT Support*).
2. **Overdue check** finds unresolved, never-escalated tickets past `slaDeadline`, sets status `Escalated`, stores the reason, writes a row in `escalations` and a timeline event.
3. It runs (a) every `ESCALATION_INTERVAL_SECONDS` in the background, (b) when ticket lists/dashboards are fetched (`ESCALATION_ON_FETCH`, throttled), and (c) on demand via `POST /api/admin/escalations/run`. The browser never triggers escalation by itself.
4. **No duplicates:** row locks + a `UNIQUE(ticket_id)` constraint on `escalations`. **Resolved tickets never escalate.**

| Priority | `demo` SLA | `standard` SLA |
|---|---|---|
| Critical | 2 min | 4 h |
| High | 3 min | 8 h |
| Medium | 4 min | 24 h |
| Low | 5 min | 72 h |

`SLA_MODE=demo` is for the live demo only. **For a button-driven demo** set `ESCALATION_ON_FETCH=false` and `ESCALATION_INTERVAL_SECONDS=0`, so tickets stay overdue until you press *Run escalation check*. Seed data includes one overdue, not-yet-escalated ticket (QF-1004) for exactly this.

## Structure

```
backend/
├── src/
│   ├── server.js              # boot + background escalation timer
│   ├── app.js                 # express app, middleware, routes
│   ├── config/                # env.js, constants.js (statuses, transitions, SLA, teams)
│   ├── db/                    # schema.sql, pool.js, migrate.js, seed.js
│   ├── routes/                # URL -> middleware -> controller
│   ├── controllers/           # thin HTTP layer
│   ├── services/              # business logic + SQL (tickets, escalation, admin, auth)
│   ├── middleware/            # auth/roles, validation, errors, lazy escalation
│   └── utils/                 # schemas (Zod), AppError, pagination
└── tests/api.test.js          # 27 integration tests
```

## Security notes

Passwords hashed with bcrypt; JWT secret from env (required in production); parameterized SQL only; Helmet + CORS allow-list (`CORS_ORIGINS`); role checks enforced server-side on every admin route; ticket ownership enforced on read.

## Team

_Add team member names here._
