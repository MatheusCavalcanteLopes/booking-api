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

## Getting started

### With Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

The API will be available at `http://localhost:3000`, with PostgreSQL
running alongside it.

### Locally

```bash
npm install
cp .env.example .env      # then point DATABASE_URL at your own Postgres
npx prisma migrate dev
npm run dev
```

## Running tests

```bash
npm test
```

Unit tests (`tests/unit`) cover pure business logic with no I/O.
Integration tests (`tests/integration`) exercise the full HTTP → service →
database path via Supertest, against a disposable test database — no
running server process required. CI runs both against a PostgreSQL
service container on every push (see `.github/workflows/ci.yml`).

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

## License

MIT
