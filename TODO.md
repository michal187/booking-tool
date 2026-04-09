# Granularne TODO.md dla MVP

## Cel
Przygotować szczegółowy plan realizacji MVP rezerwacji sprzętu (3h), zgodny z wymaganiami domenowymi i regułami kodowania.

## Założenia zgodności
- TypeScript strict, bez `any`.
- Architektura `Next.js API + Thin Components`.
- Daty w JSON file jako ISO stringi.
- UI teksty po polsku, kod po angielsku.
- `blocked` jako soft status wizualny (nie blokuje zapisu rezerwacji).
- Stack ograniczony do `Next.js + TypeScript + JSON file + Tailwind CSS`.

## Proponowana zawartość TODO.md

### Faza 0 — Bootstrap projektu (15 min)
- [ ] `B1` Zweryfikować dostępność narzędzi (`node`, `npm`) i uruchomić scaffold `Next.js + TypeScript`.
- [ ] `B2` Dodać i skonfigurować `tailwindcss` i `date-fns`.
- [ ] `B3` Ustawić alias importów `@/` i strukturę katalogów: `src/types`, `src/lib`, `src/components`, `src/features`, `src/app/api`.
- [ ] `B4` Potwierdzić `tsconfig` strict mode i brak `any`.

### Faza 1 — Model danych i kontrakty (20 min)
- [ ] `D1` Utworzyć `src/types/schema.ts` z typami: `Role`, `EquipmentStatus`, `Equipment`, `Reservation`, `CreateReservationInput`, `CreateEquipmentInput`, `ValidationResult`.
- [ ] `D2` Dodać pomocnicze typy błędów walidacji (np. kod/klucz błędu) bez zmiany publicznego kontraktu `ValidationResult`.
- [ ] `D3` Zweryfikować zgodność nazw i pól z planem (ISO stringi, brak pól zbędnych).

### Faza 2 — Store i seed (30 min)
- [ ] `S1` Utworzyć strukturę danych w `JSON file` dla `equipment` i `reservations`.
- [ ] `S2` Dodać serwis odczytu/zapisu pliku JSON (bez dodatkowej bazy danych).
- [ ] `S3` Zaimplementować `seedInitialData()` idempotentnie (seed tylko gdy lista pusta).
- [ ] `S4` Wprowadzić pełną listę seedową 20 pozycji sprzętu.

### Faza 3 — Walidacja rezerwacji (35 min)
- [ ] `V1` Dodać parse/normalizację dat wejściowych do pełnych godzin.
- [ ] `V2` Zaimplementować walidację kolejności: `startAt <= endAt`.
- [ ] `V3` Zaimplementować ograniczenie czasu: min `1h`, max `7 dni`.
- [ ] `V4` Zaimplementować check siatki godzinowej (`mm=00, ss=00, ms=000`).
- [ ] `V5` Zaimplementować overlap dla tego samego `equipmentId`: `aStart <= bEnd && bStart <= aEnd`.
- [ ] `V6` Udostępnić selektor `isSlotAvailable` do realtime blokowania CTA.
- [ ] `V7` Spiąć `validateReservation()` z czytelnymi `reason` pod UI.

### Faza 4 — CRUD i akcje admin/user (25 min)
- [ ] `C1` Zaimplementować `addEquipment(input)` (status domyślny `available`).
- [ ] `C2` Zaimplementować `toggleEquipmentBlocked(equipmentId)` (`available <-> blocked`).
- [ ] `C3` Zaimplementować `createReservation(input)` z atomowym flow: validate -> save -> zwrot wyniku.
- [ ] `C4` Dopilnować, że `blocked` nie uczestniczy w odrzucaniu rezerwacji.
- [ ] `C5` Wystawić operacje CRUD jako `Next.js API routes` pracujące na `JSON file`.

### Faza 5 — UI Dashboard (35 min)
- [ ] `U1` Nagłówek z przełącznikiem `Simulate Admin/User` (stan UI, bez persist, domyślnie `User`).
- [ ] `U2` Lista sprzętu z badge statusu (`available` / `blocked`).
- [ ] `U3` Formularz rezerwacji (start/end) dla pojedynczego sprzętu.
- [ ] `U4` Walidacja w UI: blokada przycisku + komunikaty błędów po polsku.
- [ ] `U5` Sekcja `Moje Rezerwacje` z nowo dodanym wpisem po sukcesie.
- [ ] `U6` Widok admin: formularz dodania sprzętu + toggle statusu `blocked`.
- [ ] `U7` Po sukcesie rezerwacji pokazać feedback (`toast` lub `alert`).

### Faza 6 — A11y i UX detale (10 min)
- [ ] `A1` Zapewnić czytelny stan `disabled` (`opacity-50`, `cursor-not-allowed`).
- [ ] `A2` Dodać etykiety i opisy pól formularza.
- [ ] `A3` Upewnić się, że interakcje klawiaturą działają dla podstawowych flow.

### Faza 7 — Testy manualne i domknięcie (30 min)
- [ ] `T1` Smoke: seed ładuje się tylko raz na pustym store.
- [ ] `T2` Rezerwacja poprawna: zapisuje się i jest widoczna na liście.
- [ ] `T3` Min/max: odrzuca `<1h` i `>7 dni`.
- [ ] `T4` Overlap: odrzuca konflikt tego samego `equipmentId`.
- [ ] `T5` Brak overlap: akceptuje różne `equipmentId` w tym samym czasie.
- [ ] `T6` `blocked` soft: status widoczny, ale zapis rezerwacji możliwy.
- [ ] `T7` Persist: rezerwacje/sprzęt zostają po reload; rola wraca do `User`.
- [ ] `T8` Przejrzeć lint/typecheck i naprawić błędy krytyczne.
- [ ] `T9` Zweryfikować integralność danych po restartach serwera (zapis w `JSON file`).

## Mapowanie na pierwotne T1-T8
- Oryginalne `T1` -> `D1-D3`
- Oryginalne `T2` -> `S1-S4`
- Oryginalne `T3` -> `V1-V4`
- Oryginalne `T4` -> `V5`
- Oryginalne `T5` -> `C1-C2`
- Oryginalne `T6` -> `U3-U5`
- Oryginalne `T7` -> `U1`
- Oryginalne `T8` -> `T1-T8`
