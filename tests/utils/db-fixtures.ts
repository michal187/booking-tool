import fs from 'fs';
import path from 'path';
import type { DbSchema } from '@/types/schema';

export const dbPath = path.join(process.cwd(), 'data', 'db.json');

export const emptyReservationsDb: DbSchema = {
  equipment: [
    {
      id: 'eq-001',
      name: 'Vector VN1600',
      status: 'available',
      createdAt: '2026-04-09T14:03:45.235Z',
    },
    {
      id: 'eq-002',
      name: 'Kable DB9',
      status: 'available',
      createdAt: '2026-04-09T14:03:45.235Z',
    },
    {
      id: 'eq-003',
      name: 'Adaptery OBD-II',
      status: 'blocked',
      createdAt: '2026-04-09T14:03:45.235Z',
    },
  ],
  reservations: [],
};

export const overlappingReservationDb: DbSchema = {
  ...emptyReservationsDb,
  reservations: [
    {
      id: 'res-existing',
      equipmentId: 'eq-001',
      startAt: '2026-04-10T08:00:00.000Z',
      endAt: '2026-04-10T10:00:00.000Z',
      createdAt: '2026-04-09T14:13:02.961Z',
    },
  ],
};

export function readDbFixture(): DbSchema {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as DbSchema;
}

export function writeDbFixture(db: DbSchema): void {
  fs.writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`, 'utf-8');
}
