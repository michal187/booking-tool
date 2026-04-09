# Booking Tool

Simple equipment reservation app for lab and engineering inventory.

The app lets you:

- browse available equipment
- create time-based reservations
- see current and upcoming bookings
- add equipment and block/unblock it in admin mode
- reset the working database back to a clean template

## Stack

- Next.js 16
- React 19
- JSON file database in `data/`
- Vitest + React Testing Library
- Playwright

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

## Database Layout

The app now uses a template-driven file DB setup:

- `data/db.json`
  Working app database. This file changes while you use the app.
- `data/db.template.json`
  Clean baseline for the main app.
- `data/db.test.template.json`
  Separate baseline used by end-to-end tests.

The runtime DB layer also supports custom paths through environment variables:

- `DB_PATH`
- `DB_TEMPLATE_PATH`

If the configured DB file does not exist, it is recreated automatically from the configured template.

## Reset The Database

Reset the main app database back to the clean template:

```bash
npm run db:reset
```

Reset the isolated Playwright test database:

```bash
npm run db:test:reset
```

There is also an API reset endpoint:

```bash
POST /api/reset
```

That endpoint restores the active DB from the currently configured template.

## Run Tests

Run the full test suite:

```bash
npm test
```

Run only unit, component, and API tests:

```bash
npm run test:unit
```

Run unit tests in watch mode:

```bash
npm run test:unit:watch
```

Run only end-to-end tests:

```bash
npm run test:e2e
```

Notes:

- Playwright uses its own isolated DB file under `.tmp/`.
- The E2E server is started with `DB_TEMPLATE_PATH=data/db.test.template.json`.
- If Playwright browsers are missing on a fresh machine, install them with:

```bash
npx playwright install chromium
```

## Typical Workflow

Start from a clean app state:

```bash
npm run db:reset
npm run dev
```

Run tests:

```bash
npm test
```

## Project Goal

This project is an MVP-style internal booking tool. It is optimized for local development speed and deterministic testing rather than for production-grade database infrastructure.
