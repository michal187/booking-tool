import { afterEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from '@/app/api/equipment/[id]/route';
import { POST as createEquipment } from '@/app/api/equipment/route';
import { POST as seedEquipment } from '@/app/api/seed/route';
import type { DbSchema } from '@/types/schema';

const { readDb, writeDb, buildSeedEquipment } = vi.hoisted(() => ({
  readDb: vi.fn(),
  writeDb: vi.fn(),
  buildSeedEquipment: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  readDb,
  writeDb,
}));

vi.mock('@/lib/seed-data', () => ({
  buildSeedEquipment,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('equipment routes', () => {
  it('creates equipment with trimmed names', async () => {
    const db: DbSchema = { equipment: [], reservations: [] };
    readDb.mockReturnValue(db);

    const response = await createEquipment(
      new Request('http://localhost/api/equipment', {
        method: 'POST',
        body: JSON.stringify({ name: '  Nowy laptop  ' }),
        headers: { 'Content-Type': 'application/json' },
      }) as never
    );

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toMatchObject({
      name: 'Nowy laptop',
      status: 'available',
    });
    expect(writeDb).toHaveBeenCalledTimes(1);
  });

  it('rejects empty equipment names', async () => {
    const response = await createEquipment(
      new Request('http://localhost/api/equipment', {
        method: 'POST',
        body: JSON.stringify({ name: '   ' }),
        headers: { 'Content-Type': 'application/json' },
      }) as never
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Nazwa sprzętu jest wymagana.',
    });
  });

  it('toggles equipment status', async () => {
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

    const response = await PATCH(new Request('http://localhost') as never, {
      params: Promise.resolve({ id: 'eq-001' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: 'eq-001',
      status: 'blocked',
    });
    expect(writeDb).toHaveBeenCalledTimes(1);
  });

  it('seeds equipment only when the store is empty', async () => {
    buildSeedEquipment.mockReturnValue([
      {
        id: 'eq-001',
        name: 'Vector VN1600',
        status: 'available',
        createdAt: '2026-04-09T00:00:00.000Z',
      },
    ]);
    readDb.mockReturnValueOnce({ equipment: [], reservations: [] });
    readDb.mockReturnValueOnce({
      equipment: [
        {
          id: 'eq-existing',
          name: 'Existing',
          status: 'available',
          createdAt: '2026-04-09T00:00:00.000Z',
        },
      ],
      reservations: [],
    });

    const firstResponse = await seedEquipment();
    const secondResponse = await seedEquipment();

    expect(firstResponse.status).toBe(200);
    await expect(firstResponse.json()).resolves.toEqual({ seeded: true, count: 1 });
    await expect(secondResponse.json()).resolves.toEqual({
      seeded: false,
      message: 'Dane już istnieją.',
    });
  });
});
