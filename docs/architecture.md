# Booking Tool Architecture

This document describes the current implementation in the repository, not the original MVP intent. The system is a single Next.js application with a client UI, route handlers under `src/app/api`, validation helpers in `src/lib`, and a JSON file used as the persistent store.

## System Overview

- The browser renders one main dashboard screen.
- The dashboard seeds data on first load, then fetches users, equipment, grouped availability, and reservations.
- Reservation requests are created against an equipment category name, not a specific unit chosen by the user.
- The backend resolves the request to a concrete free equipment unit and stores the reservation with `pending` status.
- Admins can approve, reject, and close reservations by marking a return.

## Main Actors

- `User`
  Logs in, browses categories, requests reservations, sees personal reservations, returns confirmed loans.
- `Admin`
  Has all user capabilities plus queue review, return confirmation, and inventory growth by adding units.
- `JSON DB`
  Persistent store for users, equipment, and reservations.

## Use Case View

```mermaid
flowchart LR
  user[User]
  admin[Admin]

  subgraph app[Booking Tool]
    uc1([Log in])
    uc2([Browse equipment categories])
    uc3([View availability and upcoming reservations])
    uc4([Create reservation request])
    uc5([See my reservations])
    uc6([Return confirmed equipment])
    uc7([Review pending queue])
    uc8([Approve reservation])
    uc9([Reject reservation])
    uc10([Confirm equipment return])
    uc11([Add equipment unit])
    uc12([Reset database])
  end

  user --> uc1
  user --> uc2
  user --> uc3
  user --> uc4
  user --> uc5
  user --> uc6

  admin --> uc1
  admin --> uc2
  admin --> uc3
  admin --> uc5
  admin --> uc7
  admin --> uc8
  admin --> uc9
  admin --> uc10
  admin --> uc11
  admin --> uc12
```

## Reservation Creation Sequence

This is the core end-user flow implemented by `src/components/ReservationForm.tsx`, `src/app/api/reservations/route.ts`, and `src/lib/validation.ts`.

```mermaid
sequenceDiagram
  actor U as User
  participant UI as Dashboard UI
  participant API as POST /api/reservations
  participant VAL as Validation Helpers
  participant DB as JSON DB

  U->>UI: Select category and time range
  U->>UI: Submit reservation form
  UI->>API: equipmentName, userId, startAt, endAt
  API->>DB: readDb()
  DB-->>API: users, equipment, reservations
  API->>VAL: hasOverdueItems(userId, reservations)

  alt User has overdue confirmed item
    VAL-->>API: true
    API-->>UI: 403 overdue error
    UI-->>U: Show error toast
  else User is eligible
    API->>VAL: findAvailableUnit(equipmentName, startAt, endAt, equipment, reservations)
    alt No free unit in category
      VAL-->>API: null
      API-->>UI: 422 availability error
      UI-->>U: Show error toast
    else Unit found
      VAL-->>API: equipmentId
      API->>VAL: validateReservation({equipmentId, startAt, endAt}, reservations)
      alt Validation failed
        VAL-->>API: reason
        API-->>UI: 422 validation error
        UI-->>U: Show error toast
      else Validation passed
        VAL-->>API: ok
        API->>DB: writeDb(new pending reservation)
        DB-->>API: saved
        API-->>UI: 201 reservation
        UI->>UI: Refetch grouped equipment and reservations
        UI-->>U: Show success toast
      end
    end
  end
```

## Admin Reservation Lifecycle Sequence

This describes the queue and return handling implemented by `src/components/AdminPanel.tsx` and `src/app/api/reservations/[id]/route.ts`.

