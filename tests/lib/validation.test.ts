import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  countAvailableUnits,
  findAvailableUnit,
  hasOverdueItems,
  isSlotAvailable,
  validateReservation,
} from '@/lib/validation';
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

  it('treats legacy reservations without status fields as blocking', () => {
    const legacyReservations = [
      {
        id: 'res-legacy',
        equipmentId: 'eq-001',
        userId: 'user-001',
        startAt: '2026-04-10T08:00:00.000Z',
        endAt: '2026-04-10T10:00:00.000Z',
        createdAt: '2026-04-09T10:00:00.000Z',
      },
    ] as Reservation[];

    expect(
      validateReservation(
        {
          equipmentId: 'eq-001',
          startAt: '2026-04-10T09:00:00.000Z',
          endAt: '2026-04-10T11:00:00.000Z',
        },
        legacyReservations
      )
    ).toEqual({
      ok: false,
      reason: 'Konflikt z istniejącą rezerwacją (2026-04-10T08:00:00.000Z – 2026-04-10T10:00:00.000Z).',
    });
  });
});

describe('findAvailableUnit', () => {
  it('skips units occupied by legacy reservations', () => {
    const equipment = [
      { id: 'eq-001', name: 'Vector VN1600' },
      { id: 'eq-002', name: 'Vector VN1600' },
    ];
    const reservations = [
      {
        id: 'res-legacy',
        equipmentId: 'eq-001',
        userId: 'user-001',
        startAt: '2026-04-10T08:00:00.000Z',
        endAt: '2026-04-10T10:00:00.000Z',
        createdAt: '2026-04-09T10:00:00.000Z',
      },
    ] as Reservation[];

    expect(
      findAvailableUnit(
        'Vector VN1600',
        '2026-04-10T09:00:00.000Z',
        '2026-04-10T11:00:00.000Z',
        equipment,
        reservations
      )
    ).toBe('eq-002');
  });
});

describe('countAvailableUnits', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not reduce current stock for future confirmed reservations', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-09T12:00:00.000Z'));

    const equipment = [{ id: 'eq-001', name: 'Vector VN1600' }];
    const reservations = [
      {
        id: 'res-future',
        equipmentId: 'eq-001',
        userId: 'user-001',
        startAt: '2026-04-10T08:00:00.000Z',
        endAt: '2026-04-10T10:00:00.000Z',
        status: 'confirmed',
        isReturned: false,
        createdAt: '2026-04-09T10:00:00.000Z',
      },
    ] satisfies Reservation[];

    expect(countAvailableUnits('Vector VN1600', equipment, reservations)).toEqual({
      available: 1,
      total: 1,
    });
  });

  it('keeps overdue unreturned reservations unavailable', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10T12:00:00.000Z'));

    const equipment = [{ id: 'eq-001', name: 'Vector VN1600' }];
    const reservations = [
      {
        id: 'res-overdue',
        equipmentId: 'eq-001',
        userId: 'user-001',
        startAt: '2026-04-09T08:00:00.000Z',
        endAt: '2026-04-10T10:00:00.000Z',
        status: 'confirmed',
        isReturned: false,
        createdAt: '2026-04-09T07:00:00.000Z',
      },
    ] satisfies Reservation[];

    expect(countAvailableUnits('Vector VN1600', equipment, reservations)).toEqual({
      available: 0,
      total: 1,
    });
  });
});

describe('hasOverdueItems', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('treats legacy confirmed reservations as overdue when past the end date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10T12:00:00.000Z'));

    const reservations = [
      {
        id: 'res-legacy',
        equipmentId: 'eq-001',
        userId: 'user-001',
        startAt: '2026-04-09T08:00:00.000Z',
        endAt: '2026-04-10T10:00:00.000Z',
        createdAt: '2026-04-09T07:00:00.000Z',
      },
    ] as Reservation[];

    expect(hasOverdueItems('user-001', reservations)).toBe(true);
  });
});
