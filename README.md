# Booking Tool

Internal equipment booking app for lab and engineering inventory.

The current implementation supports:

- login with seeded test users
- browsing equipment by category and current availability
- creating reservation requests for a selected time range
- automatic assignment of a free physical unit within a category
- reviewing personal reservations and returning confirmed loans
- admin queue handling: approve, reject, confirm return
- adding new equipment units
- resetting the file-based database to a clean template

## Documentation

- [Architecture and UML](docs/architecture.md)

That document includes:

- system overview
- actors and use cases
- reservation and admin sequence diagrams
- data model notes
- API and persistence flow summary

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- JSON file database in `data/`
- Vitest + React Testing Library
- Playwright

## How It Works

The app seeds initial users and equipment on first launch. Users log in, select an equipment category, and submit a reservation request for a time range. The backend finds an available unit in that category, validates the requested slot, and stores the reservation as `pending`.

Admins work from the same UI. They can review the pending queue, confirm or reject requests, add more equipment units, and mark confirmed reservations as returned. Availability is derived from current reservations rather than from a separate inventory counter.

## Run The App

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Seeded Test Accounts

- `jan` / `jan123` - user
- `anna` / `anna123` - user
- `piotr` / `piotr123` - user
- `admin` / `admin123` - admin

## Database Layout

The runtime uses a template-driven file database:

- `data/db.json`
  Active application database.
- `data/db.template.json`
  Clean baseline for local app usage.
- `data/db.test.template.json`
  Clean baseline for Playwright.

The DB layer also supports:

- `DB_PATH`
- `DB_TEMPLATE_PATH`

If the configured DB file is missing, it is recreated from the configured template.

## API Overview

- `POST /api/auth/login`
  Validate credentials and return the user profile without the password.
- `GET /api/users`
  Return seeded users for UI display.
- `GET /api/equipment`
  Return all equipment units.
- `GET /api/equipment?grouped=true`
  Return grouped equipment with computed availability.
- `POST /api/equipment`
  Add a new equipment unit.
- `PATCH /api/equipment/:id`
  Toggle `available` / `blocked`.
- `GET /api/reservations`
  Return reservations, optionally filtered by `userId`.
- `POST /api/reservations`
  Create a pending reservation request.
- `PATCH /api/reservations/:id`
  Perform admin actions: `confirm`, `reject`, `return`.
- `POST /api/seed`
  Seed users and equipment if data is missing.
- `POST /api/reset`
  Restore the active DB from the current template.

## Reset The Database

Reset the main app database:

```bash
npm run db:reset
```

Reset the isolated Playwright database:

```bash
npm run db:test:reset
```

API reset endpoint:

```bash
POST /api/reset
```

## Run Tests

Run all tests:

```bash
npm test
```

Run unit, component, and API tests only:

```bash
npm run test:unit
```

Run unit tests in watch mode:

```bash
npm run test:unit:watch
```

Run end-to-end tests only:

```bash
npm run test:e2e
```

Notes:

- Playwright uses an isolated DB file under `.tmp/`.
- E2E runs with `DB_TEMPLATE_PATH=data/db.test.template.json`.
- On a fresh machine, browsers may need:

```bash
npx playwright install chromium
```

## Typical Workflow

```bash
npm run db:reset
npm run dev
```

In a second terminal:

```bash
npm test
```

## Scope And Limitations

This is an MVP-style internal tool optimized for local development speed and deterministic testing.

Important implementation notes:

- persistence is a local JSON file, not a production database
- login is credential-based, but there is no session layer
- API routes do not currently enforce authorization server-side
- blocked equipment is treated as a soft inventory flag in the current implementation
