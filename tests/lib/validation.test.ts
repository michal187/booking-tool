import { describe, expect, it } from 'vitest';
import { isSlotAvailable, validateReservation } from '@/lib/validation';
import type { Reservation } from '@/types/schema';

const existingReservations: Reservation[] = [
  {
    id: 'res-1',
    equipmentId: 'eq-001',
    startAt: '2026-04-10T08:00:00.000Z',
    endAt: '2026-04-10T10:00:00.000Z',
    createdAt: '2026-04-09T10:00:00.000Z',
  },
];

describe('validateReservation', () => {
  it('accepts a valid reservation on a free slot', () => {
    expect(
      validateReservation(
        {
          equipmentId: 'eq-001',
          startAt: '2026-04-10T11:00:00.000Z',
          endAt: '2026-04-10T12:00:00.000Z',
        },
        existingReservations
      )
    ).toEqual({ ok: true });
  });

  it('rejects reservations that do not start on a full hour', () => {
    expect(
      validateReservation(
        {
          equipmentId: 'eq-001',
          startAt: '2026-04-10T11:30:00.000Z',
          endAt: '2026-04-10T12:00:00.000Z',
        },
        existingReservations
      )
    ).toEqual({
      ok: false,
      reason: 'Godziny muszą być pełne (np. 08:00, 14:00).',
    });
  });

  it('rejects reservations longer than 7 days', () => {
    expect(
      validateReservation(
        {
          equipmentId: 'eq-001',
          startAt: '2026-04-10T08:00:00.000Z',
          endAt: '2026-04-18T09:00:00.000Z',
        },
        []
      )
    ).toEqual({
      ok: false,
      reason: 'Maksymalny czas rezerwacji to 7 dni.',
    });
  });

  it('rejects overlapping reservations for the same equipment', () => {
    const result = validateReservation(
      {
        equipmentId: 'eq-001',
        startAt: '2026-04-10T09:00:00.000Z',
        endAt: '2026-04-10T11:00:00.000Z',
      },
      existingReservations
    );

    expect(result).toEqual({
      ok: false,
      reason: 'Konflikt z istniejącą rezerwacją (2026-04-10T08:00:00.000Z – 2026-04-10T10:00:00.000Z).',
    });
  });

  it('allows overlapping times on different equipment', () => {
    expect(
      isSlotAvailable(
        'eq-002',
        '2026-04-10T09:00:00.000Z',
        '2026-04-10T10:00:00.000Z',
        existingReservations
      )
    ).toBe(true);
  });
});
