# Booking API

A REST API for booking shared resources (rooms, equipment) with role-based
access control and automatic scheduling-conflict detection.

Built to demonstrate backend engineering practices: layered architecture,
authentication/authorization, input validation, automated testing, and a
containerized, CI-tested deployment pipeline — not just a CRUD demo.

## Features

- **JWT authentication** with short-lived access tokens and rotating refresh tokens
- **Role-based authorization** (`ADMIN`, `MANAGER`, `USER`) enforced per route
- **Conflict-free scheduling**: a resource can never be double-booked for an
  overlapping time window, enforced at the database query level
- **Cancellation policy**: regular users can only cancel bookings at least
  2 hours before the start time; managers/admins are exempt
- **Soft-delete for resources**: deactivating a resource preserves booking history
- Centralized, typed error handling — no repeated try/catch in controllers
- Request validation with [Zod](https://zod.dev), including cross-field rules
  (e.g. `endTime` must be after `startTime`)

## Tech stack

| Layer          | Choice                          |
|----------------|----------------------------------|
| Language       | TypeScript (`strict` mode)       |
| HTTP framework | Express                          |
| Database       | PostgreSQL                       |
| ORM            | Prisma                           |
| Auth           | JSON Web Tokens (`jsonwebtoken`) |
| Password hash  | bcrypt                           |
| Validation     | Zod                              |
| Testing        | Jest + Supertest                 |
| Containers     | Docker / Docker Compose          |
| CI             | GitHub Actions                   |

## Architecture

The code is organized by **feature module**, not by technical layer, so
everything related to one concept (e.g. bookings) lives together:

```
src/
  modules/
    auth/        # register, login, refresh — issues JWTs
    users/
    resources/   # bookable rooms/equipment (admin/manager managed)
    bookings/    # the core domain: creating, listing, cancelling bookings
  shared/
    errors/      # typed AppError hierarchy (NotFoundError, ConflictError...)
    middlewares/ # auth guard, role guard, centralized error handler
    utils/       # password hashing, JWT signing, pure booking-conflict logic
  config/        # env var loading, Prisma client singleton
```

Each module follows the same internal shape:
`*.routes.ts` (HTTP wiring) → `*.controller.ts` (request/response only) →
`*.service.ts` (business rules) → Prisma (persistence).

This separation means the **conflict-detection and cancellation-policy
logic has zero dependency on Express**, and is unit-tested in isolation
(see `tests/unit/booking.utils.test.ts`).

## Frontend

A small React UI lives in [`frontend/`](frontend/) — a separate app in
the same repo (monorepo-style), talking to the API over HTTP. It exists
to demo the API's behavior (auth, RBAC, and especially the booking-conflict
detection) as something you can click through, not just read about.

| Layer          | Choice                                  |
|----------------|-------------------------------------------|
| Framework      | React 19 + TypeScript (`strict` mode)      |
| Build tool     | Vite                                       |
| Styling        | Tailwind CSS                               |
| Routing        | react-router-dom                           |
| Server state   | @tanstack/react-query                      |
| HTTP client    | axios (with a token-refresh interceptor)   |
| Testing        | Vitest + React Testing Library             |

```
frontend/src/
  api/          # thin, typed wrappers around each backend endpoint
  hooks/        # react-query hooks (queries + mutations, cache invalidation)
  context/      # AuthContext — session state, persisted to localStorage
  lib/          # apiClient (auth interceptor), formatApiError, datetime helpers
  routes/       # ProtectedRoute, RoleRoute (auth/role gating)
  components/   # forms, lists, and small UI primitives, grouped by feature
  pages/        # one component per route
```

Design decisions worth noting:

- **Tokens live in `localStorage`**, not a cookie — the API returns the
  token pair in the JSON body only, so there's no cookie to piggyback on
  without a backend change. This is the pragmatic choice for a portfolio
  demo, with the usual XSS-exposure trade-off that implies.
- **A single shared in-flight token refresh**: concurrent requests that
  401 at the same time share one `/auth/refresh` call instead of each
  independently rotating the refresh token and racing each other.
- **Role-gating in the UI is UX only, not a security boundary** — the
  `RoleRoute` component just avoids showing a page whose mutations would
  403 anyway. The API's `authorize()` middleware is the actual gatekeeper.
