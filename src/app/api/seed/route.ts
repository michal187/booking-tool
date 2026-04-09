import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { buildSeedEquipment, buildSeedUsers } from '@/lib/seed-data';

export async function POST() {
  const db = readDb();
  const needsUsersSeed = !Array.isArray(db.users) || db.users.length === 0;
  const needsEquipmentSeed = !Array.isArray(db.equipment) || db.equipment.length === 0;
  const needsReservationsInit = !Array.isArray(db.reservations);

  if (!needsUsersSeed && !needsEquipmentSeed && !needsReservationsInit) {
    return NextResponse.json({ seeded: false, message: 'Dane już istnieją.' });
  }

  if (needsUsersSeed) {
    db.users = buildSeedUsers();
  }

  if (needsEquipmentSeed) {
    db.equipment = buildSeedEquipment();
  }

  if (needsReservationsInit) {
    db.reservations = [];
  }

  writeDb(db);

  return NextResponse.json({
    seeded: true,
    users: db.users.length,
    equipment: db.equipment.length,
  });
}