```mermaid
sequenceDiagram
  actor A as Admin
  participant UI as Admin Panel
  participant API as PATCH /api/reservations/:id
  participant DB as JSON DB

  A->>UI: Choose action on reservation
  UI->>API: { action: confirm | reject | return }
  API->>DB: readDb()
  DB-->>API: reservations
  API->>API: Validate action against current status

  alt confirm on pending reservation
    API->>DB: writeDb(status = confirmed)
    DB-->>API: saved
    API-->>UI: updated reservation
    UI->>UI: Refetch data
    UI-->>A: Show success toast
  else reject on pending reservation
    API->>DB: writeDb(status = rejected)
    DB-->>API: saved
    API-->>UI: updated reservation
    UI->>UI: Refetch data
    UI-->>A: Show success toast
  else return on confirmed reservation
    API->>DB: writeDb(isReturned = true)
    DB-->>API: saved
    API-->>UI: updated reservation
    UI->>UI: Refetch data
    UI-->>A: Show success toast
  else invalid transition
    API-->>UI: 422 domain error
    UI-->>A: Show error toast
  end
```

## Startup And Data Loading Sequence

```mermaid
sequenceDiagram
  participant B as Browser
  participant UI as HomePage
  participant Seed as POST /api/seed
  participant Users as GET /api/users
  participant Eq as GET /api/equipment
  participant Grouped as GET /api/equipment?grouped=true
  participant Res as GET /api/reservations
  participant DB as JSON DB

  B->>UI: Open app
  UI->>Seed: Seed if database is empty
  Seed->>DB: readDb() / writeDb() if needed
  UI->>Users: Fetch users
  Users->>DB: readDb()
  UI->>Eq: Fetch equipment units
  Eq->>DB: readDb()
  UI->>Grouped: Fetch grouped availability
  Grouped->>DB: readDb()
  UI->>Res: Fetch reservations
  Res->>DB: readDb()
  UI-->>B: Render dashboard
```

## Logical Components

```mermaid
flowchart TB
  subgraph Client
    page[HomePage]
    header[Header]
    list[EquipmentList]
    detail[EquipmentDetail]
    form[ReservationForm]
    mine[ReservationList]
    admin[AdminPanel]
    toast[Toast]
  end

  subgraph Server
    auth[/api/auth/login]
    users[/api/users]
    eq[/api/equipment]
    eqid[/api/equipment/:id]
    res[/api/reservations]
    resid[/api/reservations/:id]
    seed[/api/seed]
    reset[/api/reset]
    validation[validation.ts]
    db[db.ts]
  end

  file[(data/db.json)]

  page --> header
  page --> list
  page --> detail
  detail --> form
  page --> mine
  page --> admin
  page --> toast

  page --> auth
  page --> users
  page --> eq
  page --> res
  page --> seed
  admin --> eq
  admin --> resid
  form --> res
  mine --> resid
  eq --> validation
  res --> validation
  auth --> db
  users --> db
  eq --> db
  eqid --> db
  res --> db
  resid --> db
  seed --> db
  reset --> db
  db --> file
```

## Data Model Summary

```mermaid
classDiagram
  class User {
    +id: string
    +name: string
    +login: string
    +role: user|admin
  }

  class Equipment {
    +id: string
    +name: string
    +status: available|blocked
    +createdAt: ISO string
  }

  class Reservation {
    +id: string
    +equipmentId: string
    +userId: string
    +startAt: ISO string
    +endAt: ISO string
    +status: pending|confirmed|rejected
    +isReturned: boolean
    +createdAt: ISO string
  }

  User "1" --> "many" Reservation : creates
  Equipment "1" --> "many" Reservation : assigned to
```

## Validation Rules In Code

Current validation behavior is defined in `src/lib/validation.ts`:

- overlapping reservations block a new reservation only for the same physical `equipmentId`
- only `pending` and `confirmed` reservations that are not returned are considered blocking
- users with overdue confirmed reservations cannot create new reservations
- reservation length is checked for invalid order and for a maximum of 7 days
- the API first resolves a free unit for the selected category and then validates the exact unit reservation

## Persistence Notes

- The active DB file is `data/db.json` by default.
- If the DB file is missing, it is recreated from `data/db.template.json`.
- Tests can point the app to alternate files with `DB_PATH` and `DB_TEMPLATE_PATH`.

## Known Architectural Constraints

- Authentication is only credential verification; there is no session, cookie, or token layer.
- Authorization is currently a UI concern. The route handlers do not protect admin actions server-side.
- The `blocked` equipment flag is a soft status and is not enforced in reservation validation.
- Concurrent writes are handled through direct file writes, which is acceptable for this MVP but not for multi-user production deployment.