- **The booking-conflict (409) error is rendered distinctly** from a
  validation (422) error — an amber banner with the server's exact
  message, versus inline red text under the offending field — since a
  scheduling clash and a typo call for different user reactions.

## Getting started

### With Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

This brings up PostgreSQL, the API, and the web UI together:
- API: `http://localhost:3000`
- Web UI: `http://localhost:5173`

The API container automatically runs `prisma migrate deploy` and then a
seed script (`prisma/seed.ts`, idempotent — safe on every restart) that
creates a demo admin account and a few sample resources, so the app isn't
an empty screen on first load:

```
email:    admin@example.com
password: AdminPass123
```

(Demo-only credentials, from `prisma/seed.ts` — never seed a fixed password
like this in a real deployment.)

### Locally

Backend:
```bash
npm install
cp .env.example .env      # then point DATABASE_URL at your own Postgres
npx prisma migrate dev
npm run prisma:seed       # optional: creates the demo admin + sample resources
npm run dev
```

Frontend (in a second terminal):
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:3000
npm run dev
```

## Running tests

Backend:
```bash
npm test
```

Unit tests (`tests/unit`) cover pure business logic with no I/O.
Integration tests (`tests/integration`) exercise the full HTTP → service →
database path via Supertest, against a disposable test database — no
running server process required.

Frontend:
```bash
cd frontend && npm test
```

Component/unit tests (`frontend/src/tests`) cover the auth/role route
guards and, most notably, that a 409 booking conflict and a 422 validation
error render as visibly distinct UI states rather than one generic error.

CI runs both suites, in parallel jobs, on every push (see
`.github/workflows/ci.yml`).

## API overview

| Method | Endpoint            | Auth              | Description                          |
|--------|----------------------|-------------------|---------------------------------------|
| POST   | `/auth/register`     | –                 | Create an account                     |
| POST   | `/auth/login`         | –                 | Get access + refresh tokens           |
| POST   | `/auth/refresh`       | –                 | Rotate tokens                         |
| GET    | `/resources`          | any user          | List active resources                 |
| POST   | `/resources`          | ADMIN/MANAGER     | Create a resource                     |
| PATCH  | `/resources/:id`      | ADMIN/MANAGER     | Update a resource                     |
| DELETE | `/resources/:id`      | ADMIN/MANAGER     | Deactivate a resource (soft delete)   |
| POST   | `/bookings`            | any user          | Create a booking (conflict-checked)   |
| GET    | `/bookings/me`         | any user          | List my bookings                      |
| GET    | `/bookings`            | ADMIN/MANAGER     | List all bookings                     |
| DELETE | `/bookings/:id`        | owner/ADMIN/MANAGER | Cancel a booking                    |

## Design decisions worth noting

- **Two JWTs instead of one**: a short-lived access token limits the blast
  radius if it's ever leaked; the refresh token is only ever sent to a
  single dedicated endpoint.
- **Conflict detection is a single indexed query**, not an in-memory scan —
  `WHERE existing.start < new.end AND existing.end > new.start`, indexed on
  `(resourceId, startTime, endTime)`. This scales and avoids a
  check-then-write race window that an application-level check would have.
- **Generic auth error messages** (`Invalid email or password`) regardless
  of whether the email exists or the password is wrong, to avoid leaking
  which emails are registered.
- **Soft delete for resources**: a resource with historical bookings is
  deactivated, never hard-deleted, so past bookings stay meaningful.

## Deployment

The API/DB and the frontend are independently deployable units — there's
no live deployment for this project yet, but here's the intended path:

- **API + PostgreSQL**: deploy the root `Dockerfile` (or `docker-compose.yml`
  for API+DB together) to any Docker-friendly host — e.g. Render, Railway,
  Fly.io, or a VPS. Set `DATABASE_URL`, `JWT_ACCESS_SECRET`, and
  `JWT_REFRESH_SECRET` as real secrets (not the dev defaults in
  `docker-compose.yml`), then run `npx prisma migrate deploy` once against
  the production database.
- **Frontend**: either build it as a static site (`cd frontend && npm run
  build`, deploy the `dist/` folder to Netlify/Vercel/S3+CloudFront) with
  `VITE_API_URL` pointed at the deployed API, or deploy `frontend/Dockerfile`
  to any container host. No backend change is required for a cross-origin
  frontend — `cors()` is already unrestricted in `src/app.ts`.

## License

MIT
