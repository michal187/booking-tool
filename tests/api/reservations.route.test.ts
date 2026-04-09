import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/reservations/route';
import type { DbSchema } from '@/types/schema';

const { readDb, writeDb, validateReservation, hasOverdueItems, findAvailableUnit } = vi.hoisted(() => ({
  readDb: vi.fn(),
  writeDb: vi.fn(),
  validateReservation: vi.fn(),
  hasOverdueItems: vi.fn(),
  findAvailableUnit: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  readDb,
  writeDb,
}));

vi.mock('@/lib/validation', () => ({
  validateReservation,
  hasOverdueItems,
  findAvailableUnit,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/reservations', () => {
  it('creates a reservation for a valid request', async () => {
    const db: DbSchema = {
      users: [
        { id: 'user-001', name: 'Jan Kowalski', role: 'user' },
      ],
      equipment: [
        {
          id: 'eq-001',
          name: 'Vector VN1600',
          status: 'available',
          createdAt: '2026-04-09T00:00:00.000Z',
        },
      ],
      reservations: [],
    };

    readDb.mockReturnValue(db);
    hasOverdueItems.mockReturnValue(false);
    findAvailableUnit.mockReturnValue('eq-001');
    validateReservation.mockReturnValue({ ok: true });

    const response = await POST(
      new Request('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          equipmentName: 'Vector VN1600',
          userId: 'user-001',
          startAt: '2026-04-10T08:00:00.000Z',
          endAt: '2026-04-10T09:00:00.000Z',
        }),
        headers: { 'Content-Type': 'application/json' },
      }) as never
    );

    expect(response.status).toBe(201);
    expect(findAvailableUnit).toHaveBeenCalledWith(
      'Vector VN1600',
      '2026-04-10T08:00:00.000Z',
      '2026-04-10T09:00:00.000Z',
      db.equipment,
      db.reservations
    );
    expect(validateReservation).toHaveBeenCalledTimes(1);
    expect(validateReservation.mock.calls[0]?.[0]).toEqual({
      equipmentId: 'eq-001',
      startAt: '2026-04-10T08:00:00.000Z',
      endAt: '2026-04-10T09:00:00.000Z',
    });
    expect(writeDb).toHaveBeenCalledTimes(1);

    const payload = await response.json();
    expect(payload).toMatchObject({
      equipmentId: 'eq-001',
      userId: 'user-001',
      status: 'pending',
      isReturned: false,
      startAt: '2026-04-10T08:00:00.000Z',
      endAt: '2026-04-10T09:00:00.000Z',
    });
    expect(payload.id).toMatch(/^res-/);
  });

  it('rejects requests for unknown users', async () => {
    readDb.mockReturnValue({ users: [], equipment: [], reservations: [] });

    const response = await POST(
      new Request('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          equipmentName: 'Vector VN1600',
          userId: 'user-missing',
          startAt: '2026-04-10T08:00:00.000Z',
          endAt: '2026-04-10T09:00:00.000Z',
        }),
        headers: { 'Content-Type': 'application/json' },
      }) as never
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Nie znaleziono użytkownika.' });
    expect(findAvailableUnit).not.toHaveBeenCalled();
    expect(validateReservation).not.toHaveBeenCalled();
  });

  it('returns validation errors for conflicting reservations', async () => {
    readDb.mockReturnValue({
      users: [
        { id: 'user-001', name: 'Jan Kowalski', role: 'user' },
      ],
      equipment: [
        {
          id: 'eq-001',
          name: 'Vector VN1600',
          status: 'available',
          createdAt: '2026-04-09T00:00:00.000Z',
        },
      ],
      reservations: [],
    });
    hasOverdueItems.mockReturnValue(false);
    findAvailableUnit.mockReturnValue('eq-001');
    validateReservation.mockReturnValue({
      ok: false,
      reason: 'Konflikt z istniejącą rezerwacją.',
    });

    const response = await POST(
      new Request('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          equipmentName: 'Vector VN1600',
          userId: 'user-001',
          startAt: '2026-04-10T08:00:00.000Z',
          endAt: '2026-04-10T09:00:00.000Z',
        }),
        headers: { 'Content-Type': 'application/json' },
      }) as never
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: 'Konflikt z istniejącą rezerwacją.',
    });
    expect(writeDb).not.toHaveBeenCalled();
  });
});
