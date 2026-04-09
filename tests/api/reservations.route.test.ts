import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/reservations/route';
import type { DbSchema } from '@/types/schema';

const { readDb, writeDb, validateReservation } = vi.hoisted(() => ({
  readDb: vi.fn(),
  writeDb: vi.fn(),
  validateReservation: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  readDb,
  writeDb,
}));

vi.mock('@/lib/validation', () => ({
  validateReservation,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/reservations', () => {
  it('creates a reservation for a valid request', async () => {
    const db: DbSchema = {
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
    validateReservation.mockReturnValue({ ok: true });

    const response = await POST(
      new Request('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          equipmentId: 'eq-001',
          startAt: '2026-04-10T08:00:00.000Z',
          endAt: '2026-04-10T09:00:00.000Z',
        }),
        headers: { 'Content-Type': 'application/json' },
      }) as never
    );

    expect(response.status).toBe(201);
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
      startAt: '2026-04-10T08:00:00.000Z',
      endAt: '2026-04-10T09:00:00.000Z',
    });
    expect(payload.id).toMatch(/^res-/);
  });

  it('rejects requests for unknown equipment', async () => {
    readDb.mockReturnValue({ equipment: [], reservations: [] });

    const response = await POST(
      new Request('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          equipmentId: 'eq-missing',
          startAt: '2026-04-10T08:00:00.000Z',
          endAt: '2026-04-10T09:00:00.000Z',
        }),
        headers: { 'Content-Type': 'application/json' },
      }) as never
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Nie znaleziono sprzętu.' });
    expect(validateReservation).not.toHaveBeenCalled();
  });

  it('returns validation errors for conflicting reservations', async () => {
    readDb.mockReturnValue({
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
    validateReservation.mockReturnValue({
      ok: false,
      reason: 'Konflikt z istniejącą rezerwacją.',
    });

    const response = await POST(
      new Request('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          equipmentId: 'eq-001',
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
